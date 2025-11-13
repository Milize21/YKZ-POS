const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all products with optional filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, group_id, active_only = 'true' } = req.query;
    
    let query = `
      SELECT p.*, pg.name as group_name, pg.color as group_color
      FROM products p
      LEFT JOIN product_groups pg ON p.group_id = pg.id
    `;
    
    const conditions = [];
    const params = [];
    let paramCount = 0;

    if (active_only === 'true') {
      conditions.push(`p.is_active = $${++paramCount}`);
      params.push(true);
    }

    if (category) {
      conditions.push(`p.category = $${++paramCount}`);
      params.push(category);
    }

    if (group_id) {
      conditions.push(`p.group_id = $${++paramCount}`);
      params.push(group_id);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, pg.name as group_name, pg.color as group_color
       FROM products p
       LEFT JOIN product_groups pg ON p.group_id = pg.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new product (admin only)
router.post('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, category, price, stock_quantity, group_id, description, image_url } = req.body;

    if (!name || !category || price === undefined || stock_quantity === undefined) {
      return res.status(400).json({ 
        error: 'Name, category, price, and stock quantity are required' 
      });
    }

    const result = await pool.query(
      `INSERT INTO products (name, category, price, stock_quantity, group_id, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, category, price, stock_quantity, group_id, description, image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product (admin only)
router.put('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock_quantity, group_id, description, image_url, is_active } = req.body;

    const result = await pool.query(
      `UPDATE products SET 
       name = $1, category = $2, price = $3, stock_quantity = $4, 
       group_id = $5, description = $6, image_url = $7, is_active = $8,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [name, category, price, stock_quantity, group_id, description, image_url, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product categories
router.get('/meta/categories', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT category FROM products WHERE is_active = true ORDER BY category'
    );
    res.json(result.rows.map(row => row.category));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;