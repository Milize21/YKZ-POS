import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { CategoryCard } from '@/components/CategoryCard';
import { CATEGORIES } from '@/lib/inventory';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Select a category to view products</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category}
              category={category}
              onClick={() => navigate(`/sales?category=${encodeURIComponent(category)}`)}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
