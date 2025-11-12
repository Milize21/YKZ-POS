// Inventory types and data
export interface Product {
  id: string;
  name: string;
  material: string;
  quantity: number;
  price: number;
  sold: number;
  category: string;
  group: string;
  image?: string; // Base64 encoded image or URL
}

export const GROUPS = ['All', 'Afterrain', 'Yorukaze', 'Collab Product'];

export const CATEGORIES = [
  'KARTU GACHA',
  'STANDEE 15CM',
  'GANCHI',
  'STICKER',
  'LIGHTSTICK 15 COLORS',
  'STANDEE 1:1',
  'CAN BADGE',
  'KEYCHAIN',
  'DAKIMAKURA',
];

export const getGroups = (): string[] => {
  const stored = localStorage.getItem('groups');
  return stored ? JSON.parse(stored) : GROUPS;
};

export const saveGroups = (groups: string[]) => {
  localStorage.setItem('groups', JSON.stringify(groups));
};

// Initial inventory data
export const INITIAL_INVENTORY: Product[] = [
  // KARTU GACHA
  { id: 'kg-1', name: 'KARTU GACHA', material: 'CARD', quantity: 100, price: 35000, sold: 0, category: 'KARTU GACHA', group: 'Afterrain' },
  
  // STANDEE 15CM
  { id: 'st15-1', name: 'Avy Inkaiserin', material: 'Acrylic 15 CM (2 SISI + KAKI)', quantity: 10, price: 130000, sold: 0, category: 'STANDEE 15CM', group: 'Afterrain' },
  { id: 'st15-2', name: 'Chelly McBunny', material: 'Acrylic 15 CM (2 SISI + KAKI)', quantity: 10, price: 130000, sold: 0, category: 'STANDEE 15CM', group: 'Afterrain' },
  { id: 'st15-3', name: 'Flein Ryst', material: 'Acrylic 15 CM (2 SISI + KAKI)', quantity: 10, price: 130000, sold: 0, category: 'STANDEE 15CM', group: 'Afterrain' },
  { id: 'st15-4', name: 'Kana Chizu', material: 'Acrylic 15 CM (2 SISI + KAKI)', quantity: 10, price: 130000, sold: 0, category: 'STANDEE 15CM', group: 'Afterrain' },
  { id: 'st15-5', name: 'Lvna Tylthia', material: 'Acrylic 15 CM (2 SISI + KAKI)', quantity: 10, price: 130000, sold: 0, category: 'STANDEE 15CM', group: 'Afterrain' },
  { id: 'st15-6', name: 'LynShuu', material: 'Acrylic 15 CM (2 SISI + KAKI)', quantity: 10, price: 130000, sold: 0, category: 'STANDEE 15CM', group: 'Afterrain' },
  { id: 'st15-7', name: 'Nezufu Senshirou', material: 'Acrylic 15 CM (2 SISI + KAKI)', quantity: 10, price: 130000, sold: 0, category: 'STANDEE 15CM', group: 'Afterrain' },
  { id: 'st15-8', name: 'Poffie Hunni', material: 'Acrylic 15 CM (2 SISI + KAKI)', quantity: 10, price: 130000, sold: 0, category: 'STANDEE 15CM', group: 'Afterrain' },
  { id: 'st15-9', name: 'Ririna ruu', material: 'Acrylic 15 CM (2 SISI + KAKI)', quantity: 10, price: 130000, sold: 0, category: 'STANDEE 15CM', group: 'Afterrain' },
  { id: 'st15-10', name: 'Vice Seraphyne', material: 'Acrylic 15 CM (2 SISI + KAKI)', quantity: 10, price: 130000, sold: 0, category: 'STANDEE 15CM', group: 'Afterrain' },
  
  // GANCHI
  { id: 'gc-1', name: 'Avy Inkaiserin', material: 'Ukuran 5 CM (2 SISI)', quantity: 10, price: 40000, sold: 0, category: 'GANCHI', group: 'Afterrain' },
  { id: 'gc-2', name: 'Chelly McBunny', material: 'Ukuran 5 CM (2 SISI)', quantity: 10, price: 40000, sold: 0, category: 'GANCHI', group: 'Afterrain' },
  { id: 'gc-3', name: 'Flein Ryst', material: 'Ukuran 5 CM (2 SISI)', quantity: 10, price: 40000, sold: 0, category: 'GANCHI', group: 'Afterrain' },
  { id: 'gc-4', name: 'Kana Chizu', material: 'Ukuran 5 CM (2 SISI)', quantity: 10, price: 40000, sold: 0, category: 'GANCHI', group: 'Afterrain' },
  { id: 'gc-5', name: 'Lvna Tylthia', material: 'Ukuran 5 CM (2 SISI)', quantity: 10, price: 40000, sold: 0, category: 'GANCHI', group: 'Afterrain' },
  { id: 'gc-6', name: 'LynShuu', material: 'Ukuran 5 CM (2 SISI)', quantity: 10, price: 40000, sold: 0, category: 'GANCHI', group: 'Afterrain' },
  { id: 'gc-7', name: 'Nezufu Senshirou', material: 'Ukuran 5 CM (2 SISI)', quantity: 10, price: 40000, sold: 0, category: 'GANCHI', group: 'Afterrain' },
  { id: 'gc-8', name: 'Poffie Hunni', material: 'Ukuran 5 CM (2 SISI)', quantity: 10, price: 40000, sold: 0, category: 'GANCHI', group: 'Afterrain' },
  { id: 'gc-9', name: 'Ririna ruu', material: 'Ukuran 5 CM (2 SISI)', quantity: 10, price: 40000, sold: 0, category: 'GANCHI', group: 'Afterrain' },
  { id: 'gc-10', name: 'Vice Seraphyne', material: 'Ukuran 5 CM (2 SISI)', quantity: 10, price: 40000, sold: 0, category: 'GANCHI', group: 'Afterrain' },
  
  // STICKER
  { id: 'stk-1', name: 'Avy Inkaiserin', material: 'Finishing Doff / Lamit / Cutting', quantity: 54, price: 5000, sold: 0, category: 'STICKER', group: 'Afterrain' },
  { id: 'stk-2', name: 'Chelly McBunny', material: 'Finishing Doff / Lamit / Cutting', quantity: 54, price: 5000, sold: 0, category: 'STICKER', group: 'Afterrain' },
  { id: 'stk-3', name: 'Flein Ryst', material: 'Finishing Doff / Lamit / Cutting', quantity: 54, price: 5000, sold: 0, category: 'STICKER', group: 'Afterrain' },
  { id: 'stk-4', name: 'Kana Chizu', material: 'Finishing Doff / Lamit / Cutting', quantity: 54, price: 5000, sold: 0, category: 'STICKER', group: 'Afterrain' },
  { id: 'stk-5', name: 'Lvna Tylthia', material: 'Finishing Doff / Lamit / Cutting', quantity: 54, price: 5000, sold: 0, category: 'STICKER', group: 'Afterrain' },
  { id: 'stk-6', name: 'LynShuu', material: 'Finishing Doff / Lamit / Cutting', quantity: 54, price: 5000, sold: 0, category: 'STICKER', group: 'Afterrain' },
  { id: 'stk-7', name: 'Nezufu Senshirou', material: 'Finishing Doff / Lamit / Cutting', quantity: 54, price: 5000, sold: 0, category: 'STICKER', group: 'Afterrain' },
  { id: 'stk-8', name: 'Poffie Hunni', material: 'Finishing Doff / Lamit / Cutting', quantity: 54, price: 5000, sold: 0, category: 'STICKER', group: 'Afterrain' },
  { id: 'stk-9', name: 'Ririna ruu', material: 'Finishing Doff / Lamit / Cutting', quantity: 54, price: 5000, sold: 0, category: 'STICKER', group: 'Afterrain' },
  { id: 'stk-10', name: 'Vice Seraphyne', material: 'Finishing Doff / Lamit / Cutting', quantity: 54, price: 5000, sold: 0, category: 'STICKER', group: 'Afterrain' },
  
  // LIGHTSTICK 15 COLORS
  { id: 'ls-1', name: 'Lightstick', material: '—', quantity: 19, price: 135000, sold: 0, category: 'LIGHTSTICK 15 COLORS', group: 'Afterrain' },
  
  // STANDEE 1:1
  { id: 'st11-1', name: 'Chelly McBunny', material: '—', quantity: 1, price: 0, sold: 0, category: 'STANDEE 1:1', group: 'Afterrain' },
  { id: 'st11-2', name: 'Kana Chizu', material: '—', quantity: 1, price: 0, sold: 0, category: 'STANDEE 1:1', group: 'Afterrain' },
  { id: 'st11-3', name: 'Poffie Hunnie', material: '—', quantity: 1, price: 0, sold: 0, category: 'STANDEE 1:1', group: 'Afterrain' },

  // YORUKAZE - CAN BADGE
  { id: 'cb-1', name: 'Nanaka Poi', material: '7 Cm, Tin', quantity: 10, price: 20000, sold: 0, category: 'CAN BADGE', group: 'Yorukaze' },
  { id: 'cb-2', name: 'Amare Michiya', material: '7 Cm, Tin', quantity: 10, price: 20000, sold: 0, category: 'CAN BADGE', group: 'Yorukaze' },
  { id: 'cb-3', name: 'Winter Gea', material: '7 Cm, Tin', quantity: 10, price: 20000, sold: 0, category: 'CAN BADGE', group: 'Yorukaze' },
  { id: 'cb-4', name: 'Yuzumi Ch', material: '7 Cm, Tin', quantity: 10, price: 20000, sold: 0, category: 'CAN BADGE', group: 'Yorukaze' },
  { id: 'cb-5', name: 'Tsukiyo Miho', material: '7 Cm, Tin', quantity: 10, price: 20000, sold: 0, category: 'CAN BADGE', group: 'Yorukaze' },
  { id: 'cb-6', name: 'Ellise Youka', material: '7 Cm, Tin', quantity: 10, price: 20000, sold: 0, category: 'CAN BADGE', group: 'Yorukaze' },
  { id: 'cb-7', name: 'Hessa Elainore', material: '7 Cm, Tin', quantity: 10, price: 20000, sold: 0, category: 'CAN BADGE', group: 'Yorukaze' },
  { id: 'cb-8', name: 'Utahime Yukari', material: '7 Cm, Tin', quantity: 10, price: 20000, sold: 0, category: 'CAN BADGE', group: 'Yorukaze' },
  { id: 'cb-9', name: 'Vincent Cerbero', material: '7 Cm, Tin', quantity: 10, price: 20000, sold: 0, category: 'CAN BADGE', group: 'Yorukaze' },
  { id: 'cb-10', name: 'Wantaps Ceha', material: '7 Cm, Tin', quantity: 10, price: 20000, sold: 0, category: 'CAN BADGE', group: 'Yorukaze' },
  { id: 'cb-11', name: 'Hoshikawa Rui', material: '7 Cm, Tin', quantity: 10, price: 20000, sold: 0, category: 'CAN BADGE', group: 'Yorukaze' },
  { id: 'cb-12', name: 'Mihiro Kamigawa', material: '7 Cm, Tin', quantity: 10, price: 20000, sold: 0, category: 'CAN BADGE', group: 'Yorukaze' },

  // YORUKAZE - KEYCHAIN WINTER
  { id: 'kc-1', name: 'Nanaka Poi', material: '7 Cm, Acrylic, Double Side', quantity: 10, price: 45000, sold: 0, category: 'KEYCHAIN', group: 'Yorukaze' },
  { id: 'kc-2', name: 'Amare Michiya', material: '7 Cm, Acrylic, Double Side', quantity: 10, price: 45000, sold: 0, category: 'KEYCHAIN', group: 'Yorukaze' },
  { id: 'kc-3', name: 'Winter Gea', material: '7 Cm, Acrylic, Double Side', quantity: 10, price: 45000, sold: 0, category: 'KEYCHAIN', group: 'Yorukaze' },
  { id: 'kc-4', name: 'Yuzumi Ch', material: '7 Cm, Acrylic, Double Side', quantity: 10, price: 45000, sold: 0, category: 'KEYCHAIN', group: 'Yorukaze' },
  { id: 'kc-5', name: 'Tsukiyo Miho', material: '7 Cm, Acrylic, Double Side', quantity: 10, price: 45000, sold: 0, category: 'KEYCHAIN', group: 'Yorukaze' },
  { id: 'kc-6', name: 'Ellise Youka', material: '7 Cm, Acrylic, Double Side', quantity: 10, price: 45000, sold: 0, category: 'KEYCHAIN', group: 'Yorukaze' },
  { id: 'kc-7', name: 'Hessa Elainore', material: '7 Cm, Acrylic, Double Side', quantity: 10, price: 45000, sold: 0, category: 'KEYCHAIN', group: 'Yorukaze' },
  { id: 'kc-8', name: 'Utahime Yukari', material: '7 Cm, Acrylic, Double Side', quantity: 10, price: 45000, sold: 0, category: 'KEYCHAIN', group: 'Yorukaze' },
  { id: 'kc-9', name: 'Vincent Cerbero', material: '7 Cm, Acrylic, Double Side', quantity: 10, price: 45000, sold: 0, category: 'KEYCHAIN', group: 'Yorukaze' },
  { id: 'kc-10', name: 'Wantaps Ceha', material: '7 Cm, Acrylic, Double Side', quantity: 10, price: 45000, sold: 0, category: 'KEYCHAIN', group: 'Yorukaze' },
  { id: 'kc-11', name: 'Hoshikawa Rui', material: '7 Cm, Acrylic, Double Side', quantity: 10, price: 45000, sold: 0, category: 'KEYCHAIN', group: 'Yorukaze' },
  { id: 'kc-12', name: 'Mihiro Kamigawa', material: '7 Cm, Acrylic, Double Side', quantity: 10, price: 45000, sold: 0, category: 'KEYCHAIN', group: 'Yorukaze' },

  // YORUKAZE - STANDEE 15CM
  { id: 'yst15-1', name: 'Vincent Cerbero', material: 'Acrylic 15 CM (2 SISI + KAKI)', quantity: 5, price: 250000, sold: 0, category: 'STANDEE 15CM', group: 'Yorukaze' },
  { id: 'yst15-2', name: 'Hessa Elainore', material: 'Acrylic 15 CM (2 SISI + KAKI)', quantity: 5, price: 250000, sold: 0, category: 'STANDEE 15CM', group: 'Yorukaze' },

  // YORUKAZE - DAKIMAKURA
  { id: 'daki-1', name: 'Hessa Dakimakura', material: '180 Cm x 60 Cm', quantity: 3, price: 329000, sold: 0, category: 'DAKIMAKURA', group: 'Yorukaze' },
];

// Initialize inventory from localStorage
export const getInventory = (): Product[] => {
  const stored = localStorage.getItem('inventory');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('inventory', JSON.stringify(INITIAL_INVENTORY));
  return INITIAL_INVENTORY;
};

export const saveInventory = (inventory: Product[]) => {
  localStorage.setItem('inventory', JSON.stringify(inventory));
};

export const getProductsByCategory = (category: string): Product[] => {
  return getInventory().filter(p => p.category === category);
};
