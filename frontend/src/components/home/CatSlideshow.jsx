import React from "react";
import assets from "../../assets/assets";

const categories = [
  { label: "Cleaning Items", link: "/collections/cleaning", icon: assets.catSlideIcons.cleaning },
  { label: "Electric Items", link: "/collections/electric", icon: assets.catSlideIcons.electric },
  { label: "Plastic Items", link: "/collections/plastic", icon: assets.catSlideIcons.plastic },
  { label: "Stationary Items", link: "/collections/stationary", icon: assets.catSlideIcons.stationary },
  { label: "Homeware Items", link: "/collections/homeware", icon: assets.catSlideIcons.home },
  { label: "Kitchen Items", link: "/collections/kitchen", icon: assets.catSlideIcons.kitchen },
];

const Catslideshow = () => (
  <section className="bg-[#1d794c] py-2">
    <div className="overflow-hidden w-full">
      
      {/* Right to left train */}
      <div
        className="flex gap-4 px-2 animate-train"
        style={{ whiteSpace: "nowrap" }}
      >
  {categories.map((cat, idx) => (
          <a
            key={idx}
            className="font-neutral-950 flex cursor-pointer items-center gap-2 whitespace-nowrap px-2 py-4 text-3xl uppercase text-indigo-50 transition-colors hover:bg-black"
            href={cat.link}
          >
            <span
              className="bg-indigo-50 p-2 text-lg text-indigo-600 flex items-center justify-center"
              style={{
                clipPath:
                  "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% 100%, calc(100% - 8px) 100%, 8px 100%, 0 100%, 0 0)",
                width: "2.5rem",
                height: "2.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {cat.icon ? (
                <img src={cat.icon} alt={cat.label} style={{ width: "3rem", height: "3rem", objectFit: "contain" }} />
              ) : null}
            </span>
            {cat.label}
          </a>
        ))}
  {categories.map((cat, idx) => (
          <a
            key={`repeat-rtl-${idx}`}
            className="font-neutral-950 flex cursor-pointer items-center gap-2 whitespace-nowrap px-2 py-4 text-3xl uppercase text-indigo-50 transition-colors hover:bg-black"
            href={cat.link}
          >
            <span
              className="bg-indigo-50 p-2 text-lg text-indigo-600 h-10 w-10"
              style={{
                clipPath:
                  "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% 100%, calc(100% - 8px) 100%, 8px 100%, 0 100%, 0 0)",
              }}
            >
              {/* You can add icons here if needed */}
            </span>
            {cat.label}
          </a>
        ))}
      </div>
      {/* Left to right train */}
      <div
        className="flex gap-4 px-2 animate-train-ltr"
        style={{ whiteSpace: "nowrap" }}
      >
  {categories.map((cat, idx) => (
          <a
            key={idx}
            className="font-neutral-950 flex cursor-pointer items-center gap-2 whitespace-nowrap px-2 py-4 text-3xl uppercase text-indigo-50 transition-colors hover:bg-black"
            href={cat.link}
          >
            <span
              className="bg-indigo-50 p-2 text-lg text-indigo-600 flex items-center justify-center"
              style={{
                clipPath:
                  "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% 100%, calc(100% - 8px) 100%, 8px 100%, 0 100%, 0 0)",
                width: "2.5rem",
                height: "2.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {cat.icon ? (
                <img src={cat.icon} alt={cat.label} style={{ width: "3rem", height: "3rem", objectFit: "contain" }} />
              ) : null}
            </span>
            {cat.label}
          </a>
        ))}
  {categories.map((cat, idx) => (
          <a
            key={`repeat-ltr-${idx}`}
            className="font-neutral-950 flex cursor-pointer items-center gap-2 whitespace-nowrap px-2 py-4 text-3xl uppercase text-indigo-50 transition-colors hover:bg-black"
            href={cat.link}
          >
            <span
              className="bg-indigo-50 p-2 text-lg text-indigo-600 h-10 w-10"
              style={{
                clipPath:
                  "polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% 100%, calc(100% - 8px) 100%, 8px 100%, 0 100%, 0 0)",
              }}
            >
              {/* You can add icons here if needed */}
            </span>
            {cat.label}
          </a>
        ))}
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
          animation: train 20s linear infinite;
        }
        .animate-train-ltr {
          animation: train-ltr 20s linear infinite;
        }
      `}
    </style>
  </section>
);

export default Catslideshow;