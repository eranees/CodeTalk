#!/usr/bin/env node

const os = require('os');

console.log('🌐 CodeTalk Local Network Setup Helper\n');

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

console.log('📋 Setup Information:');
console.log(`   Your IP Address: ${localIP}`);
console.log(`   Frontend URL: http://${localIP}:5173`);
console.log(`   Backend URL: http://${localIP}:3001`);
console.log(`   Health Check: http://${localIP}:3001/health\n`);

console.log('🔧 Configuration Steps:');
console.log('1. Update frontend/.env:');
console.log(`   VITE_BACKEND_URL=http://${localIP}:3001\n`);

console.log('2. Start the servers:');
console.log('   Backend:  cd backend && pnpm run dev');
console.log('   Frontend: cd frontend && pnpm run dev\n');

console.log('3. Access from other devices:');
console.log(`   http://${localIP}:5173\n`);

console.log('📱 Mobile Access:');
console.log('   - Connect mobile device to same WiFi');
console.log(`   - Open browser: http://${localIP}:5173`);
console.log('   - Add to home screen for app-like experience\n');

console.log('🔍 Troubleshooting:');
console.log('   - Check firewall settings');
console.log('   - Ensure PostgreSQL is running');
console.log('   - Verify all devices are on same network');
console.log('   - Check console logs for errors\n');

console.log('📚 For detailed setup, see: LOCAL_NETWORK_SETUP.md');
