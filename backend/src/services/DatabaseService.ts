import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { UserEntity } from '../entities/user.entity';
import { GroupEntity } from '../entities/group.entity';
import { MessageEntity } from '../entities/message.entity';
import bcrypt from 'bcrypt';
import logger from '../config/logger';

export class DatabaseService {
  private readonly userRepository: Repository<UserEntity>;
  private readonly groupRepository: Repository<GroupEntity>;
  private readonly messageRepository: Repository<MessageEntity>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(UserEntity);
    this.groupRepository = AppDataSource.getRepository(GroupEntity);
    this.messageRepository = AppDataSource.getRepository(MessageEntity);
  }

  // User operations
  async findUserByUsername(username: string): Promise<UserEntity | null> {
    // Case-insensitive search
    return await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(user.username) = LOWER(:username)', { username })
      .getOne();
  }

  async findUserBySocketId(socketId: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({ where: { socketId } });
  }

  async createUser(username: string, socketId: string, password?: string): Promise<UserEntity> {
    // Check if user already exists before creating
    const existingUser = await this.findUserByUsername(username);
    if (existingUser) {
      throw new Error(`User with username "${username}" already exists`);
    }
    
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
    const user = this.userRepository.create({ 
      username, 
      socketId, 
      status: 'active',
      password: hashedPassword 
    });
    return await this.userRepository.save(user);
  }

  async updateUserSocketId(userId: string, socketId: string): Promise<void> {
    const status = socketId && socketId.trim() !== '' ? 'active' : 'inactive';
    await this.userRepository.update(userId, { socketId, status });
  }

  async updateUserStatus(userId: string, status: 'active' | 'inactive'): Promise<void> {
    await this.userRepository.update(userId, { status });
  }

  async findInactiveUsers(connectedSocketIds: string[]): Promise<UserEntity[]> {
    // Find users who have socket IDs that are not in the connected list
    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.socketId IS NOT NULL')
      .andWhere('user.socketId != :empty', { empty: '' })
      .andWhere('user.socketId NOT IN (:...connectedSockets)', { connectedSockets: connectedSocketIds })
      .andWhere('user.status = :status', { status: 'active' })
      .getMany();
  }

  async deleteUser(userId: string): Promise<void> {
    // First delete all messages by the user
    await this.messageRepository.delete({ user: { id: userId } });
    
    // Then delete the user
    await this.userRepository.delete(userId);
  }

  // Group operations
  async findGroupByCode(code: string): Promise<GroupEntity | null> {
    const group = await this.groupRepository.findOne({ 
      where: { code },
      relations: ['users', 'messages']
    });
    
    if (group) {
      // Filter to only include active users
      group.users = group.users.filter(user => user.status === 'active');
    }
    
    return group;
  }

  async findGroupById(id: string): Promise<GroupEntity | null> {
    const group = await this.groupRepository.findOne({ 
      where: { id },
      relations: ['users', 'messages']
    });
    
    if (group) {
      // Filter to only include active users
      group.users = group.users.filter(user => user.status === 'active');
    }
    
    return group;
  }

  async findGroupByIdWithActiveUsers(id: string): Promise<GroupEntity | null> {
    const group = await this.groupRepository.findOne({ 
      where: { id },
      relations: ['users', 'messages']
    });
    
    if (group) {
      // Filter to only include active users
      group.users = group.users.filter(user => user.status === 'active');
    }
    
    return group;
  }

  async createGroup(code: string): Promise<GroupEntity> {
    const group = this.groupRepository.create({ code });
    return await this.groupRepository.save(group);
  }

  async addUserToGroup(groupId: string, userId: string): Promise<void> {
    const group = await this.groupRepository.findOne({ 
      where: { id: groupId },
      relations: ['users']
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (group && user) {
      // Check if user is already in the group
      const userAlreadyInGroup = group.users.some(u => u.id === userId);
      if (!userAlreadyInGroup) {
        group.users.push(user);
        await this.groupRepository.save(group);
      }
    }
  }

  async removeUserFromGroup(groupId: string, userId: string): Promise<void> {
    const group = await this.groupRepository.findOne({ 
      where: { id: groupId },
      relations: ['users']
    });
    
    if (group) {
      group.users = group.users.filter(user => user.id !== userId);
      await this.groupRepository.save(group);
    }
  }

  async getGroupUsers(groupId: string): Promise<UserEntity[]> {
    const group = await this.groupRepository.findOne({ 
      where: { id: groupId },
      relations: ['users']
    });
    // Only return active users
    return group?.users.filter(user => user.status === 'active') || [];
  }

  async deleteGroup(groupId: string): Promise<void> {
    // First delete all messages in the group
    await this.messageRepository.delete({ group: { id: groupId } });
    
    // Then delete the group
    await this.groupRepository.delete(groupId);
  }

  // Message operations
  async createMessage(
    message: string,
    username: string,
    groupCode: string,
    userId: string,
    groupId: string
  ): Promise<MessageEntity> {
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new Error('Group not found');
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    const messageEntity = this.messageRepository.create({
      message,
      username,
      groupCode,
      user,
      group
    });
    return await this.messageRepository.save(messageEntity);
  }

  async getGroupMessages(groupId: string): Promise<MessageEntity[]> {
    return await this.messageRepository.find({
      where: { group: { id: groupId } },
      order: { timestamp: 'ASC' }
    });
  }

  async getUserGroups(userId: string): Promise<GroupEntity[]> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['groups']
    });
    return user?.groups || [];
  }

  // Check if username exists in group and is currently active
  async isUsernameInGroup(username: string, groupId: string): Promise<boolean> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['users']
    });
    
    if (!group) return false;
    
    // Check if user exists in group AND is active (case-insensitive)
    return group.users.some(user => 
      user.username.toLowerCase() === username.toLowerCase() && 
      user.status === 'active'
    );
  }

  // Check if username exists in group (case-insensitive, any status)
  async isUsernameInGroupAnyStatus(username: string, groupId: string): Promise<UserEntity | null> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['users']
    });
    
    if (!group) return null;
    
    // Find user with matching username (case-insensitive)
    return group.users.find(user => 
      user.username.toLowerCase() === username.toLowerCase()
    ) || null;
  }


  // Verify password for user
  async verifyUserPassword(user: UserEntity, password: string): Promise<boolean> {
    if (!user.password) return false;
    return await bcrypt.compare(password, user.password);
  }

  // Clean up inactive users from a group (users with inactive status)
  async cleanupInactiveUsersFromGroup(groupId: string): Promise<void> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['users']
    });
    
    if (group) {
      // Remove users with inactive status
      group.users = group.users.filter(user => user.status === 'active');
      await this.groupRepository.save(group);
    }
  }

  // Get database stats
  async getStats() {
    const userCount = await this.userRepository.count();
    const groupCount = await this.groupRepository.count();
    const messageCount = await this.messageRepository.count();
    
    return {
      totalUsers: userCount,
      activeGroups: groupCount,
      totalMessages: messageCount
    };
  }

  async updateUserPassword(userId: string, password: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.userRepository.update(userId, { password: hashedPassword });
  }
}
