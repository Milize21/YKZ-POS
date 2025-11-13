# 🔒 YKZ POS Security Features

## Overview
This application implements multiple layers of security to protect against various threats including DDoS attacks, SQL/NoSQL injection, XSS attacks, CSRF, and other common vulnerabilities.

---

## 🛡️ Security Layers Implemented

### 1. **Helmet.js - HTTP Headers Security**
- Sets secure HTTP headers automatically
- Content Security Policy (CSP) to prevent XSS
- X-Frame-Options to prevent clickjacking
- X-Content-Type-Options to prevent MIME sniffing
- Referrer-Policy control

**Protection Against:**
- Cross-Site Scripting (XSS)
- Clickjacking
- MIME type confusion attacks

---

### 2. **Rate Limiting - DDoS Protection**

#### General API Rate Limit
- **100 requests per 15 minutes** per IP
- Protects against API abuse and DDoS attacks

#### Authentication Rate Limit (Stricter)
- **5 login attempts per 15 minutes** per IP
- Prevents brute force password attacks
- Account temporarily locked after limit

#### Upload Rate Limit
- **50 uploads per hour** per IP
- Prevents upload flooding
- Protects server storage

**Protection Against:**
- Distributed Denial of Service (DDoS)
- Brute force attacks
- Credential stuffing
- Upload flooding

---

### 3. **NoSQL Injection Prevention**
- Sanitizes all user input
- Replaces malicious characters
- Logs attempted injection attacks

**Protection Against:**
- MongoDB injection
- Database query manipulation
- Data exfiltration attempts

---

### 4. **HTTP Parameter Pollution (HPP) Prevention**
- Prevents duplicate parameter attacks
- Whitelist for allowed duplicate params
- Blocks parameter pollution attempts

**Protection Against:**
- Parameter manipulation
- Logic bypass attempts
- Cache poisoning

---

### 5. **Request Size Limiting**
- Maximum payload: **600MB** (for video uploads)
- JSON body limit: **10MB**
- URL encoded limit: **10MB**

**Protection Against:**
- Buffer overflow attacks
- Memory exhaustion
- Bandwidth flooding

---

### 6. **IP Blacklisting System**
- Dynamic IP blocking capability
- Automatic blacklist for repeated violations
- Manual IP management functions

**Functions:**
```javascript
blockIP('192.168.1.100')    // Block an IP
unblockIP('192.168.1.100')  // Unblock an IP
```

**Protection Against:**
- Known malicious IPs
- Repeat offenders
- Targeted attacks from specific sources

---

### 7. **Security Monitoring & Logging**
Logs and alerts for suspicious patterns:
- Path traversal attempts (`../`, `/etc/`, etc.)
- SQL injection patterns (`UNION`, `SELECT`, etc.)
- XSS attempts (`<script>`, `javascript:`, etc.)
- Code injection (`eval()`, `base64_decode`, etc.)

**Each log includes:**
- Timestamp
- Source IP
- Request method and URL
- User agent
- Attack pattern detected

---

### 8. **Content-Type Validation**
- Enforces correct Content-Type headers
- Requires `application/json` for API requests
- Allows `multipart/form-data` for uploads only

**Protection Against:**
- Content-Type confusion attacks
- MIME type attacks
- Malformed requests

---

### 9. **CORS (Cross-Origin Resource Sharing) Protection**
- Whitelist-based origin control
- Only allows requests from:
  - `http://localhost:5173` (Frontend dev)
  - `http://localhost:3001` (Backend)
  - Custom origins via `CORS_ORIGIN` env variable
  
**Protection Against:**
- Unauthorized cross-origin requests
- CSRF (Cross-Site Request Forgery)
- Data theft from other domains

---

### 10. **Secure File Upload**
- File type validation
- Size restrictions (600MB max)
- Automatic video to MP3 conversion
- Isolated upload directory
- No executable file uploads

**Protection Against:**
- Malware uploads
- Web shell uploads
- Storage exhaustion
- Path traversal via filenames

---

## 🚨 Security Alerts

The system automatically logs security alerts for:

1. **Rate Limit Violations**
   ```
   [WARNING] Rate limit exceeded for IP: xxx.xxx.xxx.xxx
   ```

2. **Suspicious Requests**
   ```
   [SECURITY ALERT] Suspicious request detected:
   Time: 2025-11-13T10:30:00Z
   IP: xxx.xxx.xxx.xxx
   Method: GET
   URL: /api/../../etc/passwd
   ```

3. **Sanitized Input**
   ```
   [WARNING] Sanitized potentially malicious input: $where from xxx.xxx.xxx.xxx
   ```

4. **Blocked IPs**
   ```
   [WARNING] Blocked request from blacklisted IP: xxx.xxx.xxx.xxx
   ```

---

## 📊 Security Monitoring

### Check Security Status
```bash
# Health check endpoint
curl http://localhost:3001/api/health

# Response includes security status
{
  "status": "OK",
  "timestamp": "2025-11-13T10:30:00Z",
  "service": "YKZ POS Backend API",
  "version": "1.0.0",
  "security": "enabled"
}
```

---

## 🔧 Configuration

### Environment Variables
```bash
# CORS allowed origins
CORS_ORIGIN=http://localhost:5173

# Upload directory (isolated)
UPLOAD_DIR=./uploads

# Database (SQLite for local security)
USE_SQLITE=true
```

---

## 📝 Best Practices

### For Administrators:

1. **Monitor Logs Regularly**
   - Check console for security alerts
   - Review suspicious activity patterns

2. **Update Dependencies**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Backup Database**
   - Regular backups of SQLite database
   - Store backups securely

4. **Strong Passwords**
   - Use complex admin passwords
   - Change default credentials immediately

5. **Network Security**
   - Use firewall rules
   - Restrict access to necessary ports only
   - Use HTTPS in production

### For Users:

1. **Login Security**
   - Don't share credentials
   - Report suspicious activity
   - Logout after use

2. **Upload Safety**
   - Only upload trusted files
   - Verify file types before upload
   - Report upload errors

---

## 🚫 What's Protected Against

✅ **DDoS Attacks** - Rate limiting prevents request flooding
✅ **Brute Force** - Login attempt limits
✅ **SQL Injection** - Input sanitization
✅ **NoSQL Injection** - MongoDB query sanitization  
✅ **XSS (Cross-Site Scripting)** - CSP headers + input sanitization
✅ **CSRF (Cross-Site Request Forgery)** - CORS restrictions
✅ **Clickjacking** - X-Frame-Options header
✅ **Path Traversal** - Input validation and monitoring
✅ **Buffer Overflow** - Request size limits
✅ **Upload Malware** - File type restrictions
✅ **Parameter Pollution** - HPP prevention
✅ **MIME Sniffing** - X-Content-Type-Options header

---

## 🔄 Security Updates

Current Version: **1.0.0**
Last Updated: **November 2025**

Security is continuously monitored and improved. All security-related updates are logged and documented.

---

## 📞 Security Incident Response

If you detect a security issue:

1. **Stop using the affected feature**
2. **Document the issue** (screenshots, logs, steps to reproduce)
3. **Report immediately** to system administrator
4. **Do not attempt to exploit** the vulnerability
5. **Wait for security patch** before resuming use

---

## ⚠️ Important Notes

- All security measures are active by default
- Logs are stored in console output (consider log aggregation in production)
- Rate limits can be adjusted in `backend/src/middleware/security.js`
- IP blacklist persists only during server runtime (not permanent storage)
- For production deployment, consider additional security measures:
  - HTTPS/SSL certificates
  - Reverse proxy (nginx)
  - WAF (Web Application Firewall)
  - Intrusion Detection System (IDS)

---

**🔐 Security Status: ACTIVE**

Your application is protected with enterprise-grade security measures.
