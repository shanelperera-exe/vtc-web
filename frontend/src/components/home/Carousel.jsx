import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
// Static carousel: no backend categories
import assets from "../../assets/assets";
import CarouselButton from "./Carouselbutton";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Note: removed static image fallbacks; carousel now renders only backend-provided images

const Carousel = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const paginationRef = useRef(null);
  const [swiperInstance, setSwiperInstance] = useState(null);

  // Static slides developers can edit freely
  // Tip: replace images/text/links below to customize the carousel
  const slides = [
    {
      key: 'cleaning',
      src: assets.carouselImgs.cleaning,
      name: 'Cleaning Essentials',
      desc: 'Keep every corner spotless with durable tools and supplies.',
      link: '/collections/cleaning',
      cta: 'Shop Cleaning'
    },
    {
      key: 'kitchen',
      src: assets.carouselImgs.kitchen,
      name: 'Kitchen Must-Haves',
      desc: 'Smart, practical kitchenware for daily use.',
      link: '/collections/kitchen',
      cta: 'Shop Kitchen'
    },
    {
      key: 'plastic',
      src: assets.carouselImgs.plastic,
      name: 'Plastic Storage',
      desc: 'Organize better with sturdy storage options.',
      link: '/collections/storage',
      cta: 'Shop Storage'
    },
    {
      key: 'stationary',
      src: assets.carouselImgs.stationary,
      name: 'Stationery & Office',
      desc: 'Pens, books, and office essentials for productivity.',
      link: '/collections/stationery',
      cta: 'Shop Stationery'
    }
  ];

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

  // Simple motion presets
  const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: (d = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.15 + d, duration: 0.8, ease: [0.19, 1, 0.22, 1] }
    })
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "100%", overflow: 'hidden' }}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={false}
        pagination={false}
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        speed={3000}
        loop
        slidesPerView={1}
        style={{ width: "100%", height: "90vh" }}
        onSwiper={setSwiperInstance}
      >
        {/* Hero slide (always first) */}
        <SwiperSlide>
          <div className="relative w-full h-full overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-700 to-green-600" />
            {/* Decorative radial highlights */}
            <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-[-6rem] right-[-6rem] h-[28rem] w-[28rem] rounded-full bg-emerald-300/20 blur-3xl" />

            {/* Content */}
            <div className="relative z-10 h-full w-full flex items-center">
              <div className="px-6 sm:px-10 md:px-16 lg:px-24 xl:px-28 w-full">
                <motion.h1
                  className="uppercase font-extrabold leading-[1.05] tracking-tight text-white drop-shadow-lg text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  custom={0}
                >
                  <span className="block">Quality Essentials</span>
                  <span className="block font-light text-white/90">for every space</span>
                </motion.h1>

                <motion.p
                  className="mt-4 max-w-2xl text-base sm:text-lg md:text-xl text-white/90 drop-shadow"
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  custom={0.15}
                >
                  Elevate your home and business with durable, affordable products handpicked for everyday use.
                </motion.p>

                <motion.div
                  className="mt-6"
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  custom={0.3}
                >
                  <a href="/collections/all" style={{ textDecoration: "none" }}>
                    <CarouselButton text="Shop Now" />
                  </a>
                </motion.div>
              </div>
            </div>
          </div>
        </SwiperSlide>
        {slides.map((img, idx) => (
          <SwiperSlide key={img.key || idx}>
            <div style={{ position: "relative", width: "100%", height: "100%", overflow: 'hidden' }}>
                <motion.img
                src={img.src}
                alt={img.name}
                style={{
                  width: "100%",
                  height: "90vh",
                  objectFit: "cover",
                  /* image will be clipped by parent rounded corners */
                  borderBottomLeftRadius: '0',
                  borderBottomRightRadius: '0'
                }}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 7, ease: "linear" }}
              />
              {/* full-height subtle gradient overlay to improve text contrast */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.28) 40%, rgba(0,0,0,0.6) 100%)",
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
                  zIndex: 20
                }}
              >
                <motion.h3
                  className="uppercase font-extrabold leading-[1.05] tracking-tight drop-shadow-lg text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  custom={0}
                  style={{ textShadow: '0 6px 30px rgba(0,0,0,0.6)' }}
                >
                  {img.name?.split(' ').map((word, i) => (
                    <span key={i} style={{ fontWeight: i === 0 ? 900 : 300, display: 'block' }}>{word}</span>
                  ))}
                </motion.h3>
                <motion.p
                  className="text-base sm:text-lg md:text-xl mt-4 max-w-2xl drop-shadow"
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  custom={0.15}
                  style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                >
                  {img.desc}
                </motion.p>
                <motion.div
                  className="mt-6"
                  initial="hidden"
                  animate="show"
                  variants={fadeUp}
                  custom={0.3}
                >
                  <a href={img.link} style={{ textDecoration: "none" }}>
                    <CarouselButton text={img.cta || 'Shop Now'} />
                  </a>
                </motion.div>
              </figcaption>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {/* Custom navigation buttons at bottom right with Tailwind CSS, outside Swiper */}
      <button
        ref={prevRef}
        type="button"
        className="custom-swiper-button-prev absolute bottom-5 right-20 z-10 bg-black/70 text-white border-none w-12 h-12 flex items-center justify-center cursor-pointer text-lg transition-colors duration-200 hover:bg-white hover:text-black shadow-lg"
        aria-label="Previous slide"
      >
        <FiArrowLeft size={22} />
      </button>
      <button
        ref={nextRef}
        type="button"
        className="custom-swiper-button-next absolute bottom-5 right-5 z-10 bg-black/70 text-white border-none w-12 h-12 flex items-center justify-center cursor-pointer text-2xl transition-colors duration-200 hover:bg-white hover:text-black shadow-lg"
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
          width: "auto"
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
      `}</style>
    </div>
  );
};


export default Carousel;