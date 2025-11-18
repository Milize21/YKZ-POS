const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database/inventory.db');

console.log('🔍 Checking SQLite database for today\'s sales...\n');

// Check today's sales
const today = '2025-11-15';
db.all('SELECT * FROM sales WHERE date(created_at) = date(?)', [today], (err, rows) => {
  if (err) {
    console.log('❌ Error:', err);
  } else {
    console.log(`📊 Sales from ${today}: ${rows.length} transactions\n`);
    
    if (rows.length > 0) {
      console.log('✅ FOUND TODAY\'S SALES:\n');
      rows.forEach((sale, idx) => {
        console.log(`${idx + 1}. Sale ID: ${sale.id}`);
        console.log(`   Customer: ${sale.customer_id || 'N/A'}`);
        console.log(`   Total: $${sale.total_price}`);
        console.log(`   Items: ${sale.items_count}`);
        console.log(`   Date: ${sale.created_at}`);
        console.log('');
      });
    } else {
      console.log('❌ No sales found for today in SQLite\n');
    }
  }
  
  // Check for PARFUME products
  console.log('\n🌸 Checking for PARFUME products...\n');
  db.all('SELECT * FROM products WHERE category = ? OR name LIKE ?', ['PARFUME', '%parfume%'], (err, products) => {
    if (err) {
      console.log('❌ Error:', err);
    } else if (products.length > 0) {
      console.log(`✅ Found ${products.length} PARFUME products:\n`);
      products.forEach(p => {
        console.log(`  - ${p.name} (Code: ${p.code})`);
        console.log(`    Stock: ${p.stock}, Price: $${p.price}`);
      });
    } else {
      console.log('❌ No PARFUME products found in SQLite\n');
    }
    
    // Check all sales (any date)
    console.log('\n📊 Checking all sales in database...\n');
    db.all('SELECT COUNT(*) as total, MIN(created_at) as first, MAX(created_at) as last FROM sales', [], (err, summary) => {
      if (err) {
        console.log('❌ Error:', err);
      } else {
        console.log(`Total sales in database: ${summary[0].total}`);
        console.log(`First sale: ${summary[0].first || 'N/A'}`);
        console.log(`Last sale: ${summary[0].last || 'N/A'}`);
      }
      
      db.close();
    });
  });
});
