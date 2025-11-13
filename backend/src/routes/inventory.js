const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get inventory movements
router.get('/movements', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, product_id, movement_type } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT im.*, p.name as product_name, u.username as created_by_name
      FROM inventory_movements im
      LEFT JOIN products p ON im.product_id = p.id
      LEFT JOIN users u ON im.created_by = u.id
    `;

    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (product_id) {
      conditions.push(`im.product_id = $${++paramCount}`);
      params.push(product_id);
    }

    if (movement_type) {
      conditions.push(`im.movement_type = $${++paramCount}`);
      params.push(movement_type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY im.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Get inventory movements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add inventory adjustment (admin only)
router.post('/adjustment', authenticateToken, requireRole('admin'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { product_id, quantity, notes } = req.body;

    if (!product_id || quantity === undefined) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    // Get current stock
    const productResult = await client.query(
      'SELECT name, stock_quantity FROM products WHERE id = $1',
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productResult.rows[0];
    const oldQuantity = product.stock_quantity;
    const newQuantity = oldQuantity + quantity;

    if (newQuantity < 0) {
      return res.status(400).json({ 
        error: `Cannot adjust stock below zero. Current: ${oldQuantity}, Adjustment: ${quantity}` 
      });
    }

    // Update product stock
    await client.query(
      'UPDATE products SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newQuantity, product_id]
    );

    // Record inventory movement
    const movementResult = await client.query(
      `INSERT INTO inventory_movements 
       (product_id, movement_type, quantity, reference_type, notes, created_by)
       VALUES ($1, $2, $3, 'adjustment', $4, $5) RETURNING *`,
      [
        product_id, 
        quantity > 0 ? 'in' : 'out', 
        Math.abs(quantity), 
        notes || `Stock adjustment from ${oldQuantity} to ${newQuantity}`,
        req.user.userId
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      movement: movementResult.rows[0],
      product_name: product.name,
      old_quantity: oldQuantity,
      new_quantity: newQuantity
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Inventory adjustment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Get low stock products
router.get('/low-stock', authenticateToken, async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const result = await pool.query(
      `SELECT p.*, pg.name as group_name
       FROM products p
       LEFT JOIN product_groups pg ON p.group_id = pg.id
       WHERE p.stock_quantity <= $1 AND p.is_active = true
       ORDER BY p.stock_quantity ASC`,
      [threshold]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;