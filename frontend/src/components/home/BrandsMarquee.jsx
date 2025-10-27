import React from 'react';
import { motion } from 'framer-motion';

const brands = [
  'Ecover', 'Homeware Co', 'EcoFresh', 'CleanMax', 'KitchenPro', 'Plastiq', 'BrightLine', 'Storify', 'Stationer', 'HandyWorks'
];

export default function BrandsMarquee() {
  const row = brands.concat(brands);
  return (
    <section className="py-10 bg-white border-y border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <p className="text-center text-neutral-500 text-sm mb-6">Trusted by households and businesses</p>
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-10 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 24, ease: 'linear', repeat: Infinity }}
          >
            {row.map((b, i) => (
              <span key={i} className="text-neutral-800/80 text-xl md:text-2xl font-semibold tracking-tight">{b}</span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
