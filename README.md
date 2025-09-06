# CodeTalk - Monorepo

A full-stack real-time chat application similar to WhatsApp, built with Express.js + Socket.IO for the backend and React + Material UI for the frontend, organized as a monorepo.

## 🚀 Features

### Backend (Express + Socket.IO)
- ✅ Express server with Socket.IO support
- ✅ Group creation/joining based on secret codes
- ✅ In-memory user and group management
- ✅ Real-time message broadcasting within groups
- ✅ **Username validation** - prevents duplicate usernames in same group
- ✅ Typing indicators
- ✅ User join/leave notifications
- ✅ Health check endpoint
- ✅ Multi-group support for users
- ✅ Message history persistence

### Frontend (React + MUI)
- ✅ Material UI responsive design
- ✅ Username and group code entry
- ✅ Real-time chat interface
- ✅ Message display with timestamps
- ✅ Member list with count
- ✅ Typing indicators
- ✅ Auto-scroll to latest messages
- ✅ Message highlighting for own messages
- ✅ System notifications for user actions
- ✅ **Group switching** - switch between multiple groups
- ✅ **Connection status** indicator
- ✅ **Auto-reconnection** on connection loss
- ✅ **Clean console** - removed unnecessary logging

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite), Material UI, socket.io-client, TypeScript |
| Backend | Express.js, Socket.IO, TypeScript |
| Runtime | Node.js |
| Package Management | npm workspaces (monorepo) |

## 📁 Project Structure

```
codetalk-monorepo/
├── backend/                 # Express + Socket.IO server
│   ├── src/
│   │   ├── server.ts       # Main server file
│   │   ├── types/          # TypeScript type definitions
│   │   │   └── index.ts
│   │   └── services/       # Business logic services
│   │       ├── GroupManager.ts
│   │       ├── SocketHandlers.ts
│   │       └── SocketService.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React + MUI client
│   ├── src/
│   │   ├── App.tsx         # Main application component
│   │   ├── main.tsx        # Application entry point
│   │   ├── types/          # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── components/     # React components
│   │   │   ├── ChatHeader.tsx
│   │   │   ├── ChatRoom.tsx
│   │   │   ├── GroupList.tsx
│   │   │   ├── JoinGroup.tsx
│   │   │   ├── MemberList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   └── MessageList.tsx
│   │   ├── services/       # Business logic services
│   │   │   └── SocketService.ts
│   │   ├── hooks/          # Custom React hooks
│   │   │   └── useChat.ts
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── package.json            # Root package.json with workspace scripts
├── start-dev.bat           # Windows development script
├── start-dev.sh            # Unix development script
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd codetalk-monorepo
   ```

2. **Install all dependencies** (monorepo setup)
   ```bash
   npm run install:all
   ```

### Running the Application

#### Option 1: Quick Start (Recommended)
```bash
# Install dependencies and start both servers
npm run dev
```

#### Option 2: Manual Start
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

#### Option 3: Platform-specific Scripts
- **Windows**: Double-click `start-dev.bat`
- **Linux/Mac**: Run `./start-dev.sh`

#### Access the Application
- Backend API: `http://localhost:3001`
- Frontend App: `http://localhost:5173`
- Health Check: `http://localhost:3001/health`

## 🎯 How to Use

1. **Enter your username** - Choose a unique username (no duplicates allowed in same group)
2. **Enter a group code** - Use a secret code like "lovewhatsapp" to join or create a group
3. **Click "Join Group"** - You'll be connected to the group chat
4. **Start chatting** - Send messages and see them appear in real-time
5. **See who's online** - View the member list and count at the top
6. **Switch groups** - If you're in multiple groups, use the group switcher
7. **Leave the group** - Click the exit button to leave the current group

## 🔧 API Endpoints

### Backend Endpoints
- `GET /health` - Health check endpoint
  - Returns server status and active group/user counts

### Socket.IO Events

#### Client → Server
- `join-group` - Join or create a group
  - Data: `{ username: string, groupCode: string }`
- `send-message` - Send a message to the group
  - Data: `{ message: string, groupCode: string, groupId: string }`
- `switch-group` - Switch to a different group
  - Data: `{ groupId: string }`
- `typing-start` - Start typing indicator
  - Data: `{ groupCode: string, groupId: string }`
- `typing-stop` - Stop typing indicator
  - Data: `{ groupCode: string, groupId: string }`
- `get-my-groups` - Get all groups user is a member of

#### Server → Client
- `joined-group` - Successfully joined a group
- `user-joined` - Another user joined the group
- `user-left` - A user left the group
- `new-message` - New message received
- `user-typing` - Typing indicator update
- `group-switched` - Group switch confirmation
- `my-groups` - List of user's groups
- `error` - Error message (including username conflicts)

## ✨ Features in Detail

### Username Validation
- **Prevents duplicate usernames** within the same group
- Shows clear error message: "Username 'abc' already exists in this group. Please use a different username."
- Ensures unique identity for each user in a group

### Group Management
- Groups are created automatically when the first user joins with a new code
- Groups are deleted when the last user leaves (after 30 seconds)
- Users can be in multiple groups simultaneously
- Group switching allows seamless navigation between groups

### Real-time Communication
- Messages are broadcast instantly to all group members
- Typing indicators show when someone is typing
- User join/leave notifications appear as system messages
- Auto-reconnection on network issues
- Connection status indicator shows current state

### User Experience
- WhatsApp-inspired green color scheme
- Responsive design that works on mobile and desktop
- Auto-scroll to latest messages
- Message bubbles with different colors for own vs others' messages
- Member avatars and online count display
- Clean interface without unnecessary console logs

## 🧪 Development

### Monorepo Scripts
```bash
# Install all dependencies
npm run install:all

# Development
npm run dev                 # Start both frontend and backend
npm run dev:frontend        # Start only frontend
npm run dev:backend         # Start only backend

# Production
npm run build              # Build both frontend and backend
npm start                  # Start production servers

# Maintenance
npm run clean              # Clean node_modules and build artifacts
npm run lint               # Run linting for all workspaces
npm test                   # Run tests for all workspaces
```

### Backend Development
```bash
cd backend
npm run dev    # Start with hot reload
npm run build  # Build for production
npm start      # Run production build
```

### Frontend Development
```bash
cd frontend
npm run dev     # Start development server
npm run build   # Build for production
npm run preview # Preview production build
```

## 🚀 Deployment

### Frontend Deployment
Deploy the built frontend to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Backend Deployment
Deploy the backend to:
- Heroku
- Railway
- DigitalOcean App Platform
- AWS EC2
- Google Cloud Run

### Environment Variables
- `PORT` - Backend server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help:
1. Check the troubleshooting documentation
2. Search existing issues
3. Create a new issue with detailed information
4. Provide steps to reproduce any bugs

## 🎉 Recent Updates

- ✅ **Fixed real-time messaging** - Messages now appear instantly without page reload
- ✅ **Added username validation** - Prevents duplicate usernames in same group
- ✅ **Cleaned up console logs** - Removed unnecessary logging for production
- ✅ **Monorepo structure** - Organized as npm workspaces for better development experience
- ✅ **Enhanced error handling** - Better user feedback for various error scenarios