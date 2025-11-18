# 📧 Email Notification System - Quick Start

## ✅ Installation Complete!

The email notification system has been successfully installed in your YKZ-POS system.

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already enabled)
3. Click **App passwords** (you may need to search for it)
4. Select:
   - App: **Mail**
   - Device: **Windows Computer**
5. Click **Generate**
6. **Copy the 16-character password** (example: `abcd efgh ijkl mnop`)

### Step 2: Configure Email

**Option A: Use the Setup Wizard (Recommended)**
```bash
# Double-click this file:
Setup-Email.bat
```

**Option B: Manual Configuration**
1. Create `backend/.env` file
2. Add these lines:
```env
EMAIL_USER=yorukazeproduction@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
PORT=3001
USE_SQLITE=true
```

### Step 3: Start the System

```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend  
npm run dev
```

## 📨 How It Works

### Automatic Email Notifications

**✅ Successful Sales**
- Sent immediately after completing a sale
- Contains: Transaction ID, items, customer info, total amount
- Recipient: yorukazeproduction@gmail.com

**🚫 Cancelled Transactions**
- Sent when user cancels during checkout
- Contains: Attempted transaction details, cancellation reason

**❌ Failed Transactions** (future feature)
- Sent when payment processing fails
- Contains: Error details, transaction data

### Offline Queue System

**When offline:**
- Emails are stored in browser localStorage
- Queue visible on Dashboard (yellow warning card)
- Shows number of pending emails

**When back online:**
- Auto-sends queued emails every 30 seconds
- Manual retry button available
- Maximum 5 attempts per email

## 🎯 Features

✅ **Automatic email sending** on every transaction
✅ **Offline queue** - never lose a notification
✅ **Smart retry** - automatic resend when online
✅ **Visual status** - see pending emails on Dashboard
✅ **Secure** - credentials stored in backend only
✅ **Real-time** - instant notifications when online

## 📊 Monitor Email Queue

### In Browser Console (F12):
```javascript
// Check queue status
import { getEmailQueueStatus } from '@/lib/emailNotification';
console.log(getEmailQueueStatus());

// Manual retry
import { retryEmailQueue } from '@/lib/emailNotification';
retryEmailQueue();
```

### On Dashboard:
- Yellow card appears when emails are pending
- Shows: Number of pending emails, online status
- Click "Retry Now" to manually send queued emails

## 🧪 Testing

### Test Email Endpoint:
```bash
# Make sure backend is running on port 3001
curl -X POST http://localhost:3001/api/test-email
```

### Test Real Transaction:
1. Go to Sales page
2. Add items to cart
3. Enter customer details
4. Click "Complete Sale"
5. Confirm the transaction
6. Check yorukazeproduction@gmail.com

### Test Offline Mode:
1. Turn off WiFi
2. Complete a sale
3. Check Dashboard - yellow card appears
4. Turn WiFi back on
5. Email automatically sends within 30 seconds

## 🔧 Troubleshooting

### Emails not sending?

**Check Backend Logs:**
```bash
cd backend
npm start
# Look for "✅ Email sent:" or "❌ Error sending email:"
```

**Common Issues:**

1. **Wrong App Password**
   - Make sure you're using App Password, NOT regular password
   - No spaces in the password
   - Re-generate if needed

2. **Backend Not Running**
   ```bash
   # Check if running:
   curl http://localhost:3001/api/health
   ```

3. **Gmail Blocking**
   - Check Gmail Activity: https://myaccount.google.com/notifications
   - Verify 2-Step Verification is ON
   - Try generating new App Password

4. **Emails in Spam**
   - Check spam/junk folder
   - Mark as "Not Spam"

### Clear Email Queue:
```javascript
// In browser console (F12)
localStorage.removeItem('yorukaze_email_queue');
```

## 📁 Email Format

```
✅ SUCCESSFUL SALE

===========================================
Transaction Details
===========================================

Transaction ID: TXN-1700000000000
Customer Number: CF20-001
Date & Time: 2025-11-15T21:30:00.000Z
Cashier: John Doe

-------------------------------------------
Items
-------------------------------------------
1. Afterrain Gacha Card - Qty: 2 - $30000
2. Yorukaze Standee - Qty: 1 - $45000

-------------------------------------------
Payment Details
-------------------------------------------
Subtotal: $75000
Tax: $0
Discount: $0
Total Amount: $75000
Payment Method: Cash

===========================================
YKZ-POS System
Yorukaze Production
===========================================
```

## 🔐 Security

- ✅ Email credentials stored in backend only
- ✅ Never exposed to frontend
- ✅ Environment variables (.env) not committed to git
- ✅ Rate limiting enabled on API
- ✅ HTTPS recommended for production

## 📞 Support

If emails still don't work:
1. Check `backend/logs` for errors
2. Verify `.env` file exists in `backend/` folder
3. Test with `/api/test-email` endpoint
4. Check Gmail security settings

## 🎉 Success Checklist

- [ ] Gmail App Password generated
- [ ] `.env` file configured
- [ ] Backend running (port 3001)
- [ ] Frontend running (port 5173/5175)
- [ ] Test email received
- [ ] Dashboard shows no pending emails
- [ ] Test transaction completed
- [ ] Transaction email received

**All done? You're ready to use the email notification system! 🚀**
