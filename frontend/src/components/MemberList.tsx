import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Avatar
} from '@mui/material';

interface MemberListProps {
  members: string[];
  memberCount: number;
  username: string;
  isConnected: boolean;
}

const MemberList: React.FC<MemberListProps> = ({
  members,
  memberCount,
  username,
  isConnected
}) => {
  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2">
          Members ({memberCount})
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            sx={{ 
              width: 8, 
              height: 8, 
              borderRadius: '50%', 
              backgroundColor: isConnected ? 'success.main' : 'error.main' 
            }} 
          />
          <Typography variant="caption" color="text.secondary">
            {isConnected ? 'Connected' : 'Disconnected'}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {members.map((member, index) => (
          <Chip
            key={`${member}-${index}`}
            label={member}
            size="small"
            color={member === username ? 'primary' : 'default'}
            avatar={<Avatar sx={{ width: 24, height: 24 }}>{member[0].toUpperCase()}</Avatar>}
          />
        ))}
      </Box>
    </Box>
  );
};

export default MemberList;
