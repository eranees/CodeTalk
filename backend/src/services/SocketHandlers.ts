import { Socket } from 'socket.io';
import { Server } from 'socket.io';
import { GroupManager } from './GroupManager';
import { 
  JoinGroupData, 
  SendMessageData, 
  SwitchGroupData, 
  TypingData,
  Message,
  TypingUser
} from '../types';

export class SocketHandlers {
  constructor(
    private io: Server,
    private groupManager: GroupManager
  ) {}

  handleJoinGroup(socket: Socket, data: JoinGroupData): void {
    const { username, groupCode, groupId } = data;
    
    if (!username || !groupCode) {
      socket.emit('error', { message: 'Username and group code are required' });
      return;
    }

    let group: any;
    let targetGroupId: string;

    if (groupId) {
      group = this.groupManager.getGroup(groupId);
      if (!group) {
        socket.emit('error', { message: 'Group not found' });
        return;
      }
      targetGroupId = groupId;
    } else {
      const existingGroup = this.groupManager.findGroupByCode(groupCode);
      
      if (existingGroup) {
        group = existingGroup;
        targetGroupId = existingGroup.id;
      } else {
        group = this.groupManager.createGroup(groupCode);
        targetGroupId = group.id;
      }
    }

    // Check if username already exists in the group
    if (this.groupManager.checkUsernameExists(group, username)) {
      socket.emit('error', { message: `Username "${username}" already exists in this group. Please use a different username.` });
      return;
    }

    // Remove user from this group if they were already there (rejoin scenario)
    if (group.users.has(socket.id)) {
      this.groupManager.removeUserFromGroup(group, socket.id);
    }

    // Join the socket room
    socket.join(targetGroupId);

    // Add user to group
    const user = this.groupManager.addUserToGroup(group, socket.id, username);

    // Get all groups user is in
    const userGroups = this.groupManager.getUserGroups(socket.id);

    const joinData = {
      groupCode,
      groupId: targetGroupId,
      username,
      memberCount: group.users.size,
      members: Array.from(group.users.values()).map(u => u.username),
      messages: group.messages,
      allGroups: userGroups
    };
    
    socket.emit('joined-group', joinData);

    // Notify other users in the group
    const userJoinedData = {
      username,
      memberCount: group.users.size,
      members: Array.from(group.users.values()).map(u => u.username)
    };
    
    socket.to(targetGroupId).emit('user-joined', userJoinedData);
  }

  handleSendMessage(socket: Socket, data: SendMessageData): void {
    const { message, groupCode, groupId } = data;
    
    let group: any;
    if (groupId) {
      group = this.groupManager.getGroup(groupId);
    } else {
      group = this.groupManager.findGroupByCode(groupCode);
      if (group && !group.users.has(socket.id)) {
        group = undefined;
      }
    }
    
    if (!group) {
      socket.emit('error', { message: 'Group not found. Please rejoin the group.' });
      return;
    }

    if (!group.users.has(socket.id)) {
      socket.emit('error', { message: 'You are not in this group. Please rejoin.' });
      return;
    }

    const user = group.users.get(socket.id);
    if (!user) {
      socket.emit('error', { message: 'User not found' });
      return;
    }

    const messageData: Message = {
      id: Date.now().toString(),
      message,
      username: user.username,
      timestamp: new Date().toISOString(),
      groupCode,
      groupId: group.id
    };

    // Store message in group history
    this.groupManager.addMessageToGroup(group, messageData);
    
    // Broadcast message to all users in the group (including sender)
    this.io.to(group.id).emit('new-message', messageData);
  }

  handleSwitchGroup(socket: Socket, data: SwitchGroupData): void {
    const { groupId } = data;
    const group = this.groupManager.getGroup(groupId);
    
    if (!group || !group.users.has(socket.id)) {
      socket.emit('error', { message: 'Group not found or you are not a member' });
      return;
    }

    const user = group.users.get(socket.id);
    if (user) {
      user.currentGroupId = groupId;
    }

    const groupData = {
      groupCode: group.code,
      groupId: group.id,
      memberCount: group.users.size,
      members: Array.from(group.users.values()).map(u => u.username),
      messages: group.messages
    };

    socket.emit('group-switched', groupData);
  }

  handleGetMyGroups(socket: Socket): void {
    const userGroups = this.groupManager.getUserGroups(socket.id);
    socket.emit('my-groups', userGroups);
  }

  handleTypingStart(socket: Socket, data: TypingData): void {
    const { groupCode, groupId } = data;
    let group: any;
    
    if (groupId) {
      group = this.groupManager.getGroup(groupId);
    } else {
      group = this.groupManager.findGroupByCode(groupCode);
      if (group && !group.users.has(socket.id)) {
        group = undefined;
      }
    }
    
    if (group && group.users.has(socket.id)) {
      const user = group.users.get(socket.id);
      socket.to(group.id).emit('user-typing', {
        username: user?.username,
        isTyping: true
      });
    }
  }

  handleTypingStop(socket: Socket, data: TypingData): void {
    const { groupCode, groupId } = data;
    let group: any;
    
    if (groupId) {
      group = this.groupManager.getGroup(groupId);
    } else {
      group = this.groupManager.findGroupByCode(groupCode);
      if (group && !group.users.has(socket.id)) {
        group = undefined;
      }
    }
    
    if (group && group.users.has(socket.id)) {
      const user = group.users.get(socket.id);
      socket.to(group.id).emit('user-typing', {
        username: user?.username,
        isTyping: false
      });
    }
  }

  handleDisconnect(socket: Socket): void {
    const removedUsers = this.groupManager.removeUserFromAllGroups(socket.id);
    
    // Notify other users in each group
    removedUsers.forEach(({ group, user }) => {
      socket.to(group.id).emit('user-left', {
        username: user.username,
        memberCount: group.users.size,
        members: Array.from(group.users.values()).map(u => u.username)
      });

      // Clean up empty groups after delay
      this.groupManager.cleanupEmptyGroup(group.id);
    });
  }
}
