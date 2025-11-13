import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RotateCcw, Trash2, Package, AlertTriangle } from 'lucide-react';
import { 
  getTrash, 
  restoreFromTrash, 
  permanentlyDelete,
  emptyTrash,
  getInventory,
  saveInventory,
  TrashItem,
  getInventoryWithImages
} from '@/lib/inventory';
import { formatCurrency } from '@/lib/sales';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleBackground } from '@/components/ParticleBackground';

const Trash = () => {
  const [trash, setTrash] = useState<TrashItem[]>(getTrash());
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showEmptyDialog, setShowEmptyDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    // Refresh trash periodically
    const interval = setInterval(() => {
      setTrash(getTrash());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleRestore = async (productId: string) => {
    try {
      const { product, trash: updatedTrash } = restoreFromTrash(productId);
      
      if (product) {
        const inventory = await getInventoryWithImages();
        inventory.push(product);
        await saveInventory(inventory);
        setTrash(updatedTrash);
        toast.success('Product restored successfully');
      } else {
        toast.error('Failed to restore product');
      }
    } catch (error) {
      console.error('Failed to restore product:', error);
      toast.error('Failed to restore product');
    }
  };

  const handlePermanentDelete = async () => {
    if (selectedItem) {
      try {
        const updatedTrash = await permanentlyDelete(selectedItem);
        setTrash(updatedTrash);
        toast.success('Product permanently deleted');
        setShowDeleteDialog(false);
        setSelectedItem(null);
      } catch (error) {
        console.error('Failed to delete product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await emptyTrash();
      setTrash([]);
      toast.success('Trash emptied successfully');
      setShowEmptyDialog(false);
    } catch (error) {
      console.error('Failed to empty trash:', error);
      toast.error('Failed to empty trash');
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Layout>
      <ParticleBackground variant="snow" />
      
      <div className="space-y-6">
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Trash Bin</h2>
            <p className="text-muted-foreground">
              Deleted items are stored here. Restore or permanently delete them.
            </p>
          </div>
          {trash.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowEmptyDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Empty Trash
            </Button>
          )}
        </motion.div>

        <Card>
          {trash.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <Trash2 className="h-16 w-16 text-muted-foreground mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Trash is Empty</h3>
              <p className="text-muted-foreground">
                Deleted products will appear here
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Deleted At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {trash.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        delay: index * 0.03,
                      }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded border opacity-50"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center opacity-50">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </motion.div>
                      </TableCell>
                      <TableCell className="font-medium">{item.group}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.category}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(item.deletedAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestore(item.id)}
                              title="Restore"
                            >
                              <RotateCcw className="h-4 w-4 text-green-600" />
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item.id);
                                setShowDeleteDialog(true);
                              }}
                              title="Delete Permanently"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </motion.div>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      {/* Empty Trash Confirmation Dialog */}
      <AlertDialog open={showEmptyDialog} onOpenChange={setShowEmptyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Empty Trash?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all {trash.length} item(s) in the trash. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEmptyTrash}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Empty Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this product. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedItem(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePermanentDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Trash;
