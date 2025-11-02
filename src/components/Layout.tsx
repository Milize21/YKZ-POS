import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Package, ShoppingCart, FileText, Users } from 'lucide-react';
import { getCurrentUser, logout, isAdmin } from '@/lib/auth';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    ...(isAdmin(user) ? [{ path: '/inventory', icon: Package, label: 'Inventory' }] : []),
    { path: '/sales', icon: ShoppingCart, label: 'Sales' },
    ...(isAdmin(user) ? [
      { path: '/groups', icon: Users, label: 'Groups' },
      { path: '/reports', icon: FileText, label: 'Reports' }
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-background relative">
      {/* Wave Pattern Background */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <img 
          src="/wave-pattern.svg" 
          alt="" 
          className="w-full h-full object-cover"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>

      <header className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm" style={{ borderBottomColor: '#5D6BA3' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/yorukaze-logo.png" 
                alt="Yorukaze Logo" 
                className="h-12 w-12 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#2D3561' }}>Yorukaze POS System</h1>
                <p className="text-xs text-muted-foreground">
                  {user?.username} ({user?.role})
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 relative z-10">
        <nav className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? 'default' : 'outline'}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-2 whitespace-nowrap"
              style={location.pathname === item.path ? { 
                backgroundColor: '#2D3561',
                borderColor: '#5D6BA3'
              } : {}}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>

        <main className="mb-16">{children}</main>
      </div>

      {/* Copyright Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t z-40" style={{ borderTopColor: '#5D6BA3' }}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <img 
              src="/yorukaze-logo.png" 
              alt="Yorukaze" 
              className="h-6 w-6 opacity-70 object-contain"
            />
            <p className="text-xs text-muted-foreground">
              Copyright © Yorukaze Production 2020
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
