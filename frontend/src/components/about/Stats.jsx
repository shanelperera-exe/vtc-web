"use client";

import { useEffect, useState } from "react";

// simple count-up hook
const useCountUp = (end, duration = 2) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const step = Math.ceil(end / (duration * 60)); // 60fps approx

    const interval = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [end, duration]);

  return count;
};

export default function StatsSection() {
  const stats = [
    { number: 150, label: "Premium Products" },
    { number: 2, label: "Years Experience" },
    { number: 2500, label: "Happy Customers" },
    { number: 360, label: "Orders Delivered" },
    { number: 98, label: "On-time Delivery", suffix: "%" },
  ];

  // compute widest formatted number for a consistent width
  const formattedMax = Math.max(...stats.map((s) => s.number)).toString();
  const maxChars = formattedMax.length + 1; // +1 for possible suffix

  // helper to format numbers, using 'k' for thousands
  const formatCompact = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1).replace(/\.0$/, "")}k`;
    return String(n);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-1 md:py-1 mb-15">
      <div className="flex flex-col items-start justify-center sm:flex-row sm:flex-nowrap sm:items-start gap-12 md:gap-24">
        {stats.map((stat, index) => {
          const count = useCountUp(stat.number, 5 + index); // stagger timing
          return (
            <div key={index} className="flex w-72 flex-col items-center justify-center h-28 py-2 sm:py-0">
              {/* Number container: reserve exact space based on widest number */}
              <div
                className="relative flex items-center justify-center"
                style={{ width: `${maxChars}ch`, minWidth: `${maxChars}ch`, height: 'auto' }}
              >
                {/* invisible spacer to reserve width (prevents reflow while counting) */}
                <span className="invisible block text-6xl font-semibold tabular-nums">
                  {Array(maxChars).fill("0").join("")}
                </span>

                <div className="absolute inset-0 flex items-center justify-center">
                  <p
                    className="mb-0 text-6xl font-semibold tabular-nums leading-none"
                    aria-label={String(stat.number)}
                  >
                    {formatCompact(count)}
                    <span className="text-[#00bf63]">{stat.suffix ?? "+"}</span>
                  </p>
                </div>
              </div>

              {/* Force label to a single line to avoid wrapping/shaking, centered under number */}
              <p className="mt-2 text-center text-neutral-600 truncate whitespace-nowrap max-w-full">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
