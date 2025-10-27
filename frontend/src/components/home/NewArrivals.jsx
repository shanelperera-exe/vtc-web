import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ProductCard from '../products/ProductCard';
import { useProducts } from '../../api/hooks/useProducts';

export default function NewArrivals() {
  const { data = [], loading } = useProducts({ size: 24, status: 'ACTIVE', sort: 'createdAt,desc' });
  const items = useMemo(() => (data && data.length ? data.slice(0, 10) : []), [data]);

  return (
    <section className="py-12 sm:py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.2em] text-neutral-600 font-semibold">JUST IN</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">New arrivals</h2>
          <p className="mt-2 text-neutral-600">Fresh picks this week — limited stock.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div key={i} className="h-[460px] border-2 border-neutral-900 bg-neutral-200 animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 5200, disableOnInteraction: false }}
            loop={false}
            spaceBetween={16}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 }
            }}
            className="py-4"
          >
            {items.map((p) => (
              <SwiperSlide key={p.id} className="!flex !justify-center">
                <div style={{ width: '100%', maxWidth: 320 }}>
                  <ProductCard
                    id={p.id}
                    sku={p.sku}
                    name={p.name}
                    description={p.shortDescription || p.short_desc || p.description}
                    image={p.image}
                    price={p.price}
                    category={p.category}
                    rating={p.rating}
                    numOfReviews={p.numOfReviews}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        <div className="text-center mt-8">
          <a href="/category/all" className="inline-flex items-center justify-center px-5 py-3 font-semibold border border-neutral-300 hover:bg-white transition rounded-full" style={{ textDecoration: 'none' }}>
            View all products
          </a>
        </div>
      </div>
    </section>
  );
}
