const fs = require('fs');
const path = require('path');

// This script searches Windows Recycle Bin and temp files for any YKZ-POS data
console.log('🔍 Searching for recoverable YKZ-POS data...\n');

const searchPaths = [
  process.env.TEMP,
  process.env.TMP,
  path.join(process.env.LOCALAPPDATA, 'Temp'),
  path.join(process.env.USERPROFILE, 'AppData', 'Local', 'Temp'),
  'C:\\$Recycle.Bin' // Recycle Bin
];

const relevantPatterns = [
  /yorukaze/i,
  /ykz.*pos/i,
  /sales.*\d{4}/i,
  /parfume/i,
  /inventory.*\d+/i
];

function searchDirectory(dirPath, depth = 0) {
  if (depth > 3) return; // Limit recursion depth
  
  try {
    if (!fs.existsSync(dirPath)) return;
    
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      
      // Check if filename matches patterns
      const nameMatches = relevantPatterns.some(pattern => pattern.test(item.name));
      
      if (item.isDirectory()) {
        if (nameMatches || depth < 2) {
          searchDirectory(fullPath, depth + 1);
        }
      } else if (item.isFile()) {
        // Check file size and extension
        const stats = fs.statSync(fullPath);
        const isJson = item.name.endsWith('.json');
        const isDb = item.name.endsWith('.db') || item.name.endsWith('.sqlite');
        const isRecent = (Date.now() - stats.mtime.getTime()) < 24 * 60 * 60 * 1000; // Last 24 hours
        
        if ((nameMatches || isJson || isDb) && stats.size > 100 && isRecent) {
          console.log(`\n✅ Found: ${item.name}`);
          console.log(`   Path: ${fullPath}`);
          console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
          console.log(`   Modified: ${stats.mtime.toLocaleString()}`);
          
          // Try to read if it's JSON
          if (isJson && stats.size < 10 * 1024 * 1024) { // Less than 10MB
            try {
              const content = fs.readFileSync(fullPath, 'utf8');
              const data = JSON.parse(content);
              
              if (data.sales || data.inventory || data.categories) {
                console.log('   🎯 CONTAINS YKZ DATA!');
                console.log(`   - Products: ${data.inventory?.length || 0}`);
                console.log(`   - Sales: ${data.sales?.length || 0}`);
                console.log(`   - Categories: ${data.categories?.length || 0}`);
                
                // Copy to recovery folder
                const recoveryPath = path.join(__dirname, '..', 'recovered-files', item.name);
                fs.mkdirSync(path.dirname(recoveryPath), { recursive: true });
                fs.copyFileSync(fullPath, recoveryPath);
                console.log(`   ✅ Copied to: ${recoveryPath}`);
              }
            } catch (e) {
              // Not valid JSON or can't read
            }
          }
        }
      }
    }
  } catch (error) {
    // Skip directories we can't access
  }
}

console.log('Searching in:');
searchPaths.forEach(p => console.log(`  - ${p}`));
console.log('\n');

searchPaths.forEach(searchPath => {
  if (fs.existsSync(searchPath)) {
    console.log(`\n📁 Searching: ${searchPath}`);
    searchDirectory(searchPath);
  }
});

console.log('\n\n🔍 Search complete!');
console.log('Check the "recovered-files" folder for any found data.');
