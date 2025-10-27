import React from 'react';
import placeholderLogos from '../../assets/brands';

// Small tile for a single logo (keeps 1:1 square and padding)
const LogoTile = ({ src, alt, imgLoading = 'lazy' }) => (
  <div className="w-24 h-24 p-2 flex items-center justify-center mx-4" aria-hidden>
    <div className="w-full h-full flex items-center justify-center">
      <img
        src={src}
        alt={alt}
          className="max-w-full max-h-full object-contain"
        loading={imgLoading}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = 'https://via.placeholder.com/200x200?text=No+Logo';
        }}
      />
    </div>
  </div>
);

const Brands = () => {
  // We'll render two tracks: measure a single sequence and repeat it enough times
  // so the total marquee content is at least 2x the visible container width (prevents empty gaps).
  const containerRef = React.useRef(null);
  const seqRef = React.useRef(null); // measures one sequence block (one A group)
  // Use a fixed, defined order for logos (no randomization)
  const logos = placeholderLogos;

  const [repeats, setRepeats] = React.useState(2);
  // number of tiles to include in one group A (we'll build A by cycling logos)
  const [tilesPerGroup, setTilesPerGroup] = React.useState(logos.length);

  React.useEffect(() => {
    let mounted = true;

    const measure = () => {
      const containerW = containerRef.current ? containerRef.current.offsetWidth : 0;
      if (!containerW) return;

      // Try to measure step between two adjacent tiles (includes tile width + margin/gap)
  const imgs = seqRef.current ? Array.from(seqRef.current.querySelectorAll('img')) : [];
      if (imgs.length >= 2) {
        const r0 = imgs[0].getBoundingClientRect();
        const r1 = imgs[1].getBoundingClientRect();
        const step = Math.abs(r1.left - r0.left) || Math.abs(r1.right - r0.left);
        if (step > 0) {
          // ensure the sequence A is at least as wide as the container (plus a small buffer)
          const neededTiles = Math.max(1, Math.ceil(containerW / step) + 2);
          // set both tilesPerGroup and repeats so visible rendering uses this count
          if (mounted) {
            setTilesPerGroup(neededTiles);
            setRepeats(1); // we build group by tilesPerGroup, so repeats=1 (we'll duplicate group A)
          }
          return;
        }
      }

      // If we couldn't measure two adjacent images, try using a single image width as fallback.
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

      // Fallback: measure the whole seqRef width (if present) and decide how many full lists fit
      const seqW = seqRef.current ? seqRef.current.offsetWidth : 0;
      if (!seqW) return;
      const listsNeeded = Math.max(1, Math.ceil(containerW / seqW) + 1);
      if (mounted) setRepeats(listsNeeded);
    };

    // measure after images load inside the seqRef
  const imgs = seqRef.current ? Array.from(seqRef.current.querySelectorAll('img')) : [];
    let loaded = 0;
    if (imgs.length === 0) {
      // nothing to wait for
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
      // in case all were already complete
      if (loaded === imgs.length) measure();
    }

    // re-measure on resize
    const onResize = () => {
      // small debounce
      clearTimeout(onResize._t);
      onResize._t = setTimeout(measure, 120);
    };
    window.addEventListener('resize', onResize);

    // also measure after a short timeout in case of delayed loads
    const t = setTimeout(measure, 400);

    return () => {
      mounted = false;
      window.removeEventListener('resize', onResize);
      clearTimeout(t);
    };
  }, []);

  // build group A by cycling shuffledLogos until we have `count` tiles
  const buildGroupSrcs = (count) => {
    const out = [];
    for (let i = 0; i < count; i++) {
      out.push(logos[i % logos.length]);
    }
    return out;
  };

  // render src array into LogoTile nodes
  const renderFromSrcs = (srcs, imgLoading = 'lazy') =>
    srcs.map((src, i) => (
      <LogoTile key={`tile-${i}`} src={src} alt={`brand-${i}`} imgLoading={imgLoading} />
    ));

  return (
    <section className="bg-white py-4">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section title styled like AboutHero - aligned to the right */}
        <div className="flex">
          <div className="ml-auto pt-8 text-right">
            <h2 className="text-[#161616] font-heading font-medium text-[46px] leading-[44px] tracking-tight md:text-[46px] md:leading-[44px] max-w-[700px]">
              Explore products from your favorite brands today!
            </h2>
          </div>
        </div>
      </div>
      <div className="overflow-hidden w-full mt-6" ref={containerRef}>
        {/* Right to left train */}
        <div className="overflow-hidden px-2">
          <div
            className="marquee-track animate-train"
            style={{ whiteSpace: 'nowrap', display: 'inline-flex', gap: '1.5rem' }}
          >
            {/* Render a hidden measured sequence (A) using the shuffled logos */}
            <div ref={seqRef} style={{ display: 'inline-block', visibility: 'hidden', position: 'absolute', pointerEvents: 'none' }}>
              {/* Measure one sequence A using eager images built from tilesPerGroup */}
              <div style={{ display: 'inline-flex' }}>{renderFromSrcs(buildGroupSrcs(tilesPerGroup), 'eager')}</div>
            </div>

      {/* Render visible flattened group A (tilesPerGroup tiles) and duplicate it multiple times (A A A)
        Using three copies and animating by -33.333% produces a seamless circular train without gaps. */}
      <div style={{ display: 'inline-flex' }}>{renderFromSrcs(buildGroupSrcs(tilesPerGroup))}</div>
      <div style={{ display: 'inline-flex' }}>{renderFromSrcs(buildGroupSrcs(tilesPerGroup))}</div>
      <div style={{ display: 'inline-flex' }}>{renderFromSrcs(buildGroupSrcs(tilesPerGroup))}</div>
          </div>
        </div>

        {/* Left to right train */}
        <div className="overflow-hidden px-2 mt-4">
          <div
            className="marquee-track animate-train-ltr"
            style={{ whiteSpace: 'nowrap', display: 'inline-flex', gap: '1.5rem' }}
          >
            {/* LTR train uses the same duplicated flattened A A A sequence */}
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
          @keyframes train-ltr {
            0% { transform: translateX(-33.3333%); }
            100% { transform: translateX(0); }
          }
          .animate-train {
            animation: train 48s linear infinite;
          }
          .animate-train-ltr {
            animation: train-ltr 48s linear infinite;
          }
        `}
      </style>
    </section>
  );
};

export default Brands;
