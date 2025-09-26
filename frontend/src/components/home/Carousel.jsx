import React, { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import assets from "../../assets/assets";
import CarouselButton from "./Carouselbutton";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Carousel images from assets
const images = [
  {
    src: assets.carouselImgs.cleaning,
    title: (
      <div style={{fontWeight: 900}}>
        Cleaning<br/><span style={{fontWeight: 300}}>Items</span>
      </div>
    ),
    desc: "Find all cleaning essentials for your home and business.",
    link: "/collections/cleaning",
    cta: "Shop Cleaning",
  },
  {
    src: assets.carouselImgs.kitchen,
    title: (
    <div style={{fontWeight: 900}}>
      Kitchen<br/><span style={{fontWeight: 300}}>Appliences</span>
    </div>
    ),
    desc: "Upgrade your kitchen with our latest products.",
    link: "/collections/kitchen",
    cta: "Shop Kitchen",
  },
  {
    src: assets.carouselImgs.plastic,
    title: (
    <div style={{fontWeight: 900}}>
      Plastic<br/><span style={{fontWeight: 300}}>Items</span>
    </div>
    ),
    desc: "Durable plastic goods for everyday use.",
    link: "/collections/plastic",
    cta: "Shop Plastic",
  },
  {
    src: assets.carouselImgs.stationary,
    title: (
    <div style={{fontWeight: 900}}>
      Stationary<br/><span style={{fontWeight: 300}}>Items</span>
    </div>
    ),
    desc: "All your stationary needs in one place.",
    link: "/collections/stationary",
    cta: "Shop Stationary",
  },
];

const Carousel = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const paginationRef = useRef(null);
  const [swiperInstance, setSwiperInstance] = useState(null);

  useEffect(() => {
    if (swiperInstance && prevRef.current && nextRef.current && paginationRef.current) {
      swiperInstance.params.navigation.prevEl = prevRef.current;
      swiperInstance.params.navigation.nextEl = nextRef.current;
      swiperInstance.params.pagination.el = paginationRef.current;
      swiperInstance.navigation.destroy();
      swiperInstance.navigation.init();
      swiperInstance.navigation.update();
      swiperInstance.pagination.destroy();
      swiperInstance.pagination.init();
      swiperInstance.pagination.render();
      swiperInstance.pagination.update();
    }
  }, [swiperInstance, prevRef, nextRef, paginationRef]);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "100vw", overflow: 'hidden' }}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current
        }}
        pagination={{ clickable: true, el: paginationRef.current }}
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        speed={3000}
        loop
        slidesPerView={1}
        style={{ width: "100%", height: "60vh" }}
        onSwiper={setSwiperInstance}
      >
        {images.map((img, idx) => (
          <SwiperSlide key={idx}>
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <img
                src={img.src}
                alt={img.title}
                style={{
                  width: "100%",
                  height: "75vh",
                  objectFit: "cover",
                  borderBottomLeftRadius: '28px',
                  borderBottomRightRadius: '28px'
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
                <h3 style={{ fontSize: "6rem", textTransform: "uppercase", lineHeight: 1.1, fontWeight: 900 }}>
                  {img.title}
                </h3>
                <p style={{ fontSize: "1.25rem", margin: "1rem 0", lineHeight: 1.3 }}>{img.desc}</p>
                <div style={{ marginTop: "1.5rem" }}>
                  <a href={img.link} style={{ textDecoration: "none" }}>
                    <CarouselButton text={img.cta} />
                  </a>
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
        className="custom-swiper-button-prev absolute bottom-5 right-20 z-10 bg-black/70 text-white border-none rounded-full w-12 h-12 flex items-center justify-center cursor-pointer text-lg transition-colors duration-200 hover:bg-white hover:text-black shadow-lg"
        aria-label="Previous slide"
      >
        &#8592;
      </button>
      <button
        ref={nextRef}
        type="button"
        className="custom-swiper-button-next absolute bottom-5 right-5 z-10 bg-black/70 text-white border-none rounded-full w-12 h-12 flex items-center justify-center cursor-pointer text-2xl transition-colors duration-200 hover:bg-white hover:text-black shadow-lg"
        aria-label="Next slide"
      >
        &#8594;
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