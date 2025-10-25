import React, { useState } from 'react';
import ProductCard from '../products/ProductCard';
import { useProducts } from '../../api/hooks/useProducts';

export default function CustomersPurchased() {
  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: backendProducts } = useProducts({ size: 50, status: 'ACTIVE' });
  const products = (backendProducts || []).slice().sort((a,b)=> ((b.rating||0) - (a.rating||0))); // backend may not provide rating yet

  // Show 2 products at a time on mobile, more on larger screens
  // Responsive breakpoints: sm (2), md (3), lg (4)
  const getVisibleCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 2; // mobile
      if (window.innerWidth < 1024) return 3; // tablet
      return 4; // desktop (show 4 products)
    }
    return 2;
  };

  const [visibleCount, setVisibleCount] = useState(getVisibleCount());

  React.useEffect(() => {
    let prevVisibleCount = getVisibleCount();
    const handleResize = () => {
      const newCount = getVisibleCount();
      setVisibleCount(newCount);
      // If moving to a larger screen, reset index to 0
      if (newCount > prevVisibleCount) {
        setCurrentIndex(0);
      } else {
        // Clamp index if needed
        setCurrentIndex((i) => Math.min(i, Math.max(0, products.length - newCount)));
      }
      prevVisibleCount = newCount;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Clamp index so carousel doesn't go out of bounds
  const maxIndex = Math.max(0, products.length - visibleCount);
  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () => setCurrentIndex((i) => Math.min(maxIndex, i + 1));

  // Slice products for carousel
  const visibleProducts = products.slice(currentIndex, currentIndex + visibleCount);

  // Show buttons only if carousel is scrollable and on small screens
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : true;
  const showButtons = isMobile && products.length > visibleCount;

  return (
  <div className="w-full" style={{ width: '100%', marginBottom: '20px'}}>
  {/* add px-10 horizontally so section extends from both ends */}
  <div className="px-10 py-8 flex flex-col w-full">
        <div className="flex items-center justify-between w-full mb-2">
          <h2 className="text-5xl font-bold tracking-tight text-gray-800">Customers <span className='text-gray-400'>also Purchased</span></h2>
          {showButtons && (
            <div className="flex gap-2">
              {currentIndex > 0 && (
                <button
                  aria-label="Previous"
                  onClick={goPrev}
                  className={`rounded-full border border-gray-300 px-3 py-1 text-gray-700 bg-white hover:bg-gray-100 transition`}
                >
                  &#8592;
                </button>
              )}
              {currentIndex < maxIndex && (
                <button
                  aria-label="Next"
                  onClick={goNext}
                  className={`rounded-full border border-gray-300 px-3 py-1 text-gray-700 bg-white hover:bg-gray-100 transition`}
                >
                  &#8594;
                </button>
              )}
            </div>
          )}
        </div>
        <div
          className="mt-4 grid w-full"
          style={{
            width: '100%',
            // Slightly smaller min widths so cards sit with gaps between them
            // mobile: 130px, tablet: 170px, desktop: 190px
            gridTemplateColumns: (() => {
              const w = typeof window !== 'undefined' ? window.innerWidth : 1024;
              const min = w < 640 ? 130 : w < 1024 ? 170 : 190;
              return `repeat(${visibleCount}, minmax(${min}px, 1fr))`;
            })(),
            transition: 'grid-template-columns 0.3s',
            // increased gaps: mobile 0.75rem, desktop 1rem
            gap: typeof window !== 'undefined' && window.innerWidth < 640 ? '0.75rem' : '1rem',
          }}
        >
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              sku={product.sku}
              name={product.name}
              description={product.shortDescription || product.short_desc || product.shortDesc || product.summary || product.description}
              image={product.image}
              price={product.price}
              category={product.category}
              rating={product.rating}
              numOfReviews={product.numOfReviews}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
