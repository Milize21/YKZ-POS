const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/ykz_pos.db');

console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║         YKZ-POS DATABASE CONTENTS                            ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');

// Get all tables
db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }

  console.log('📊 TABLES FOUND:', tables.length);
  console.log('═══════════════════════════════════════════════════════════════\n');

  let completed = 0;
  const total = tables.length;

  tables.forEach((table) => {
    const tableName = table.name;
    
    // Get row count
    db.get(`SELECT COUNT(*) as count FROM ${tableName}`, (err, countResult) => {
      if (err) {
        console.error(`Error counting ${tableName}:`, err);
        completed++;
        if (completed === total) db.close();
        return;
      }

      console.log(`\n📁 TABLE: ${tableName}`);
      console.log(`   Records: ${countResult.count}`);
      console.log('   ───────────────────────────────────────────────────────');

      // Get all data from the table
      db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
        if (err) {
          console.error(`Error reading ${tableName}:`, err);
        } else if (rows.length > 0) {
          // Show first few rows
          rows.slice(0, 5).forEach((row, index) => {
            console.log(`   Row ${index + 1}:`, JSON.stringify(row, null, 2).split('\n').join('\n   '));
          });
          if (rows.length > 5) {
            console.log(`   ... and ${rows.length - 5} more records`);
          }
        } else {
          console.log('   (Empty table)');
        }

        completed++;
        if (completed === total) {
          console.log('\n═══════════════════════════════════════════════════════════════');
          console.log('✓ Database scan completed!\n');
          db.close();
        }
      });
    });
  });

  if (tables.length === 0) {
    console.log('No tables found in database.');
    db.close();
  }
});
