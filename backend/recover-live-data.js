// Run this in your browser console while on localhost:5175
// This will extract ALL possible data sources

console.log('🔍 Starting comprehensive data recovery...\n');

// Function to safely get data
function safeGet(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return localStorage.getItem(key);
  }
}

// 1. Check main database
console.log('1️⃣ Checking yorukaze_pos_db...');
const mainDb = safeGet('yorukaze_pos_db');
if (mainDb) {
  console.log('✅ Found main database!');
  console.log('  - Products:', mainDb.inventory?.length || 0);
  console.log('  - Sales:', mainDb.sales?.length || 0);
  console.log('  - Categories:', mainDb.categories?.length || 0);
  
  if (mainDb.sales && mainDb.sales.length > 0) {
    console.log('\n📊 SALES DATA FOUND:');
    mainDb.sales.forEach((sale, idx) => {
      console.log(`  Sale ${idx + 1}:`, {
        date: sale.date,
        total: sale.total,
        customer: sale.customerNumber,
        items: sale.items?.length || 0
      });
    });
  }
  
  if (mainDb.categories && mainDb.categories.includes('PARFUME')) {
    console.log('✅ PARFUME category exists!');
  }
  
  // Check for PARFUME products
  const parfumeProducts = mainDb.inventory?.filter(p => 
    p.category === 'PARFUME' || p.name?.toLowerCase().includes('parfume')
  );
  if (parfumeProducts && parfumeProducts.length > 0) {
    console.log('\n🌸 PARFUME PRODUCTS FOUND:');
    parfumeProducts.forEach(p => console.log('  -', p.name, `(${p.code})`));
  }
} else {
  console.log('❌ Main database not found');
}

// 2. Check all localStorage keys
console.log('\n2️⃣ Scanning all localStorage keys...');
const allKeys = Object.keys(localStorage);
console.log(`Found ${allKeys.length} keys:`, allKeys);

const relevantKeys = allKeys.filter(k => 
  k.includes('yorukaze') || 
  k.includes('pos') || 
  k.includes('inventory') || 
  k.includes('sales') ||
  k.includes('product') ||
  k.includes('backup')
);

if (relevantKeys.length > 0) {
  console.log('📦 Relevant keys found:', relevantKeys);
  relevantKeys.forEach(key => {
    const data = safeGet(key);
    console.log(`\n  ${key}:`, typeof data === 'object' ? JSON.stringify(data).substring(0, 200) : data);
  });
}

// 3. Check sessionStorage
console.log('\n3️⃣ Checking sessionStorage...');
const sessionKeys = Object.keys(sessionStorage);
console.log(`Found ${sessionKeys.length} session keys`);
sessionKeys.forEach(key => {
  if (key.includes('yorukaze') || key.includes('sales') || key.includes('product')) {
    console.log('  -', key, ':', sessionStorage.getItem(key).substring(0, 100));
  }
});

// 4. Check IndexedDB
console.log('\n4️⃣ Checking IndexedDB...');
indexedDB.databases().then(dbs => {
  console.log('Available databases:', dbs.map(db => db.name));
  
  dbs.forEach(dbInfo => {
    const request = indexedDB.open(dbInfo.name);
    request.onsuccess = (event) => {
      const db = event.target.result;
      console.log(`\n  Database: ${dbInfo.name}`);
      console.log('  Object Stores:', Array.from(db.objectStoreNames));
      db.close();
    };
  });
});

// 5. Generate export
console.log('\n5️⃣ Generating export...');
const exportData = {
  timestamp: new Date().toISOString(),
  mainDatabase: mainDb,
  allLocalStorage: {},
  allSessionStorage: {}
};

allKeys.forEach(key => {
  exportData.allLocalStorage[key] = safeGet(key);
});

Object.keys(sessionStorage).forEach(key => {
  try {
    exportData.allSessionStorage[key] = JSON.parse(sessionStorage.getItem(key));
  } catch (e) {
    exportData.allSessionStorage[key] = sessionStorage.getItem(key);
  }
});

// Create downloadable backup
const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `ykz_recovery_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
a.click();
URL.revokeObjectURL(url);

console.log('\n✅ Recovery complete! File downloaded.');
console.log('\n📋 Export data also available in variable: exportData');
console.log('To access: copy(JSON.stringify(exportData, null, 2))');

// Return for inspection
exportData;
