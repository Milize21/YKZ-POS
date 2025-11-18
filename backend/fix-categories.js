// Fix duplicate categories and add PARFUME
const fs = require('fs');
const path = require('path');

console.log('=== Category Fix Script ===\n');

// This script helps generate the fix command
console.log('To fix categories in your browser:');
console.log('1. Open http://localhost:5175 (or your dev server URL)');
console.log('2. Press F12 to open Developer Console');
console.log('3. Go to Console tab');
console.log('4. Paste this code:\n');

const fixScript = `
// Fix duplicate categories and add PARFUME
const db = JSON.parse(localStorage.getItem('yorukaze_pos_db'));
console.log('Current categories:', db.categories);

// Remove duplicates
db.categories = Array.from(new Set(db.categories));

// Add PARFUME if not exists
if (!db.categories.includes('PARFUME')) {
  db.categories.push('PARFUME');
}

// Sort categories
db.categories.sort();

console.log('Fixed categories:', db.categories);

// Save back
localStorage.setItem('yorukaze_pos_db', JSON.stringify(db));

// Reload page
alert('Categories fixed! Page will reload.');
location.reload();
`;

console.log(fixScript);
console.log('\n5. Press Enter to execute');
console.log('\n=== Alternative: Manual Steps ===');
console.log('Or you can manually:');
console.log('1. Go to Application tab in DevTools');
console.log('2. Click Local Storage > http://localhost:5175');
console.log('3. Find "yorukaze_pos_db"');
console.log('4. Edit the categories array to remove duplicate and add PARFUME');
