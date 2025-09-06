import React, { useRef, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material';
import type { Message, TypingUser } from '../types';

interface MessageListProps {
  messages: Message[];
  typingUsers: TypingUser[];
  username: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  typingUsers,
  username
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOwnMessage = (messageUsername: string) => messageUsername === username;

  const getMessageStyles = (message: Message) => {
    const isSystem = message.username === 'System';
    const isLeaveMessage = message.message.includes('left the group');
    const isOwn = isOwnMessage(message.username);

    return {
      backgroundColor: isSystem 
        ? (isLeaveMessage ? 'error.light' : 'grey.300')
        : (isOwn ? 'primary.main' : 'grey.100'),
      color: isSystem 
        ? (isLeaveMessage ? 'error.dark' : 'text.primary')
        : (isOwn ? 'white' : 'text.primary')
    };
  };

  return (
    <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
      <List>
        {messages.map((message) => (
          <ListItem
            key={message.id}
            sx={{
              flexDirection: isOwnMessage(message.username) ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              mb: 1
            }}
          >
            <Box
              sx={{
                maxWidth: '70%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isOwnMessage(message.username) ? 'flex-end' : 'flex-start'
              }}
            >
              {message.username !== 'System' && (
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                  {message.username}
                </Typography>
              )}
              <Paper
                elevation={1}
                sx={{
                  p: 1.5,
                  ...getMessageStyles(message),
                  borderRadius: 2,
                  wordBreak: 'break-word'
                }}
              >
                <Typography variant="body1">
                  {message.message}
                </Typography>
              </Paper>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {formatTime(message.timestamp)}
              </Typography>
            </Box>
          </ListItem>
        ))}
        
        {typingUsers.length > 0 && (
          <ListItem>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {typingUsers.map(user => user.username).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </Typography>
              <CircularProgress size={16} />
            </Box>
          </ListItem>
        )}
        
        <div ref={messagesEndRef} />
      </List>
    </Box>
  );
};

export default MessageList;
