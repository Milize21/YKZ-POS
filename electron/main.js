const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

// Start the backend server
function startBackend() {
  // In production, backend is in resources folder
  const isDev = process.env.NODE_ENV === 'development';
  const backendPath = isDev 
    ? path.join(__dirname, '../backend/src/server.js')
    : path.join(process.resourcesPath, 'backend/src/server.js');
  
  const dbPath = path.join(app.getPath('userData'), 'database');
  const uploadsPath = path.join(app.getPath('userData'), 'uploads');
  
  // Create directories if they don't exist
  const fs = require('fs');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  
  console.log('Starting backend from:', backendPath);
  
  backendProcess = spawn('node', [backendPath], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      USE_SQLITE: 'true',
      SQLITE_DB_PATH: path.join(dbPath, 'ykz_pos.db'),
      JWT_SECRET: 'ykz_jwt_secret_key_2024_secure',
      CORS_ORIGIN: 'http://localhost',
      UPLOAD_DIR: uploadsPath,
      MAX_FILE_SIZE: '629145600',
      PORT: '3001'
    },
    cwd: isDev ? path.join(__dirname, '../backend') : path.join(process.resourcesPath, 'backend')
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  backendProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
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
    backgroundColor: '#1a1a1a'
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Start backend server
  startBackend();
  
  // Wait a bit for backend to start, then create window
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
