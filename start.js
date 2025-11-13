#!/usr/bin/env node

console.log('🚀 Starting YKZ POS System...\n');

const { spawn } = require('child_process');
const path = require('path');

// Start backend
console.log('📦 Starting Backend API...');
const backend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3001',
    JWT_SECRET: 'ykz_jwt_secret_key_2024_secure',
    CORS_ORIGIN: 'http://localhost:8080'
  }
});

// Wait a moment then start frontend
setTimeout(() => {
  console.log('🎨 Starting Frontend...');
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      VITE_API_URL: 'http://localhost:3001/api'
    }
  });

  frontend.on('close', (code) => {
    console.log(`Frontend exited with code ${code}`);
    backend.kill();
  });
}, 3000);

backend.on('close', (code) => {
  console.log(`Backend exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down YKZ POS System...');
  backend.kill();
  process.exit(0);
});

console.log('\n🌟 YKZ POS System is starting up!');
console.log('Frontend: http://localhost:8080');
console.log('Backend API: http://localhost:3001');
console.log('\nDefault Login:');
console.log('Admin: admin / 12345');
console.log('Cashier: cashier / 12345');
console.log('\nPress Ctrl+C to stop all services\n');