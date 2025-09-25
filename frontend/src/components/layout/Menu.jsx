import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Menu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Floating Corner Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-500 shadow-lg shadow-violet-800/20"
      >
        {/* Hamburger / Close animation */}
        <span
          className={`absolute block h-1 w-8 rounded bg-white transition-transform duration-300 ${
            open ? "rotate-45" : "-translate-y-2"
          }`}
        />
        <span
          className={`absolute block h-1 w-8 rounded bg-white transition-opacity duration-300 ${
            open ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          className={`absolute block h-1 w-8 rounded bg-white transition-transform duration-300 ${
            open ? "-rotate-45" : "translate-y-2"
          }`}
        />
      </button>

      {/* Fullscreen Overlay Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed top-4 right-4 z-40 h-[calc(100vh-32px)] w-[calc(100%-32px)] rounded-xl bg-gradient-to-br from-violet-600 to-violet-500 shadow-lg shadow-violet-800/20"
          >
            {/* Navigation */}
            <nav className="flex h-full flex-col justify-between p-8">
              <div className="space-y-8 mt-16">
                {["home.", "features.", "blog.", "careers."].map((item, i) => (
                  <motion.a
                    key={i}
                    href="#"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="block text-4xl font-semibold text-violet-200 transition-colors hover:text-white md:text-6xl"
                  >
                    {item}
                  </motion.a>
                ))}
              </div>

              {/* Footer Social + CTA */}
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-6">
                  <a href="#" className="text-white hover:text-violet-300">
                    🌐
                  </a>
                  <a href="#" className="text-white hover:text-violet-300">
                    📷
                  </a>
                  <a href="#" className="text-white hover:text-violet-300">
                    💼
                  </a>
                </div>
                <button className="flex items-center gap-2 rounded-full bg-violet-700 px-6 py-3 text-lg font-semibold text-violet-200 transition-colors hover:bg-white hover:text-violet-600">
                  contact us →
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
