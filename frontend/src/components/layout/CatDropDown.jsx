import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  FiArrowRight,
  FiBarChart2,
  FiChevronDown,
  FiCompass,
  FiHome,
  FiInfo,
  FiPieChart,
  FiMail,
  FiHelpCircle,
  FiArrowUpRight,
} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import useCategories from "../../api/hooks/useCategories";
import { slugifyCategory } from "../../utils/slugify";
import CatDropTile from "../categories/CatDropTile";

export const CatDropDown = () => {
  return (
    <Tabs />
  );
};

const Tabs = () => {
  const [selected, setSelected] = useState(null);
  const [dir, setDir] = useState(null);
  const closeTimerRef = useRef(null);

  const handleSetSelected = (val) => {
    if (typeof selected === "number" && typeof val === "number") {
      setDir(selected > val ? "r" : "l");
    } else if (val === null) {
      setDir(null);
    }

    setSelected(val);
  };

  const scheduleClose = () => {
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => handleSetSelected(null), 150);
  };

  const cancelClose = () => {
    clearTimeout(closeTimerRef.current);
  };

  return (
    <div
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
      className="relative flex h-fit gap-2"
    >
      {TABS.map((t) => {
        return (
          <Tab
            key={t.id}
            selected={selected}
            handleSetSelected={handleSetSelected}
            tab={t.id}
            icon={t.icon}
          >
            {t.title}
          </Tab>
        );
      })}

      <AnimatePresence>
        {selected && (
          <Content
            dir={dir}
            selected={selected}
            onMouseEnterOverlay={cancelClose}
            onMouseLeaveOverlay={scheduleClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const Tab = ({ children, tab, handleSetSelected, selected, icon }) => {
  return (
    <button
      id={`shift-tab-${tab}`}
      onMouseEnter={() => handleSetSelected(tab)}
      onClick={() => handleSetSelected(tab)}
      className={`flex items-center gap-1 px-4 py-1.5 text-lg transition-colors font-medium rounded-full ${
        selected === tab
          ? "bg-black text-neutral-100"
          : "text-black hover:bg-black hover:text-white"
      }`}
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {icon && (
        (() => {
          const Icon = icon;
          return <Icon className="w-5 h-5" aria-hidden="true" />;
        })()
      )}
      <span>{children}</span>
      <FiChevronDown
        className={`transition-transform ${
          selected === tab ? "rotate-180" : ""
        }`}
      />
    </button>
  );
};

const Content = ({ selected, dir, onMouseEnterOverlay, onMouseLeaveOverlay }) => {
  const [overlayTop, setOverlayTop] = useState(96); // fallback

  useEffect(() => {
    const updateTop = () => {
      const hoveredTab = document.getElementById(`shift-tab-${selected}`);
      if (!hoveredTab) return;
      const rect = hoveredTab.getBoundingClientRect();
      setOverlayTop(rect.bottom + 16);
    };
    updateTop();
    window.addEventListener('resize', updateTop);
    window.addEventListener('scroll', updateTop, { passive: true });
    return () => {
      window.removeEventListener('resize', updateTop);
      window.removeEventListener('scroll', updateTop);
    };
  }, [selected]);

  return (
    <motion.div
      id="overlay-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      onMouseEnter={onMouseEnterOverlay}
      onMouseLeave={onMouseLeaveOverlay}
      className="mega-menu__inner fixed left-0 right-0 w-screen bg-white shadow-2xl rounded-none pointer-events-auto border-t border-neutral-200 px-6 py-6 z-50 overflow-auto"
      style={{ top: overlayTop, maxHeight: `calc(100vh - ${overlayTop + 16}px)` }}
    >
      <Bridge />
      <Nub selected={selected} />

      {TABS.map((t) => (
        <div className="overflow-hidden" key={t.id}>
          {selected === t.id && (
            <motion.div
              initial={{ opacity: 0, x: dir === 'l' ? 100 : dir === 'r' ? -100 : 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <t.Component />
            </motion.div>
          )}
        </div>
      ))}
    </motion.div>
  );
};

const Bridge = () => (
  <div className="absolute -top-[24px] left-0 right-0 h-[24px]" />
);

const Nub = ({ selected }) => {
  const [left, setLeft] = useState(0);

  useEffect(() => {
    moveNub();
  }, [selected]);

  const moveNub = () => {
    if (selected) {
      const hoveredTab = document.getElementById(`shift-tab-${selected}`);
      const overlayContent = document.getElementById("overlay-content");

      if (!hoveredTab || !overlayContent) return;

      const tabRect = hoveredTab.getBoundingClientRect();
      const { left: contentLeft } = overlayContent.getBoundingClientRect();

      const tabCenter = tabRect.left + tabRect.width / 2 - contentLeft;

      setLeft(tabCenter);
    }
  };

  return (
    <motion.span
      style={{
        clipPath: "polygon(0 0, 100% 0, 50% 50%, 0% 100%)",
      }}
      animate={{ left }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white border-l border-t border-neutral-200"
    />
  );
};

const Categories = () => {
  const navigate = useNavigate();
  const { data: categories, loading, error } = useCategories();

  // Derive tiles: prefer fields per CategoryTile logic
  const tiles = (categories || []).map((cat) => {
    const label = cat.name || cat.label || cat.title || '';
    const slug = cat.slug || slugifyCategory(label);
    const primary = cat?.catTileImage1 || cat?.catMainImg || cat?.categoryImage || cat?.categoryIcon || cat?.catTileImage2 || '';
    const hover = cat?.catTileImage2 || cat?.carouselImg || cat?.carouselImage || cat?.catMainImg || cat?.catTileImage1 || cat?.categoryIcon || '';
    return { id: cat.id || slug || label, label, slug, primary, hover: hover && hover !== primary ? hover : '' };
  });

  return (
    <div className="w-full h-full">
      {/* Image tiles grid (fills full width) */}
      <div className="mega-menu__image-links grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 overflow-y-auto w-full">
        {loading && (
          <div className="col-span-full text-neutral-500 text-sm">Loading categories…</div>
        )}
        {error && (
          <div className="col-span-full text-red-500 text-sm">Failed to load categories</div>
        )}
        {!loading && !error && tiles.slice(0, 9).map((t) => (
          <CatDropTile
            key={t.id}
            label={t.label}
            href={`/category/${t.slug}`}
            primaryUrl={t.primary}
            hoverUrl={t.hover}
          />
        ))}

        {/* Explore all tile */}
        {!loading && !error && (
          <a href="/category/all" aria-label="Explore all products" title="Explore all products" className="callout col-span-full md:col-span-1 relative border-2 border-black bg-black text-white hover:shadow-md transition-shadow overflow-hidden">
            <FiArrowUpRight className="absolute right-1 top-1 w-15 h-15 text-white" aria-hidden="true" />
            <div className="absolute left-3 bottom-3">
                <span className="label font-semibold text-lg md:text-xl lg:text-3xl text-white">Explore <br></br>all products</span>
              </div>
          </a>
        )}
      </div>
    </div>
  );
};


const TABS = [
  {
    title: "Explore products",
    icon: FiCompass,
    Component: Categories,
  }
].map((n, idx) => ({ ...n, id: idx + 1 }));