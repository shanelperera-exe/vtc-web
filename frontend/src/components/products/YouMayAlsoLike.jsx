import React, { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import ProductCard from './ProductCard';
import { useProducts } from '../../api/hooks/useProducts';
import { useCategories } from '../../api/hooks/useCategories';

/**
 * YouMayAlsoLike
 * - Fetches products in the same category as the current product and shows a small grid.
 * - Falls back to generic products if category cannot be resolved.
 */
export default function YouMayAlsoLike({ categoryId = null, categoryName = '', excludeId = null, title = 'You may also like' }) {
  // Resolve category id from name if not provided
  const { data: categories } = useCategories({ size: 200 });
  const resolvedCategoryId = useMemo(() => {
    if (categoryId) return categoryId;
    const target = (categoryName || '').trim().toLowerCase();
    if (!target || !Array.isArray(categories)) return null;
    const found = categories
      .filter(c => String(c.status || '').toLowerCase() === 'active')
      .find(c => (c?.name || '').trim().toLowerCase() === target);
    return found?.id ?? null;
  }, [categoryId, categoryName, categories]);

  // Load products: prefer category-specific, but also fetch a generic list as a fallback
  const { data: catProducts, loading: catLoading } = useProducts({ size: 12, categoryId: resolvedCategoryId || undefined, status: 'ACTIVE' });
  const { data: defaultProducts, loading: defaultLoading } = useProducts({ size: 8, status: 'ACTIVE' });

  const categoryItems = useMemo(() => {
    const arr = Array.isArray(catProducts) ? catProducts : [];
    return excludeId ? arr.filter(p => p.id !== excludeId) : arr;
  }, [catProducts, excludeId]);

  const fallbackItems = useMemo(() => {
    const arr = Array.isArray(defaultProducts) ? defaultProducts : [];
    return excludeId ? arr.filter(p => p.id !== excludeId) : arr;
  }, [defaultProducts, excludeId]);

  // Prefer category items, otherwise fallback to defaultProducts
  const items = (categoryItems && categoryItems.length) ? categoryItems : fallbackItems;
  const loading = catLoading || defaultLoading;

  // Always render the section header so the user sees the area even when no matches exist
  return (
    <section className="py-12 sm:py-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.1em] text-neutral-600 font-semibold uppercase">Top recommendations</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">{title}</h2>
          <p className="mt-2 text-neutral-600">Tailored recommendations to match the product you’re viewing.</p>
        </div>

        {loading && (!items || items.length === 0) && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-[460px] border-2 border-neutral-900 bg-neutral-200 animate-pulse rounded" />
            ))}
          </div>
        )}

        {!loading && (!items || items.length === 0) && (
          <div className="p-6 text-sm text-gray-500">No recommendations found.</div>
        )}

        {items && items.length > 0 && (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
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
            {items.slice(0, 10).map((p) => (
              <SwiperSlide key={p.id} className="!flex !justify-center">
                <div style={{ width: '100%', maxWidth: 320 }}>
                  <ProductCard
                    id={p.id}
                    sku={p.sku}
                    name={p.name}
                    description={p.shortDescription || p.description}
                    image={(p.primaryImageUrl || (p.imageUrls && p.imageUrls[0]) || p.image)}
                    price={p.basePrice || p.price || 0}
                    category={p.categoryName || p.category}
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
