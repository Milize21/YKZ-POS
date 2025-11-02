import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { login } from '@/lib/auth';
import { toast } from 'sonner';

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4 relative">
      {/* Wave Pattern Background */}
      <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
        <img 
          src="/wave-pattern.svg" 
          alt="" 
          className="w-full h-full object-cover"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>

      <Card className="w-full max-w-md p-8 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src="/yorukaze-logo.png" 
              alt="Yorukaze Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#2D3561' }}>Yorukaze POS System</h1>
          <p className="text-muted-foreground">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="admin or cashier"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            style={{ backgroundColor: '#2D3561' }}
          >
            Sign In
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          <p>Demo credentials:</p>
          <p>admin / 12345 or cashier / 12345</p>
        </div>

        <div className="text-center pt-4 border-t">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <img 
              src="/yorukaze-logo.png" 
              alt="Yorukaze" 
              className="h-5 w-5 opacity-70 object-contain"
            />
            Copyright © Yorukaze Production 2020
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
