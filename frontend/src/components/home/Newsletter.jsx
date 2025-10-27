import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail } from 'react-icons/fi';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setSubmitted(true);
    // TODO: integrate backend newsletter endpoint when available
  };

  return (
    <section className="relative py-16 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute -top-24 -right-24 w-[40rem] h-[40rem] rounded-full blur-3xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.18), rgba(255,255,255,0))' }}
      />
      <div className="relative max-w-4xl mx-auto px-6 sm:px-8 text-center">
        <p className="text-xs tracking-[0.2em] font-semibold text-emerald-100">STAY UPDATED</p>
        <h3 className="mt-2 text-3xl md:text-4xl font-bold">Get fresh deals in your inbox</h3>
        <p className="mt-2 text-emerald-50">We’ll send occasional promotions and product updates. No spam.</p>

        {submitted ? (
          <motion.p className="mt-6 text-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Thanks! You’re on the list.
          </motion.p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 max-w-xl mx-auto flex items-center bg-white/10 backdrop-blur rounded-full p-1.5 border border-white/20">
            <div className="pl-3 text-white/80"><FiMail /></div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-transparent outline-none placeholder:text-white/60 text-white px-3 py-2"
              required
            />
            <button type="submit" className="rounded-full bg-white text-emerald-700 font-semibold px-5 py-2 hover:bg-emerald-50">Subscribe</button>
          </form>
        )}
      </div>
    </section>
  );
}
