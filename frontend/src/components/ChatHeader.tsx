import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Badge,
  IconButton
} from '@mui/material';
import {
  Group as GroupIcon,
  ExitToApp as ExitIcon,
  Chat as ChatIcon
} from '@mui/icons-material';

interface ChatHeaderProps {
  currentGroup: string | null;
  memberCount: number;
  myGroups: any[];
  showGroupList: boolean;
  onToggleGroupList: () => void;
  onLeaveGroup: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentGroup,
  memberCount,
  myGroups,
  showGroupList,
  onToggleGroupList,
  onLeaveGroup
}) => {
  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <ChatIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          CodeTalk
        </Typography>
        {currentGroup && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge badgeContent={memberCount} color="secondary">
              <GroupIcon />
            </Badge>
            <Typography variant="body2">
              {currentGroup}
            </Typography>
            {myGroups.length > 1 && (
              <IconButton 
                color="inherit" 
                onClick={onToggleGroupList}
                title="Switch Groups"
              >
                <ChatIcon />
              </IconButton>
            )}
            <IconButton color="inherit" onClick={onLeaveGroup}>
              <ExitIcon />
            </IconButton>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default ChatHeader;
