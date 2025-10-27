import { StarIcon } from '@heroicons/react/20/solid';
import { FiInfo, FiPackage } from 'react-icons/fi';
// Removed static products import; now fetching from backend API
import { useParams } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import Navbar from '../components/layout/Navbar';
import StarReview from '../components/ui/StarReview';
import BuyNowBtn from '../components/ui/BuyNowBtn';
import AddToCartBtn from '../components/ui/AddToCartBtn';
import AddToWishlistBtn from '../components/ui/AddToWishlistBtn';
import QuantityInput from '../components/ui/QuantityInput';
import StatusPill from '../components/ui/StatusPill';
import PriceTag from '../components/products/PriceTag';
import ProductTabs from '../components/products/ProductTabs';
import YouMayAlsoLike from '../components/products/YouMayAlsoLike';
import { getProductDetails, getProduct, searchProducts } from '../api/productApi';
import { listReviewsByProduct } from '../api/reviewApi';

// Helper to normalize product shape differences between mock/static and backend
function normalizeProduct(p) {
  if (!p) return null;

  // Primary image precedence order
  const primary = p.primaryImageUrl || p.mainImageUrl || p.primaryImage || p.image || '';

  // Collect possible secondary/gallery arrays
  let secondary = [];
  const candidates = [p.secondaryImages, p.galleryImages, p.imageUrls];
  for (const c of candidates) {
    if (Array.isArray(c)) {
      secondary.push(...c);
    } else if (typeof c === 'string') {
      // Support comma / semicolon delimited strings (defensive)
      secondary.push(...c.split(/[;,]/).map(s => s.trim()).filter(Boolean));
    }
  }
  // Remove falsy, trim, and exclude primary duplicate
  secondary = secondary
    .map(u => (u || '').trim())
    .filter(u => u && u !== primary);
  // Dedupe while preserving order
  const seen = new Set();
  secondary = secondary.filter(u => (seen.has(u) ? false : (seen.add(u), true)));

  const longDesc = p.detailedDescription || p.details || p.longDescription || p.description || '';
  const shortDesc = p.shortDescription || '';

  // Derive options from backend variations if provided
  const variations = Array.isArray(p.variations) ? p.variations : [];
  const colorsFromVars = Array.from(new Set(variations.map(v => (v.attributes?.Color || v.attributes?.color || '').trim()).filter(Boolean)));
  const sizesFromVars = Array.from(new Set(variations.map(v => (v.attributes?.Size || v.attributes?.size || '').trim()).filter(Boolean)));
  // Build availability map color -> size -> status based on stock
  let availability = null;
  if (variations.length) {
    availability = {};
    for (const v of variations) {
      const col = (v.attributes?.Color || v.attributes?.color || '').trim() || 'Default';
      const size = (v.attributes?.Size || v.attributes?.size || '').trim() || 'Default';
      const status = Number(v.stock || 0) > 0 ? 'in stock' : 'out of stock';
      if (!availability[col]) availability[col] = {};
      availability[col][size] = status;
    }
  }
  return {
    id: p.id,
    name: p.name || p.title || 'Unnamed Product',
    // Short summary line used near price (fallback to truncated long if short missing)
    description: shortDesc || (longDesc.length > 160 ? longDesc.slice(0,160).trim() + '…' : longDesc),
    // Full long description used in tabs
    detailedDescription: longDesc,
    details: longDesc,
    image: primary,
    secondaryImages: secondary,
    highlights: p.highlights || p.bullets || [],
  price: p.basePrice || p.price, // fallback; UI will override by selected variant when available
    compareAtPrice: p.compareAtPrice || p.mrp || null,
    category: p.categoryName || p.category || (p.categoryDto?.name) || '',
    rating: p.rating || p.review || 0,
  numOfReviews: p.numOfReviews || p.reviewCount || 0,
  sku: p.sku || p.SKU || p.skuCode || null,
  availableColors: (p.availableColors || p.colors || []).length ? (p.availableColors || p.colors) : colorsFromVars,
    availableSizes: (p.availableSizes || p.sizes || []).length ? (p.availableSizes || p.sizes) : sizesFromVars,
    // prefer availability built from variations, else pass-through legacy
    availability: availability || p.availability || p.stockStatus || p.stock || null,
    variations: variations,
  };
}

export default function ProductDetails() {
  const { sku } = useParams();
  const [rawProduct, setRawProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true); setError(null);
      try {
        // We accept either a SKU string or a numeric id in the URL param for backward compatibility.
        const isNumeric = (v) => /^\d+$/.test(String(v || ''));
        let p = null;
        if (sku && !isNumeric(sku)) {
          // Try lookup by SKU using search endpoint (backend supports sku query)
          try {
            const page = await searchProducts({ sku });
            const fromSku = page?.content && page.content[0] ? page.content[0] : null;
            if (fromSku) {
              // After shallow fetch by SKU, get full details by id
              try { p = await getProductDetails(fromSku.id); } catch (e) {
                p = await getProduct(fromSku.id);
              }
            }
          } catch (_E) {
            // ignore and fallback below
          }
        }
        // If SKU path param was numeric or SKU lookup failed, attempt direct by id
        if (!p && sku) {
          const idNum = isNumeric(sku) ? Number(sku) : null;
          if (idNum != null) {
            try { p = await getProductDetails(idNum); } catch (_E2) { p = await getProduct(idNum); }
          }
        }
        // If still not found and we somehow have a product id on state, leave as not found
        if (active) {
          setRawProduct(p);
          // fetch reviews separately and attach
          try {
            if (p?.id) {
              const rev = await listReviewsByProduct(p.id);
              if (active) setRawProduct((cur) => ({ ...(p || cur), reviews: rev }));
            }
          } catch (_E3) {
            // ignore review load errors
          }
        }
      } catch (_E4) {
        if (active) setError(_E4);
      } finally {
        if (active) setLoading(false);
      }
    }
    if (sku) load();
    return () => { active = false; };
  }, [sku]);

  const product = useMemo(() => normalizeProduct(rawProduct), [rawProduct]);

  // Derived / interactive state depends on product (reset when product changes)
  const colorOptions = product?.availableColors || [];
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty, setQty] = useState(1);
  // Sizes sorted by increasing variation price; prefer prices for selectedColor
  const sortedSizes = useMemo(() => {
    if (!product) return [];
    const vars = Array.isArray(product.variations) ? product.variations : [];
    // If no variations, fall back to availableSizes order
    if (!vars.length) {
      return Array.isArray(product?.availableSizes) ? [...product.availableSizes] : [];
    }
    const norm = (s) => (s ?? '').toString().trim();
    const selColor = (selectedColor ?? '').toLowerCase();
    const sizeMap = new Map(); // size -> { colorPrice?: number, anyMin?: number }
    for (const v of vars) {
      const attrs = v.attributes || {};
      const color = norm(attrs.Color || attrs.color).toLowerCase();
      const size = norm(attrs.Size || attrs.size) || 'Default';
      const price = Number(v.price ?? v.basePrice ?? product.price ?? Number.POSITIVE_INFINITY);
      const cur = sizeMap.get(size) || { colorPrice: undefined, anyMin: undefined };
      if (selColor && color === selColor) {
        cur.colorPrice = Math.min(cur.colorPrice ?? Number.POSITIVE_INFINITY, price);
      }
      cur.anyMin = Math.min(cur.anyMin ?? Number.POSITIVE_INFINITY, price);
      sizeMap.set(size, cur);
    }
    const arr = Array.from(sizeMap.entries()).map(([size, info]) => {
      const effective = (selColor && info.colorPrice !== undefined && isFinite(info.colorPrice))
        ? info.colorPrice
        : (info.anyMin ?? Number.POSITIVE_INFINITY);
      return { size, price: effective };
    });
    arr.sort((a, b) => (a.price === b.price ? a.size.localeCompare(b.size) : a.price - b.price));
    return arr.map(x => x.size);
  }, [product, selectedColor]);

  // Initialize/adjust selections without unnecessary resets
  useEffect(() => {
    if (!selectedColor || !colorOptions.includes(selectedColor)) {
      setSelectedColor(colorOptions.length ? colorOptions[0] : null);
    }
    if (!selectedSize || !sortedSizes.includes(selectedSize)) {
      setSelectedSize(sortedSizes.length ? sortedSizes[0] : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorOptions, sortedSizes]);

  // Derive rating and number of reviews: prefer fields from product; else compute from attached reviews
  const numReviews = useMemo(() => {
     const revs = rawProduct?.reviews;
     const backendCount = typeof product?.numOfReviews === 'number' ? product.numOfReviews : null;
     if (Array.isArray(revs)) return revs.length;
     return backendCount ?? 0;
  }, [product?.numOfReviews, rawProduct?.reviews]);
  const rating = useMemo(() => {
      const revs = rawProduct?.reviews;
      const backendRating = typeof product?.rating === 'number' ? product.rating : null;
      if (Array.isArray(revs) && revs.length) {
        const sum = revs.reduce((s, r) => s + (Number(r.rating) || Number(r.stars) || 0), 0);
        return Math.round((sum / revs.length) * 10) / 10;
      }
      return backendRating ?? 0;
  }, [product?.rating, rawProduct?.reviews]);

  const availabilityStatus = useMemo(() => {
    if (!product) return null;
    if (product.availability && typeof product.availability === 'object') {
      const color = selectedColor || Object.keys(product.availability)[0];
      const size = selectedSize || (color && product.availability[color] ? Object.keys(product.availability[color])[0] : null);
      let status = 'in stock';
      if (color && size && product.availability[color] && product.availability[color][size]) {
        status = product.availability[color][size];
      }
      return status;
    } else if (product.availability) {
      return product.availability;
    }
    return null;
  }, [product, selectedColor, selectedSize]);

  const allImages = useMemo(() => {
    if (!product) return [];
    // Build full list, remove duplicates
    const arr = [product.image, ...(product.secondaryImages || [])].filter(Boolean);
    const uniq = [];
    const seen = new Set();
    for (const u of arr) { if (!seen.has(u)) { seen.add(u); uniq.push(u); } }
    return uniq.length ? uniq : ['https://via.placeholder.com/600x600?text=No+Image'];
  }, [product]);
  const [selectedImg, setSelectedImg] = useState(null);
  useEffect(() => { setSelectedImg(allImages[0]); }, [allImages]);

  const breadcrumbs = useMemo(() => ([
    { id: 0, name: 'Home', href: '/' },
    product?.category ? { id: 1, name: product.category, href: `/category/${encodeURIComponent(product.category)}` } : null,
  ].filter(Boolean)), [product]);

  // Compute selected variation and effective price/stock
  const selectedVariation = useMemo(() => {
    if (!product || !Array.isArray(product.variations) || product.variations.length === 0) return null;
    const col = selectedColor?.toLowerCase();
    const sz = selectedSize?.toLowerCase();
    // Try exact match
    let match = product.variations.find(v => {
      const a = v.attributes || {};
      const vc = (a.Color || a.color || '').toLowerCase();
      const vs = (a.Size || a.size || '').toLowerCase();
      return (col ? vc === col : true) && (sz ? vs === sz : true);
    });
    if (match) return match;
    // Fallback pick first
    return product.variations[0];
  }, [product, selectedColor, selectedSize]);

  const effectivePrice = selectedVariation?.price ?? product?.price;
  const effectiveStock = selectedVariation?.stock ?? null;

  // Compute how many units are left based on the selected variation (fallback to aggregate)
  const unitsLeft = useMemo(() => {
    if (selectedVariation && selectedVariation.stock != null) {
      const n = Number(selectedVariation.stock);
      return Number.isFinite(n) ? Math.max(0, n) : null;
    }
    if (Array.isArray(product?.variations) && product.variations.length) {
      const selColor = selectedColor?.toLowerCase();
      const selSize = selectedSize?.toLowerCase();
      const filtered = product.variations.filter(v => {
        const a = v.attributes || {};
        const vc = (a.Color || a.color || '').toLowerCase();
        const vs = (a.Size || a.size || '').toLowerCase();
        return (selColor ? vc === selColor : true) && (selSize ? vs === selSize : true);
      });
      const sum = filtered.reduce((s, v) => s + (Number(v.stock) || 0), 0);
      return Math.max(0, sum);
    }
    return null;
  }, [product, selectedVariation, selectedColor, selectedSize]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-12 text-center text-gray-500">Loading product...</div>
      </>
    );
  }
  if (error) {
    return (
      <>
        <Navbar />
        <div className="p-12 text-center text-red-500">Failed to load product: {error.message || 'Unknown error'}</div>
      </>
    );
  }
  if (!product) {
    return (
      <>
        <Navbar />
        <div className="p-12 text-center text-xl text-red-500">Product not found.</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-white">
        <div className="pt-6">
          <nav aria-label="Breadcrumb">
            <ol role="list" className="flex max-w-2xl items-center space-x-2 pl-6 sm:pl-10 lg:max-w-7xl lg:pl-16">
              {breadcrumbs.map((breadcrumb) => (
                <li key={breadcrumb.id}>
                  <div className="flex items-center leading-none whitespace-nowrap">
                    <a href={breadcrumb.href} className="mr-2 text-sm font-medium text-gray-900">
                      {breadcrumb.id === 0 && (
                        <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" className="inline-block mr-1 align-text-bottom" width="20" height="20">
                          <path d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clip-rule="evenodd" fill-rule="evenodd"></path>
                        </svg>
                      )}
                      {breadcrumb.name}
                    </a>
                    <svg
                      fill="currentColor"
                      width={16}
                      height={20}
                      viewBox="0 0 16 20"
                      aria-hidden="true"
                      className="h-5 w-4 text-gray-300"
                    >
                      <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                    </svg>
                  </div>
                </li>
              ))}
              <li className="text-sm">
                <a href="#" aria-current="page" className="font-large text-gray-500 hover:text-gray-600">
                  {product.name}
                </a>
              </li>
            </ol>
          </nav>

          {/* Product main flex layout */}
          <div className="mt-6 max-w-5xl pl-6 sm:pl-10 lg:max-w-[800px] lg:pl-16">
            <div className="flex flex-col gap-8 lg:flex-row">
              {/* Image gallery */}
              <div className="flex-1 flex justify-start items-start">
                {/* Side images - sticky gallery */}
                <div className="flex flex-row gap-8 sticky top-24 self-start">
                  <div className="flex flex-col gap-4 justify-start max-h-[550px] pr-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                    {allImages.map((img, idx) => (
                      <button
                        type="button"
                        key={img + idx}
                        className={`bg-gray-100 flex items-center justify-center w-[110px] h-[110px] cursor-pointer border transition focus:outline-none overflow-hidden ${selectedImg === img ? 'border-2 border-black' : 'border-transparent hover:border-gray-300'}`}
                        onClick={() => setSelectedImg(img)}
                        aria-label={`Select image ${idx + 1}`}
                      >
                        <img
                          alt={product.name + ' thumbnail ' + (idx + 1)}
                          src={img}
                          className="object-contain w-full h-full"
                          loading={idx > 2 ? 'lazy' : 'eager'}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="bg-gray-100 flex items-center justify-center w-[550px] h-[550px] min-w-[300px] min-h-[300px]">
                    <img
                      alt={product.name}
                      src={selectedImg}
                      className="object-contain w-full h-full aspect-square"
                      style={{ border: '3px solid #d1d5db', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
              {/* Product info and options */}
              <div className="flex-[1.2] flex flex-col gap-3 lg:ml-6 w-full">
                <h1 className="text-6xl font-medium tracking-tight">{product.name}</h1>
                <div className="flex items-center justify-start gap-6">
                  <StarReview rating={rating} numReviews={numReviews} size={20} showCount={true} />
                  <div className="text-md text-gray-500 flex items-center gap-3">
                    {product.sku && (
                      <div className="mr-2">SKU: <span className="font-medium text-gray-900">{product.sku}</span></div>
                    )}
                    {availabilityStatus && (
                      <StatusPill status={availabilityStatus} />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 gap-4">
                  <PriceTag price={effectivePrice} compareAtPrice={product.compareAtPrice || null} currency={'LKR'} />
                </div>
                <p className="text-xs font-medium text-gray-500 -mt-3 pt-0 flex items-center gap-2">
                  <FiInfo className="text-gray-400" aria-hidden="true" />
                  <span><span className='underline'><a href="">Shipping</a></span> calculated at checkout.</span>
                </p>
                <div className="space-y-1 mt-1">
                  <p className="text-base text-gray-900">{product.description}</p>
                </div>

                <div className="">
                  <div className="mt-2">
                    {/* Color option chooser (if available) */}
                    {colorOptions.length > 0 && (
                      <form className="mb-5">
                        <div>
                          <h3 className="mb-2 text-md text-gray-700">Color: <span className="font-medium text-gray-900">{selectedColor}</span></h3>
                          <fieldset aria-label="Choose a color" className="mt-3">
                            <div className="flex items-center gap-x-3">
                              {colorOptions.map((color) => (
                                <div key={color} className="flex outline -outline-offset-1 outline-black/10">
                                  <input
                                    type="radio"
                                    name="color"
                                    value={color}
                                    checked={selectedColor === color}
                                    aria-label={color}
                                    className={`size-8 appearance-none forced-color-adjust-none checked:outline-2 checked:outline-offset-2 focus-visible:outline-3 focus-visible:outline-offset-3 ${color === 'White' ? 'bg-white checked:outline-gray-400' : color === 'Black' ? 'bg-gray-900 checked:outline-gray-900' : color === 'Red' ? 'bg-red-500 checked:outline-red-500' : color === 'Blue' ? 'bg-blue-500 checked:outline-blue-500' : color === 'Green' ? 'bg-green-500 checked:outline-green-500' : color === 'Silver' ? 'bg-gray-300 checked:outline-gray-400' : 'bg-gray-200 checked:outline-gray-400'}`}
                                    onChange={() => setSelectedColor(color)}
                                  />
                                </div>
                              ))}
                            </div>
                          </fieldset>
                        </div>
                      </form>
                    )}

                    {/* Size option chooser (if available) */}
                    {sortedSizes && sortedSizes.length > 0 && (
                      <div className="mt-4 mb-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-md font-medium text-gray-900">Size</h3>
                          {/* <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Size guide</a> */}
                        </div>
                        <fieldset aria-label="Choose a size" className="mt-4">
                          <div className="grid grid-cols-4 gap-3">
                            {sortedSizes.map((size) => (
                              <label
                                key={size}
                                aria-label={size}
                                className={`group relative flex items-center justify-center border border-gray-300 bg-white p-2.5 cursor-pointer`}
                                style={selectedSize === size ? { backgroundColor: 'rgb(30, 42, 56)', borderColor: 'rgb(30, 42, 56)' } : {}}
                              >
                                <input
                                  type="radio"
                                  name="size"
                                  value={size}
                                  checked={selectedSize === size}
                                  onChange={() => setSelectedSize(size)}
                                  className="absolute inset-0 appearance-none focus:outline-none"
                                />
                                <span
                                  className="text-sm font-medium uppercase"
                                  style={selectedSize === size ? { color: '#fff' } : { color: '#1e2a38' }}
                                >
                                  {size}
                                </span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      </div>
                    )}
                    {/* Units left display */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <FiPackage className={`${unitsLeft > 0 ? 'text-green-600' : 'text-red-600'} w-5 h-5 flex-shrink-0`} aria-hidden="true" />
                        {unitsLeft != null ? (
                          unitsLeft > 0 ? (
                            <span className="text-green-700 font-semibold">
                              Hurry! Only {unitsLeft} {unitsLeft === 1 ? 'item' : 'items'} left in stock.
                            </span>
                          ) : (
                            <span className="text-red-600 font-semibold">Out of stock</span>
                          )
                        ) : (
                          <span className="text-gray-500">Availability info unavailable</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 mb-6">
                      {/* First row: quantity + add to cart + add to wishlist */}
                      <div className="flex flex-row items-center gap-4">
                        <QuantityInput value={qty} onChange={setQty} min={1} max={15} />
                        <AddToCartBtn product={{ ...product, selectedVariationId: selectedVariation?.id, price: effectivePrice, color: selectedColor, size: selectedSize, stock: unitsLeft ?? effectiveStock }} quantity={qty} />
                        <AddToWishlistBtn product={{ ...product, selectedVariationId: selectedVariation?.id, color: selectedColor, size: selectedSize }} />
                      </div>
                      {/* Second row: buy now spanning same width area */}
                      <div className="flex flex-row items-center">
                        <BuyNowBtn product={{ ...product, selectedVariationId: selectedVariation?.id, color: selectedColor, size: selectedSize }} fullWidth />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product tabs (description, shipping, reviews) placed under the image/buying section */}
          <div className="w-full mt-8">
            <ProductTabs
              product={product ? { ...product, detailedDescription: product.detailedDescription || product.details || product.description } : null}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
            />
          </div>

          {/* Divider between product details and recommendations */}
          <div className="mt-10">
            <div className="mx-auto w-full max-w-8xl px-6">
              <hr className="border-t border-gray-200" />
            </div>
          </div>

          {/* Related products section */}
          <YouMayAlsoLike
            categoryName={product?.category || ''}
            excludeId={product?.id}
            title="You may also like"
          />
        </div>
      </div>
    </>
  )
}
