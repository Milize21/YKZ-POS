import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { CategoryCard } from '@/components/CategoryCard';
import { CATEGORIES } from '@/lib/inventory';
import { motion } from 'framer-motion';
import { MorphShape } from '@/components/MorphShape';

const Dashboard = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <Layout>
      {/* Decorative Morphing Shapes */}
      <div className="fixed top-20 right-10 opacity-10 pointer-events-none z-0">
        <MorphShape variant="blob" color="#2D3561" size={150} duration={10} />
      </div>
      <div className="fixed bottom-20 left-10 opacity-10 pointer-events-none z-0">
        <MorphShape variant="blob" color="#5D6BA3" size={120} duration={12} />
      </div>
      
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Select a category to view products</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {CATEGORIES.map((category) => (
            <motion.div key={category} variants={itemVariants}>
              <CategoryCard
                category={category}
                onClick={() => navigate(`/sales?category=${encodeURIComponent(category)}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;
