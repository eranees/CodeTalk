#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('📱 CodeTalk Mobile Setup Helper\n');

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIP = getLocalIP();

console.log('📋 Network Information:');
console.log(`   Your IP Address: ${localIP}`);
console.log(`   Frontend URL: http://${localIP}:5173`);
console.log(`   Backend URL: http://${localIP}:3001\n`);

// Create .env file for frontend
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
const envContent = `VITE_BACKEND_URL=http://${localIP}:3001\n`;

try {
  fs.writeFileSync(frontendEnvPath, envContent);
  console.log('✅ Created frontend/.env file with local IP');
} catch (error) {
  console.log('❌ Could not create .env file automatically');
  console.log('   Please create frontend/.env manually with:');
  console.log(`   VITE_BACKEND_URL=http://${localIP}:3001\n`);
}

console.log('🔧 Setup Steps:');
console.log('1. Start the backend server:');
console.log('   cd backend && pnpm run dev\n');

console.log('2. Start the frontend server:');
console.log('   cd frontend && pnpm run dev\n');

console.log('3. Access from mobile device:');
console.log(`   http://${localIP}:5173\n`);

console.log('📱 Mobile Instructions:');
console.log('   - Connect your mobile device to the same WiFi network');
console.log(`   - Open browser and go to: http://${localIP}:5173`);
console.log('   - The app should now connect properly\n');

console.log('🔍 Troubleshooting:');
console.log('   - Make sure both devices are on the same WiFi');
console.log('   - Check Windows Firewall settings');
console.log('   - Ensure PostgreSQL is running');
console.log('   - Try accessing http://' + localIP + ':3001/health from mobile browser\n');

console.log('🚀 Ready to go! Start the servers and test on mobile.');
