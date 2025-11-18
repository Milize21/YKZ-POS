const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
});

// Format transaction details for email
function formatTransactionEmail(type, transaction, timestamp) {
  const statusEmoji = {
    success: '✅',
    failed: '❌',
    cancelled: '🚫',
  };

  const statusText = {
    success: 'SUCCESSFUL SALE',
    failed: 'FAILED TRANSACTION',
    cancelled: 'CANCELLED TRANSACTION',
  };

  let itemsList = '';
  if (transaction.items && transaction.items.length > 0) {
    itemsList = transaction.items
      .map(
        (item, idx) =>
          `${idx + 1}. ${item.name || item.product_id} - Qty: ${item.quantity} - $${item.subtotal || item.price}`
      )
      .join('\n');
  }

  const emailBody = `
${statusEmoji[type]} ${statusText[type]}

===========================================
Transaction Details
===========================================

Transaction ID: ${transaction.id || 'N/A'}
Customer Number: ${transaction.customerNumber || transaction.customer_number || 'N/A'}
Date & Time: ${timestamp}
Cashier: ${transaction.cashierName || transaction.cashier || 'Unknown'}

-------------------------------------------
Items
-------------------------------------------
${itemsList || 'No items'}

-------------------------------------------
Payment Details
-------------------------------------------
Subtotal: $${transaction.subtotal || transaction.total || 0}
Tax: $${transaction.tax || 0}
Discount: $${transaction.discount || 0}
Total Amount: $${transaction.total || transaction.total_amount || 0}
Payment Method: ${transaction.paymentMethod || transaction.payment_method || 'N/A'}

${type === 'failed' ? `\nReason: ${transaction.reason || 'Unknown error'}\n` : ''}
${type === 'cancelled' ? `\nReason: ${transaction.reason || 'Cancelled by user'}\n` : ''}

===========================================
YKZ-POS System
Yorukaze Production
===========================================
  `.trim();

  return emailBody;
}

// Send transaction email
router.post('/send-transaction-email', async (req, res) => {
  try {
    const { to, type, transaction, timestamp } = req.body;

    if (!to || !type || !transaction) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const subject = `YKZ-POS: ${type.toUpperCase()} Transaction - ${transaction.customerNumber || transaction.id}`;
    const text = formatTransactionEmail(type, transaction, timestamp);

    // Send email
    const info = await transporter.sendMail({
      from: `"YKZ-POS System" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: text,
    });

    console.log('✅ Email sent:', info.messageId);

    res.json({
      success: true,
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: error.message,
    });
  }
});

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: `"YKZ-POS System" <${process.env.EMAIL_USER}>`,
      to: 'yorukazeproduction@gmail.com',
      subject: 'YKZ-POS: Email System Test',
      text: 'This is a test email from YKZ-POS system. Email notifications are working correctly!',
    });

    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Test email sent successfully',
    });
  } catch (error) {
    console.error('❌ Error sending test email:', error);
    res.status(500).json({
      error: 'Failed to send test email',
      message: error.message,
    });
  }
});

// Get email queue status (for debugging)
router.get('/email-status', (req, res) => {
  res.json({
    configured: !!process.env.EMAIL_USER && !!process.env.EMAIL_PASSWORD,
    service: 'gmail',
    recipient: 'yorukazeproduction@gmail.com',
  });
});

module.exports = router;
