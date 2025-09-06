import { Server } from 'socket.io';
import { Socket } from 'socket.io';
import { GroupManager } from './GroupManager';
import { SocketHandlers } from './SocketHandlers';

export class SocketService {
  private socketHandlers: SocketHandlers;

  constructor(private io: Server, private groupManager: GroupManager) {
    this.socketHandlers = new SocketHandlers(io, groupManager);
    this.setupSocketEvents();
  }

  private setupSocketEvents(): void {
    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: Socket): void {
    // Join group event
    socket.on('join-group', (data) => {
      this.socketHandlers.handleJoinGroup(socket, data);
    });

    // Send message event
    socket.on('send-message', (data) => {
      this.socketHandlers.handleSendMessage(socket, data);
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

    // Disconnect event
    socket.on('disconnect', () => {
      this.socketHandlers.handleDisconnect(socket);
    });
  }
}
