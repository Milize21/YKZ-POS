# Email Configuration for YKZ-POS

## Setup Gmail for Email Notifications

1. **Create App Password** (Gmail):
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification if not already enabled
   - Go to "App passwords" section
   - Select "Mail" and "Windows Computer"
   - Generate password
   - Copy the 16-character password

2. **Configure Environment Variables**:

Create or update `backend/.env` file:

```env
# Email Configuration
EMAIL_USER=yorukazeproduction@gmail.com
EMAIL_PASSWORD=your-16-char-app-password-here

# Backend Configuration
PORT=3001
NODE_ENV=production
```

3. **Test Email System**:

```bash
cd backend
npm start
```

Then test with:
```bash
curl -X POST http://localhost:3001/api/test-email
```

## How It Works

### Successful Sales
- When a sale completes successfully, an email is automatically sent to `yorukazeproduction@gmail.com`
- Contains: Transaction ID, Customer Number, Items, Total Amount, Cashier Name

### Failed/Cancelled Sales
- When a transaction fails or is cancelled, a notification email is sent
- Contains: Reason for failure/cancellation, attempted transaction details

### Offline Queue System
- If there's no internet connection, emails are stored in browser localStorage
- Automatically retries when internet connection is restored
- Checks every 30 seconds
- Maximum 5 retry attempts per email

## Email Queue Status

You can check the email queue status in browser console:
```javascript
import { getEmailQueueStatus } from '@/lib/emailNotification';
console.log(getEmailQueueStatus());
```

Manual retry:
```javascript
import { retryEmailQueue } from '@/lib/emailNotification';
retryEmailQueue();
```

## Security Notes

- Never commit `.env` file to git (already in `.gitignore`)
- Use App Passwords, not your actual Gmail password
- Emails are sent via backend API to keep credentials secure
- Rate limiting is enabled to prevent abuse

## Troubleshooting

### Emails not sending?
1. Check backend console for errors
2. Verify EMAIL_USER and EMAIL_PASSWORD in .env
3. Check if backend API is running (port 3001)
4. Test with `/api/test-email` endpoint

### Emails stuck in queue?
1. Open browser console (F12)
2. Check localStorage for `yorukaze_email_queue`
3. Verify internet connection
4. Manually retry: `retryEmailQueue()`

### Gmail blocking emails?
1. Check Gmail security settings
2. Verify App Password is correct
3. Check "Less secure app access" is OFF (use App Password instead)
4. Review Gmail "Activity" for blocked sign-ins
