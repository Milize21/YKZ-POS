import { useState, useEffect, useMemo } from 'react';
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
import { Plus, Pencil, Trash2, Upload, X, Package, Settings, List } from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getInventory, saveInventory, getCategories, addCategory, Product, getGroups, moveToTrash, getInventoryWithImages, saveCategories } from '@/lib/inventory';
import { formatCurrency } from '@/lib/sales';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleBackground } from '@/components/ParticleBackground';

const Inventory = () => {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<string[]>(getGroups());
  const [categories, setCategories] = useState<string[]>(() => {
    const cats = getCategories();
    // Remove duplicates by converting to Set and back to array
    return Array.from(new Set(cats));
  });
  const [selectedCategory, setSelectedCategory] = useState<string>(getCategories()[0]);
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategories, setEditingCategories] = useState<string[]>([]);
  const [originalCategories, setOriginalCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [batchCategory, setBatchCategory] = useState<string>(getCategories()[0]);
  const [batchGroup, setBatchGroup] = useState<string>(groups.find(g => g !== 'All') || 'Afterrain');
  const [batchProducts, setBatchProducts] = useState<string>('');
  const [categoryScrollPosition, setCategoryScrollPosition] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    material: '',
    quantity: 0,
    price: 0,
    category: getCategories()[0],
    group: groups.find(g => g !== 'All') || 'Afterrain',
    image: '',
  });

  // Load inventory with images from IndexedDB
  useEffect(() => {
    const loadInventory = async () => {
      setLoading(true);
      try {
        const products = await getInventoryWithImages();
        setInventory(products);
      } catch (error) {
        console.error('Failed to load inventory:', error);
        toast.error('Failed to load some product images');
        // Fallback to localStorage-only data
        setInventory(getInventory());
      } finally {
        setLoading(false);
      }
    };
    
    loadInventory();
  }, []);

  // Refresh groups and categories from localStorage periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedGroups = getGroups();
      const updatedCategories = getCategories();
      
      // Only update if there are actual changes
      if (JSON.stringify(updatedGroups) !== JSON.stringify(groups)) {
        setGroups(updatedGroups);
      }
      if (JSON.stringify(updatedCategories) !== JSON.stringify(categories)) {
        setCategories(updatedCategories);
      }
    }, 1000); // Check every second for synchronization
    
    return () => clearInterval(interval);
  }, [groups, categories]); // Proper dependency array for comparison

  const filteredProducts = inventory.filter(p => {
    const matchesCategory = p.category === selectedCategory;
    const matchesGroup = selectedGroup === 'All' || p.group === selectedGroup;
    return matchesCategory && matchesGroup;
  });

  // Get only categories that have products for the selected group (memoized)
  const availableCategories = useMemo(() => {
    return categories.filter(category => {
      return inventory.some(p => {
        const matchesCategory = p.category === category;
        const matchesGroup = selectedGroup === 'All' || p.group === selectedGroup;
        return matchesCategory && matchesGroup;
      });
    });
  }, [categories, inventory, selectedGroup]);

  // If selected category has no products, switch to first available category
  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.includes(selectedCategory)) {
      setSelectedCategory(availableCategories[0]);
    }
  }, [selectedGroup, availableCategories, selectedCategory]); // Complete dependencies

  // Update arrow visibility on scroll
  useEffect(() => {
    const updateArrows = () => {
      const container = document.getElementById('category-carousel');
      if (container) {
        const scrollLeft = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        setShowLeftArrow(scrollLeft > 10);
        setShowRightArrow(scrollLeft < maxScroll - 10);
      }
    };

    updateArrows();
    const container = document.getElementById('category-carousel');
    if (container) {
      container.addEventListener('scroll', updateArrows);
      window.addEventListener('resize', updateArrows);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', updateArrows);
        window.removeEventListener('resize', updateArrows);
      }
    };
  }, [availableCategories]);

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

    // Show loading state
    toast.info('Processing image...');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      // Compress large images
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize if image is too large (max 800px width/height)
        const maxSize = 800;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setImagePreview(compressedBase64);
        setFormData({ ...formData, image: compressedBase64 });
        toast.success('Image uploaded successfully');
      };
      img.src = base64String;
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Disable multiple rapid submissions
    if (isDialogOpen === false) return;
    
    try {
      if (editingProduct) {
        const updated = inventory.map(p =>
          p.id === editingProduct.id ? { 
            ...p, 
            ...formData,
            sold: p.sold // Preserve sold count
          } : p
        );
        setInventory(updated);
        await saveInventory(updated);
        toast.success('Product updated successfully');
      } else {
        const newProduct: Product = {
          ...formData,
          id: `prod-${Date.now()}`,
          sold: 0,
        };
        const updated = [...inventory, newProduct];
        setInventory(updated);
        await saveInventory(updated);
        toast.success('Product added successfully');
      }
      
      setIsDialogOpen(false);
      resetForm();
      
      // Reload inventory to get IndexedDB references
      const refreshed = await getInventoryWithImages();
      setInventory(refreshed);
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('Failed to save product. Please try again.');
    }
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

  const handleDelete = async (id: string) => {
    const product = inventory.find(p => p.id === id);
    if (product) {
      try {
        await moveToTrash(product);
        const updated = inventory.filter(p => p.id !== id);
        setInventory(updated);
        await saveInventory(updated);
        toast.success('Product moved to trash');
      } catch (error) {
        console.error('Failed to move product to trash:', error);
        toast.error('Failed to move product to trash');
      }
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setImagePreview(null);
    setFormData({
      name: '',
      material: '',
      quantity: 0,
      price: 0,
      category: categories[0],
      group: groups.find(g => g !== 'All') || 'Afterrain',
      image: '',
    });
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      const updatedCategories = addCategory(newCategory.trim());
      setCategories(updatedCategories);
      setFormData({ ...formData, category: newCategory.trim() });
      toast.success(`Category "${newCategory.trim()}" added successfully`);
      setNewCategory('');
      setIsAddingCategory(false);
    } else if (categories.includes(newCategory.trim())) {
      toast.error('Category already exists');
    }
  };

  const handleSaveCategories = () => {
    // Find all renamed categories by comparing with original
    const renamedCategories: { oldName: string; newName: string }[] = [];
    
    originalCategories.forEach((oldCat, index) => {
      const newCat = editingCategories[index];
      if (newCat && oldCat !== newCat) {
        renamedCategories.push({ oldName: oldCat, newName: newCat });
      }
    });

    // Update all products that use renamed categories
    if (renamedCategories.length > 0) {
      const updatedInventory = inventory.map(product => {
        const renamed = renamedCategories.find(r => r.oldName === product.category);
        if (renamed) {
          return { ...product, category: renamed.newName };
        }
        return product;
      });
      
      setInventory(updatedInventory);
      saveInventory(updatedInventory);
      
      const affectedProducts = updatedInventory.filter(p => 
        renamedCategories.some(r => r.newName === p.category)
      ).length;
      
      toast.success(`Updated ${renamedCategories.length} category name(s) and ${affectedProducts} product(s)`);
    }

    // Save the new category list
    saveCategories(editingCategories);
    setCategories(editingCategories);
    setIsCategoryDialogOpen(false);
    
    if (renamedCategories.length === 0) {
      toast.success('Categories updated successfully');
    }
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim() && !editingCategories.includes(newCategoryName.trim())) {
      setEditingCategories([...editingCategories, newCategoryName.trim().toUpperCase()]);
      setNewCategoryName('');
      toast.success('Category added');
    } else if (editingCategories.includes(newCategoryName.trim())) {
      toast.error('Category already exists');
    }
  };

  const handleDeleteCategory = (categoryToDelete: string) => {
    const hasProducts = inventory.some(p => p.category === categoryToDelete);
    if (hasProducts) {
      toast.error('Cannot delete category with existing products');
      return;
    }
    setEditingCategories(editingCategories.filter(c => c !== categoryToDelete));
    toast.success('Category removed');
  };

  const handleEditCategory = (oldName: string, newName: string) => {
    if (newName.trim() && newName !== oldName) {
      const index = editingCategories.indexOf(oldName);
      const updated = [...editingCategories];
      updated[index] = newName.trim().toUpperCase();
      setEditingCategories(updated);
    }
  };

  const handleBatchAdd = async () => {
    if (!batchProducts.trim()) {
      toast.error('Please enter product data');
      return;
    }

    try {
      const lines = batchProducts.trim().split('\n').filter(line => line.trim());
      const newProducts: Product[] = [];
      let successCount = 0;
      let errorCount = 0;

      for (const line of lines) {
        // Expected format: Name | Material | Quantity | Price
        const parts = line.split('|').map(p => p.trim());
        
        if (parts.length < 4) {
          errorCount++;
          continue;
        }

        const [name, material, quantityStr, priceStr] = parts;
        const quantity = parseInt(quantityStr);
        const price = parseFloat(priceStr);

        if (!name || !material || isNaN(quantity) || isNaN(price)) {
          errorCount++;
          continue;
        }

        const newProduct: Product = {
          id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: name,
          material: material,
          quantity: quantity,
          price: price,
          category: batchCategory,
          group: batchGroup,
          sold: 0,
        };

        newProducts.push(newProduct);
        successCount++;
      }

      if (newProducts.length > 0) {
        const updated = [...inventory, ...newProducts];
        setInventory(updated);
        await saveInventory(updated);
        toast.success(`Added ${successCount} product(s) successfully${errorCount > 0 ? `. ${errorCount} failed.` : ''}`);
        
        // Reset and close
        setBatchProducts('');
        setIsBatchDialogOpen(false);
        
        // Reload inventory to get IndexedDB references
        const refreshed = await getInventoryWithImages();
        setInventory(refreshed);
      } else {
        toast.error('No valid products to add');
      }
    } catch (error) {
      console.error('Failed to add batch products:', error);
      toast.error('Failed to add products. Please check the format.');
    }
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    const container = document.getElementById('category-carousel');
    if (container) {
      const scrollAmount = 400; // Scroll more to show next set
      const newPosition = direction === 'left' 
        ? Math.max(0, container.scrollLeft - scrollAmount)
        : Math.min(container.scrollWidth - container.clientWidth, container.scrollLeft + scrollAmount);
      
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
    }
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
          <div className="flex gap-2">
            <Dialog open={isCategoryDialogOpen} onOpenChange={(open) => {
              setIsCategoryDialogOpen(open);
              if (open) {
                setEditingCategories([...categories]);
                setOriginalCategories([...categories]);
              }
            }}>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Categories
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Manage Product Categories</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add new category..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewCategory();
                        }
                      }}
                    />
                    <Button onClick={handleAddNewCategory}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {editingCategories.map((category, index) => {
                        const hasProducts = inventory.some(p => p.category === category);
                        return (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded">
                            <Input
                              value={category}
                              onChange={(e) => handleEditCategory(category, e.target.value)}
                              className="flex-1"
                            />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {inventory.filter(p => p.category === category).length} products
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category)}
                              disabled={hasProducts}
                              title={hasProducts ? "Cannot delete category with products" : "Delete category"}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveCategories}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
              <DialogTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline">
                    <List className="h-4 w-4 mr-2" />
                    Batch Add Product
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Batch Add Products</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="batch-category">Category (Same for all)</Label>
                      <Select value={batchCategory} onValueChange={setBatchCategory}>
                        <SelectTrigger id="batch-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="batch-group">Group (Same for all)</Label>
                      <Select value={batchGroup} onValueChange={setBatchGroup}>
                        <SelectTrigger id="batch-group">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.filter(g => g !== 'All').map((group) => (
                            <SelectItem key={group} value={group}>
                              {group}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="batch-products">Product List</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enter one product per line in format: <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Name | Material | Quantity | Price</span>
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Example: <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Avy Inkaiserin | Acrylic 5CM | 10 | 40000</span>
                    </p>
                    <textarea
                      id="batch-products"
                      value={batchProducts}
                      onChange={(e) => setBatchProducts(e.target.value)}
                      className="w-full h-64 p-3 border rounded-md font-mono text-sm"
                      placeholder="Avy Inkaiserin | Acrylic 5CM | 10 | 40000
Chelly McBunny | Acrylic 5CM | 10 | 40000
Flein Ryst | Acrylic 5CM | 10 | 40000"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setIsBatchDialogOpen(false);
                      setBatchProducts('');
                    }}>
                      Cancel
                    </Button>
                    <Button onClick={handleBatchAdd}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add All Products
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
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
                  {!isAddingCategory ? (
                    <div className="flex gap-2">
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddingCategory(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter new category name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCategory();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddCategory}
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsAddingCategory(false);
                          setNewCategory('');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
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
          </div>
        </motion.div>

        <div className="flex gap-4">
          <Card className="p-0 flex-1" style={{ 
            borderRadius: '16px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            border: '1px solid rgba(229, 231, 235, 0.5)',
            overflow: 'hidden'
          }}>
            <div className="relative flex items-center">
              {/* Category Carousel Container */}
              <div className="w-full overflow-hidden">
                <div 
                  id="category-carousel"
                  className="flex overflow-x-auto scroll-smooth items-center"
                  style={{ 
                    gap: '65px',
                    padding: '20px 24px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(59, 130, 246, 0.6) rgba(229, 231, 235, 0.3)',
                  }}
                >
                  {availableCategories.map((cat, index) => (
                    <motion.div
                      key={cat}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        delay: index * 0.025,
                        type: "spring",
                        stiffness: 350,
                        damping: 30
                      }}
                      className="flex-shrink-0"
                    >
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedCategory(cat)}
                        className={`
                          font-semibold uppercase tracking-wider transition-all duration-200 whitespace-nowrap
                          ${selectedCategory === cat 
                            ? 'bg-[#3B82F6] text-white hover:bg-[#2563EB]' 
                            : 'bg-white text-[#111827] border border-[#E5E7EB] hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                          }
                        `}
                        style={{
                          borderRadius: '9999px',
                          padding: '0 32px',
                          fontSize: '13px',
                          fontWeight: '600',
                          letterSpacing: '0.8px',
                          height: '44px',
                          width: '180px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: selectedCategory === cat 
                            ? '0 2px 6px rgba(59, 130, 246, 0.25)' 
                            : '0 1px 2px rgba(0,0,0,0.04)',
                        }}
                        title={cat}
                      >
                        <span className="truncate" style={{ maxWidth: '140px' }}>
                          {cat}
                        </span>
                      </Button>
                    </motion.div>
                  ))}
                  {availableCategories.length === 0 && (
                    <p className="text-muted-foreground py-3 px-4">No categories available for this group</p>
                  )}
                </div>
              </div>
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
                            className="w-12 h-12 object-contain rounded border bg-gray-50 p-1"
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
