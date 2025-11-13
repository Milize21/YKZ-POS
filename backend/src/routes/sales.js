const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Create new sale
router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { customer_id, items, payment_method = 'cash', notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Sale must contain at least one item' });
    }

    // Generate unique transaction ID
    const transaction_id = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate total
    let total_amount = 0;
    const processedItems = [];

    // Validate and prepare items
    for (const item of items) {
      const productResult = await client.query(
        'SELECT id, name, price, stock_quantity FROM products WHERE id = $1 AND is_active = true',
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Product with ID ${item.product_id} not found or inactive`);
      }

      const product = productResult.rows[0];

      if (product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`);
      }

      const subtotal = product.price * item.quantity;
      total_amount += subtotal;

      processedItems.push({
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity: item.quantity,
        subtotal: subtotal
      });
    }

    // Create sales transaction
    const transactionResult = await client.query(
      `INSERT INTO sales_transactions 
       (transaction_id, customer_id, total_amount, payment_method, cashier_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [transaction_id, customer_id, total_amount, payment_method, req.user.userId, notes]
    );

    const transaction = transactionResult.rows[0];

    // Create sales items and update inventory
    for (const item of processedItems) {
      // Insert sales item
      await client.query(
        `INSERT INTO sales_items 
         (transaction_id, product_id, product_name, product_price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [transaction.id, item.product_id, item.product_name, item.product_price, item.quantity, item.subtotal]
      );

      // Update product stock
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );

      // Record inventory movement
      await client.query(
        `INSERT INTO inventory_movements 
         (product_id, movement_type, quantity, reference_type, reference_id, created_by)
         VALUES ($1, 'out', $2, 'sale', $3, $4)`,
        [item.product_id, item.quantity, transaction.id, req.user.userId]
      );
    }

    await client.query('COMMIT');

    // Return complete transaction data
    const completeTransaction = await pool.query(
      `SELECT st.*, u.username as cashier_name,
       json_agg(
         json_build_object(
           'id', si.id,
           'product_id', si.product_id,
           'product_name', si.product_name,
           'product_price', si.product_price,
           'quantity', si.quantity,
           'subtotal', si.subtotal
         )
       ) as items
       FROM sales_transactions st
       LEFT JOIN users u ON st.cashier_id = u.id
       LEFT JOIN sales_items si ON st.id = si.transaction_id
       WHERE st.id = $1
       GROUP BY st.id, u.username`,
      [transaction.id]
    );

    res.status(201).json(completeTransaction.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create sale error:', error);
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Get all sales with pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, customer_id, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT st.*, u.username as cashier_name,
      COUNT(*) OVER() as total_count
      FROM sales_transactions st
      LEFT JOIN users u ON st.cashier_id = u.id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (customer_id) {
      conditions.push(`st.customer_id = $${++paramCount}`);
      params.push(customer_id);
    }

    if (start_date) {
      conditions.push(`st.created_at >= $${++paramCount}`);
      params.push(start_date);
    }

    if (end_date) {
      conditions.push(`st.created_at <= $${++paramCount}`);
      params.push(end_date);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY st.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      sales: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0
      }
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single sale with items
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT st.*, u.username as cashier_name,
       json_agg(
         json_build_object(
           'id', si.id,
           'product_id', si.product_id,
           'product_name', si.product_name,
           'product_price', si.product_price,
           'quantity', si.quantity,
           'subtotal', si.subtotal
         )
       ) as items
       FROM sales_transactions st
       LEFT JOIN users u ON st.cashier_id = u.id
       LEFT JOIN sales_items si ON st.id = si.transaction_id
       WHERE st.id = $1
       GROUP BY st.id, u.username`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;