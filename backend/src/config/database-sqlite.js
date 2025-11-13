const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use environment variable for database path if available (for Electron)
const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '../../database/ykz_pos.db');

// Ensure database directory exists
const fs = require('fs');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('✅ Connected to SQLite database at:', dbPath);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize database with tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    const schema = `
      -- Users table for authentication
      CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('admin', 'cashier')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Product groups table
      CREATE TABLE IF NOT EXISTS product_groups (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          name TEXT NOT NULL,
          description TEXT,
          color TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Products table
      CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          price REAL NOT NULL CHECK (price >= 0),
          stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
          group_id TEXT REFERENCES product_groups(id) ON DELETE SET NULL,
          description TEXT,
          image_url TEXT,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Sales transactions table
      CREATE TABLE IF NOT EXISTS sales_transactions (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          transaction_id TEXT UNIQUE NOT NULL,
          customer_id TEXT,
          total_amount REAL NOT NULL CHECK (total_amount >= 0),
          payment_method TEXT DEFAULT 'cash',
          cashier_id TEXT REFERENCES users(id),
          status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Sales items table
      CREATE TABLE IF NOT EXISTS sales_items (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          transaction_id TEXT REFERENCES sales_transactions(id) ON DELETE CASCADE,
          product_id TEXT REFERENCES products(id),
          product_name TEXT NOT NULL,
          product_price REAL NOT NULL,
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          subtotal REAL NOT NULL CHECK (subtotal >= 0),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Inventory movements table
      CREATE TABLE IF NOT EXISTS inventory_movements (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
          movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
          quantity INTEGER NOT NULL,
          reference_type TEXT,
          reference_id TEXT,
          notes TEXT,
          created_by TEXT REFERENCES users(id),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_products_group_id ON products(group_id);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
      CREATE INDEX IF NOT EXISTS idx_sales_transactions_customer_id ON sales_transactions(customer_id);
      CREATE INDEX IF NOT EXISTS idx_sales_transactions_cashier_id ON sales_transactions(cashier_id);
      CREATE INDEX IF NOT EXISTS idx_sales_transactions_created_at ON sales_transactions(created_at);
      CREATE INDEX IF NOT EXISTS idx_sales_items_transaction_id ON sales_items(transaction_id);
      CREATE INDEX IF NOT EXISTS idx_sales_items_product_id ON sales_items(product_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id);
      CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON inventory_movements(created_at);
    `;

    db.exec(schema, (err) => {
      if (err) {
        console.error('Error creating schema:', err);
        reject(err);
      } else {
        console.log('✅ Database schema created successfully');
        resolve();
      }
    });
  });
};

// Insert default data
const insertDefaultData = () => {
  return new Promise((resolve, reject) => {
    // Check if data already exists
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count > 0) {
        console.log('✅ Default data already exists');
        resolve();
        return;
      }

      // Insert default data
      const bcrypt = require('bcrypt');
      const hashedPassword = bcrypt.hashSync('12345', 10);

      const insertData = `
        -- Insert default users
        INSERT INTO users (username, password_hash, role) VALUES 
        ('admin', '${hashedPassword}', 'admin'),
        ('cashier', '${hashedPassword}', 'cashier');

        -- Insert default product groups
        INSERT INTO product_groups (name, description, color) VALUES 
        ('Afterrain', 'Afterrain merchandise and products', '#2D3561'),
        ('Yorukaze', 'Yorukaze merchandise and products', '#5D6BA3'),
        ('Collaboration', 'Collaborative products between groups', '#8B5A96');
      `;

      db.exec(insertData, (err) => {
        if (err) {
          console.error('Error inserting default data:', err);
          reject(err);
        } else {
          console.log('✅ Default data inserted successfully');
          
          // Insert sample products
          db.all('SELECT id, name FROM product_groups', (err, groups) => {
            if (err) {
              reject(err);
              return;
            }

            const afterrainGroup = groups.find(g => g.name === 'Afterrain');
            const yorukazeGroup = groups.find(g => g.name === 'Yorukaze');
            const collabGroup = groups.find(g => g.name === 'Collaboration');

            const sampleProducts = `
              INSERT INTO products (name, category, price, stock_quantity, group_id, description) VALUES 
              ('Afterrain Gacha Card Set', 'Kartu Gacha', 15000.00, 100, '${afterrainGroup?.id}', 'Special edition gacha card set'),
              ('Yorukaze Standee 15CM', 'Standee 15CM & 1:1', 45000.00, 50, '${yorukazeGroup?.id}', 'Small standee figure 15cm height'),
              ('Collaboration Keychain Winter', 'Keychain Winter', 25000.00, 75, '${collabGroup?.id}', 'Limited winter themed keychain'),
              ('Afterrain Can Badge', 'Can Badge', 12000.00, 200, '${afterrainGroup?.id}', 'Official can badge with character design'),
              ('Yorukaze Stickers Pack', 'Stickers', 18000.00, 150, '${yorukazeGroup?.id}', 'Pack of 5 vinyl stickers'),
              ('Lightstick 15 Colors', 'Lightstick 15 Colors', 85000.00, 30, '${collabGroup?.id}', 'Multi-color LED lightstick for concerts'),
              ('Afterrain Dakimakura', 'Dakimakura', 350000.00, 10, '${afterrainGroup?.id}', 'Premium quality body pillow cover');
            `;

            db.exec(sampleProducts, (err) => {
              if (err) {
                console.error('Error inserting sample products:', err);
                reject(err);
              } else {
                console.log('✅ Sample products inserted successfully');
                resolve();
              }
            });
          });
        }
      });
    });
  });
};

// Initialize database
const initDB = async () => {
  try {
    await initializeDatabase();
    await insertDefaultData();
    console.log('🎉 Database initialization completed!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

// Utility functions for common database operations
const dbUtils = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },

  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

module.exports = { db, dbUtils, initDB };