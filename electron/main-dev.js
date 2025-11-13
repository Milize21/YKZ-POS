const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let backendProcess;
let viteProcess;

// Check if a port is available
function checkPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
}

// Wait for server to be ready
function waitForServer(url, timeout = 30000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          retry();
        }
      }).on('error', retry);
    };
    
    const retry = () => {
      if (Date.now() - startTime < timeout) {
        setTimeout(check, 500);
      } else {
        reject(new Error('Server timeout'));
      }
    };
    
    check();
  });
}

// Start the backend server
async function startBackend() {
  const backendPath = path.join(__dirname, '../backend/src/server.js');
  const dbPath = path.join(app.getPath('userData'), 'database');
  const uploadsPath = path.join(app.getPath('userData'), 'uploads');
  
  // Create directories
  const fs = require('fs');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  
  console.log('Starting backend...');
  
  backendProcess = spawn('node', [backendPath], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      USE_SQLITE: 'true',
      SQLITE_DB_PATH: path.join(dbPath, 'ykz_pos.db'),
      JWT_SECRET: 'ykz_jwt_secret_key_2024_secure',
      CORS_ORIGIN: 'http://localhost:5173',
      UPLOAD_DIR: uploadsPath,
      MAX_FILE_SIZE: '629145600',
      PORT: '3001'
    },
    cwd: path.join(__dirname, '../backend'),
    stdio: 'inherit'
  });

  backendProcess.on('error', (err) => {
    console.error('Backend error:', err);
  });

  // Wait for backend to start
  await waitForServer('http://localhost:3001/api/health');
  console.log('✅ Backend started');
}

// Start Vite dev server
async function startVite() {
  console.log('Starting Vite...');
  
  viteProcess = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '..'),
    shell: true,
    stdio: 'inherit'
  });

  viteProcess.on('error', (err) => {
    console.error('Vite error:', err);
  });

  // Wait for Vite to start
  await waitForServer('http://localhost:5173');
  console.log('✅ Vite started');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'Yorukaze POS System',
    icon: path.join(__dirname, '../public/yorukaze-logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    autoHideMenuBar: true,
    backgroundColor: '#1a1a1a',
    show: false
  });

  mainWindow.loadURL('http://localhost:5173');
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    // Check if ports are available
    const backendAvailable = await checkPort(3001);
    const frontendAvailable = await checkPort(5173);
    
    if (!backendAvailable || !frontendAvailable) {
      console.error('Ports already in use. Please close other instances.');
      app.quit();
      return;
    }

    await startBackend();
    await startVite();
    
    createWindow();
  } catch (error) {
    console.error('Startup error:', error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (viteProcess) viteProcess.kill();
  if (backendProcess) backendProcess.kill();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (viteProcess) viteProcess.kill();
  if (backendProcess) backendProcess.kill();
});
