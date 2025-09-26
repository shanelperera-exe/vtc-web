import React, { useState } from 'react';
import ProductCard from '../products/ProductCard';
import { products as allProducts } from '../../assets/data';

export default function CustomersPurchased() {
  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get top 5 highest rated products
  const products = [...allProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);

  // Show 2 products at a time on mobile, more on larger screens
  // Responsive breakpoints: sm (2), md (3), lg (5)
  const getVisibleCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 2; // mobile
      if (window.innerWidth < 1024) return 3; // tablet
      return 5; // desktop
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
  <div className="w-full" style={{ width: '100%', marginBottom: '140px'}}>
      <div className="px-4 py-4 sm:px-6 sm:py-6 flex flex-col w-full bg-green-200">
        <div className="flex items-center justify-between w-full mb-2">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Customers also purchased</h2>
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
            gridTemplateColumns: `repeat(${visibleCount}, minmax(0, 1fr))`,
            transition: 'grid-template-columns 0.3s',
            gap: typeof window !== 'undefined' && window.innerWidth < 640 ? '0.7rem' : '2rem',
          }}
        >
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
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
