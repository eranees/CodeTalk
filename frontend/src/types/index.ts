export interface Message {
  id: string;
  message: string;
  username: string;
  timestamp: string;
  groupCode: string;
  groupId: string;
}

export interface TypingUser {
  username: string;
  isTyping: boolean;
}

export interface UserGroup {
  groupCode: string;
  groupId: string;
  memberCount: number;
  members: string[];
  lastMessage?: Message | null;
}

export interface JoinedGroupData {
  groupCode: string;
  groupId: string;
  username: string;
  memberCount: number;
  members: string[];
  messages: Message[];
  allGroups: UserGroup[];
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

export interface ErrorData {
  message: string;
}

export interface JoinGroupData {
  username: string;
  groupCode: string;
}

export interface SendMessageData {
  message: string;
  groupCode: string;
  groupId: string;
}

export interface SwitchGroupData {
  groupId: string;
}

export interface TypingData {
  groupCode: string;
  groupId: string;
}
