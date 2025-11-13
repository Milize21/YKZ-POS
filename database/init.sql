-- YKZ POS Database Initialization Script
-- Copyright © Yorukaze Production 2025

-- Create database extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'cashier')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product groups table
CREATE TABLE product_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- hex color code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    group_id UUID REFERENCES product_groups(id) ON DELETE SET NULL,
    description TEXT,
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sales transactions table
CREATE TABLE sales_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(100),
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method VARCHAR(50) DEFAULT 'cash',
    cashier_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sales items table (individual items in a transaction)
CREATE TABLE sales_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES sales_transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL, -- store name at time of sale
    product_price DECIMAL(10, 2) NOT NULL, -- store price at time of sale
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory movements table for tracking stock changes
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(50), -- 'sale', 'restock', 'adjustment', etc.
    reference_id UUID, -- could reference sales_transactions.id or other entities
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_products_group_id ON products(group_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_sales_transactions_customer_id ON sales_transactions(customer_id);
CREATE INDEX idx_sales_transactions_cashier_id ON sales_transactions(cashier_id);
CREATE INDEX idx_sales_transactions_created_at ON sales_transactions(created_at);
CREATE INDEX idx_sales_items_transaction_id ON sales_items(transaction_id);
CREATE INDEX idx_sales_items_product_id ON sales_items(product_id);
CREATE INDEX idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements(created_at);

-- Insert default users
INSERT INTO users (username, password_hash, role) VALUES 
('admin', '$2b$10$rWZx.QjJ9mKZ1YxPzJKyIOQKNgGG9xGXNUxJz9qI2qVZxN8HzKyOC', 'admin'), -- password: 12345
('cashier', '$2b$10$rWZx.QjJ9mKZ1YxPzJKyIOQKNgGG9xGXNUxJz9qI2qVZxN8HzKyOC', 'cashier'); -- password: 12345

-- Insert default product groups
INSERT INTO product_groups (name, description, color) VALUES 
('Afterrain', 'Afterrain merchandise and products', '#2D3561'),
('Yorukaze', 'Yorukaze merchandise and products', '#5D6BA3'),
('Collaboration', 'Collaborative products between groups', '#8B5A96');

-- Insert sample products
INSERT INTO products (name, category, price, stock_quantity, group_id, description) VALUES 
('Afterrain Gacha Card Set', 'Kartu Gacha', 15000.00, 100, (SELECT id FROM product_groups WHERE name = 'Afterrain'), 'Special edition gacha card set'),
('Yorukaze Standee 15CM', 'Standee 15CM & 1:1', 45000.00, 50, (SELECT id FROM product_groups WHERE name = 'Yorukaze'), 'Small standee figure 15cm height'),
('Collaboration Keychain Winter', 'Keychain Winter', 25000.00, 75, (SELECT id FROM product_groups WHERE name = 'Collaboration'), 'Limited winter themed keychain'),
('Afterrain Can Badge', 'Can Badge', 12000.00, 200, (SELECT id FROM product_groups WHERE name = 'Afterrain'), 'Official can badge with character design'),
('Yorukaze Stickers Pack', 'Stickers', 18000.00, 150, (SELECT id FROM product_groups WHERE name = 'Yorukaze'), 'Pack of 5 vinyl stickers'),
('Lightstick 15 Colors', 'Lightstick 15 Colors', 85000.00, 30, (SELECT id FROM product_groups WHERE name = 'Collaboration'), 'Multi-color LED lightstick for concerts'),
('Afterrain Dakimakura', 'Dakimakura', 350000.00, 10, (SELECT id FROM product_groups WHERE name = 'Afterrain'), 'Premium quality body pillow cover');

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_groups_updated_at BEFORE UPDATE ON product_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update inventory movements when stock changes
CREATE OR REPLACE FUNCTION track_inventory_movement()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.stock_quantity != NEW.stock_quantity THEN
        INSERT INTO inventory_movements 
        (product_id, movement_type, quantity, reference_type, notes)
        VALUES (
            NEW.id,
            CASE WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'in' ELSE 'out' END,
            ABS(NEW.stock_quantity - OLD.stock_quantity),
            'adjustment',
            'Stock adjusted from ' || OLD.stock_quantity || ' to ' || NEW.stock_quantity
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for inventory tracking
CREATE TRIGGER track_product_inventory AFTER UPDATE ON products FOR EACH ROW EXECUTE FUNCTION track_inventory_movement();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ykz_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ykz_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO ykz_user;