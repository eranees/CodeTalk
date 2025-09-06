export interface Group {
  id: string;
  code: string;
  users: Map<string, User>;
  messages: Message[];
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  socketId: string;
  joinedAt: Date;
  currentGroupId?: string;
}

export interface Message {
  id: string;
  message: string;
  username: string;
  timestamp: string;
  groupCode: string;
  groupId: string;
}

export interface JoinGroupData {
  username: string;
  groupCode: string;
  groupId?: string;
}

export interface SendMessageData {
  message: string;
  groupCode: string;
  groupId?: string;
}

export interface SwitchGroupData {
  groupId: string;
}

export interface TypingData {
  groupCode: string;
  groupId?: string;
}

export interface UserGroup {
  groupCode: string;
  groupId: string;
  memberCount: number;
  members: string[];
  lastMessage?: Message | null;
}

export interface UserJoinedData {
  username: string;
  memberCount: number;
  members: string[];
}

export interface UserLeftData {
  username: string;
  memberCount: number;
  members: string[];
}

export interface GroupSwitchedData {
  groupCode: string;
  groupId: string;
  memberCount: number;
  members: string[];
  messages: Message[];
}

export interface TypingUser {
  username: string;
  isTyping: boolean;
}

export interface ErrorData {
  message: string;
}
