import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { CategoryCard } from '@/components/CategoryCard';
import { getCategories } from '@/lib/inventory';
import { motion } from 'framer-motion';
import { ParticleBackground } from '@/components/ParticleBackground';
import { EmailQueueStatus } from '@/components/EmailQueueStatus';

const Dashboard = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>(() => {
    const cats = getCategories();
    // Remove duplicates using Set
    return Array.from(new Set(cats));
  });

  // Refresh categories from localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedCategories = getCategories();
      // Remove duplicates
      const uniqueCategories = Array.from(new Set(updatedCategories));
      if (JSON.stringify(uniqueCategories) !== JSON.stringify(categories)) {
        setCategories(uniqueCategories);
      }
    }, 1000); // Check every second for category updates
    
    return () => clearInterval(interval);
  }, [categories]);

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
      {/* Snow Particle Animation */}
      <ParticleBackground variant="snow" />
      
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Select a category to view products</p>
        </motion.div>

        {/* Email Queue Status */}
        <EmailQueueStatus />

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {categories.map((category, index) => (
            <motion.div key={`${category}-${index}`} variants={itemVariants}>
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
