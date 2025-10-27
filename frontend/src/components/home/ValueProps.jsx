import React from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiShield, FiRefreshCcw, FiHeadphones, FiTag } from 'react-icons/fi';

const items = [
  {
    icon: FiTruck,
    title: 'Fast Delivery',
    desc: 'Island-wide shipping, reliable and quick.',
    bg: 'bg-emerald-50',
    accent: 'text-emerald-600',
    gradientFrom: 'from-emerald-600',
    gradientTo: 'to-emerald-500',
    titleColor: 'text-emerald-900',
    subtitleColor: 'text-emerald-700',
    borderClass: 'border-emerald-600',
  },
  {
    icon: FiShield,
    title: 'Quality Guaranteed',
    desc: 'Durable products you can trust.',
    bg: 'bg-sky-50',
    accent: 'text-sky-600',
    gradientFrom: 'from-sky-600',
    gradientTo: 'to-sky-500',
    titleColor: 'text-sky-900',
    subtitleColor: 'text-sky-700',
    borderClass: 'border-sky-600',
  },
  {
    icon: FiRefreshCcw,
    title: 'Easy Returns',
    desc: 'Hassle-free exchanges and returns.',
    bg: 'bg-amber-50',
    accent: 'text-amber-600',
    gradientFrom: 'from-amber-600',
    gradientTo: 'to-amber-500',
    titleColor: 'text-amber-900',
    subtitleColor: 'text-amber-700',
  },
  {
    icon: FiHeadphones,
    title: 'Friendly Support',
    desc: 'We’re here when you need us.',
    bg: 'bg-violet-50',
    accent: 'text-violet-600',
    gradientFrom: 'from-violet-600',
    gradientTo: 'to-violet-500',
    titleColor: 'text-violet-900',
    subtitleColor: 'text-violet-700',
    borderClass: 'border-violet-600',
  },
  {
    icon: FiTag,
    title: 'Great Value',
    desc: 'Everyday low prices and deals.',
    bg: 'bg-rose-50',
    accent: 'text-rose-600',
    gradientFrom: 'from-rose-600',
    gradientTo: 'to-rose-500',
    titleColor: 'text-rose-900',
    subtitleColor: 'text-rose-700',
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
    <section className="bg-white border-t border-b border-neutral-200 py-12 sm:py-14">
  <div className="max-w-7xl mx-auto px-1 sm:px-1">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.2em] text-emerald-700/80 font-semibold">WHY SHOP WITH US</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">We make it effortless</h2>
        </div>

        <motion.ul
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {items.map(({ icon: Icon, title, desc, bg, accent, gradientFrom, gradientTo, titleColor, subtitleColor }, i) => (
            <motion.li key={title} variants={itemVar}>
              <Card
                title={title}
                subtitle={desc}
                Icon={Icon}
                href="#"
                bg={bg}
                accent={accent}
                from={gradientFrom}
                to={gradientTo}
                titleColor={titleColor}
                subtitleColor={subtitleColor}
                borderClass={/* allow per-item override */ items[i].borderClass}
              />
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

const Card = ({ title, subtitle, Icon, href, bg, from, to, accent, titleColor, subtitleColor, borderClass: explicitBorder }) => {
  // accent is expected like 'text-emerald-600'
  // Make border color match the icon color (e.g. text-emerald-600 -> border-emerald-600)
  const computedBorder = accent ? accent.replace('text-', 'border-') : 'border-gray-300';
  const borderClass = explicitBorder || computedBorder;
  const bigIconClass = accent
    ? `${accent} opacity-20 group-hover:opacity-40 group-hover:text-white`
    : 'text-slate-100 group-hover:text-white';

  return (
    <a
      href={href}
      className={`w-full p-3 border-2 ${borderClass} rounded-2xl relative overflow-hidden group ${bg} shadow-sm hover:shadow-md transition-shadow block`}
    >
  <div className={`absolute inset-0 z-10 bg-gradient-to-r ${from} ${to} translate-y-[120%] group-hover:translate-y-0 transition-transform duration-300 rounded-2xl`} />

  <Icon className={`absolute z-20 -top-12 -right-12 text-9xl ${bigIconClass} group-hover:rotate-12 transition-transform duration-300`} />
  <div className="relative z-20">
        <Icon className={`mb-2 text-2xl ${accent} group-hover:text-white transition-colors duration-300`} />
        <h3 className={`font-medium text-lg ${titleColor} group-hover:text-white relative z-10 duration-300`}>{title}</h3>
        <p className={`${subtitleColor} group-hover:text-white relative z-10 duration-300`}>{subtitle}</p>
      </div>
    </a>
  );
};
