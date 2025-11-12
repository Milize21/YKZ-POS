import { Card } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { getProductsByCategory } from '@/lib/inventory';
import { motion } from 'framer-motion';

interface CategoryCardProps {
  category: string;
  onClick: () => void;
}

export const CategoryCard = ({ category, onClick }: CategoryCardProps) => {
  const products = getProductsByCategory(category);
  const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
  const totalSold = products.reduce((sum, p) => sum + p.sold, 0);
  const itemCount = products.length;

  return (
    <motion.div
      whileHover={{ 
        scale: 1.03,
        y: -4,
        transition: { type: "spring" as const, stiffness: 400, damping: 17 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="p-6 cursor-pointer hover:shadow-xl transition-shadow duration-300 border-2"
        onClick={onClick}
      >
        <div className="flex items-start gap-4">
          <motion.div 
            className="p-3 bg-primary/10 rounded-lg"
            whileHover={{ 
              rotate: [0, -10, 10, -10, 0],
              transition: { duration: 0.5 }
            }}
          >
            <Package className="h-6 w-6 text-primary" />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 text-foreground">{category}</h3>
            <motion.div 
              className="space-y-1 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              <motion.div 
                className="flex justify-between"
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
              >
                <span className="text-muted-foreground">Items:</span>
                <motion.span 
                  className="font-medium text-foreground"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" as const, stiffness: 500, damping: 25, delay: 0.1 }}
                >
                  {itemCount}
                </motion.span>
              </motion.div>
              <motion.div 
                className="flex justify-between"
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
              >
                <span className="text-muted-foreground">In Stock:</span>
                <motion.span 
                  className="font-medium text-foreground"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" as const, stiffness: 500, damping: 25, delay: 0.15 }}
                >
                  {totalStock}
                </motion.span>
              </motion.div>
              <motion.div 
                className="flex justify-between"
                whileHover={{ x: 4, transition: { duration: 0.2 } }}
              >
                <span className="text-muted-foreground">Sold:</span>
                <motion.span 
                  className="font-medium text-success"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" as const, stiffness: 500, damping: 25, delay: 0.2 }}
                >
                  {totalSold}
                </motion.span>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
