const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/ykz_pos.db');
const fs = require('fs');

console.log('\n🔄 Exporting SQLite data to localStorage format...\n');

const localStorageData = {
  inventory: [],
  sales: [],
  groups: [],
  categories: [],
  inventoryTrash: [],
  auth: null,
  lastModified: {},
  version: '1.0.0'
};

// Get all products
db.all("SELECT * FROM products WHERE is_active = 1", (err, products) => {
  if (err) {
    console.error('Error reading products:', err);
    db.close();
    return;
  }

  console.log(`✓ Found ${products.length} products`);

  // Convert products to inventory format
  localStorageData.inventory = products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    stock: p.stock_quantity,
    group: getGroupName(p.group_id),
    description: p.description || '',
    image: p.image_url || null,
    createdAt: p.created_at,
    updatedAt: p.updated_at
  }));

  // Get unique categories from products
  const categoriesSet = new Set(products.map(p => p.category));
  localStorageData.categories = Array.from(categoriesSet);

  // Add standard categories if not present
  const standardCategories = [
    'KARTU GACHA',
    'STANDEE 15CM',
    'GANCI',
    'STICKER',
    'LIGHTSTICK 15 COLORS',
    'STANDEE 1:1',
    'CAN BADGE',
    'KEYCHAIN',
    'DAKIMAKURA',
    'STICKER PEEK A BOO',
    'PARFUME'
  ];

  standardCategories.forEach(cat => {
    if (!localStorageData.categories.includes(cat)) {
      localStorageData.categories.push(cat);
    }
  });

  console.log(`✓ Found ${localStorageData.categories.length} categories`);

  // Get product groups
  db.all("SELECT * FROM product_groups", (err, groups) => {
    if (err) {
      console.error('Error reading groups:', err);
      db.close();
      return;
    }

    console.log(`✓ Found ${groups.length} groups`);
    localStorageData.groups = ['All', ...groups.map(g => g.name)];

    // Get sales transactions
    db.all(`
      SELECT 
        st.*,
        GROUP_CONCAT(
          json_object(
            'product_id', si.product_id,
            'quantity', si.quantity,
            'price', si.price,
            'subtotal', si.subtotal
          )
        ) as items
      FROM sales_transactions st
      LEFT JOIN sales_items si ON st.id = si.transaction_id
      GROUP BY st.id
      ORDER BY st.created_at DESC
    `, (err, sales) => {
      if (err) {
        console.error('Error reading sales:', err);
        db.close();
        return;
      }

      console.log(`✓ Found ${sales.length} sales transactions`);

      // Convert sales to localStorage format
      localStorageData.sales = sales.map(s => ({
        id: s.id,
        customerNumber: s.customer_number || '',
        items: s.items ? JSON.parse(`[${s.items}]`) : [],
        total: s.total_amount,
        paymentMethod: s.payment_method,
        date: s.created_at,
        cashierName: s.cashier_name || 'Unknown'
      }));

      // Save to JSON file
      const outputPath = '../sqlite_export.json';
      fs.writeFileSync(outputPath, JSON.stringify(localStorageData, null, 2));

      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('✅ Export completed successfully!');
      console.log('═══════════════════════════════════════════════════════════\n');
      console.log('📊 Summary:');
      console.log(`   - Products: ${localStorageData.inventory.length}`);
      console.log(`   - Categories: ${localStorageData.categories.length}`);
      console.log(`   - Groups: ${localStorageData.groups.length}`);
      console.log(`   - Sales: ${localStorageData.sales.length}`);
      console.log(`\n📁 Saved to: ${outputPath}`);
      console.log('\n📋 Next steps:');
      console.log('   1. Open your browser');
      console.log('   2. Go to http://localhost:5175');
      console.log('   3. Open Developer Console (F12)');
      console.log('   4. Paste this command:\n');
      console.log('   fetch("/sqlite_export.json")');
      console.log('     .then(r => r.json())');
      console.log('     .then(data => {');
      console.log('       localStorage.setItem("yorukaze_pos_db", JSON.stringify(data));');
      console.log('       alert("Database restored! Page will reload.");');
      console.log('       location.reload();');
      console.log('     });\n');

      db.close();
    });
  });

  function getGroupName(groupId) {
    const groupMap = {
      '1b1d261395a1144cbd8a2906de4a2ce7': 'Afterrain',
      '4aa1b146aa0deec4ed268a2c4f919eba': 'Yorukaze',
      'a0abae144b7a200387a2a7f8d04f1419': 'Collab Product'
    };
    return groupMap[groupId] || 'All';
  }
});
