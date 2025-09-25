import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  FiArrowRight,
  FiBarChart2,
  FiChevronDown,
  FiHome,
  FiPieChart,
} from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";
import { categories } from "../../assets/data";

export const CatDropDown = () => {
  return (
    <Tabs/>
  );
};

const Tabs = () => {
  const [selected, setSelected] = useState(null);
  const [dir, setDir] = useState(null);

  const handleSetSelected = (val) => {
    if (typeof selected === "number" && typeof val === "number") {
      setDir(selected > val ? "r" : "l");
    } else if (val === null) {
      setDir(null);
    }

    setSelected(val);
  };

  return (
    <div
      onMouseLeave={() => handleSetSelected(null)}
      className="relative flex h-fit gap-2"
    >
      {TABS.map((t) => {
        return (
          <Tab
            key={t.id}
            selected={selected}
            handleSetSelected={handleSetSelected}
            tab={t.id}
          >
            {t.title}
          </Tab>
        );
      })}

      <AnimatePresence>
        {selected && <Content dir={dir} selected={selected} />}
      </AnimatePresence>
    </div>
  );
};

const Tab = ({ children, tab, handleSetSelected, selected }) => {
  return (
    <button
      id={`shift-tab-${tab}`}
      onMouseEnter={() => handleSetSelected(tab)}
      onClick={() => handleSetSelected(tab)}
      className={`flex items-center gap-1 px-4 py-1.5 text-xl transition-colors font-bold lowercase ${
        selected === tab
          ? " bg-[#1e2a38] text-neutral-100"
          : "text-black"
      }`}
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <span>{children}</span>
      <FiChevronDown
        className={`transition-transform ${
          selected === tab ? "rotate-180" : ""
        }`}
      />
    </button>
  );
};

const Content = ({ selected, dir }) => {
  return (
    <motion.div
      id="overlay-content"
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        y: 8,
      }}
         className="absolute left-0 top-[calc(100%_+_24px)] bg-[#1e2a38] px-4 py-2 w-fit min-w-[240px]"
    >
      <Bridge />
      <Nub selected={selected} />

      {TABS.map((t) => {
        return (
          <div className="overflow-hidden" key={t.id}>
            {selected === t.id && (
              <motion.div
                initial={{
                  opacity: 0,
                  x: dir === "l" ? 100 : dir === "r" ? -100 : 0,
                }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <t.Component />
              </motion.div>
            )}
          </div>
        );
      })}
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
      className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#1e2a38]"
    />
  );
};

const Categories = () => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex flex-col mt-1">
        {categories.map((cat, idx) => (
          <React.Fragment key={cat.label}>
            <button
              className="mb-1 text-md font-bold text-white hover:text-[#0bd964] text-left bg-transparent border-none p-0 cursor-pointer"
              style={{ minWidth: 0, fontFamily: 'Poppins, sans-serif' }}
              onClick={() => {
                // Convert category label to route param
                const routeCategory = cat.label.toLowerCase().replace(/ /g, '-');
                navigate(`/category/${routeCategory}`);
              }}
            >
              {cat.label}
            </button>
            {idx < categories.length - 1 && (
              <hr className="border-t border-neutral-300 my-2" />
            )}
          </React.Fragment>
        ))}
      </div>
      <button className="ml-auto mt-2 flex items-center gap-1 text-sm text-[#0bd964] bg-transparent border-none p-0 cursor-pointer">
        <span>View more</span>
        <FiArrowRight />
      </button>
    </div>
  );
};


const TABS = [
  {
    title: "CATEGORIES",
    Component: Categories,
  }
].map((n, idx) => ({ ...n, id: idx + 1 }));