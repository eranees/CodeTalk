import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Group as GroupIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  GroupAdd as GroupAddIcon,
  Message as MessageIcon
} from '@mui/icons-material';

interface JoinGroupProps {
  onJoinGroup: (username: string, groupCode: string) => void;
  isJoining: boolean;
  isConnected: boolean;
  error: string | null;
  onClearError: () => void;
}

const JoinGroup: React.FC<JoinGroupProps> = ({
  onJoinGroup,
  isJoining,
  isConnected,
  error,
  onClearError
}) => {
  const [username, setUsername] = useState('');
  const [groupCode, setGroupCode] = useState('');

  const handleSubmit = () => {
    if (!username.trim() || !groupCode.trim()) {
      return;
    }
    onJoinGroup(username.trim(), groupCode.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <ChatIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Join CodeTalk
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter your username and group code to start chatting
        </Typography>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          onClose={onClearError}
        >
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon />
              </InputAdornment>
            ),
          }}
          onKeyPress={handleKeyPress}
        />
        <TextField
          fullWidth
          label="Group Code"
          value={groupCode}
          onChange={(e) => setGroupCode(e.target.value)}
          variant="outlined"
          placeholder="e.g., lovewhatsapp"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <GroupIcon />
              </InputAdornment>
            ),
          }}
          onKeyPress={handleKeyPress}
        />
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={isJoining || !isConnected}
          startIcon={isJoining ? <CircularProgress size={20} /> : <GroupIcon />}
        >
          {isJoining ? 'Joining...' : 'Join Group'}
        </Button>
      </Box>

      {!isConnected && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Connecting to server...
        </Alert>
      )}

      <Accordion sx={{ mt: 3 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="how-to-use-content"
          id="how-to-use-header"
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoIcon color="primary" />
            <Typography variant="subtitle1" fontWeight="medium">
              How to use CodeTalk
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <GroupAddIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Create or Join Groups"
                secondary="Enter a group code to join an existing group or create a new one. Group codes are like room names (e.g., 'myteam', 'friends2024')"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <PersonIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Choose a Username"
                secondary="Pick a unique username for the group. Each username must be different within the same group."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <MessageIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Start Chatting"
                secondary="Send messages instantly to all group members. See who's online and typing in real-time."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SecurityIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Privacy & Security"
                secondary="Messages are only visible to group members. Groups are automatically deleted when empty."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SpeedIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Real-time Features"
                secondary="Enjoy instant messaging, typing indicators, member status, and auto-reconnection."
              />
            </ListItem>
          </List>
          
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>💡 Pro Tips:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              • Share the group code with friends to invite them to the same chat
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Use descriptive group codes like 'project-alpha' or 'family-chat'
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • You can join multiple groups with different codes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Messages are stored temporarily and will be lost when the group is empty
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default JoinGroup;
