import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Package, ShoppingCart, FileText, Users } from 'lucide-react';
import { getCurrentUser, logout, isAdmin } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Enhanced animation variants
  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 20,
        mass: 1
      }
    }
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: 0.5 + (i * 0.08),
        type: "spring" as const,
        stiffness: 150,
        damping: 20
      }
    })
  };

  const pageTransitionVariants = {
    initial: { opacity: 0, x: 30, scale: 0.98 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    },
    exit: {
      opacity: 0,
      x: -30,
      scale: 0.98,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  };  return (
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

      <motion.header 
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="border-b bg-card/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm" 
        style={{ borderBottomColor: '#5D6BA3' }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 120, damping: 18 }}
            >
              <motion.img 
                src="/yorukaze-logo.png" 
                alt="Yorukaze Logo" 
                className="h-12 w-12 object-contain cursor-pointer"
                whileHover={{ 
                  scale: 1.15, 
                  rotate: 8,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ scale: 0.9, rotate: -5 }}
              />
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#2D3561' }}>Yorukaze POS System</h1>
                <p className="text-xs text-muted-foreground">
                  {user?.username} ({user?.role})
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 120, damping: 18 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-6 relative z-10">
        <motion.nav 
          className="mb-6 flex gap-2 overflow-x-auto pb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 120, damping: 18 }}
        >
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              custom={index}
              variants={navItemVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ 
                y: -4, 
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={location.pathname === item.path ? 'default' : 'outline'}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2 whitespace-nowrap transition-all"
                style={location.pathname === item.path ? { 
                  backgroundColor: '#2D3561',
                  borderColor: '#5D6BA3'
                } : {}}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </motion.div>
          ))}
        </motion.nav>

        <AnimatePresence mode="wait">
          <motion.main 
            key={location.pathname}
            variants={pageTransitionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="mb-16"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>

      {/* Copyright Footer */}
      <motion.footer 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 100, damping: 20 }}
        className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t z-40" 
        style={{ borderTopColor: '#5D6BA3' }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <motion.img 
              src="/yorukaze-logo.png" 
              alt="Yorukaze" 
              className="h-6 w-6 opacity-70 object-contain cursor-pointer"
              whileHover={{ 
                scale: 1.3, 
                rotate: 360,
                opacity: 1,
                transition: { type: "spring", stiffness: 260, damping: 20 }
              }}
              whileTap={{ scale: 0.9 }}
            />
            <p className="text-xs text-muted-foreground">
              Copyright © Yorukaze Production 2020
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};
