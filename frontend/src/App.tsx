import React from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box
} from '@mui/material';
import { useChat } from './hooks/useChat';
import ChatHeader from './components/ChatHeader';
import GroupList from './components/GroupList';
import JoinGroup from './components/JoinGroup';
import ChatRoom from './components/ChatRoom';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#25D366',
    },
    secondary: {
      main: '#128C7E',
    },
    background: {
      default: '#f0f0f0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const App: React.FC = () => {
  const {
    // State
    isConnected,
    currentGroup,
    currentGroupId,
    messages,
    members,
    memberCount,
    newMessage,
    typingUsers,
    error,
    isJoining,
    myGroups,
    showGroupList,
    username,
    
    // Actions
    handleJoinGroup,
    handleSendMessage,
    handleTyping,
    handleSwitchGroup,
    handleLeaveGroup,
    handleClearError,
    handleToggleGroupList
  } = useChat();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <ChatHeader
          currentGroup={currentGroup}
          memberCount={memberCount}
          myGroups={myGroups}
          showGroupList={showGroupList}
          onToggleGroupList={handleToggleGroupList}
          onLeaveGroup={handleLeaveGroup}
        />

        <GroupList
          myGroups={myGroups}
          currentGroupId={currentGroupId}
          showGroupList={showGroupList}
          onSwitchGroup={handleSwitchGroup}
          onClose={() => handleToggleGroupList()}
        />

        <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', py: 2 }}>
          {!currentGroup ? (
            <JoinGroup
              onJoinGroup={handleJoinGroup}
              isJoining={isJoining}
              isConnected={isConnected}
              error={error}
              onClearError={handleClearError}
            />
          ) : (
            <ChatRoom
              error={error}
              onClearError={handleClearError}
              members={members}
              memberCount={memberCount}
              username={username}
              isConnected={isConnected}
              messages={messages}
              typingUsers={typingUsers}
              newMessage={newMessage}
              onMessageChange={handleTyping}
              onSendMessage={handleSendMessage}
              currentGroup={currentGroup}
              currentGroupId={currentGroupId}
            />
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;