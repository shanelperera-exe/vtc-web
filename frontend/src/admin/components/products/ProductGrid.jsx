import React from 'react';
import AdminProductCard from './AdminProductCard';
import { AnimatePresence } from 'framer-motion';

export default function ProductGrid({ data, onEdit, onDelete, onToggleStatus }) {
  if (!data.length) {
    return <div className="mt-6 border-2 border-dashed border-neutral-300 p-10 text-center text-neutral-500 tracking-wide">No products found.</div>;
  }

  return (
    <div className="mt-6">
      <AnimatePresence mode="popLayout">
  <div className="grid gap-8 sm:gap-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4">
          {data.map((p, index) => (
            <AdminProductCard key={p.id} product={p} onEdit={onEdit} onDelete={onDelete} index={index} onToggleStatus={onToggleStatus} />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}

// ProductGrid renders AdminProductCard components which handle their own badges and motion.
