import { Socket, Server } from 'socket.io';
import { GroupManager } from './GroupManager';
import { 
  JoinGroupData, 
  SendMessageData, 
  SwitchGroupData, 
  TypingData,
} from '../types';
import { GroupEntity } from '../entities/group.entity';
import logger from '../config/logger';

export class SocketHandlers {
  constructor(
    private io: Server,
    private groupManager: GroupManager
  ) {}

  async handleJoinGroup(socket: Socket, data: JoinGroupData): Promise<void> {
    const { username, groupCode, groupId, password } = data;
    
    logger.info(`Join group request: username="${username}", groupCode="${groupCode}", password="${password ? 'PROVIDED' : 'NOT_PROVIDED'}"`);
    
    if (!username || !groupCode) {
      socket.emit('error', { message: 'Username and group code are required' });
      return;
    }

    try {
      let group: any;
      let targetGroupId: string;

      if (groupId) {
        group = await this.groupManager.getGroup(groupId);
        if (!group) {
          socket.emit('error', { message: 'Group not found' });
          return;
        }
        targetGroupId = groupId;
      } else {
        const existingGroup = await this.groupManager.findGroupByCode(groupCode);
        
        if (existingGroup) {
          group = existingGroup;
          targetGroupId = existingGroup.id;
        } else {
          group = await this.groupManager.createGroup(groupCode);
          targetGroupId = group.id;
        }
      }

      // Check if username already exists in the group (case-insensitive)
      const existingUser = await this.groupManager.findExistingUserInGroup(group, username);
      
      if (existingUser) {
        logger.info(`Found existing user "${username}" in group ${groupCode} with password: ${existingUser.password ? 'YES' : 'NO'}`);
        
        // User exists in group - check password if they have one
        if (existingUser.password) {
          logger.info(`Password check required for user "${username}" in group ${groupCode}`);
          if (!password) {
            logger.warn(`Username "${username}" requires password to rejoin group ${groupCode} - no password provided`);
            socket.emit('error', { message: `Username "${username}" requires a password to rejoin this group.` });
            return;
          }
          
          const isValidPassword = await this.groupManager.verifyUserPassword(existingUser, password);
          if (!isValidPassword) {
            logger.warn(`Invalid password for username "${username}" in group ${groupCode}`);
            socket.emit('error', { message: 'Invalid password for this username.' });
            return;
          }
          logger.info(`Valid password provided for username "${username}" in group ${groupCode}`);
        } else {
          logger.info(`User "${username}" rejoining group ${groupCode} without password requirement`);
        }
        
        logger.info(`User "${username}" rejoining group ${groupCode} - password check passed`);
      } else {
        logger.info(`New user "${username}" joining group ${groupCode} for the first time`);
      }

      // Join the socket room
      socket.join(targetGroupId);
      const roomSize = this.io.sockets.adapter.rooms.get(targetGroupId)?.size || 0;
      logger.info(`Socket ${socket.id} joined room ${targetGroupId}. Room size: ${roomSize}`);
      
      // Debug: List all rooms and their sizes
      const allRooms = Array.from(this.io.sockets.adapter.rooms.keys());
      logger.info(`All rooms: ${allRooms.join(', ')}`);

      // Add user to group (this will handle existing users by updating their socketId)
      const user = await this.groupManager.addUserToGroup(group, socket.id, username, password);
      
      logger.info(`User ${username} joined group ${groupCode} (${targetGroupId}) with socket ${socket.id}. User has password: ${user.password ? 'YES' : 'NO'}`);

      // Get all groups user is in
      const userGroups = await this.groupManager.getUserGroups(socket.id);

      // Get group messages
      const messages = await this.groupManager.getGroupMessages(targetGroupId);

      // Get updated group with only active users
      const updatedGroup = await this.groupManager.getGroupWithActiveUsers(targetGroupId);

      const joinData = {
        groupCode,
        groupId: targetGroupId,
        username,
        memberCount: updatedGroup?.users?.length || 0,
        members: updatedGroup?.users?.map(u => u.username) || [],
        messages: messages.map(msg => ({
          id: msg.id,
          message: msg.message,
          username: msg.username,
          timestamp: msg.timestamp.toISOString(),
          groupCode: msg.groupCode,
          groupId: msg.group?.id
        })),
        allGroups: userGroups
      };
      
      socket.emit('joined-group', joinData);

      // Notify other users in the group
      const userJoinedData = {
        username,
        memberCount: updatedGroup?.users?.length || 0,
        members: updatedGroup?.users?.map(u => u.username) || []
      };
      
      socket.to(targetGroupId).emit('user-joined', userJoinedData);
    } catch (error) {
      logger.error('Error in handleJoinGroup:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          socket.emit('error', { message: `Username "${username}" is already taken. Please choose a different username.` });
        } else if (error.message.includes('duplicate key')) {
          socket.emit('error', { message: `Username "${username}" is already in use. Please choose a different username.` });
        } else {
          socket.emit('error', { message: `An error occurred while joining the group: ${error.message}` });
        }
      } else {
        socket.emit('error', { message: 'An error occurred while joining the group' });
      }
    }
  }

  async handleSendMessage(socket: Socket, data: SendMessageData): Promise<void> {
    const { message, groupCode, groupId } = data;
    
    try {
      let group: any;
      if (groupId) {
        group = await this.groupManager.getGroup(groupId);
      } else {
        group = await this.groupManager.findGroupByCode(groupCode);
      }
      
      if (!group) {
        socket.emit('error', { message: 'Group not found. Please rejoin the group.' });
        return;
      }

      // Check if user is in the group
      const user = await this.groupManager.databaseService.findUserBySocketId(socket.id);
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      const isUserInGroup = await this.groupManager.checkUsernameExists(group, user.username);
      if (!isUserInGroup) {
        socket.emit('error', { message: 'You are not in this group. Please rejoin.' });
        return;
      }

      // Store message in database
      const savedMessage = await this.groupManager.addMessageToGroup(
        group, 
        message, 
        user.username, 
        user.id
      );

      const messageData = {
        id: savedMessage.id,
        message: savedMessage.message,
        username: savedMessage.username,
        timestamp: savedMessage.timestamp.toISOString(),
        groupCode: savedMessage.groupCode,
        groupId: savedMessage.group?.id
      };
      
      // Broadcast message to all users in the group (including sender)
      logger.info(`Broadcasting message to room ${group.id}. Room size: ${this.io.sockets.adapter.rooms.get(group.id)?.size || 0}`);
      this.io.to(group.id).emit('new-message', messageData);
      
      logger.info(`Message sent by ${user.username} in group ${group.code}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
    } catch (error) {
      logger.error('Error in handleSendMessage:', error);
      socket.emit('error', { message: 'An error occurred while sending the message' });
    }
  }

  async handleSwitchGroup(socket: Socket, data: SwitchGroupData): Promise<void> {
    const { groupId } = data;
    
    try {
      const group = await this.groupManager.getGroup(groupId);
      
      if (!group) {
        socket.emit('error', { message: 'Group not found' });
        return;
      }

      // Check if user is in the group
      const user = await this.groupManager.databaseService.findUserBySocketId(socket.id);
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      const isUserInGroup = await this.groupManager.checkUsernameExists(group, user.username);
      if (!isUserInGroup) {
        socket.emit('error', { message: 'You are not a member of this group' });
        return;
      }

      // Get group messages
      const messages = await this.groupManager.getGroupMessages(groupId);
      
      // Get updated group with only active users
      const updatedGroup = await this.groupManager.getGroupWithActiveUsers(groupId);

      const groupData = {
        groupCode: group.code,
        groupId: group.id,
        memberCount: updatedGroup?.users?.length || 0,
        members: updatedGroup?.users?.map(u => u.username) || [],
        messages: messages.map(msg => ({
          id: msg.id,
          message: msg.message,
          username: msg.username,
          timestamp: msg.timestamp.toISOString(),
          groupCode: msg.groupCode,
          groupId: msg.group?.id
        }))
      };

      socket.emit('group-switched', groupData);
    } catch (error) {
      logger.error('Error in handleSwitchGroup:', error);
      socket.emit('error', { message: 'An error occurred while switching groups' });
    }
  }

  async handleGetMyGroups(socket: Socket): Promise<void> {
    try {
      const userGroups = await this.groupManager.getUserGroups(socket.id);
      socket.emit('my-groups', userGroups);
    } catch (error) {
      logger.error('Error in handleGetMyGroups:', error);
      socket.emit('error', { message: 'An error occurred while getting your groups' });
    }
  }

  async handleTypingStart(socket: Socket, data: TypingData): Promise<void> {
    const { groupCode, groupId } = data;
    
    try {
      let group: GroupEntity | null = null;
      
      if (groupId) {
        group = await this.groupManager.getGroup(groupId);
      } else {
        group = await this.groupManager.findGroupByCode(groupCode);
      }
      
      if (!group) {
        return;
      }

      // Check if user is in the group
      const user = await this.groupManager.databaseService.findUserBySocketId(socket.id);
      if (!user) {
        return;
      }

      const isUserInGroup = await this.groupManager.checkUsernameExists(group, user.username);
      if (!isUserInGroup) {
        return;
      }
      
      logger.info(`Broadcasting typing start to room ${group.id}. Room size: ${this.io.sockets.adapter.rooms.get(group.id)?.size || 0}`);
      this.io.to(group.id).emit('user-typing', {
        username: user.username,
        isTyping: true
      });
    } catch (error) {
      logger.error('Error in handleTypingStart:', error);
    }
  }

  async handleTypingStop(socket: Socket, data: TypingData): Promise<void> {
    const { groupCode, groupId } = data;
    
    try {
      let group: GroupEntity | null = null;
      
      if (groupId) {
        group = await this.groupManager.getGroup(groupId);
      } else {
        group = await this.groupManager.findGroupByCode(groupCode);
      }
      
      if (!group) {
        return;
      }

      // Check if user is in the group
      const user = await this.groupManager.databaseService.findUserBySocketId(socket.id);
      if (!user) {
        return;
      }

      const isUserInGroup = await this.groupManager.checkUsernameExists(group, user.username);
      if (!isUserInGroup) {
        return;
      }
      
      logger.info(`Broadcasting typing stop to room ${group.id}. Room size: ${this.io.sockets.adapter.rooms.get(group.id)?.size || 0}`);
      this.io.to(group.id).emit('user-typing', {
        username: user.username,
        isTyping: false
      });
    } catch (error) {
      logger.error('Error in handleTypingStop:', error);
    }
  }

  async handleLeaveGroup(socket: Socket): Promise<void> {
    try {
      logger.info(`User leaving group via socket ${socket.id}`);
      
      // Find user by socket ID
      const user = await this.groupManager.databaseService.findUserBySocketId(socket.id);
      if (!user) {
        logger.warn(`No user found for socket ${socket.id} - user may have already disconnected`);
        socket.emit('left-group', { message: 'Successfully left the group' });
        return;
      }

      // Get user's groups
      const userGroups = await this.groupManager.databaseService.getUserGroups(user.id);
      
      if (userGroups.length === 0) {
        logger.info(`User ${user.username} is not in any groups`);
        socket.emit('left-group', { message: 'Successfully left the group' });
        return;
      }
      
      // Remove user from all groups
      for (const group of userGroups) {
        await this.groupManager.removeUserFromGroup(group, socket.id);
        logger.info(`User ${user.username} left group ${group.code}`);
      }
      
      // Leave all socket rooms
      for (const group of userGroups) {
        socket.leave(group.id);
      }
      
      // Emit success event
      socket.emit('left-group', { message: 'Successfully left the group' });
      
    } catch (error) {
      logger.error('Error in handleLeaveGroup:', error);
      socket.emit('error', { message: 'An error occurred while leaving the group' });
    }
  }

  async handleLogout(socket: Socket): Promise<void> {
    try {
      logger.info(`User explicitly logged out via socket ${socket.id}`);
      await this.handleDisconnect(socket, 'user logout');
    } catch (error) {
      logger.error('Error in handleLogout:', error);
    }
  }

  async handleDisconnect(socket: Socket, reason?: string): Promise<void> {
    try {
      logger.info(`Socket ${socket.id} disconnected. Reason: ${reason || 'unknown'}`);
      const removedUsers = await this.groupManager.removeUserFromAllGroups(socket.id);
      
      logger.info(`Removed ${removedUsers.length} users from groups`);
      
      // Notify other users in each group
      for (const { group, user } of removedUsers) {
        logger.info(`User ${user.username} disconnected from group ${group.code} (${group.id})`);
        
        // Clean up inactive users first
        await this.groupManager.cleanupInactiveUsersFromGroup(group.id);
        
        // Get updated group with only active users
        const updatedGroup = await this.groupManager.getGroupWithActiveUsers(group.id);
        
        logger.info(`Group ${group.code} now has ${updatedGroup?.users?.length || 0} active users: ${updatedGroup?.users?.map(u => u.username).join(', ') || 'none'}`);
        
        socket.to(group.id).emit('user-left', {
          username: user.username,
          memberCount: updatedGroup?.users?.length || 0,
          members: updatedGroup?.users?.map(u => u.username) || []
        });

        // Clean up empty groups after delay
        this.groupManager.cleanupEmptyGroup(group.id);
      }
    } catch (error) {
      logger.error('Error in handleDisconnect:', error);
    }
  }
}
