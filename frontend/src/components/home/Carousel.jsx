import React, { useRef, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
// Static carousel: no backend categories
import assets from "../../assets/assets";
import CarouselButton from "./Carouselbutton";
import {
  FiArrowLeft,
  FiArrowRight,
  FiTruck,
  FiShield,
  FiTag,
  FiGift,
  FiStar,
  FiHeadphones,
  FiRefreshCcw,
  FiClock,
  FiShoppingBag,
  FiGrid,
  FiInfo,
  FiUserPlus,
} from "react-icons/fi";
import { TbSparkles } from "react-icons/tb";
import { RiDiscountPercentFill, RiShoppingCartFill } from "react-icons/ri";
import { FaKitchenSet } from "react-icons/fa6";
import { BsLamp } from "react-icons/bs";
import { PiSprayBottleFill, PiPencilRulerFill } from "react-icons/pi";
import { GiPlasticDuck } from "react-icons/gi";
import { FaPlug } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Note: removed static image fallbacks; carousel now renders only backend-provided images

const Carousel = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const paginationRef = useRef(null);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const getCtaIcon = (text = "") => {
    const t = text.toLowerCase();
    if (t.includes("shop")) return <FiShoppingBag className="button-icon" />;
    if (t.includes("browse") || t.includes("all"))
      return <FiGrid className="button-icon" />;
    if (t.includes("learn") || t.includes("more"))
      return <FiInfo className="button-icon" />;
    if (t.includes("bundle")) return <FiGift className="button-icon" />;
    if (
      t.includes("deal") ||
      t.includes("offer") ||
      t.includes("save") ||
      t.includes("off")
    )
      return <RiDiscountPercentFill className="button-icon" />;
    if (t.includes("join") || t.includes("sign"))
      return <FiUserPlus className="button-icon" />;
    if (t.includes("reward") || t.includes("star"))
      return <FiStar className="button-icon" />;
    return <FiShoppingBag className="button-icon" />;
  };

  // Highly-styled non-hero slides (edit freely)
  // Tip: replace src/images later; content/types drive the unique layouts below
  const staticCategories = [
    {
      label: "Cleaning Items",
      link: "/category/cleaning-items",
      icon: PiSprayBottleFill,
    },
    { label: "Electric Items", link: "/category/electric", icon: FaPlug },
    { label: "Plastic Items", link: "/category/plastic", icon: GiPlasticDuck },
    {
      label: "Stationary Items",
      link: "/category/stationary",
      icon: PiPencilRulerFill,
    },
    { label: "Homeware", link: "/category/homeware", icon: BsLamp },
    { label: "Kitchen Items", link: "/category/kitchen", icon: FaKitchenSet },
  ];
  const slides = [
    {
      type: "promo",
      key: "mega_sale",
      src: assets.carouselImgs.mega_sale,
      name: "Mega Sale",
      desc: "Limited time savings on bestsellers",
      percent: 50,
      link: "/collections/all",
      cta: "Shop Deals",
      badge: "Limited Time",
    },
    {
      type: "categories",
      key: "shop_by_category",
      src: assets.carouselImgs.categories,
      name: "Shop by Category",
      categories: staticCategories.map(({ label, link, icon }) => ({
        label,
        href: link,
        icon,
      })),
      link: "/collections/all",
      cta: "Browse All",
    },
    {
      type: "service",
      key: "why_choose_us",
      src: assets.carouselImgs.why_choose,
      name: "Why Choose Us",
      features: [
        { icon: "truck", title: "Fast Delivery", desc: "Island-wide shipping" },
        {
          icon: "shield",
          title: "Quality Guaranteed",
          desc: "Durable, trusted products",
        },
        {
          icon: "refresh",
          title: "Easy Returns",
          desc: "Hassle-free exchanges",
        },
        {
          icon: "headphones",
          title: "Friendly Support",
          desc: "We’re here to help",
        },
      ],
      link: "/contact",
      cta: "Contact Us",
    },
    {
      type: "bundle",
      key: "bundle_and_save",
      // use dedicated bundle image
      src: assets.carouselImgs.bundle_save,
      name: "Bundle & Save",
      offer: "Buy 1 Get 1 Free",
      desc: "Stylish lampshades to brighten any room",
      link: "/collections/homeware",
      cta: "View Bundles",
    },
    {
      type: "new",
      key: "new_arrivals",
      // use the dedicated new_arrivals carousel image
      src: assets.carouselImgs.new_arrivals,
      name: "New Arrivals",
      desc: "Fresh picks this week — limited stock",
      link: "/collections/new",
      cta: "Shop New",
    },
    {
      type: "loyalty",
      key: "member_rewards",
      src: assets.carouselImgs.member_rewards,
      name: "Member Rewards",
      desc: "Earn points on every order. Redeem for discounts.",
      link: "/rewards",
      cta: "Join Free",
    },
  ];

  const renderIcon = (name) => {
    const common = { size: 18 };
    switch (name) {
      case "truck":
        return <FiTruck {...common} />;
      case "shield":
        return <FiShield {...common} />;
      case "refresh":
        return <FiRefreshCcw {...common} />;
      case "headphones":
        return <FiHeadphones {...common} />;
      default:
        return null;
    }
  };

  const renderSlideContent = (slide) => {
    switch (slide.type) {
      case "promo":
        return (
          <div className="max-w-3xl">
            <motion.div
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur px-2 py-[3px] sm:px-3 sm:py-1 text-white/90 text-[10px] sm:text-xs"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0}
            >
              <FiClock size={14} />
              <span>{slide.badge || "Limited Time"}</span>
            </motion.div>
            <motion.h3
              className="mt-3 font-semibold leading-[1.02] tracking-tight drop-shadow-lg text-white text-3xl sm:text-7xl md:text-8xl"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.12}
              style={{ textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}
            >
              {slide.name}
            </motion.h3>
            <motion.p
              className="mt-2 text-white/90 text-base sm:text-2xl flex items-center gap-2"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.22}
            >
              <RiDiscountPercentFill size={24} /> Up to {slide.percent || 50}%
              OFF
            </motion.p>
            <motion.p
              className="mt-2 max-w-xl text-white/90"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.32}
            >
              {slide.desc}
            </motion.p>
            <motion.div
              className="mt-6"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.42}
            >
              <a href={slide.link} style={{ textDecoration: "none" }}>
                <CarouselButton
                  text={slide.cta || "Shop Now"}
                  icon={getCtaIcon(slide.cta || "Shop Now")}
                />
              </a>
            </motion.div>
          </div>
        );
      case "categories":
        return (
          <div className="max-w-5xl">
            <motion.h3
              className="font-semibold leading-tight drop-shadow-lg text-white text-2xl sm:text-6xl md:text-7xl lg:text-8xl"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0}
              style={{ textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}
            >
              {slide.name}
            </motion.h3>
            <motion.p
              className="mt-3 text-white/90 text-base sm:text-lg"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.12}
            >
              Explore essentials across every department
            </motion.p>
            <motion.ul
              className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-x-1 gap-y-2 max-w-xl"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.2}
            >
              {(slide.categories || []).map((c, i) => {
                const Icon = c.icon;
                return (
                  <li key={i} className="flex justify-start">
                    <a
                      href={c.href}
                      className="category-pill group inline-flex items-center gap-2 sm:gap-3 rounded-full border border-white/15 bg-white/5 px-2 py-1.5 sm:px-3 sm:py-2 text-white/95 hover:bg-white/10 transition-transform transform hover:-translate-y-1 shadow-sm"
                      style={{ textDecoration: "none" }}
                    >
                      <span className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-black/30 flex-shrink-0">
                        {Icon ? (
                          <Icon size={16} className="text-white" />
                        ) : (
                          <FiShoppingBag size={16} className="text-white" />
                        )}
                      </span>
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs sm:text-sm font-medium">{c.label}</span>
                        <span className="text-[10px] sm:text-[11px] text-white/70">
                          Shop now
                        </span>
                      </div>
                    </a>
                  </li>
                );
              })}
            </motion.ul>
            <motion.div
              className="mt-5"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.32}
            >
              <a href={slide.link} style={{ textDecoration: "none" }}>
                <CarouselButton
                  text={slide.cta || "Browse All"}
                  icon={getCtaIcon(slide.cta || "Browse All")}
                />
              </a>
            </motion.div>
          </div>
        );
      case "service":
        return (
          <div className="max-w-5xl">
            <motion.h3
              className="font-semibold leading-tight drop-shadow-lg text-white text-2xl sm:text-6xl md:text-7xl lg:text-8xl"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0}
              style={{ textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}
            >
              {slide.name}
            </motion.h3>
            <motion.ul
              className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-2 sm:gap-3 w-full sm:w-1/2 justify-start justify-items-start scale-90 sm:scale-100 origin-top-left"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.12}
            >
              {(slide.features || []).map((f, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur px-2.5 py-1.5 sm:px-3 sm:py-3 text-white/95 w-auto max-w-[210px] sm:max-w-none"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-6 w-6 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/15 text-white">
                      {renderIcon(f.icon)}
                    </span>
                    <div>
                      <p className="text-[11px] sm:text-sm font-semibold">{f.title}</p>
                      <p className="text-[10px] sm:text-xs text-white/85">{f.desc}</p>
                    </div>
                  </div>
                </li>
              ))}
            </motion.ul>
            <motion.div
              className="mt-6"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.26}
            >
              <a href={slide.link} style={{ textDecoration: "none" }}>
                <CarouselButton
                  text={slide.cta || "Learn More"}
                  icon={getCtaIcon(slide.cta || "Learn More")}
                />
              </a>
            </motion.div>
          </div>
        );
      case "bundle":
        return (
          <div className="max-w-3xl">
            <motion.div
              className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur px-2 py-[3px] sm:px-3 sm:py-1 text-white/90 text-[10px] sm:text-xs"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0}
            >
              <FiGift size={16} />{" "}
              <span>Special Offer</span>
            </motion.div>
            <motion.h3
              className="mt-3 font-semibold leading-[1.02] tracking-tight drop-shadow-lg text-white text-2xl sm:text-6xl md:text-7xl lg:text-8xl"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.12}
              style={{ textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}
            >
              {slide.name}
            </motion.h3>
            <motion.p
              className="mt-2 text-lg sm:text-3xl text-emerald-200"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.22}
            >
              {slide.offer}
            </motion.p>
            <motion.p
              className="mt-2 max-w-xl text-white/90"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.32}
            >
              {slide.desc}
            </motion.p>
            <motion.div
              className="mt-6"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.42}
            >
              <a href={slide.link} style={{ textDecoration: "none" }}>
                <CarouselButton
                  text={slide.cta || "Shop Bundles"}
                  icon={getCtaIcon(slide.cta || "Shop Bundles")}
                />
              </a>
            </motion.div>
          </div>
        );
      case "new":
        return (
          <div className="max-w-3xl">
            <motion.h3
              className="font-semibold leading-[1.02] tracking-tight drop-shadow-lg text-white text-2xl sm:text-6xl md:text-7xl lg:text-8xl"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0}
              style={{ textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}
            >
              {slide.name}
            </motion.h3>
            <motion.p
              className="mt-2 max-w-xl text-white/90"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.12}
            >
              {slide.desc}
            </motion.p>
            <motion.div
              className="mt-6"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.22}
            >
              <a href={slide.link} style={{ textDecoration: "none" }}>
                <CarouselButton
                  text={slide.cta || "Explore New"}
                  icon={getCtaIcon(slide.cta || "Explore New")}
                />
              </a>
            </motion.div>
          </div>
        );
      case "loyalty":
        return (
          <div className="max-w-3xl">
            <motion.div
              className="flex items-center gap-1.5 sm:gap-2 text-yellow-200"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0}
            >
              <FiStar size={22} />{" "}
              <span className="text-xs sm:text-sm">Member Rewards</span>
            </motion.div>
            <motion.h3
              className="mt-2 font-semibold leading-[1.02] tracking-tight drop-shadow-lg text-white text-2xl sm:text-6xl md:text-7xl lg:text-8xl"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.12}
              style={{ textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}
            >
              {slide.name}
            </motion.h3>
            <motion.p
              className="mt-2 max-w-xl text-white/90"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.22}
            >
              {slide.desc}
            </motion.p>
            <motion.div
              className="mt-6"
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={0.32}
            >
              <a href={slide.link} style={{ textDecoration: "none" }}>
                <CarouselButton
                  text={slide.cta || "Join Now"}
                  icon={getCtaIcon(slide.cta || "Join Now")}
                />
              </a>
            </motion.div>
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (
      swiperInstance &&
      prevRef.current &&
      nextRef.current &&
      paginationRef.current
    ) {
      // Assign navigation and pagination elements
      swiperInstance.params.navigation.prevEl = prevRef.current;
      swiperInstance.params.navigation.nextEl = nextRef.current;
      swiperInstance.params.pagination.el = paginationRef.current;
      // Re-init navigation and pagination
      if (swiperInstance.navigation && swiperInstance.navigation.destroy) {
        swiperInstance.navigation.destroy();
        swiperInstance.navigation.init();
        swiperInstance.navigation.update();
      }
      if (swiperInstance.pagination && swiperInstance.pagination.destroy) {
        swiperInstance.pagination.destroy();
        swiperInstance.pagination.init();
        swiperInstance.pagination.render();
        swiperInstance.pagination.update();
      }
    }
  }, [swiperInstance]);

  // Ensure all category pills share the same width (width of the largest pill).
  useEffect(() => {
    const setUniformPillWidth = () => {
      const pills = Array.from(document.querySelectorAll(".category-pill"));
      if (!pills.length) return;
      const isMobile = window.innerWidth < 640;
      // On mobile, make each pill fill its grid column so badges are wider
      if (isMobile) {
        pills.forEach((p) => (p.style.width = "100%"));
        return;
      }
      // reset widths to let them measure naturally
      pills.forEach((p) => (p.style.width = "auto"));
      // measure
      let max = 0;
      pills.forEach((p) => {
        const w = p.getBoundingClientRect().width;
        if (w > max) max = w;
      });
      // apply max width (use Math.ceil to avoid subpixel issues)
      if (max > 0)
        pills.forEach((p) => (p.style.width = Math.ceil(max) + "px"));
    };

    // run after a tick so DOM is settled (Swiper may lazy-render)
    const t = setTimeout(setUniformPillWidth, 50);
    window.addEventListener("resize", setUniformPillWidth);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", setUniformPillWidth);
    };
  }, [activeIndex]);

  // Simple motion presets
  const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: (d = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.15 + d, duration: 0.8, ease: [0.19, 1, 0.22, 1] },
    }),
  };
  const captionVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.19, 1, 0.22, 1] },
    },
  };

  return (
    <div className="relative w-full max-w-full overflow-hidden h-[50vh] sm:h-[80vh] md:h-[85vh] lg:h-[92vh] -mt-4 sm:mt-0">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={false}
        pagination={false}
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        speed={3000}
        loop
        slidesPerView={1}
        className="w-full h-full"
        onSwiper={setSwiperInstance}
        onSlideChange={(s) => setActiveIndex(s.realIndex || 0)}
      >
        {/* Hero slide (always first) */}
        <SwiperSlide>
          <div
            className="relative w-full h-full overflow-hidden"
            style={{ contain: "paint" }}
          >
            {/* Animated aurora + conic gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-700 to-green-600" />

            {/* Slow rotating conic sheen */}
            <motion.div
              aria-hidden
              className="absolute inset-0 transform-gpu will-change-transform"
              style={{
                background:
                  "conic-gradient(from 0deg at 50% 50%, rgba(16,185,129,0.18), rgba(59,130,246,0.16), rgba(236,72,153,0.12), rgba(16,185,129,0.18))",
                mixBlendMode: "overlay",
              }}
              animate={
                activeIndex === 0 && !prefersReducedMotion
                  ? { rotate: 360 }
                  : { rotate: 0 }
              }
              transition={{ duration: 80, ease: "linear", repeat: Infinity }}
            />

            {/* Aurora blobs */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -top-24 -left-24 w-[55vw] h-[55vw] rounded-full blur-2xl transform-gpu will-change-transform"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(16,185,129,0.42), rgba(16,185,129,0.0) 70%)",
              }}
              animate={
                activeIndex === 0 && !prefersReducedMotion
                  ? { x: [0, 36, -18, 0], y: [0, -18, 26, 0] }
                  : { x: 0, y: 0 }
              }
              transition={{ duration: 28, ease: "easeInOut", repeat: Infinity }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute bottom-[-10rem] right-[-10rem] w-[50vw] h-[50vw] rounded-full blur-2xl transform-gpu will-change-transform"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(59,130,246,0.34), rgba(59,130,246,0.0) 70%)",
              }}
              animate={
                activeIndex === 0 && !prefersReducedMotion
                  ? { x: [0, -26, 9, 0], y: [0, 18, -22, 0] }
                  : { x: 0, y: 0 }
              }
              transition={{ duration: 30, ease: "easeInOut", repeat: Infinity }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[36vw] h-[36vw] rounded-full blur-2xl transform-gpu will-change-transform"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(236,72,153,0.22), rgba(236,72,153,0.0) 70%)",
              }}
              animate={
                activeIndex === 0 && !prefersReducedMotion
                  ? {
                      x: [0, 9, -12, 0],
                      y: [0, -12, 4, 0],
                      scale: [1, 1.05, 0.99, 1],
                    }
                  : { x: 0, y: 0, scale: 1 }
              }
              transition={{ duration: 26, ease: "easeInOut", repeat: Infinity }}
            />

            {/* Content */}
            <div className="relative z-10 h-full w-full flex items-center">
              {/* Mobile-only downscaled content to keep hero much smaller on small screens */}
              <div className="w-full scale-[0.78] sm:scale-100 origin-left">
                <div className="px-6 sm:px-10 md:px-16 lg:px-24 xl:px-28 w-full">
                <motion.div
                  className="mb-3 flex items-center gap-2 text-emerald-200/90 drop-shadow"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.05,
                    duration: 0.6,
                    ease: [0.19, 1, 0.22, 1],
                  }}
                >
                  <TbSparkles size={26} />
                  <span className="text-sm sm:text-base tracking-wide">
                    Discover everyday essentials
                  </span>
                </motion.div>
                <motion.h1
                  className="font-medium leading-[1.05] tracking-tight text-white drop-shadow-lg text-2xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  custom={0}
                >
                  <span className="block">Quality Essentials</span>
                  <span className="block font-light text-white/90">
                    for every space
                  </span>
                </motion.h1>

                <motion.p
                  className="mt-4 max-w-2xl text-base sm:text-lg md:text-xl text-white/90 drop-shadow"
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  custom={0.15}
                >
                  Elevate your home and business with durable, affordable
                  products handpicked for everyday use.
                </motion.p>

                <motion.div
                  className="mt-6"
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  custom={0.3}
                >
                  <a href="/collections/all" style={{ textDecoration: "none" }}>
                    <CarouselButton
                      text="Shop Now"
                      icon={getCtaIcon("Shop Now")}
                    />
                  </a>
                </motion.div>

                {/* Trust badges / features */}
                <motion.ul
                  className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl"
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  custom={0.45}
                >
                  <li className="flex items-center gap-2 sm:gap-3 rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-3 text-white/95 shadow-sm max-w-[220px] sm:max-w-none">
                    <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-200">
                      <FiTruck size={18} />
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Fast Delivery</p>
                      <p className="text-[11px] sm:text-xs text-white/80">
                        Island-wide shipping
                      </p>
                    </div>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-3 text-white/95 shadow-sm max-w-[220px] sm:max-w-none">
                    <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-200">
                      <FiShield size={18} />
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Quality Assured</p>
                      <p className="text-[11px] sm:text-xs text-white/80">
                        Trusted by customers
                      </p>
                    </div>
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-3 text-white/95 shadow-sm max-w-[220px] sm:max-w-none">
                    <span className="inline-flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-200">
                      <FiTag size={18} />
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-medium">Great Value</p>
                      <p className="text-[11px] sm:text-xs text-white/80">
                        Everyday low prices
                      </p>
                    </div>
                  </li>
                </motion.ul>
              </div>
            </div>
              {/* Big cart icon bottom-right */}
              <div className="pointer-events-none absolute bottom-10 right-10 hidden md:block">
                <div className="relative">
                  <div className="absolute -inset-6 rounded-full bg-emerald-400/20 blur-3xl" />
                  <RiShoppingCartFill
                    className="relative text-white"
                    style={{
                      fontSize: "25rem",
                      transform: "rotate(-18deg)",
                    }}
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
        {slides.map((img, idx) => (
          <SwiperSlide key={img.key || idx}>
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
              }}
            >
              <motion.img
                src={img.src}
                alt={img.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  /* image will be clipped by parent rounded corners */
                  borderBottomLeftRadius: "0",
                  borderBottomRightRadius: "0",
                }}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 7, ease: "linear" }}
              />
              {/* full-height subtle gradient overlay to improve text contrast */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.28) 40%, rgba(0,0,0,0.6) 100%)",
                  zIndex: 15,
                }}
              />
              <figcaption
                className="absolute left-0 w-full text-white px-6 sm:px-10 md:px-16 lg:px-24 xl:px-28 box-border"
                style={{
                  /* move caption up from bottom so it sits higher on the slide */
                  bottom: "15%",
                  /* overlay is applied across the whole slide; keep caption background transparent */
                  background: "transparent",
                  zIndex: 20,
                }}
              >
                {/* Mobile-only downscaled caption content so all text, badges and buttons are smaller on small screens */}
                <div className="w-full scale-[0.8] sm:scale-100 origin-left">
                  <motion.div
                    key={`${img.key}-${activeIndex === idx + 1}`}
                    variants={captionVariants}
                    initial="hidden"
                    animate={activeIndex === idx + 1 ? "show" : "hidden"}
                  >
                    {renderSlideContent(img)}
                  </motion.div>
                </div>
              </figcaption>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {/* Custom navigation buttons at bottom right with Tailwind CSS, outside Swiper */}
      <button
        ref={prevRef}
        type="button"
        className="custom-swiper-button-prev absolute bottom-5 right-20 z-10 bg-black/70 text-white border-none w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center cursor-pointer text-base sm:text-lg md:text-xl transition-colors duration-200 hover:bg-white hover:text-black shadow-lg"
        aria-label="Previous slide"
      >
        <FiArrowLeft size={22} />
      </button>
      <button
        ref={nextRef}
        type="button"
        className="custom-swiper-button-next absolute bottom-5 right-5 z-10 bg-black/70 text-white border-none w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center cursor-pointer text-base sm:text-lg md:text-xl transition-colors duration-200 hover:bg-white hover:text-black shadow-lg"
        aria-label="Next slide"
      >
        <FiArrowRight size={24} />
      </button>
      {/* Custom pagination dots at bottom center, outside Swiper */}
      <div
        ref={paginationRef}
        className="custom-swiper-pagination"
        style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "auto",
        }}
      />
      {/* Add custom style for white pagination dots */}
      <style>{`
        .custom-swiper-pagination .swiper-pagination-bullet {
          background: #fff !important;
          opacity: 0.7;
        }
        .custom-swiper-pagination .swiper-pagination-bullet-active {
          background: #fff !important;
          opacity: 1;
        }
        @media (max-width: 640px) {
          .custom-swiper-pagination .swiper-pagination-bullet {
            width: 6px;
            height: 6px;
            margin: 0 2px;
          }
        }
      `}</style>
    </div>
  );
};

export default Carousel;
