const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Dashboard summary
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Today's sales
    const todaySales = await pool.query(`
      SELECT COUNT(*) as transaction_count, COALESCE(SUM(total_amount), 0) as total_revenue
      FROM sales_transactions 
      WHERE DATE(created_at) = CURRENT_DATE
    `);

    // This month's sales
    const monthSales = await pool.query(`
      SELECT COUNT(*) as transaction_count, COALESCE(SUM(total_amount), 0) as total_revenue
      FROM sales_transactions 
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    // Product counts
    const productCounts = await pool.query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(*) FILTER (WHERE is_active = true) as active_products,
        COUNT(*) FILTER (WHERE stock_quantity <= 10) as low_stock_products
      FROM products
    `);

    // Top selling products (last 30 days)
    const topProducts = await pool.query(`
      SELECT 
        si.product_name,
        SUM(si.quantity) as total_sold,
        SUM(si.subtotal) as total_revenue
      FROM sales_items si
      JOIN sales_transactions st ON si.transaction_id = st.id
      WHERE st.created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY si.product_name
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    // Recent transactions
    const recentTransactions = await pool.query(`
      SELECT st.*, u.username as cashier_name
      FROM sales_transactions st
      LEFT JOIN users u ON st.cashier_id = u.id
      ORDER BY st.created_at DESC
      LIMIT 10
    `);

    res.json({
      today: todaySales.rows[0],
      month: monthSales.rows[0],
      products: productCounts.rows[0],
      top_products: topProducts.rows,
      recent_transactions: recentTransactions.rows
    });
  } catch (error) {
    console.error('Dashboard report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sales report by date range
router.get('/sales', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, group_by = 'day' } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    let dateFormat;
    switch (group_by) {
      case 'hour':
        dateFormat = "DATE_TRUNC('hour', created_at)";
        break;
      case 'day':
        dateFormat = "DATE(created_at)";
        break;
      case 'week':
        dateFormat = "DATE_TRUNC('week', created_at)";
        break;
      case 'month':
        dateFormat = "DATE_TRUNC('month', created_at)";
        break;
      default:
        dateFormat = "DATE(created_at)";
    }

    const result = await pool.query(`
      SELECT 
        ${dateFormat} as period,
        COUNT(*) as transaction_count,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_transaction
      FROM sales_transactions
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY ${dateFormat}
      ORDER BY period ASC
    `, [start_date, end_date]);

    res.json(result.rows);
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sales by product group
router.get('/sales-by-group', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        pg.name as group_name,
        pg.color as group_color,
        COUNT(si.id) as items_sold,
        SUM(si.quantity) as total_quantity,
        SUM(si.subtotal) as total_revenue
      FROM sales_items si
      JOIN sales_transactions st ON si.transaction_id = st.id
      JOIN products p ON si.product_id = p.id
      LEFT JOIN product_groups pg ON p.group_id = pg.id
    `;

    const params = [];
    if (start_date && end_date) {
      query += ' WHERE st.created_at >= $1 AND st.created_at <= $2';
      params.push(start_date, end_date);
    }

    query += `
      GROUP BY pg.id, pg.name, pg.color
      ORDER BY total_revenue DESC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Sales by group report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sales by category
router.get('/sales-by-category', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        p.category,
        COUNT(si.id) as items_sold,
        SUM(si.quantity) as total_quantity,
        SUM(si.subtotal) as total_revenue
      FROM sales_items si
      JOIN sales_transactions st ON si.transaction_id = st.id
      JOIN products p ON si.product_id = p.id
    `;

    const params = [];
    if (start_date && end_date) {
      query += ' WHERE st.created_at >= $1 AND st.created_at <= $2';
      params.push(start_date, end_date);
    }

    query += `
      GROUP BY p.category
      ORDER BY total_revenue DESC
    `;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Sales by category report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Detailed transactions report
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, page = 1, limit = 100 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        st.transaction_id,
        st.customer_id,
        st.total_amount,
        st.payment_method,
        st.created_at,
        u.username as cashier_name,
        json_agg(
          json_build_object(
            'product_name', si.product_name,
            'quantity', si.quantity,
            'price', si.product_price,
            'subtotal', si.subtotal
          )
        ) as items
      FROM sales_transactions st
      LEFT JOIN users u ON st.cashier_id = u.id
      LEFT JOIN sales_items si ON st.id = si.transaction_id
    `;

    const params = [];
    let paramCount = 0;

    if (start_date && end_date) {
      query += ` WHERE st.created_at >= $${++paramCount} AND st.created_at <= $${++paramCount}`;
      params.push(start_date, end_date);
    }

    query += `
      GROUP BY st.id, st.transaction_id, st.customer_id, st.total_amount, 
               st.payment_method, st.created_at, u.username
      ORDER BY st.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Transactions report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;