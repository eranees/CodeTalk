import { useState, useEffect, useRef } from 'react';
import { SocketService } from '../services/SocketService';
import type {
  Message,
  TypingUser,
  UserGroup,
  JoinedGroupData,
  UserJoinedData,
  UserLeftData,
  GroupSwitchedData,
  ErrorData
} from '../types';

export const useChat = () => {
  const [socketService] = useState(() => new SocketService());
  const [isConnected, setIsConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [currentGroup, setCurrentGroup] = useState<string | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [myGroups, setMyGroups] = useState<UserGroup[]>([]);
  const [showGroupList, setShowGroupList] = useState(false);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentGroupRef = useRef<string | null>(null);
  const currentGroupIdRef = useRef<string | null>(null);
  const usernameRef = useRef<string>('');

  const createSystemMessage = (message: string) => ({
    id: `system-${Date.now()}`,
    message,
    username: 'System',
    timestamp: new Date().toISOString(),
    groupCode: currentGroupRef.current || '',
    groupId: currentGroupIdRef.current || ''
  });

  // Keep refs in sync with state
  useEffect(() => {
    currentGroupRef.current = currentGroup;
    currentGroupIdRef.current = currentGroupId;
    usernameRef.current = username;
  }, [currentGroup, currentGroupId, username]);

  // Setup socket event handlers
  useEffect(() => {
    socketService.setOnConnect(() => {
      setIsConnected(true);
      setError(null);
    });

    socketService.setOnDisconnect((reason) => {
      setIsConnected(false);
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        setError('Connection lost. Attempting to reconnect...');
      }
    });

    socketService.setOnConnectError(() => {
      setError('Failed to connect to server. Make sure backend is running on port 3001.');
    });

    socketService.setOnReconnect(() => {
      setIsConnected(true);
      setError(null);
      
      // Rejoin the group if we were in one
      if (currentGroupRef.current && usernameRef.current) {
        const currentGroup = currentGroupRef.current;
        const currentUsername = usernameRef.current;
        if (currentGroup && currentUsername) {
          socketService.joinGroup({ 
            username: currentUsername.trim(), 
            groupCode: currentGroup.trim() 
          });
        }
      }
    });

    socketService.setOnJoinedGroup((data: JoinedGroupData) => {
      setCurrentGroup(data.groupCode);
      setCurrentGroupId(data.groupId);
      setMemberCount(data.memberCount);
      setMembers(data.members);
      setMyGroups(data.allGroups || []);
      setMessages(data.messages || []);
      setIsJoining(false);
      setError(null);
    });

    socketService.setOnUserJoined((data: UserJoinedData) => {
      setMemberCount(data.memberCount);
      setMembers(data.members);
      setMessages(prev => [...prev, createSystemMessage(`${data.username} joined the group`)]);
    });

    socketService.setOnUserLeft((data: UserLeftData) => {
      setMemberCount(data.memberCount);
      setMembers(data.members);
      setMessages(prev => [...prev, createSystemMessage(`${data.username} left the group`)]);
    });

    socketService.setOnNewMessage((message: Message) => {
      // Accept messages for the current group or if we don't have a current group set
      if (!currentGroupIdRef.current || message?.groupId === currentGroupIdRef.current) {
        setMessages(prev => [...prev, message]);
      }
    });

    socketService.setOnGroupSwitched((data: GroupSwitchedData) => {
      setCurrentGroup(data.groupCode);
      setCurrentGroupId(data.groupId);
      setMemberCount(data.memberCount);
      setMembers(data.members);
      setMessages(data.messages || []);
      setError(null);
    });

    socketService.setOnMyGroups((groups: UserGroup[]) => {
      setMyGroups(groups);
    });

    socketService.setOnUserTyping((data: TypingUser) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(user => user.username !== data.username);
        if (data.isTyping) {
          return [...filtered, data];
        }
        return filtered;
      });
    });

    socketService.setOnError((data: ErrorData) => {
      setError(data.message);
      setIsJoining(false);
      
      // Auto-rejoin if user not in group
      if (data.message.includes('not in this group') && currentGroupRef.current && usernameRef.current) {
        setTimeout(() => {
          const currentGroup = currentGroupRef.current;
          const currentUsername = usernameRef.current;
          if (currentGroup && currentUsername) {
            socketService.joinGroup({ 
              username: currentUsername.trim(), 
              groupCode: currentGroup.trim() 
            });
          }
        }, 1000);
      }
    });

    // Connect to socket
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleJoinGroup = (username: string, groupCode: string) => {
    if (!username.trim() || !groupCode.trim()) {
      setError('Please enter both username and group code');
      return;
    }

    setUsername(username);
    setIsJoining(true);
    setError(null);
    socketService.joinGroup({ username: username.trim(), groupCode: groupCode.trim() });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentGroup || !socketService.isConnected || !currentGroupId) {
      return;
    }
    
    socketService.sendMessage({
      message: newMessage.trim(),
      groupCode: currentGroup,
      groupId: currentGroupId
    });
    setNewMessage('');
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!isTyping && value.trim() && currentGroupRef.current && currentGroupIdRef.current) {
      setIsTyping(true);
      socketService.startTyping({ groupCode: currentGroupRef.current, groupId: currentGroupIdRef.current });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (currentGroupRef.current && currentGroupIdRef.current) {
        socketService.stopTyping({ groupCode: currentGroupRef.current, groupId: currentGroupIdRef.current });
      }
    }, 1000);
  };

  const handleSwitchGroup = (groupId: string) => {
    socketService.switchGroup({ groupId });
  };

  const handleLeaveGroup = () => {
    setCurrentGroup(null);
    setCurrentGroupId(null);
    setMessages([]);
    setMembers([]);
    setMemberCount(0);
    setTypingUsers([]);
    setNewMessage('');
    setIsTyping(false);
    setMyGroups([]);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleClearError = () => {
    setError(null);
  };

  const handleToggleGroupList = () => {
    setShowGroupList(!showGroupList);
  };

  return {
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
  };
};
