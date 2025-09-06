import React from 'react';
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

interface GroupListProps {
  myGroups: any[];
  currentGroupId: string | null;
  showGroupList: boolean;
  onSwitchGroup: (groupId: string) => void;
  onClose: () => void;
}

const GroupList: React.FC<GroupListProps> = ({
  myGroups,
  currentGroupId,
  showGroupList,
  onSwitchGroup,
  onClose
}) => {
  if (!showGroupList || myGroups.length <= 1) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ position: 'absolute', top: 64, right: 16, zIndex: 1000, minWidth: 200 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          My Groups ({myGroups.length})
        </Typography>
        <List dense>
          {myGroups.map((group) => (
            <ListItem
              key={group.groupId}
              button
              onClick={() => {
                onSwitchGroup(group.groupId);
                onClose();
              }}
              sx={{
                backgroundColor: group.groupId === currentGroupId ? 'primary.light' : 'transparent',
                borderRadius: 1,
                mb: 0.5
              }}
            >
              <ListItemText
                primary={group.groupCode}
                secondary={`${group.memberCount} members`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default GroupList;
