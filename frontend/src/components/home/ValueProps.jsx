import React from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiShield, FiRefreshCcw, FiHeadphones, FiTag } from 'react-icons/fi';

const items = [
  {
    icon: FiTruck,
    title: 'Fast Delivery',
    desc: 'Island-wide delivery with carefully handled packaging, so your essentials arrive quickly and in great condition.',
  },
  {
    icon: FiShield,
    title: 'Quality Guaranteed',
    desc: 'Curated products that go through checks for durability, performance, and everyday use, so you get lasting value.',
  },
  {
    icon: FiRefreshCcw,
    title: 'Easy Returns',
    desc: 'Simple return and exchange options with clear guidelines, giving you the freedom to shop with confidence.',
  },
  {
    icon: FiHeadphones,
    title: 'Friendly Support',
    desc: 'A responsive support team ready to help with orders, product questions, and after-sales assistance whenever you need it.',
  },
  {
    icon: FiTag,
    title: 'Great Value',
    desc: 'Competitive pricing with regular offers and bundles, so you can upgrade your setup without stretching your budget.',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVar = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] } },
};

export default function ValueProps() {
  return (
    <section className="bg-white border-t border-b border-neutral-200 py-14 sm:py-16">
      <div className="w-full px-6 sm:px-8">
        <div className="mx-auto w-full max-w-[1376px]">
          <div className="text-center mb-10">
            <p className="text-xs tracking-[0.35em] text-neutral-500 font-semibold uppercase">Why shop with us</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">
              Effortless essentials, modern experience
            </h2>
          </div>

          <motion.ul
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5"
          >
            {items.map(({ icon: Icon, title, desc }) => (
              <motion.li key={title} variants={itemVar}>
                <Card title={title} subtitle={desc} Icon={Icon} />
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

const Card = ({ title, subtitle, Icon }) => {
  return (
    <div className="relative h-full">
      <div className="absolute inset-0 rounded-3xl border border-black/20 bg-transparent" />

      <motion.div className="relative z-10 h-full rounded-2xl px-4 py-5 flex flex-col gap-3 overflow-hidden bg-black text-white border border-black">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl">
            <motion.div initial={{ scale: 0.98 }} transition={{ duration: 0.3 }}>
              <Icon className="text-4xl text-emerald-400" />
            </motion.div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold tracking-tight text-white">
              {title}
            </h3>
            <div className="mt-1 h-[2px] w-12 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600" />
          </div>
        </div>

        <p className="mt-2 text-[14px] leading-relaxed text-white/90">
          {subtitle}
        </p>
        
      </motion.div>
    </div>
  );
};
