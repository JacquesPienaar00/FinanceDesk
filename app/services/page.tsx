'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/eCommerce/ProductCard';
import { Products } from '@/app/services/data/products';
import Header from '@/components/navigation/header';

// Function to group products by category
const groupByCategory = (products: any[]): { [key: string]: any[] } => {
  return products.reduce((acc, product) => {
    const category = product.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});
};

export default function ServicesPage() {
  const [categorizedProducts, setCategorizedProducts] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    setCategorizedProducts(groupByCategory(Products));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Header />
      <main className="container mx-auto mt-52 px-4 py-8">
        <h1 className="mb-12 text-center text-4xl font-bold text-primary">Our Services</h1>
        <div className="space-y-16">
          {Object.entries(categorizedProducts).map(([category, products]) => (
            <motion.section
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-lg bg-card p-6 shadow-lg"
            >
              <h2 className="mb-6 flex justify-center text-3xl font-semibold text-primary">
                {category}
              </h2>
              <div className="grid grid-cols-1 justify-items-center sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {products.map((product: any) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard product={{ ...product, id: product.id.toString() }} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </main>
    </div>
  );
}
