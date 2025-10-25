import React, { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import useCategories from "../../api/hooks/useCategories";
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
  const { data: categories } = useCategories();

  // Derive dynamic images from categories that have carouselImg or catMainImg.
  const images = (categories || [])
    .filter(c => String(c.status || '').toLowerCase() === 'active')
    .filter(c => c.carouselImg || c.catMainImg)
    .slice(0, 8) // limit to avoid overly long carousels
    .map(c => ({
      src: c.carouselImg || c.catMainImg || c.catTileImage1 || c.catTileImage2,
      name: c.name,
      desc: c.description || 'Explore our collection.',
      link: `/collections/${encodeURIComponent(c.name.toLowerCase().replace(/\s+/g,'-'))}`,
      cta: `Shop ${c.name.split(' ')[0]}`
    }));

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

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "100%", overflow: 'hidden' }}>
      {images.length > 0 ? (
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={false}
        pagination={false}
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        speed={3000}
        loop
        slidesPerView={1}
        style={{ width: "100%", height: "75vh" }}
        onSwiper={setSwiperInstance}
      >
        {images.map((img, idx) => (
          <SwiperSlide key={idx}>
            <div style={{ position: "relative", width: "100%", height: "100%", overflow: 'hidden', borderBottomLeftRadius: '28px', borderBottomRightRadius: '28px' }}>
                <img
                src={img.src}
                alt={img.name}
                style={{
                  width: "100%",
                  height: "75vh",
                  objectFit: "cover",
                  /* image will be clipped by parent rounded corners */
                  borderBottomLeftRadius: '0',
                  borderBottomRightRadius: '0'
                }}
              />
              <figcaption
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  width: "100%",
                  background: "linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.7) 100%)",
                  color: "#fff",
                  padding: "2rem",
                  boxSizing: "border-box",
                }}
              >
                <h3 style={{ fontSize: "5.5rem", textTransform: "uppercase", lineHeight: 1.05, fontWeight: 900 }}>
                  {img.name?.split(' ').map((word, i) => <span key={i} style={{fontWeight: i===0 ? 900 : 300, display: 'block'}}>{word}</span>)}
                </h3>
                <p style={{ fontSize: "1.25rem", margin: "1rem 0", lineHeight: 1.3 }}>{img.desc}</p>
                <div style={{ marginTop: "1.5rem" }}>
                  <a href={img.link} style={{ textDecoration: "none" }}>
                    <CarouselButton text={img.cta || 'Shop Now'} />
                  </a>
                </div>
              </figcaption>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      ) : (
        <div style={{ width: '100%', height: '75vh', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }} className="bg-gray-100 flex items-center justify-center">
          <div className="text-gray-500">No categories with images available.</div>
        </div>
      )}
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