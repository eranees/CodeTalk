import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { GroupManager } from './services/GroupManager';
import { SocketService } from './services/SocketService';
import { initializeDatabase } from './config/database';
import logger from './config/logger';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
// CORS configuration for local network access
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    /^http:\/\/192\.168\.\d+\.\d+:5173$/,
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

const io = new Server(server, {
  cors: corsOptions
});

app.use(cors(corsOptions));
app.use(express.json());

// Initialize services
const groupManager = new GroupManager();
const socketService = new SocketService(io, groupManager);

// Health check endpoint
app.get('/health', async (req: any, res: any) => {
  try {
    const stats = await groupManager.getStats();
    res.json({ 
      status: 'OK', 
      activeGroups: stats.activeGroups,
      totalUsers: stats.totalUsers,
      totalMessages: stats.totalMessages
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Database connection failed' 
    });
  }
});

const PORT = parseInt(process.env.PORT || '3001');

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    
server.listen(PORT, '0.0.0.0', () => {
      logger.info(`CodeTalk server running on port ${PORT}`);
      logger.info(`Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
      logger.info(`Server accessible on local network at: http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();