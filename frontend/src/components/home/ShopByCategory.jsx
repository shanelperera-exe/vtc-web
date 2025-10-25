import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import useCategories from "../../api/hooks/useCategories";

export default function DecorCollection() {
  const { data: categories, loading, error } = useCategories();

  const collections = (categories || []).slice(0, 12).map(c => ({
    name: c.name,
    items: c.productCount ?? 0,
    image: c.carouselImg || c.catMainImg || c.catTileImage1 || c.catTileImage2 || null,
    link: `/collections/${encodeURIComponent(c.name.toLowerCase().replace(/\s+/g, '-'))}`
  }));

  const containerRef = useRef(null);

  const scrollBy = (direction = 1) => {
    const el = containerRef.current;
    if (!el) return;
    // scroll by visible width (one viewport of the carousel)
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <section className="w-full overflow-hidden py-12 bg-white">
  <div className="w-full px-8">
        {/* Heading */}
        <div className="text-center mb-10">
          <div className="text-sm uppercase tracking-widest text-gray-600 font-semibold">
            SHOP BY CATEGORIES
          </div>
          <h3 className="text-3xl md:text-4xl font-bold mt-2">Product Categories</h3>
        </div>

        {error && (
          <div className="text-red-600 mb-4 text-sm" role="alert">Failed to load categories: {error.message || 'Error'}</div>
        )}
        {/* Carousel */}
        <div className="relative">
          {/* Centered viewport for 4 cards: 4*320 + 3*24 = 1352px */}
          <div className="mx-auto w-full max-w-[1352px] relative">
            <div
              ref={containerRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory px-0 py-4 scroll-smooth hide-scrollbar"
            >
            {loading && (
              <div className="text-center w-full py-10 text-gray-500">Loading categories...</div>
            )}
            {!loading && collections.map((col, idx) => (
              <div
                key={idx}
                className="snap-start flex-shrink-0 min-w-[220px] sm:min-w-[240px] md:min-w-[280px] lg:min-w-[320px] group"
              >
                <a
                  href={col.link}
                  className="block w-full bg-white shadow-sm hover:shadow-md overflow-hidden transition-all duration-300 group"
                >
                  <div className="relative overflow-hidden">
                    <div style={{ position: 'relative', paddingTop: '100%' }}>
                      {col.image ? (
                        <img
                          src={col.image}
                          alt={col.name}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                          className="transform transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          aria-hidden
                          style={{ position: 'absolute', inset: 0 }}
                          className="bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400"
                        >
                          <span className="text-sm">No image</span>
                        </div>
                      )}
                    </div>

                    {/* pill overlay: text above, animated black fill beneath that grows on hover */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-10 w-[90%] max-w-[520px]">
                      <div className="relative">
                        <div className="absolute inset-0 w-full bg-white transition-all duration-500 group-hover:bg-black"></div>

                        {/* content sits above the fill */}
                        <div className="relative px-4 py-2 flex items-center justify-between gap-3">
                          <h5 className="font-semibold text-lg text-black group-hover:text-white transition-colors duration-300">{col.name}</h5>

                          <div className="relative">
                            <span className="text-sm text-gray-700 group-hover:text-white transition-opacity duration-300 inline-block group-hover:opacity-0">{col.items} ITEMS</span>
                            <span className="absolute inset-0 flex items-center justify-end pr-1 opacity-0 group-hover:opacity-100 group-hover:text-white transition-opacity duration-300">
                              <ArrowRight size={18} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            ))}
            </div>

            {/* overlay buttons inside carousel */}
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              aria-label="Previous"
              className="hidden md:flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200 w-14 h-14 -left-8 top-1/2 -translate-y-1/2 absolute z-30 hover:bg-white"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={() => scrollBy(1)}
              aria-label="Next"
              className="hidden md:flex items-center justify-center bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200 w-14 h-14 -right-8 top-1/2 -translate-y-1/2 absolute z-30 hover:bg-white"
            >
              <ChevronRight size={22} />
            </button>
        </div>
      </div>
    </div>
    </section>
  );
}
