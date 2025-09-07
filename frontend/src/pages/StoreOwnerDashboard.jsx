import React from 'react';
import { motion } from 'framer-motion';

const StoreOwnerDashboard = () => {
  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-text-primary mb-8">Store Owner Dashboard</h1>
        <div className="card">
          <p className="text-text-secondary">Store owner dashboard functionality coming soon...</p>
        </div>
      </motion.div>
    </div>
  );
};

export default StoreOwnerDashboard;
