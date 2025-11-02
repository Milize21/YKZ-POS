import { Card } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { getProductsByCategory } from '@/lib/inventory';

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
    <Card
      className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2 text-foreground">{category}</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Items:</span>
              <span className="font-medium text-foreground">{itemCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">In Stock:</span>
              <span className="font-medium text-foreground">{totalStock}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sold:</span>
              <span className="font-medium text-success">{totalSold}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
