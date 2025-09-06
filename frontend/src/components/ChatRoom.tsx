import React from 'react';
import {
  Paper,
  Alert
} from '@mui/material';
import MemberList from './MemberList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import type { Message, TypingUser } from '../types';

interface ChatRoomProps {
  error: string | null;
  onClearError: () => void;
  members: string[];
  memberCount: number;
  username: string;
  isConnected: boolean;
  messages: Message[];
  typingUsers: TypingUser[];
  newMessage: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  currentGroup: string | null;
  currentGroupId: string | null;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  error,
  onClearError,
  members,
  memberCount,
  username,
  isConnected,
  messages,
  typingUsers,
  newMessage,
  onMessageChange,
  onSendMessage,
  currentGroup,
  currentGroupId
}) => {
  return (
    <Paper elevation={3} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ m: 2, mb: 0 }}
          onClose={onClearError}
        >
          {error}
        </Alert>
      )}
      
      <MemberList
        members={members}
        memberCount={memberCount}
        username={username}
        isConnected={isConnected}
      />

      <MessageList
        messages={messages}
        typingUsers={typingUsers}
        username={username}
      />

      <MessageInput
        newMessage={newMessage}
        onMessageChange={onMessageChange}
        onSendMessage={onSendMessage}
        isConnected={isConnected}
        currentGroup={currentGroup}
        currentGroupId={currentGroupId}
      />
    </Paper>
  );
};

export default ChatRoom;
