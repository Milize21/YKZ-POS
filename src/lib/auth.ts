// Temporary auth context - will be replaced with Lovable Cloud auth
import { getDatabase, saveDatabase } from './database';

export type UserRole = 'admin' | 'cashier';

export interface User {
  username: string;
  role: UserRole;
}

// Mock users for demo (will be replaced with database)
const MOCK_USERS = [
  { username: 'admin', password: '12345', role: 'admin' as UserRole },
  { username: 'cashier', password: '12345', role: 'cashier' as UserRole },
];

export const login = (username: string, password: string): User | null => {
  const user = MOCK_USERS.find(
    (u) => u.username === username && u.password === password
  );
  
  if (user) {
    const userData = { username: user.username, role: user.role };
    const db = getDatabase();
    db.auth = userData;
    saveDatabase(db);
    return userData;
  }
  
  return null;
};

export const logout = () => {
  const db = getDatabase();
  db.auth = null;
  saveDatabase(db);
};

export const getCurrentUser = (): User | null => {
  const db = getDatabase();
  return db.auth;
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};
