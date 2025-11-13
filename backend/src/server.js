require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import security middleware
const {
  helmetMiddleware,
  limiter,
  authLimiter,
  uploadLimiter,
  sanitizeInput,
  preventHPP,
  requestSizeLimiter,
  ipBlacklist,
  securityLogger,
  validateContentType,
  corsOptions,
} = require('./middleware/security');

// Use SQLite if USE_SQLITE environment variable is set (for Electron)
let pool, dbUtils, initDB;
const useSQLite = process.env.USE_SQLITE === 'true';

if (useSQLite) {
  console.log('📦 Using SQLite database');
  const sqliteConfig = require('./config/database-sqlite');
  dbUtils = sqliteConfig.dbUtils;
  initDB = sqliteConfig.initDB;
} else {
  console.log('📦 Using PostgreSQL database');
  const dbConfig = require('./config/database');
  pool = dbConfig.pool;
}

const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const groupsRoutes = require('./routes/groups');
const salesRoutes = require('./routes/sales');
const inventoryRoutes = require('./routes/inventory');
const reportsRoutes = require('./routes/reports');
const mediaRoutes = require('./routes/media');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// SECURITY MIDDLEWARE STACK
// ============================================

// 1. IP Blacklist (First line of defense)
app.use(ipBlacklist);

// 2. Security Logger (Monitor all requests)
app.use(securityLogger);

// 3. Helmet - Secure HTTP headers
app.use(helmetMiddleware);

// 4. CORS - Control cross-origin requests
app.use(cors(corsOptions));

// 5. Request size limiter
app.use(requestSizeLimiter);

// 6. Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 7. NoSQL injection prevention
app.use(sanitizeInput);

// 8. HTTP Parameter Pollution prevention
app.use(preventHPP);

// 9. Content-Type validation
app.use(validateContentType);

// 10. General rate limiting for all API routes
app.use('/api/', limiter);

// Static file serving for media
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/media', express.static(path.join(__dirname, '..', uploadDir)));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'YKZ POS Backend API',
    version: '1.0.0',
    security: 'enabled'
  });
});

// API Routes with specific rate limiters
app.use('/api/auth', authLimiter, authRoutes); // Stricter limit for authentication
app.use('/api/products', productsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/media', uploadLimiter, mediaRoutes); // Limit uploads

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid authentication credentials'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong' 
      : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Database connection test
async function testDatabaseConnection() {
  try {
    if (useSQLite) {
      // Using SQLite (for Electron standalone app)
      await initDB();
      console.log('✅ Database connected successfully (SQLite)');
    } else {
      // Using PostgreSQL (for Docker/server deployment)
      const client = await pool.connect();
      console.log('✅ Database connected successfully (PostgreSQL)');
      client.release();
    }
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
}

// Start server
async function startServer() {
  try {
    await testDatabaseConnection();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 YKZ POS Backend API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();