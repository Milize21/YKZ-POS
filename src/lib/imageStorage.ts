// IndexedDB Storage Manager for larger data (images)
// Uses IndexedDB which has much higher storage limits (50MB - 500MB+)

const DB_NAME = 'YorukazePOS';
const DB_VERSION = 1;
const STORE_NAME = 'images';

let dbInstance: IDBDatabase | null = null;

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object store for images if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// Save image to IndexedDB
export const saveImageToDB = async (id: string, imageData: string): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await store.put({ id, imageData, timestamp: Date.now() });
  } catch (error) {
    console.error('Error saving image to IndexedDB:', error);
    throw error;
  }
};

// Get image from IndexedDB
export const getImageFromDB = async (id: string): Promise<string | null> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.imageData : null);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error getting image from IndexedDB:', error);
    return null;
  }
};

// Delete image from IndexedDB
export const deleteImageFromDB = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await store.delete(id);
  } catch (error) {
    console.error('Error deleting image from IndexedDB:', error);
  }
};

// Get all image IDs
export const getAllImageIds = async (): Promise<string[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.getAllKeys();
      
      request.onsuccess = () => {
        resolve(request.result as string[]);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Error getting all image IDs:', error);
    return [];
  }
};

// Compress image to reduce size
export const compressImage = (base64: string, maxWidth = 600, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Resize if image is too large
      if (width > maxWidth) {
        height = (height / width) * maxWidth;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG with compression
      const compressed = canvas.toDataURL('image/jpeg', quality);
      resolve(compressed);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = base64;
  });
};

// Clear all images (for cleanup)
export const clearAllImages = async (): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    await store.clear();
  } catch (error) {
    console.error('Error clearing images:', error);
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

// Migrate existing base64 images from localStorage to IndexedDB
export const migrateLocalStorageImages = async (): Promise<{
  migratedCount: number;
  freedSpace: number;
  errors: string[];
}> => {
  const errors: string[] = [];
  let migratedCount = 0;
  let freedSpace = 0;
  
  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    for (const key of keys) {
      try {
        const data = localStorage.getItem(key);
        if (!data) continue;
        
        // Try to parse as JSON
        const parsed = JSON.parse(data);
        
        // Check if it's an array of products
        if (Array.isArray(parsed)) {
          let modified = false;
          
          for (const item of parsed) {
            // Check if item has base64 image
            if (item.image && typeof item.image === 'string' && item.image.startsWith('data:')) {
              const originalSize = item.image.length;
              
              // Compress and save to IndexedDB
              const compressed = await compressImage(item.image);
              await saveImageToDB(item.id, compressed);
              
              // Replace with reference
              item.image = `indexed:${item.id}`;
              
              migratedCount++;
              freedSpace += originalSize;
              modified = true;
            }
          }
          
          // Save back to localStorage if modified
          if (modified) {
            localStorage.setItem(key, JSON.stringify(parsed));
          }
        }
      } catch (error) {
        // Skip invalid JSON or non-array data
        console.warn(`Skipping key ${key}:`, error);
      }
    }
    
    console.log(`✅ Migration complete: ${migratedCount} images migrated, ${(freedSpace / 1024 / 1024).toFixed(2)}MB freed`);
    
  } catch (error) {
    errors.push(`Migration failed: ${error}`);
    console.error('Migration error:', error);
  }
  
  return { migratedCount, freedSpace, errors };
};
