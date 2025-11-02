// Temporary auth context - will be replaced with Lovable Cloud auth
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
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  }
  
  return null;
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};
