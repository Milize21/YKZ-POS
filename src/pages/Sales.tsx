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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { getInventory, saveInventory, CATEGORIES, Product, getGroups } from '@/lib/inventory';
import { addSale, formatCurrency, getSales } from '@/lib/sales';
import QRReceipt from '@/components/QRReceipt';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { MorphShape } from '@/components/MorphShape';
import { ParticleBackground } from '@/components/ParticleBackground';

const Sales = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || CATEGORIES[0];
  
  const [inventory, setInventory] = useState<Product[]>(getInventory());
  const [groups, setGroups] = useState<string[]>(getGroups());
  const [selectedGroup, setSelectedGroup] = useState<string>(groups[0] || 'All');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [customerDate, setCustomerDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerDetails, setCustomerDetails] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [staffName, setStaffName] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [qrLabel, setQrLabel] = useState('');

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

    // Validate all customer fields
    if (!customerDate) {
      toast.error('Please enter customer date');
      return;
    }

    if (!customerDetails.trim()) {
      toast.error('Please enter customer details (e.g., CF20)');
      return;
    }

    if (!customerNumber.trim()) {
      toast.error('Please enter customer number (e.g., 001)');
      return;
    }

    if (!staffName.trim()) {
      toast.error('Please enter staff name');
      return;
    }

    // Create full customer ID
    const fullCustomerId = `${customerDetails.trim()}-${customerNumber.trim()}`;

    // Check if customer ID already exists
    const existingSales = getSales();
    const customerExists = existingSales.some(sale => sale.customerId === fullCustomerId);
    
    if (customerExists) {
      toast.error(`Customer ID "${fullCustomerId}" already exists! Please use a different number.`);
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const confirmCheckout = () => {
    const fullCustomerId = `${customerDetails.trim()}-${customerNumber.trim()}`;
    const transactionId = `TXN-${Date.now()}`;
    // Collect sale records so we can show a QR for the transaction
    const saleRecords = [] as any[];
    const updatedInventory = inventory.map(product => {
      const soldQty = cart.get(product.id);
      if (soldQty) {
        // Record sale with transaction ID and capture return value
        const newSale = addSale({
          transactionId,
          customerId: fullCustomerId,
          group: product.group,
          category: product.category,
          itemName: product.name,
          quantitySold: soldQty,
          totalPrice: product.price * soldQty,
          staffName: staffName.trim(),
        });
        saleRecords.push(newSale);

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
    setCustomerDate(new Date().toISOString().split('T')[0]);
    setCustomerDetails('');
    setCustomerNumber('');
    setStaffName('');
    const totalAmount = getTotalAmount();
    setShowConfirmDialog(false);
    // Prepare QR payload (encode transaction info)
    const payload = JSON.stringify({
      transactionId,
      customerId: fullCustomerId,
      totalAmount,
      date: new Date().toISOString(),
      saleIds: saleRecords.map(r => r.id),
    });
    setQrValue(payload);
    setQrLabel(`Transaction ${transactionId} — ${formatCurrency(totalAmount)}`);
    setShowQR(true);
    toast.success(`Sale completed! Transaction ID: ${transactionId}\nCustomer ID: ${fullCustomerId}`);
  };

  return (
    <Layout>
      {/* Snow Particle Animation */}
      <ParticleBackground variant="snow" />
      
      {/* Decorative Wave Shape */}
      <div className="fixed top-1/4 right-0 opacity-5 pointer-events-none z-0">
        <MorphShape variant="wave" color="#2D3561" size={180} duration={15} />
      </div>
      
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
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product, index) => {
                const inCart = cart.get(product.id) || 0;
                const available = product.quantity - inCart;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ 
                      delay: index * 0.04,
                      type: "spring" as const, 
                      stiffness: 300, 
                      damping: 25,
                      mass: 0.8
                    }}
                    whileHover={{ 
                      y: -6, 
                      scale: 1.03,
                      transition: { type: "spring" as const, stiffness: 500, damping: 15 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    layout
                  >
                    <Card className="p-4 transition-shadow hover:shadow-lg overflow-hidden">
                      <div className="space-y-3">
                        {product.image && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.04 + 0.05 }}
                            className="w-full h-32 overflow-hidden rounded-lg"
                          >
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </motion.div>
                        )}
                        <motion.div
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.04 + 0.1 }}
                        >
                          <h3 className="font-semibold text-foreground">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.material}</p>
                        </motion.div>
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
                            <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromCart(product.id)}
                                disabled={inCart === 0}
                                className="transition-all"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </motion.div>
                            <motion.span 
                              className="w-8 text-center font-medium"
                              key={inCart}
                              initial={{ scale: 1.5, color: '#2D3561' }}
                              animate={{ scale: 1, color: 'inherit' }}
                              transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
                            >
                              {inCart}
                            </motion.span>
                            <motion.div whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addToCart(product.id)}
                                disabled={available === 0}
                                className="transition-all"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:col-span-1">
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" as const, stiffness: 120, damping: 20 }}
          >
            <Card className="p-6 sticky top-24 space-y-4 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ delay: 0.5, duration: 0.5, ease: "easeInOut" }}
                >
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground">Cart</h3>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {Array.from(cart.entries()).map(([productId, qty]) => {
                    const product = inventory.find(p => p.id === productId);
                    if (!product) return null;

                    return (
                      <motion.div
                        key={productId}
                        initial={{ opacity: 0, x: -20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: "auto" }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
                        layout
                        className="flex justify-between items-center py-2 border-b"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(product.price)} × {qty}
                          </p>
                        </div>
                        <motion.p
                          key={`${productId}-${qty}`}
                          initial={{ scale: 1.3, color: '#2D3561' }}
                          animate={{ scale: 1, color: 'inherit' }}
                          className="font-semibold text-foreground"
                        >
                          {formatCurrency(product.price * qty)}
                        </motion.p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                {cart.size === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-muted-foreground py-8"
                  >
                    Cart is empty
                  </motion.p>
                )}
              </div>

            <div className="pt-4 border-t space-y-4">
              <div>
                <Label htmlFor="customerDate">Customer Date *</Label>
                <Input
                  id="customerDate"
                  type="date"
                  value={customerDate}
                  readOnly
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground mt-1">Auto-set to today's date</p>
              </div>
              <div>
                <Label htmlFor="customerDetails">Customer Details *</Label>
                <Input
                  id="customerDetails"
                  placeholder="e.g. CF20"
                  value={customerDetails}
                  onChange={(e) => setCustomerDetails(e.target.value.toUpperCase())}
                  maxLength={10}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Example: CF20, AR15, YK22</p>
              </div>
              <div>
                <Label htmlFor="customerNumber">Customer Number *</Label>
                <Input
                  id="customerNumber"
                  placeholder="e.g. 001"
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                  maxLength={10}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Will create ID: {customerDetails || 'XX'}-{customerNumber || '000'}</p>
              </div>
              <div>
                <Label htmlFor="staffName">Staff Name *</Label>
                <Input
                  id="staffName"
                  placeholder="Enter staff name"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground">Total:</span>
                <motion.span
                  key={getTotalAmount()}
                  initial={{ scale: 1.2, color: '#2D3561' }}
                  animate={{ scale: 1, color: '#5D6BA3' }}
                  transition={{ type: "spring" as const, stiffness: 300, damping: 20 }}
                  className="text-2xl font-bold"
                >
                  {formatCurrency(getTotalAmount())}
                </motion.span>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={cart.size === 0}
                  style={{ backgroundColor: cart.size > 0 ? '#2D3561' : undefined }}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Complete Sale
                </Button>
              </motion.div>
            </div>
          </Card>
          </motion.div>
        </div>
      </div>

      {/* QRIS Dialog */}
      <QRReceipt 
        value={qrValue} 
        customerName={`${customerDetails}-${customerNumber}`}
        customerId={qrLabel}
        isOpen={showQR}
        onClose={() => setShowQR(false)}
      />

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl">Confirm Sale</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 text-left text-base">
                <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer ID</p>
                    <p className="font-semibold text-lg text-foreground">{customerDetails}-{customerNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Staff</p>
                    <p className="font-semibold text-lg text-foreground">{staffName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="font-semibold text-lg text-foreground">{cart.size} item(s)</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="font-bold text-2xl text-primary">{formatCurrency(getTotalAmount())}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="font-semibold text-foreground mb-3">Cart Items:</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Array.from(cart.entries()).map(([productId, qty]) => {
                      const product = inventory.find(p => p.id === productId);
                      return product ? (
                        <div key={productId} className="flex justify-between items-center bg-background p-3 rounded border">
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-sm text-muted-foreground">Qty: {qty}</p>
                          </div>
                          <p className="font-semibold text-foreground">{formatCurrency(product.price * qty)}</p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="text-base">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCheckout} className="text-base" style={{ backgroundColor: '#2D3561' }}>
              Confirm Sale
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Sales;
