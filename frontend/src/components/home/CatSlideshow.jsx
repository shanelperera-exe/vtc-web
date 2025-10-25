import React from "react";

import { FaKitchenSet } from "react-icons/fa6";
import { BsLamp } from "react-icons/bs";
import { PiSprayBottleFill } from "react-icons/pi";
import { GiPlasticDuck } from "react-icons/gi";
import { PiPencilRulerFill } from "react-icons/pi";
import { FaPlug } from "react-icons/fa";

const staticCategories = [
  { label: "Cleaning Items", link: "/category/cleaning-items", icon: PiSprayBottleFill },
  { label: "Electric Items", link: "/category/electric", icon: FaPlug },
  { label: "Plastic Items", link: "/category/plastic", icon: GiPlasticDuck },
  { label: "Stationary Items", link: "/category/stationary", icon: PiPencilRulerFill },
  { label: "Homeware Items", link: "/category/homeware", icon: BsLamp },
  { label: "Kitchen Items", link: "/category/kitchen", icon: FaKitchenSet },
];

const Catslideshow = () => {
  // Always use the predefined static categories (no dynamic fetching)
  const merged = staticCategories;
  return (
  <section className="bg-[#0a9747] py-2">
    <div className="overflow-hidden w-full">
      {/* Right to left train */}
      <div className="overflow-hidden px-2">
  <div className="marquee-track animate-train" style={{ whiteSpace: "nowrap", display: 'inline-flex', gap: '0.75rem' }}>
          {merged.concat(merged).map((cat, idx) => (
            <a
              key={idx}
              href={cat.link}
              className="font-neutral-950 flex cursor-pointer items-center gap-1 whitespace-nowrap px-2 py-4 text-3xl lowercase text-white font-semibold transition-colors hover:bg-[#0bd964]"
              style={{ flex: '0 0 auto' }}
              aria-hidden={idx >= merged.length}
              tabIndex={idx >= merged.length ? -1 : 0}
            >
              <span className="p-1 flex items-center justify-center" style={{ width: "2.5rem", height: "2.5rem" }}>
                {cat.icon ? React.createElement(cat.icon, { size: 30, className: 'text-white', style: { strokeWidth: 1 } }) : null}
              </span>
              {cat.label}
            </a>
          ))}
        </div>
      </div>

      {/* Left to right train */}
      <div className="overflow-hidden px-2">
  <div className="marquee-track animate-train-ltr" style={{ whiteSpace: "nowrap", display: 'inline-flex', gap: '0.75rem' }}>
          {merged.concat(merged).map((cat, idx) => (
            <a
              key={idx}
              href={cat.link}
              className="font-neutral-950 flex cursor-pointer items-center gap-1 whitespace-nowrap px-2 py-4 text-3xl lowercase text-white font-semibold transition-colors hover:bg-[#0bd964]"
              style={{ flex: '0 0 auto' }}
              aria-hidden={idx >= merged.length}
              tabIndex={idx >= merged.length ? -1 : 0}
            >
              <span className="p-1 flex items-center justify-center" style={{ width: "2.5rem", height: "2.5rem" }}>
                {cat.icon ? React.createElement(cat.icon, { size: 30, className: 'text-white', style: { strokeWidth: 1 } }) : null}
              </span>
              {cat.label}
            </a>
          ))}
        </div>
      </div>
    </div>

    <style>
      {`
        @keyframes train {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes train-ltr {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-train {
          animation: train 28s linear infinite;
        }
        .animate-train-ltr {
          animation: train-ltr 28s linear infinite;
        }
      `}
    </style>
  </section>
  );
};

export default Catslideshow;