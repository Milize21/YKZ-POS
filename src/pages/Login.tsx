import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { login } from '@/lib/auth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = login(username, password);
    
    if (user) {
      toast.success(`Welcome back, ${user.username}!`);
      navigate('/');
    } else {
      toast.error('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Wave Pattern Background */}
      <motion.div 
        className="fixed inset-0 pointer-events-none opacity-5 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 1 }}
      >
        <img 
          src="/wave-pattern.svg" 
          alt="" 
          className="w-full h-full object-cover"
          style={{ mixBlendMode: 'multiply' }}
        />
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring" as const, stiffness: 120, damping: 18, mass: 1 }}
      >
        <Card className="w-full max-w-md p-8 space-y-6 relative z-10 shadow-2xl backdrop-blur-sm">
          <motion.div 
            className="text-center space-y-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" as const, stiffness: 120, damping: 18 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center mb-4"
              whileHover={{ scale: 1.15, rotate: 8 }}
              whileTap={{ scale: 0.9, rotate: -5 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
            >
              <img 
                src="/yorukaze-logo.png" 
                alt="Yorukaze Logo" 
                className="w-20 h-20 object-contain cursor-pointer"
              />
            </motion.div>
            <motion.h1 
              className="text-3xl font-bold" 
              style={{ color: '#2D3561' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Yorukaze POS System
            </motion.h1>
            <motion.p 
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Sign in to continue
            </motion.p>
          </motion.div>

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <motion.div 
              className="space-y-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring" as const, stiffness: 150, damping: 20 }}
            >
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin or cashier"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="transition-all focus:scale-[1.02]"
              />
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, type: "spring" as const, stiffness: 150, damping: 20 }}
            >
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transition-all focus:scale-[1.02]"
              />
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, type: "spring" as const, stiffness: 150, damping: 20 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button 
                type="submit" 
                className="w-full shadow-lg" 
                size="lg"
                style={{ backgroundColor: '#2D3561' }}
              >
                Sign In
              </Button>
            </motion.div>
          </motion.form>

          <motion.div 
            className="text-center text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p>Demo credentials:</p>
            <p>admin / 12345 or cashier / 12345</p>
          </motion.div>

          <motion.div 
            className="text-center pt-4 border-t"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <motion.img 
                src="/yorukaze-logo.png" 
                alt="Yorukaze" 
                className="h-5 w-5 opacity-70 object-contain"
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ type: "spring", stiffness: 200 }}
              />
              Copyright © Yorukaze Production 2020
            </p>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
