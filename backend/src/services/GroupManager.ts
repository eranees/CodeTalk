import { Group, User, Message, JoinGroupData, SendMessageData, UserGroup } from '../types';

export class GroupManager {
  private groups = new Map<string, Group>();
  private userSockets = new Map<string, string>(); // socketId -> username mapping

  createGroup(groupCode: string): Group {
    const groupId = `${groupCode}-${Date.now()}`;
    const group: Group = {
      id: groupId,
      code: groupCode,
      users: new Map(),
      messages: [],
      createdAt: new Date()
    };
    this.groups.set(groupId, group);
    return group;
  }

  findGroupByCode(groupCode: string): Group | undefined {
    return Array.from(this.groups.values()).find(g => g.code === groupCode);
  }

  getGroup(groupId: string): Group | undefined {
    return this.groups.get(groupId);
  }

  addUserToGroup(group: Group, socketId: string, username: string): User {
    const user: User = {
      id: socketId,
      username,
      socketId,
      joinedAt: new Date(),
      currentGroupId: group.id
    };
    group.users.set(socketId, user);
    this.userSockets.set(socketId, username);
    return user;
  }

  removeUserFromGroup(group: Group, socketId: string): User | undefined {
    const user = group.users.get(socketId);
    if (user) {
      group.users.delete(socketId);
      this.userSockets.delete(socketId);
    }
    return user;
  }

  removeUserFromAllGroups(socketId: string): { group: Group; user: User }[] {
    const removedUsers: { group: Group; user: User }[] = [];
    
    this.groups.forEach((group, groupId) => {
      if (group.users.has(socketId)) {
        const user = group.users.get(socketId);
        if (user) {
          group.users.delete(socketId);
          removedUsers.push({ group, user });
        }
      }
    });
    
    this.userSockets.delete(socketId);
    return removedUsers;
  }

  addMessageToGroup(group: Group, message: Message): void {
    group.messages.push(message);
  }

  getUserGroups(socketId: string): UserGroup[] {
    return Array.from(this.groups.values())
      .filter(g => g.users.has(socketId))
      .map(g => ({
        groupCode: g.code,
        groupId: g.id,
        memberCount: g.users.size,
        members: Array.from(g.users.values()).map(u => u.username),
        lastMessage: g.messages[g.messages.length - 1] || null
      }));
  }

  checkUsernameExists(group: Group, username: string): boolean {
    return Array.from(group.users.values()).some(u => u.username === username);
  }

  cleanupEmptyGroup(groupId: string): void {
    const group = this.groups.get(groupId);
    if (group && group.users.size === 0) {
      setTimeout(() => {
        const currentGroup = this.groups.get(groupId);
        if (currentGroup && currentGroup.users.size === 0) {
          this.groups.delete(groupId);
        }
      }, 30000);
    }
  }

  getStats() {
    return {
      activeGroups: this.groups.size,
      totalUsers: Array.from(this.groups.values()).reduce((sum, group) => sum + group.users.size, 0)
    };
  }

  getAllGroups(): Group[] {
    return Array.from(this.groups.values());
  }
}
