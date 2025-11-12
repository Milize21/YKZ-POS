import { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Upload, X, Package } from 'lucide-react';
import { getInventory, saveInventory, CATEGORIES, Product, getGroups } from '@/lib/inventory';
import { formatCurrency } from '@/lib/sales';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleBackground } from '@/components/ParticleBackground';

const Inventory = () => {
  const [inventory, setInventory] = useState<Product[]>(getInventory());
  const [groups, setGroups] = useState<string[]>(getGroups());
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    material: '',
    quantity: 0,
    price: 0,
    category: CATEGORIES[0],
    group: groups.find(g => g !== 'All') || 'Afterrain',
    image: '',
  });

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setFormData({ ...formData, image: base64String });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProduct) {
      const updated = inventory.map(p =>
        p.id === editingProduct.id ? { ...p, ...formData } : p
      );
      setInventory(updated);
      saveInventory(updated);
      toast.success('Product updated successfully');
    } else {
      const newProduct: Product = {
        ...formData,
        id: `prod-${Date.now()}`,
        sold: 0,
      };
      const updated = [...inventory, newProduct];
      setInventory(updated);
      saveInventory(updated);
      toast.success('Product added successfully');
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      material: product.material,
      quantity: product.quantity,
      price: product.price,
      category: product.category,
      group: product.group,
      image: product.image || '',
    });
    setImagePreview(product.image || null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = inventory.filter(p => p.id !== id);
    setInventory(updated);
    saveInventory(updated);
    toast.success('Product deleted');
  };

  const resetForm = () => {
    setEditingProduct(null);
    setImagePreview(null);
    setFormData({
      name: '',
      material: '',
      quantity: 0,
      price: 0,
      category: CATEGORIES[0],
      group: groups.find(g => g !== 'All') || 'Afterrain',
      image: '',
    });
  };

  return (
    <Layout>
      {/* Snow Particle Effect with Blue Shades */}
      <ParticleBackground variant="snow" />
      
      <div className="space-y-6">
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Inventory Management</h2>
            <p className="text-muted-foreground">Manage your products and stock</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Label htmlFor="image">Product Image</Label>
                  <div className="mt-2">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                          <Upload className="h-8 w-8 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-2">Upload</span>
                        </label>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">Max size: 2MB</p>
                  </div>
                </motion.div>
                <div>
                  <Label htmlFor="group">Group</Label>
                  <Select
                    value={formData.group}
                    onValueChange={(value) => setFormData({ ...formData, group: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.filter(g => g !== 'All').map(group => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="material">Material/Description</Label>
                  <Input
                    id="material"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (Rp)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="flex gap-4">
          <Card className="p-4 flex-1">
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
          <Card className="p-4 w-48">
            <Label>Filter by Group</Label>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Groups</SelectItem>
                {groups.filter(g => g !== 'All').map(group => (
                  <SelectItem key={group} value={group}>{group}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>
        </div>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Material</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Sold</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      type: "spring" as const,
                      stiffness: 300,
                      damping: 30,
                      delay: index * 0.03,
                    }}
                    className="border-b transition-colors hover:bg-muted/50"
                  >
                    <TableCell>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring" as const, stiffness: 400, damping: 20 }}
                      >
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </motion.div>
                    </TableCell>
                    <TableCell className="font-medium">{product.group}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.material}</TableCell>
                    <TableCell className="text-right">{product.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                    <TableCell className="text-right text-success">{product.sold}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: -5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </Card>
      </div>
    </Layout>
  );
};

export default Inventory;
