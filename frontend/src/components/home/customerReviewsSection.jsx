import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { AvatarImg } from "../../services/AvatarImg";
import StarReview from "../ui/StarReview";

// keep the same container clip-path as the provided Slideshow layout
const polygonClip =
  "polygon(48px 0%, calc(100% - 0px) 0%, 100% 48px, 100% 100%, calc(100% - 48px) 100%, 48px 100%, 0px 100%, 0px 0px)";

// reviews mapped to the same "slides" shape used by Slideshow
// reviews mapped to the same "slides" shape used by Slideshow
const slides = [
  {
    name: "Anika Perera",
    rating: 5,
    link: "/reviews",
    linkText: "Read full review",
    subtitle: "Anika Perera · Verified Buyer",
    title: "Excellent quality and fast delivery",
    description:
      "Absolutely love the quality and the customer service. Delivery was fast and the packaging was beautiful.",
  },
  {
    name: "Ishara Fernando",
    rating: 5,
    link: "/reviews",
    linkText: "Read full review",
    subtitle: "Ishara Fernando · Business Owner",
    title: "Great prices, better support",
    description:
      "Great prices and even better support. The checkout flow was smooth and I got exactly what I needed.",
  },
  {
    name: "Malith Jay",
    rating: 4,
    link: "/reviews",
    linkText: "Read full review",
    subtitle: "Malith Jay · Frequent Customer",
    title: "Solid and reliable",
    description:
      "Solid experience overall. I appreciate the careful attention to detail and quick responses.",
  },
  {
    name: "Nadeesha R.",
    rating: 5,
    link: "/reviews",
    linkText: "Read full review",
    subtitle: "Nadeesha R. · Designer",
    title: "Looks even better in person",
    description:
      "The product looks even better in person. Clean design, premium feel—highly recommended!",
  },
  {
    name: "Kasun L.",
    rating: 5,
    link: "/reviews",
    linkText: "Read full review",
    subtitle: "Kasun L. · Verified Buyer",
    title: "Fantastic — reordered already",
    description:
      "Fantastic! I’ve already ordered again. The rewards points are a nice touch too.",
  },
  {
    name: "Tharindi S.",
    rating: 4,
    link: "/reviews",
    linkText: "Read full review",
    subtitle: "Tharindi S. · Marketer",
    title: "Seamless ordering and tracking",
    description:
      "Seamless ordering and the shipment tracking worked flawlessly. Will shop here again.",
  },
  {
    name: "Sajith Mendis",
    rating: 5,
    link: "/reviews",
    linkText: "Read full review",
    subtitle: "Sajith Mendis · Verified Buyer",
    title: "Top-notch service and packaging",
    description:
      "From checkout to delivery, everything was smooth and secure. The packaging was premium and eco-friendly.",
  },
  {
    name: "Dilani K.",
    rating: 4,
    link: "/reviews",
    linkText: "Read full review",
    subtitle: "Dilani K. · Entrepreneur",
    title: "Good quality, decent price",
    description:
      "Items arrived on time and matched the description perfectly. Great value for money.",
  },
  {
    name: "Ruwin Perera",
    rating: 5,
    link: "/reviews",
    linkText: "Read full review",
    subtitle: "Ruwin Perera · Verified Buyer",
    title: "Exactly what I needed",
    description:
      "Easy to find, easy to order. The product quality exceeded expectations — highly recommended.",
  },
  {
    name: "Heshani De Silva",
    rating: 5,
    link: "/reviews",
    linkText: "Read full review",
    subtitle: "Heshani De Silva · Designer",
    title: "Beautiful and functional",
    description:
      "Looks great and works even better. The attention to detail really shows.",
  },
  {
    name: "Chamath Fernando",
    rating: 4,
    link: "/reviews",
    linkText: "Read full review",
    subtitle: "Chamath Fernando · Developer",
    title: "Smooth experience overall",
    description:
      "Checkout was seamless and shipping updates were timely. Would purchase again without hesitation.",
  },
  {
    name: "Shenali Jayawardena",
    rating: 5,
    link: "/reviews",
    linkText: "Read full review",
    subtitle: "Shenali Jayawardena · Verified Buyer",
    title: "Great support team",
    description:
      "Had a small query and support resolved it quickly. Impressed by their professionalism.",
  },
  {
    name: "Dinuk Peris",
    rating: 4,
    link: "/reviews",
    linkText: "Read full review",
    subtitle: "Dinuk Peris · Frequent Customer",
    title: "Consistent quality",
    description:
      "This is my third order and the quality has been consistent every time. Reliable store.",
  },
  {
    name: "Ama Wijeratne",
    rating: 5,
    link: "/reviews",
    linkText: "Read full review",
    subtitle: "Ama Wijeratne · Artist",
    title: "Love the craftsmanship",
    description:
      "Finishes are clean and premium. You can tell they care about the final product.",
  },
  {
    name: "Harith Senanayake",
    rating: 5,
    link: "/reviews",
    linkText: "Read full review",
    subtitle: "Harith Senanayake · Verified Buyer",
    title: "Fast delivery, zero hassle",
    description:
      "Ordered on the weekend and still arrived quickly. No issues at all.",
  },
  {
    name: "Ishani Gunasekara",
    rating: 4,
    link: "/reviews",
    linkText: "Read full review",
    subtitle: "Ishani Gunasekara · Marketer",
    title: "Clean UI and easy checkout",
    description:
      "Site is easy to navigate and checkout was straightforward. Product matched photos perfectly.",
  },
];

export default function CustomerReviewsSection() {
  // Start from the middle index so the carousel appears like a balanced ring on load
  const [current, setCurrent] = useState(Math.floor(slides.length / 2));
  const timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearTimeout(timeoutRef.current);
  }, [current]);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };
  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      className="relative mb-12 mt-24 w-full overflow-hidden border-y-2 border-neutral-950"
      style={{ height: 650, clipPath: polygonClip }}
    >
      {/* Inline CSS (no external file) to provide the animated grid background */}
      <style>{`
        .bgGridWrapper {
          --blockSize: 32px;
          --borderWidth: 2px;
          /*light 2*/
          --borderColor: #A2AF9B;
          --bgColor: #F5F5DC;
          width: 100%;
          height: 100%;
          background-color: var(--bgColor);
          background-image:
            linear-gradient(
              transparent calc(var(--blockSize) - var(--borderWidth)),
              var(--borderColor) calc(var(--blockSize) - var(--borderWidth))),
            linear-gradient(
              90deg, transparent calc(var(--blockSize) - var(--borderWidth)),
              var(--borderColor) calc(var(--blockSize) - var(--borderWidth)));
          background-size:
            var(--blockSize) var(--blockSize),
            var(--blockSize) var(--blockSize);
          background-repeat: round;
          animation: gridBgMove 2s infinite linear;
        }
        @keyframes gridBgMove {
          to {
            background-position-y: var(--blockSize);
          }
        }
        /* Decorative bottom label */
        .fancy-text {
          position: absolute;
          left: 50%;
          bottom: -60px; /* pushes it down so it's cut by the container */
          transform: translateX(-50%);
          z-index: 1; /* above grid, below cards */
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          text-align: center;
          font-family: inherit;
          color: #099b48ff;
          font-size: 175px;
          line-height: 180px;
          font-weight: 600;
          letter-spacing: -9px;
        }
        @media (max-width: 1279px) { .fancy-text { font-size: 160px; line-height: 160px; letter-spacing: -8px; } }
        @media (max-width: 1023px) { .fancy-text { font-size: 120px; line-height: 120px; letter-spacing: -6px; } }
        @media (max-width: 767px)  { .fancy-text { font-size: 84px;  line-height: 84px;  letter-spacing: -4px; } }
        @media (max-width: 479px)  { .fancy-text { font-size: 64px;  line-height: 64px;  letter-spacing: -3px; } }
      `}</style>

      {/* Animated grid background */}
      <div className="bgGridWrapper"></div>

      {/* Slides — keep layout identical to the provided Slideshow */}
      {slides.map((slide, idx) => {
        // compute shortest signed offset on a ring so items wrap smoothly
        const n = slides.length;
        const half = Math.floor(n / 2);
        let raw = idx - current;
        // shift into range [-half, half]
        let offset = ((raw + n + half) % n) - half;
        const isActive = idx === current;

        const style = {
          borderWidth: 2,
          clipPath:
            "polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0px 100%, 0px 0px)",
          width: 365,
          height: 365,
          zIndex: isActive ? 10 : Math.max(0, half - Math.abs(offset)),
          transition:
            "transform 0.7s cubic-bezier(.77,0,.18,1), box-shadow 0.5s, background 0.5s",
          transform: `translateX(calc(-50% + ${offset * 243.333}px)) translateY(calc(-50% + ${
            idx % 2 === 0 ? -15 : 15
          }px)) rotate(${isActive ? 0 : idx % 2 === 0 ? -2.5 : 2.5}deg) translateZ(0px)`,
          boxShadow: isActive
            ? "0 8px 32px rgba(60,60,200,0.15)"
            : "0 2px 8px rgba(0,0,0,0.08)",
        };

        let cardClass =
          "absolute left-1/2 top-1/2 cursor-pointer border-neutral-950 p-8 transition-colors duration-500";
        cardClass += isActive
          ? " bg-[#099b48ff] text-white"
          : " bg-white text-neutral-950";

        return (
          <motion.div
            key={slide.title}
            className={cardClass}
            style={style}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <span
              className="absolute block origin-top-right rotate-45 bg-neutral-950 object-cover"
              style={{ right: -2, top: 48, width: 70.7107, height: 2 }}
            ></span>

            {/* Avatar + subtitle row */}
            <div className="mb-2 flex items-center gap-3">
              <AvatarImg
                seed={slide.name}
                style="notionists"
                className={`h-10 w-10 border-2 border-neutral-950 ${
                  isActive ? "bg-[#0bd964]" : "bg-neutral-100"
                }`}
                alt={`Avatar for ${slide.name}`}
              />
              <span
                className={`text-xs uppercase transition-colors ${
                  isActive ? "text-emerald-100" : "text-neutral-700"
                }`}
              >
                {slide.subtitle}
              </span>
            </div>

            <p
              className={`text-xl font-medium transition-colors md:text-3xl ${
                isActive ? "text-white" : "text-neutral-950"
              }`}
            >
              {slide.title}
            </p>
            {/* Yellow star rating (no review count) */}
            <div className="mt-2 mb-1">
              <StarReview rating={slide.rating} size={18} showCount={false} color="#FFB800" emptyColor="#E5E7EB" />
            </div>
            <p
              className={`mt-3 text-lg md:text-xl leading-relaxed transition-colors ${
                isActive ? "text-emerald-100" : "text-neutral-950"
              }`}
            >
              {slide.description}
            </p>
          </motion.div>
        );
      })}

      {/* Decorative bottom text, half cut by height */}
      <div className="fancy-text alt-font fill-text" aria-hidden>
        customer reviews
      </div>

      {/* Navigation Buttons */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-8">
        <button
          className="grid h-14 w-14 place-content-center bg-neutral-950 text-3xl text-white transition-colors hover:bg-neutral-700"
          onClick={prevSlide}
          aria-label="Previous review"
        >
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <button
          className="grid h-14 w-14 place-content-center bg-neutral-950 text-3xl text-white transition-colors hover:bg-neutral-700"
          onClick={nextSlide}
          aria-label="Next review"
        >
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        </button>
      </div>

      {/* Top label */}
      <div className="absolute left-1/2 top-0 border-x-2 border-b-2 border-neutral-950 bg-white px-4 py-2" style={{ transform: "translateX(-50%) translateY(0%) translateZ(0px)" }}>
        <h2 className="whitespace-nowrap text-center text-base font-medium sm:text-xl lg:text-2xl">
          <span className="text-[#099b48ff]">What customers say.</span> Real reviews.
        </h2>
      </div>
    </div>
  );
}
