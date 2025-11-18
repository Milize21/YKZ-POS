// Centralized Database Manager for localStorage
// This ensures all data operations are synchronized and organized
import { saveImageToDB, getImageFromDB, deleteImageFromDB, compressImage } from './imageStorage';

export interface DatabaseSchema {
  inventory: any[];
  sales: any[];
  groups: string[];
  categories: string[];
  inventoryTrash: any[];
  auth: any;
  lastModified: {
    inventory?: string;
    sales?: string;
    groups?: string;
    categories?: string;
    inventoryTrash?: string;
  };
  version: string;
}

const DB_VERSION = '1.0.0';
const DB_KEY = 'yorukaze_pos_db';

// Initialize database with default structure
const initializeDatabase = (): DatabaseSchema => {
  return {
    inventory: [],
    sales: [],
    groups: ['All', 'Afterrain', 'Yorukaze', 'Collab Product'],
    categories: [
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
      'PARFUME',
    ],
    inventoryTrash: [],
    auth: null,
    lastModified: {},
    version: DB_VERSION,
  };
};

// Get entire database
export const getDatabase = (): DatabaseSchema => {
  try {
    const stored = localStorage.getItem(DB_KEY);
    if (stored) {
      const db = JSON.parse(stored) as DatabaseSchema;
      
      // Check if migration is needed
      if (db.version !== DB_VERSION) {
        console.log('Database version mismatch, migrating...');
        return migrateDatabase(db);
      }
      
      return db;
    }
    
    // Initialize new database
    const newDb = initializeDatabase();
    saveDatabase(newDb);
    return newDb;
  } catch (error) {
    console.error('Error reading database:', error);
    const newDb = initializeDatabase();
    saveDatabase(newDb);
    return newDb;
  }
};

// Save entire database
export const saveDatabase = (db: DatabaseSchema): void => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (error) {
    console.error('Error saving database:', error);
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      alert('Storage quota exceeded. Please delete some old data or images.');
    }
  }
};

// Update specific collection with timestamp
export const updateCollection = <K extends keyof Omit<DatabaseSchema, 'lastModified' | 'version' | 'auth'>>(
  collection: K,
  data: DatabaseSchema[K]
): void => {
  const db = getDatabase();
  db[collection] = data;
  db.lastModified[collection] = new Date().toISOString();
  saveDatabase(db);
};

// Get specific collection
export const getCollection = <K extends keyof Omit<DatabaseSchema, 'lastModified' | 'version' | 'auth'>>(
  collection: K
): DatabaseSchema[K] => {
  const db = getDatabase();
  return db[collection];
};

// Migrate from old localStorage structure to new centralized database
const migrateDatabase = (oldDb: Partial<DatabaseSchema>): DatabaseSchema => {
  console.log('Starting database migration...');
  
  const newDb = initializeDatabase();
  
  // Try to migrate from old individual localStorage keys
  try {
    // Migrate inventory
    const oldInventory = localStorage.getItem('inventory');
    if (oldInventory) {
      newDb.inventory = JSON.parse(oldInventory);
      localStorage.removeItem('inventory');
    } else if (oldDb.inventory) {
      newDb.inventory = oldDb.inventory;
    }
    
    // Migrate sales
    const oldSales = localStorage.getItem('sales');
    if (oldSales) {
      newDb.sales = JSON.parse(oldSales);
      localStorage.removeItem('sales');
    } else if (oldDb.sales) {
      newDb.sales = oldDb.sales;
    }
    
    // Migrate groups
    const oldGroups = localStorage.getItem('groups');
    if (oldGroups) {
      newDb.groups = JSON.parse(oldGroups);
      localStorage.removeItem('groups');
    } else if (oldDb.groups) {
      newDb.groups = oldDb.groups;
    }
    
    // Migrate categories
    const oldCategories = localStorage.getItem('categories');
    if (oldCategories) {
      newDb.categories = JSON.parse(oldCategories);
      localStorage.removeItem('categories');
    } else if (oldDb.categories) {
      newDb.categories = oldDb.categories;
    }
    
    // Migrate trash
    const oldTrash = localStorage.getItem('inventoryTrash');
    if (oldTrash) {
      newDb.inventoryTrash = JSON.parse(oldTrash);
      localStorage.removeItem('inventoryTrash');
    } else if (oldDb.inventoryTrash) {
      newDb.inventoryTrash = oldDb.inventoryTrash;
    }
    
    // Migrate auth
    const oldAuth = localStorage.getItem('auth');
    if (oldAuth) {
      newDb.auth = JSON.parse(oldAuth);
      localStorage.removeItem('auth');
    } else if (oldDb.auth) {
      newDb.auth = oldDb.auth;
    }
    
    // Set all as modified now
    const now = new Date().toISOString();
    newDb.lastModified = {
      inventory: now,
      sales: now,
      groups: now,
      categories: now,
      inventoryTrash: now,
    };
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  }
  
  newDb.version = DB_VERSION;
  saveDatabase(newDb);
  return newDb;
};

// Export database - creates a JSON file for backup
export const exportDatabase = (): string => {
  const db = getDatabase();
  return JSON.stringify(db, null, 2);
};

// Import database - restores from backup
export const importDatabase = (jsonData: string): boolean => {
  try {
    const db = JSON.parse(jsonData) as DatabaseSchema;
    saveDatabase(db);
    console.log('Database imported successfully');
    return true;
  } catch (error) {
    console.error('Error importing database:', error);
    return false;
  }
};

// Get storage usage estimate
export const getStorageEstimate = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        usageMB: ((estimate.usage || 0) / (1024 * 1024)).toFixed(2),
        quotaMB: ((estimate.quota || 0) / (1024 * 1024)).toFixed(2),
        percentUsed: estimate.quota 
          ? ((estimate.usage || 0) / estimate.quota * 100).toFixed(2)
          : '0'
      };
    } catch (error) {
      console.error('Error getting storage estimate:', error);
    }
  }
  
  return {
    usage: 0,
    quota: 0,
    usageMB: '0',
    quotaMB: '0',
    percentUsed: '0'
  };
};

// Save product with image handling
export const saveProductWithImage = async (product: any): Promise<any> => {
  if (product.image && product.image.startsWith('data:')) {
    try {
      // Compress image
      const compressed = await compressImage(product.image, 600, 0.7);
      
      // Save to IndexedDB
      await saveImageToDB(product.id, compressed);
      
      // Return product with image reference instead of data
      return {
        ...product,
        image: `indexed:${product.id}`, // Reference to IndexedDB
        hasImage: true
      };
    } catch (error) {
      console.error('Error saving image:', error);
      // Fallback: save without image
      return { ...product, image: '', hasImage: false };
    }
  }
  
  return product;
};

// Load product with image from IndexedDB
export const loadProductWithImage = async (product: any): Promise<any> => {
  if (product.image && product.image.startsWith('indexed:')) {
    try {
      const imageId = product.image.replace('indexed:', '');
      const imageData = await getImageFromDB(imageId);
      
      return {
        ...product,
        image: imageData || '',
        hasImage: !!imageData
      };
    } catch (error) {
      console.error('Error loading image:', error);
      return { ...product, image: '', hasImage: false };
    }
  }
  
  return product;
};

// Delete product image from IndexedDB
export const deleteProductImage = async (productId: string): Promise<void> => {
  try {
    await deleteImageFromDB(productId);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

// Get database statistics
export const getDatabaseStats = () => {
  const db = getDatabase();
  const dbString = JSON.stringify(db);
  const sizeInBytes = new Blob([dbString]).size;
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);
  const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
  
  // Calculate image storage
  let imageCount = 0;
  let imageSizeBytes = 0;
  
  db.inventory.forEach((item: any) => {
    if (item.image) {
      imageCount++;
      imageSizeBytes += item.image.length;
    }
  });
  
  db.inventoryTrash.forEach((item: any) => {
    if (item.image) {
      imageCount++;
      imageSizeBytes += item.image.length;
    }
  });
  
  return {
    version: db.version,
    totalSize: sizeInBytes,
    sizeKB: sizeInKB,
    sizeMB: sizeInMB,
    collections: {
      inventory: db.inventory.length,
      sales: db.sales.length,
      groups: db.groups.length,
      categories: db.categories.length,
      trash: db.inventoryTrash.length,
    },
    images: {
      count: imageCount,
      sizeBytes: imageSizeBytes,
      sizeKB: (imageSizeBytes / 1024).toFixed(2),
      sizeMB: (imageSizeBytes / (1024 * 1024)).toFixed(2),
    },
    lastModified: db.lastModified,
  };
};

// Clear all data (with confirmation)
export const clearDatabase = (): void => {
  const newDb = initializeDatabase();
  saveDatabase(newDb);
  console.log('Database cleared');
};

// Optimize database - remove orphaned data, compress images, etc.
export const optimizeDatabase = (): { 
  beforeSize: number; 
  afterSize: number; 
  saved: string;
  optimizations: string[];
} => {
  const db = getDatabase();
  const beforeString = JSON.stringify(db);
  const beforeSize = new Blob([beforeString]).size;
  const optimizations: string[] = [];
  
  // Remove duplicate sales (same transaction ID and item)
  const uniqueSales = new Map();
  db.sales.forEach((sale: any) => {
    const key = `${sale.transactionId}-${sale.itemName}`;
    if (!uniqueSales.has(key)) {
      uniqueSales.set(key, sale);
    }
  });
  
  if (uniqueSales.size < db.sales.length) {
    db.sales = Array.from(uniqueSales.values());
    optimizations.push(`Removed ${db.sales.length - uniqueSales.size} duplicate sales`);
  }
  
  // Fix any corrupted sold values
  let fixedProducts = 0;
  db.inventory = db.inventory.map((p: any) => {
    if (typeof p.sold !== 'number' || p.sold < 0) {
      fixedProducts++;
      return { ...p, sold: 0 };
    }
    return p;
  });
  
  if (fixedProducts > 0) {
    optimizations.push(`Fixed ${fixedProducts} products with invalid sold counts`);
  }
  
  // Update timestamp
  db.lastModified.inventory = new Date().toISOString();
  db.lastModified.sales = new Date().toISOString();
  
  saveDatabase(db);
  
  const afterString = JSON.stringify(db);
  const afterSize = new Blob([afterString]).size;
  const saved = ((beforeSize - afterSize) / 1024).toFixed(2);
  
  return {
    beforeSize,
    afterSize,
    saved: `${saved} KB`,
    optimizations: optimizations.length > 0 ? optimizations : ['Database already optimized'],
  };
};
