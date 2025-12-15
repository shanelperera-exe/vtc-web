import React from 'react';
import placeholderLogos from '../../assets/brands';

// Small tile for a single logo (keeps 1:1 square and padding)
const LogoTile = ({ src, alt, imgLoading = 'lazy' }) => (
  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 p-2 flex items-center justify-center mx-4" aria-hidden>
    <div className="w-full h-full flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain opacity-70 grayscale-[60%] hover:opacity-100 hover:grayscale-0 transition duration-200 ease-out"
        loading={imgLoading}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = 'https://via.placeholder.com/200x200?text=No+Logo';
        }}
      />
    </div>
  </div>
);

const BrandsMarquee = () => {
  const containerRef = React.useRef(null);
  const seqRef = React.useRef(null);
  const logos = placeholderLogos;

  const [repeats, setRepeats] = React.useState(2);
  const [tilesPerGroup, setTilesPerGroup] = React.useState(logos.length);

  React.useEffect(() => {
    let mounted = true;

    const measure = () => {
      const containerW = containerRef.current ? containerRef.current.offsetWidth : 0;
      if (!containerW) return;

      const imgs = seqRef.current ? Array.from(seqRef.current.querySelectorAll('img')) : [];
      if (imgs.length >= 2) {
        const r0 = imgs[0].getBoundingClientRect();
        const r1 = imgs[1].getBoundingClientRect();
        const step = Math.abs(r1.left - r0.left) || Math.abs(r1.right - r0.left);
        if (step > 0) {
          const neededTiles = Math.max(1, Math.ceil(containerW / step) + 2);
          if (mounted) {
            setTilesPerGroup(neededTiles);
            setRepeats(1);
          }
          return;
        }
      }

      if (imgs.length === 1) {
        const r0 = imgs[0].getBoundingClientRect();
        const tileW = r0.width || 1;
        const neededTiles = Math.max(1, Math.ceil(containerW / tileW) + 2);
        if (mounted) {
          setTilesPerGroup(neededTiles);
          setRepeats(1);
        }
        return;
      }

      const seqW = seqRef.current ? seqRef.current.offsetWidth : 0;
      if (!seqW) return;
      const listsNeeded = Math.max(1, Math.ceil(containerW / seqW) + 1);
      if (mounted) setRepeats(listsNeeded);
    };

    const imgs = seqRef.current ? Array.from(seqRef.current.querySelectorAll('img')) : [];
    let loaded = 0;
    if (imgs.length === 0) {
      measure();
    } else {
      imgs.forEach((img) => {
        if (img.complete) {
          loaded += 1;
        } else {
          img.addEventListener('load', () => {
            loaded += 1;
            if (loaded === imgs.length) measure();
          });
          img.addEventListener('error', () => {
            loaded += 1;
            if (loaded === imgs.length) measure();
          });
        }
      });
      if (loaded === imgs.length) measure();
    }

    const onResize = () => {
      clearTimeout(onResize._t);
      // @ts-ignore
      onResize._t = setTimeout(measure, 120);
    };
    window.addEventListener('resize', onResize);

    const t = setTimeout(measure, 400);

    return () => {
      mounted = false;
      window.removeEventListener('resize', onResize);
      clearTimeout(t);
    };
  }, []);

  const buildGroupSrcs = (count) => {
    const out = [];
    for (let i = 0; i < count; i++) {
      out.push(logos[i % logos.length]);
    }
    return out;
  };

  const renderFromSrcs = (srcs, imgLoading = 'lazy') =>
    srcs.map((src, i) => (
      <LogoTile key={`tile-${i}`} src={src} alt={`brand-${i}`} imgLoading={imgLoading} />
    ));

  return (
    <section className="bg-white py-10 border-y border-neutral-200/60">
      <div className="w-full px-6 sm:px-10 md:px-16 lg:px-24 xl:px-28">
        <div className="flex flex-col items-center gap-2 mb-6">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-neutral-600">
            Our brand partners
          </p>
          <p className="text-center text-neutral-600 text-sm sm:text-base max-w-xl">
            We proudly stock a curated selection of trusted household, kitchen and electronics brands loved by Sri Lankans.
          </p>
        </div>
      </div>
      <div className="overflow-hidden w-full mt-2 px-6 sm:px-10 md:px-16 lg:px-24 xl:px-28" ref={containerRef}>
        <div className="relative overflow-hidden px-2">
          {/* gray overlay edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white via-white/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white via-white/80 to-transparent" />

          {/* Single right-to-left train */}
          <div
            className="marquee-track animate-train"
            style={{ whiteSpace: 'nowrap', display: 'inline-flex', gap: '1.5rem' }}
          >
            <div
              ref={seqRef}
              style={{ display: 'inline-block', visibility: 'hidden', position: 'absolute', pointerEvents: 'none' }}
            >
              <div style={{ display: 'inline-flex' }}>{renderFromSrcs(buildGroupSrcs(tilesPerGroup), 'eager')}</div>
            </div>

            <div style={{ display: 'inline-flex' }}>{renderFromSrcs(buildGroupSrcs(tilesPerGroup))}</div>
            <div style={{ display: 'inline-flex' }}>{renderFromSrcs(buildGroupSrcs(tilesPerGroup))}</div>
            <div style={{ display: 'inline-flex' }}>{renderFromSrcs(buildGroupSrcs(tilesPerGroup))}</div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes train {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.3333%); }
          }
          .animate-train {
            /* slowed down for a calmer brand wall */
            animation: train 90s linear infinite;
          }
        `}
      </style>
    </section>
  );
};

export default BrandsMarquee;
