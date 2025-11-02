import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { getInventory, saveInventory, CATEGORIES, Product, getGroups } from '@/lib/inventory';
import { addSale, formatCurrency } from '@/lib/sales';
import { toast } from 'sonner';

const Sales = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || CATEGORIES[0];
  
  const [inventory, setInventory] = useState<Product[]>(getInventory());
  const [groups, setGroups] = useState<string[]>(getGroups());
  const [selectedGroup, setSelectedGroup] = useState<string>(groups[0] || 'All');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [customerId, setCustomerId] = useState('');

  useEffect(() => {
    setInventory(getInventory());
  }, []);

  // Refresh groups from localStorage periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedGroups = getGroups();
      if (JSON.stringify(updatedGroups) !== JSON.stringify(groups)) {
        setGroups(updatedGroups);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [groups]);

  const filteredProducts = inventory.filter(p => {
    const matchesCategory = p.category === selectedCategory;
    const matchesGroup = selectedGroup === 'All' || p.group === selectedGroup;
    return matchesCategory && matchesGroup;
  });

  // Get only categories that have products for the selected group
  const availableCategories = CATEGORIES.filter(category => {
    return inventory.some(p => {
      const matchesCategory = p.category === category;
      const matchesGroup = selectedGroup === 'All' || p.group === selectedGroup;
      return matchesCategory && matchesGroup;
    });
  });

  // If selected category has no products, switch to first available category
  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.includes(selectedCategory)) {
      setSelectedCategory(availableCategories[0]);
    }
  }, [selectedGroup, availableCategories, selectedCategory]);

  const addToCart = (productId: string) => {
    const product = inventory.find(p => p.id === productId);
    if (!product || product.quantity === 0) {
      toast.error('Product out of stock');
      return;
    }

    const currentQty = cart.get(productId) || 0;
    if (currentQty >= product.quantity) {
      toast.error('Not enough stock');
      return;
    }

    const newCart = new Map(cart);
    newCart.set(productId, currentQty + 1);
    setCart(newCart);
  };

  const removeFromCart = (productId: string) => {
    const currentQty = cart.get(productId) || 0;
    if (currentQty === 0) return;

    const newCart = new Map(cart);
    if (currentQty === 1) {
      newCart.delete(productId);
    } else {
      newCart.set(productId, currentQty - 1);
    }
    setCart(newCart);
  };

  const getTotalAmount = () => {
    let total = 0;
    cart.forEach((qty, productId) => {
      const product = inventory.find(p => p.id === productId);
      if (product) total += product.price * qty;
    });
    return total;
  };

  const handleCheckout = () => {
    if (cart.size === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (!customerId.trim()) {
      toast.error('Please enter Customer ID');
      return;
    }

    const transactionId = `TXN-${Date.now()}`;
    
    const updatedInventory = inventory.map(product => {
      const soldQty = cart.get(product.id);
      if (soldQty) {
        // Record sale with transaction ID
        addSale({
          transactionId,
          customerId: customerId.trim(),
          group: product.group,
          category: product.category,
          itemName: product.name,
          quantitySold: soldQty,
          totalPrice: product.price * soldQty,
        });

        return {
          ...product,
          quantity: product.quantity - soldQty,
          sold: product.sold + soldQty,
        };
      }
      return product;
    });

    setInventory(updatedInventory);
    saveInventory(updatedInventory);
    setCart(new Map());
    setCustomerId('');
    toast.success(`Sale completed! Transaction ID: ${transactionId}`);
  };

  return (
    <Layout>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Sales</h2>
              <p className="text-muted-foreground">Select products to sell</p>
            </div>
            <div className="w-48">
              <Label>Group</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card className="p-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableCategories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat)}
                  className="whitespace-nowrap"
                >
                  {cat}
                </Button>
              ))}
              {availableCategories.length === 0 && (
                <p className="text-muted-foreground py-2">No categories available for this group</p>
              )}
            </div>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            {filteredProducts.map((product) => {
              const inCart = cart.get(product.id) || 0;
              const available = product.quantity - inCart;

              return (
                <Card key={product.id} className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.material}</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {formatCurrency(product.price)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Stock: {available}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(product.id)}
                          disabled={inCart === 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">{inCart}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addToCart(product.id)}
                          disabled={available === 0}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <h3 className="text-xl font-bold text-foreground">Cart</h3>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {Array.from(cart.entries()).map(([productId, qty]) => {
                const product = inventory.find(p => p.id === productId);
                if (!product) return null;

                return (
                  <div key={productId} className="flex justify-between items-center py-2 border-b">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(product.price)} × {qty}
                      </p>
                    </div>
                    <p className="font-semibold text-foreground">
                      {formatCurrency(product.price * qty)}
                    </p>
                  </div>
                );
              })}
              {cart.size === 0 && (
                <p className="text-center text-muted-foreground py-8">Cart is empty</p>
              )}
            </div>

            <div className="pt-4 border-t space-y-4">
              <div>
                <Label htmlFor="customerId">Customer ID</Label>
                <Input
                  id="customerId"
                  placeholder="e.g. CUST-001"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(getTotalAmount())}
                </span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={cart.size === 0}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Complete Sale
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Sales;
