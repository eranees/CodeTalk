import { Server } from 'socket.io';
import { Socket } from 'socket.io';
import { GroupManager } from './GroupManager';
import { SocketHandlers } from './SocketHandlers';

export class SocketService {
  private socketHandlers: SocketHandlers;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(private io: Server, private groupManager: GroupManager) {
    this.socketHandlers = new SocketHandlers(io, groupManager);
    this.setupSocketEvents();
    this.startCleanupInterval();
  }

  private setupSocketEvents(): void {
    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: Socket): void {
    // Heartbeat/ping event
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Join group event
    socket.on('join-group', async (data) => {
      await this.socketHandlers.handleJoinGroup(socket, data);
    });

    // Send message event
    socket.on('send-message', async (data) => {
      await this.socketHandlers.handleSendMessage(socket, data);
    });

    // Switch group event
    socket.on('switch-group', (data) => {
      this.socketHandlers.handleSwitchGroup(socket, data);
    });

    // Get my groups event
    socket.on('get-my-groups', () => {
      this.socketHandlers.handleGetMyGroups(socket);
    });

    // Typing events
    socket.on('typing-start', (data) => {
      this.socketHandlers.handleTypingStart(socket, data);
    });

    socket.on('typing-stop', (data) => {
      this.socketHandlers.handleTypingStop(socket, data);
    });

    // Leave group event
    socket.on('leave-group', () => {
      this.socketHandlers.handleLeaveGroup(socket);
    });

    // Logout event (explicit logout)
    socket.on('logout', () => {
      this.socketHandlers.handleLogout(socket);
    });

    // Disconnect event (browser close, network issues, etc.)
    socket.on('disconnect', (reason) => {
      this.socketHandlers.handleDisconnect(socket, reason);
    });
  }

  private startCleanupInterval(): void {
    // Run cleanup every 30 seconds to detect and clean up inactive users
    this.cleanupInterval = setInterval(async () => {
      try {
        await this.cleanupInactiveUsers();
      } catch (error) {
        console.error('Error in cleanup interval:', error);
      }
    }, 30000); // 30 seconds
  }

  private async cleanupInactiveUsers(): Promise<void> {
    try {
      // Get all connected socket IDs
      const connectedSockets = Array.from(this.io.sockets.sockets.keys());
      
      // Find users with socket IDs that are no longer connected
      const inactiveUsers = await this.groupManager.databaseService.findInactiveUsers(connectedSockets);
      
      if (inactiveUsers.length > 0) {
        console.log(`Found ${inactiveUsers.length} inactive users to clean up`);
        
        for (const user of inactiveUsers) {
          // Set user status to inactive
          await this.groupManager.databaseService.updateUserStatus(user.id, 'inactive');
          
          // Get user's groups and clean them up
          const userGroups = await this.groupManager.databaseService.getUserGroups(user.id);
          for (const group of userGroups) {
            await this.groupManager.cleanupInactiveUsersFromGroup(group.id);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up inactive users:', error);
    }
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}
