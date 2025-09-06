import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GroupManager } from './services/GroupManager';
import { SocketService } from './services/SocketService';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Initialize services
const groupManager = new GroupManager();
const socketService = new SocketService(io, groupManager);

// Health check endpoint
app.get('/health', (req, res) => {
  const stats = groupManager.getStats();
  res.json({ 
    status: 'OK', 
    activeGroups: stats.activeGroups,
    totalUsers: stats.totalUsers
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`CodeTalk server running on port ${PORT}`);
});