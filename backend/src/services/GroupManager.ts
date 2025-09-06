import { DatabaseService } from './DatabaseService';
import { UserEntity } from '../entities/user.entity';
import { GroupEntity } from '../entities/group.entity';
import { MessageEntity } from '../entities/message.entity';
import logger from '../config/logger';
import bcrypt from 'bcrypt';

export class GroupManager {
  public databaseService: DatabaseService;
  private userSockets = new Map<string, string>(); // socketId -> username mapping

  constructor() {
    this.databaseService = new DatabaseService();
  }

  async createGroup(groupCode: string): Promise<GroupEntity> {
    return await this.databaseService.createGroup(groupCode);
  }

  async findGroupByCode(groupCode: string): Promise<GroupEntity | null> {
    return await this.databaseService.findGroupByCode(groupCode);
  }

  async getGroup(groupId: string): Promise<GroupEntity | null> {
    return await this.databaseService.findGroupById(groupId);
  }

  async getGroupWithActiveUsers(groupId: string): Promise<GroupEntity | null> {
    return await this.databaseService.findGroupByIdWithActiveUsers(groupId);
  }

  async addUserToGroup(group: GroupEntity, socketId: string, username: string, password?: string): Promise<UserEntity> {
    logger.info(`addUserToGroup: username="${username}", group="${group.code}", password="${password ? 'PROVIDED' : 'NOT_PROVIDED'}"`);
    
    // Check if user already exists in this specific group
    const existingUserInGroup = await this.findExistingUserInGroup(group, username);
    
    if (existingUserInGroup) {
      logger.info(`User "${username}" exists in group ${group.code} - updating socketId`);
      // User exists in this group - update their socketId and status
      await this.databaseService.updateUserSocketId(existingUserInGroup.id, socketId);
      this.userSockets.set(socketId, username);
      return existingUserInGroup;
    } else {
      // User doesn't exist in this group - check if user exists globally
      let user = await this.databaseService.findUserByUsername(username);
      
      if (user) {
        logger.info(`User "${username}" exists globally with password: ${user.password ? 'YES' : 'NO'}`);
        
        // Handle password logic for existing user
        if (user.password && !password) {
          // User has password but didn't provide one
          logger.warn(`User "${username}" exists globally with password but no password provided for group ${group.code}`);
          throw new Error(`Username "${username}" requires a password to join this group.`);
        } else if (user.password && password) {
          // User has password and provided one - verify it
          const isValidPassword = await this.databaseService.verifyUserPassword(user, password);
          if (!isValidPassword) {
            logger.warn(`Invalid password for user "${username}" in group ${group.code}`);
            throw new Error('Invalid password for this username.');
          }
          logger.info(`Valid password provided for user "${username}" in group ${group.code}`);
        } else if (!user.password && password) {
          // User doesn't have password but provided one - set it
          logger.info(`Setting password for user "${username}" in group ${group.code}`);
          await this.databaseService.updateUserPassword(user.id, password);
          // Update the user object to reflect the new password
          user.password = await bcrypt.hash(password, 10);
        } else {
          // User doesn't have password and didn't provide one - that's fine
          logger.info(`User "${username}" joining group ${group.code} without password`);
        }
        
        // Add them to this group
        logger.info(`User "${username}" exists globally, adding to group ${group.code}`);
        await this.databaseService.addUserToGroup(group.id, user.id);
        await this.databaseService.updateUserSocketId(user.id, socketId);
      } else {
        // User doesn't exist anywhere - create new user
        logger.info(`Creating new user "${username}" for group ${group.code} with password: ${password ? 'YES' : 'NO'}`);
        user = await this.databaseService.createUser(username, socketId, password);
        await this.databaseService.addUserToGroup(group.id, user.id);
      }
      
      this.userSockets.set(socketId, username);
      return user;
    }
  }

  async removeUserFromGroup(group: GroupEntity, socketId: string): Promise<UserEntity | null> {
    const user = await this.databaseService.findUserBySocketId(socketId);
    if (user) {
      await this.databaseService.removeUserFromGroup(group.id, user.id);
      // Clear the socketId to allow reconnection with same username
      await this.databaseService.updateUserSocketId(user.id, '');
      this.userSockets.delete(socketId);
    }
    return user;
  }

  async removeUserFromAllGroups(socketId: string): Promise<{ group: GroupEntity; user: UserEntity }[]> {
    const user = await this.databaseService.findUserBySocketId(socketId);
    const removedUsers: { group: GroupEntity; user: UserEntity }[] = [];
    
    if (user) {
      const userGroups = await this.databaseService.getUserGroups(user.id);
      for (const group of userGroups) {
        await this.databaseService.removeUserFromGroup(group.id, user.id);
        removedUsers.push({ group, user });
      }
      
      // Clear the socketId to allow reconnection with same username
      await this.databaseService.updateUserSocketId(user.id, '');
      logger.info(`User ${user.username} status set to inactive, socketId cleared`);
    }
    
    this.userSockets.delete(socketId);
    return removedUsers;
  }

  async addMessageToGroup(group: GroupEntity, message: string, username: string, userId: string): Promise<MessageEntity> {
    return await this.databaseService.createMessage(
      message,
      username,
      group.code,
      userId,
      group.id
    );
  }

  async getUserGroups(socketId: string): Promise<any[]> {
    const user = await this.databaseService.findUserBySocketId(socketId);
    if (!user) return [];

    const groups = await this.databaseService.getUserGroups(user.id);
    return groups.map(group => ({
      groupCode: group.code,
      groupId: group.id,
      memberCount: group.users?.length || 0,
      members: group.users?.map(u => u.username) || [],
      lastMessage: group.messages?.[group.messages.length - 1] || null
    }));
  }

  async checkUsernameExists(group: GroupEntity, username: string): Promise<boolean> {
    return await this.databaseService.isUsernameInGroup(username, group.id);
  }

  async findExistingUserInGroup(group: GroupEntity, username: string): Promise<UserEntity | null> {
    return await this.databaseService.isUsernameInGroupAnyStatus(username, group.id);
  }


  async verifyUserPassword(user: UserEntity, password: string): Promise<boolean> {
    return await this.databaseService.verifyUserPassword(user, password);
  }

  async cleanupEmptyGroup(groupId: string): Promise<void> {
    const group = await this.databaseService.findGroupById(groupId);
    if (group && (!group.users || group.users.length === 0)) {
      setTimeout(async () => {
        const currentGroup = await this.databaseService.findGroupById(groupId);
        if (currentGroup && (!currentGroup.users || currentGroup.users.length === 0)) {
          await this.databaseService.deleteGroup(groupId);
        }
      }, 30000);
    }
  }

  async cleanupInactiveUsersFromGroup(groupId: string): Promise<void> {
    await this.databaseService.cleanupInactiveUsersFromGroup(groupId);
  }

  async getStats() {
    return await this.databaseService.getStats();
  }

  async getGroupMessages(groupId: string): Promise<MessageEntity[]> {
    return await this.databaseService.getGroupMessages(groupId);
  }
}
