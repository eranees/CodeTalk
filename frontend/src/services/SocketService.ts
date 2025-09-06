import { io, Socket } from 'socket.io-client';
import type {
  Message,
  TypingUser,
  UserGroup,
  JoinedGroupData,
  UserJoinedData,
  UserLeftData,
  GroupSwitchedData,
  ErrorData,
  JoinGroupData,
  SendMessageData,
  SwitchGroupData,
  TypingData
} from '../types';

export class SocketService {
  private socket: Socket | null = null;
  private _isConnected = false;

  // Event handlers
  private onConnect?: () => void;
  private onDisconnect?: (reason: string) => void;
  private onConnectError?: (error: Error) => void;
  private onReconnect?: () => void;
  private onJoinedGroup?: (data: JoinedGroupData) => void;
  private onUserJoined?: (data: UserJoinedData) => void;
  private onUserLeft?: (data: UserLeftData) => void;
  private onNewMessage?: (message: Message) => void;
  private onGroupSwitched?: (data: GroupSwitchedData) => void;
  private onMyGroups?: (groups: UserGroup[]) => void;
  private onUserTyping?: (data: TypingUser) => void;
  private onError?: (data: ErrorData) => void;

  connect(): void {
    this.socket = io('http://localhost:3001', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this._isConnected = true;
      this.onConnect?.();
    });

    this.socket.on('disconnect', (reason) => {
      this._isConnected = false;
      this.onDisconnect?.(reason);
    });

    this.socket.on('connect_error', (error) => {
      this.onConnectError?.(error);
    });

    this.socket.on('reconnect', () => {
      this._isConnected = true;
      this.onReconnect?.();
    });

    this.socket.on('joined-group', (data: JoinedGroupData) => {
      this.onJoinedGroup?.(data);
    });

    this.socket.on('user-joined', (data: UserJoinedData) => {
      this.onUserJoined?.(data);
    });

    this.socket.on('user-left', (data: UserLeftData) => {
      this.onUserLeft?.(data);
    });

    this.socket.on('new-message', (message: Message) => {
      this.onNewMessage?.(message);
    });

    this.socket.on('group-switched', (data: GroupSwitchedData) => {
      this.onGroupSwitched?.(data);
    });

    this.socket.on('my-groups', (groups: UserGroup[]) => {
      this.onMyGroups?.(groups);
    });

    this.socket.on('user-typing', (data: TypingUser) => {
      this.onUserTyping?.(data);
    });

    this.socket.on('error', (data: ErrorData) => {
      this.onError?.(data);
    });
  }

  // Event handler setters
  setOnConnect(handler: () => void): void {
    this.onConnect = handler;
  }

  setOnDisconnect(handler: (reason: string) => void): void {
    this.onDisconnect = handler;
  }

  setOnConnectError(handler: (error: Error) => void): void {
    this.onConnectError = handler;
  }

  setOnReconnect(handler: () => void): void {
    this.onReconnect = handler;
  }

  setOnJoinedGroup(handler: (data: JoinedGroupData) => void): void {
    this.onJoinedGroup = handler;
  }

  setOnUserJoined(handler: (data: UserJoinedData) => void): void {
    this.onUserJoined = handler;
  }

  setOnUserLeft(handler: (data: UserLeftData) => void): void {
    this.onUserLeft = handler;
  }

  setOnNewMessage(handler: (message: Message) => void): void {
    this.onNewMessage = handler;
  }

  setOnGroupSwitched(handler: (data: GroupSwitchedData) => void): void {
    this.onGroupSwitched = handler;
  }

  setOnMyGroups(handler: (groups: UserGroup[]) => void): void {
    this.onMyGroups = handler;
  }

  setOnUserTyping(handler: (data: TypingUser) => void): void {
    this.onUserTyping = handler;
  }

  setOnError(handler: (data: ErrorData) => void): void {
    this.onError = handler;
  }

  // Socket actions
  joinGroup(data: JoinGroupData): void {
    this.socket?.emit('join-group', data);
  }

  sendMessage(data: SendMessageData): void {
    this.socket?.emit('send-message', data);
  }

  switchGroup(data: SwitchGroupData): void {
    this.socket?.emit('switch-group', data);
  }

  startTyping(data: TypingData): void {
    this.socket?.emit('typing-start', data);
  }

  stopTyping(data: TypingData): void {
    this.socket?.emit('typing-stop', data);
  }

  getMyGroups(): void {
    this.socket?.emit('get-my-groups');
  }

  // Getters
  get isConnected(): boolean {
    return this._isConnected;
  }

  disconnect(): void {
    this.socket?.close();
    this.socket = null;
    this._isConnected = false;
  }
}
