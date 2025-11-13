const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

/**
 * Security Middleware Configuration
 * Protects against common web vulnerabilities and attacks
 */

// 1. Helmet - Sets various HTTP headers for security
const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// 2. Rate Limiting - Prevents DDoS and brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

// 3. Strict Rate Limiting for Authentication Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    console.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Account temporarily locked. Please try again in 15 minutes.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});

// 4. Upload Rate Limiting - Prevents upload abuse
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit each IP to 50 uploads per hour
  message: 'Too many uploads, please try again later.',
  handler: (req, res) => {
    console.warn(`Upload rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Upload limit exceeded',
      message: 'You have uploaded too many files. Please try again later.',
    });
  },
});

// 5. NoSQL Injection Prevention - Sanitize user input
const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized potentially malicious input: ${key} from ${req.ip}`);
  },
});

// 6. HTTP Parameter Pollution Prevention
const preventHPP = hpp({
  whitelist: ['category', 'group', 'sort', 'limit', 'page'], // Allow these params to appear multiple times
});

// 7. Request Size Limiter - Prevents large payload attacks
const requestSizeLimiter = (req, res, next) => {
  const contentLength = req.headers['content-length'];
  const maxSize = 600 * 1024 * 1024; // 600MB (for video uploads)
  
  if (contentLength && parseInt(contentLength) > maxSize) {
    console.warn(`Request size exceeded: ${contentLength} bytes from ${req.ip}`);
    return res.status(413).json({
      error: 'Payload too large',
      message: 'Request entity too large. Maximum size is 600MB.',
    });
  }
  next();
};

// 8. IP Blacklist Middleware
const blacklistedIPs = new Set();

const ipBlacklist = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (blacklistedIPs.has(clientIP)) {
    console.warn(`Blocked request from blacklisted IP: ${clientIP}`);
    return res.status(403).json({
      error: 'Access denied',
      message: 'Your IP address has been blocked.',
    });
  }
  next();
};

// Function to add IP to blacklist
const blockIP = (ip) => {
  blacklistedIPs.add(ip);
  console.log(`IP ${ip} added to blacklist`);
};

// Function to remove IP from blacklist
const unblockIP = (ip) => {
  blacklistedIPs.delete(ip);
  console.log(`IP ${ip} removed from blacklist`);
};

// 9. Request Logging for Security Monitoring
const securityLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  
  // Log suspicious patterns
  const suspiciousPatterns = [
    /(\.\.|\/etc\/|\/var\/|\/usr\/)/i, // Path traversal
    /(union|select|insert|update|delete|drop|create|alter|exec|script)/i, // SQL injection
    /(<script|javascript:|onerror=|onload=)/i, // XSS attempts
    /(eval\(|base64_decode|gzinflate)/i, // Code injection
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(JSON.stringify(req.body))
  );
  
  if (isSuspicious) {
    console.warn(`[SECURITY ALERT] Suspicious request detected:
      Time: ${timestamp}
      IP: ${ip}
      Method: ${method}
      URL: ${url}
      User-Agent: ${userAgent}
    `);
  }
  
  next();
};

// 10. Content Type Validation
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    
    // Allow multipart for file uploads
    if (req.path.includes('/upload')) {
      return next();
    }
    
    // Require JSON for API requests
    if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
      console.warn(`Invalid content-type from ${req.ip}: ${contentType}`);
      return res.status(400).json({
        error: 'Invalid content type',
        message: 'Content-Type must be application/json or multipart/form-data',
      });
    }
  }
  next();
};

// 11. CORS Configuration with Whitelist
const corsOptions = {
  origin: (origin, callback) => {
    const whitelist = [
      'http://localhost:5173',
      'http://localhost:3001',
      process.env.CORS_ORIGIN,
    ].filter(Boolean);
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = {
  helmetMiddleware,
  limiter,
  authLimiter,
  uploadLimiter,
  sanitizeInput,
  preventHPP,
  requestSizeLimiter,
  ipBlacklist,
  blockIP,
  unblockIP,
  securityLogger,
  validateContentType,
  corsOptions,
};
