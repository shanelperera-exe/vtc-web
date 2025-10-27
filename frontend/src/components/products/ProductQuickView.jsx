import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/20/solid';
import StarReview from '../ui/StarReview';
import { useNavigate } from 'react-router-dom';
import { listAllVariations } from '../../api/productApi';
import AddToCartBtn from '../ui/AddToCartBtn';
import { FiInfo } from 'react-icons/fi';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function formatCurrency(v) {
  if (v == null) return '—';
  if (typeof v === 'number') return `LKR ${Number(v).toLocaleString()}`;
  const n = Number(String(v).replace(/[^0-9.]/g, ''));
  if (!isNaN(n)) return `LKR ${n.toLocaleString()}`;
  return String(v);
}

export default function ProductQuickView({ product = {}, open = false, onClose = () => {} }) {
  const navigate = useNavigate();
  const qvProduct = product || {};

  // Fetch variations to determine real available colors/sizes
  const [variations, setVariations] = useState([]);
  const [loadingVars, setLoadingVars] = useState(false);
  const [varError, setVarError] = useState(null);

  const productId = qvProduct.productId || qvProduct.id;

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!open || !productId) return;
      setLoadingVars(true); setVarError(null);
      try {
        const res = await listAllVariations(productId);
        if (ignore) return;
        // Normalize: expect [{id, price, stock, imageUrl, attributes:{ Color:'Red', Size:'M', ...}}]
        setVariations(Array.isArray(res) ? res : []);
      } catch (e) {
        if (!ignore) setVarError(e?.message || 'Failed to load options');
      } finally {
        if (!ignore) setLoadingVars(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [open, productId]);

  // Derive sets of colors and sizes from variations' attributes
  const { colors, sizes } = useMemo(() => {
    const colorSet = new Map();
    // sizeMap will store min price per size and stock flag
    const sizeMap = new Map();
    const push = (map, id, name, classes) => { if (!map.has(id)) map.set(id, { id, name, classes }); };
    variations.forEach(v => {
      const attrs = v?.attributes || {};
      // Find keys case-insensitively
      const keys = Object.keys(attrs);
      const findKey = (needle) => keys.find(k => (k?.toLowerCase?.()||'') === needle || (k?.toLowerCase?.()||'').includes(needle));
      const colorKey = findKey('color') || findKey('colour');
      const sizeKey = findKey('size');
      const colorVal = colorKey ? String(attrs[colorKey]) : undefined;
      const sizeVal = sizeKey ? String(attrs[sizeKey]) : undefined;
      if (colorVal) {
        // Map color to tailwind class heuristically (fallback gray)
        const cls = colorToClass(colorVal);
        push(colorSet, colorVal, colorVal, cls);
      }
      if (sizeVal) {
        const price = Number(v?.price ?? v?.salePrice ?? 0) || 0;
        const inStock = (v?.stock ?? v?.stockLevel ?? 1) > 0;
        if (!sizeMap.has(sizeVal)) {
          sizeMap.set(sizeVal, { id: sizeVal, name: sizeVal, minPrice: price, inStock });
        } else {
          const existing = sizeMap.get(sizeVal);
          existing.minPrice = Math.min(existing.minPrice ?? Infinity, price);
          existing.inStock = existing.inStock || inStock;
          sizeMap.set(sizeVal, existing);
        }
      }
    });

    const sizesArr = Array.from(sizeMap.values()).map(s => ({ id: s.id, name: s.name, inStock: s.inStock, minPrice: s.minPrice }));
    // sort by price low -> high
    sizesArr.sort((a, b) => (a.minPrice || 0) - (b.minPrice || 0));

    return {
      colors: Array.from(colorSet.values()),
      sizes: sizesArr,
    };
  }, [variations]);

  // Current selections
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // Reset selections when options change or dialog opens
  useEffect(() => {
    if (!open) return;
    setSelectedColor(colors?.[0]?.id || null);
    setSelectedSize(sizes?.[0]?.id || null);
  }, [open, colors, sizes]);

  // Find matching variation id
  const matchedVariation = useMemo(() => {
    if (!variations.length) return null;
    return variations.find(v => {
      const attrs = v?.attributes || {};
      const keys = Object.keys(attrs);
      const findKey = (needle) => keys.find(k => (k?.toLowerCase?.()||'') === needle || (k?.toLowerCase?.()||'').includes(needle));
      const cKey = findKey('color') || findKey('colour');
      const sKey = findKey('size');
      const c = cKey ? String(attrs[cKey]) : undefined;
      const s = sKey ? String(attrs[sKey]) : undefined;
      return (!selectedColor || c === selectedColor) && (!selectedSize || s === selectedSize);
    }) || null;
  }, [variations, selectedColor, selectedSize]);

  const addToCartPayload = useMemo(() => {
    const priceNum = Number(qvProduct.price?.toString().replace(/[^0-9.]/g, '')) || 0;
    return {
      id: matchedVariation?.id, // fallback handled by CartContext
      selectedVariationId: matchedVariation?.id,
      name: qvProduct.name,
      imageUrl: qvProduct.imageSrc,
      price: matchedVariation?.price ?? priceNum,
      color: selectedColor || undefined,
      size: selectedSize || undefined,
    };
  }, [matchedVariation, qvProduct.name, qvProduct.imageSrc, qvProduct.price, selectedColor, selectedSize]);

  function colorToClass(color) {
    const c = String(color).toLowerCase();
    if (c.includes('white')) return 'bg-white checked:outline-gray-400';
    if (c.includes('black')) return 'bg-black checked:outline-gray-900';
    if (c.includes('gray') || c.includes('grey')) return 'bg-gray-300 checked:outline-gray-400';
    if (c.includes('red')) return 'bg-red-500 checked:outline-red-600';
    if (c.includes('blue')) return 'bg-blue-500 checked:outline-blue-600';
    if (c.includes('green')) return 'bg-green-500 checked:outline-green-600';
    if (c.includes('yellow')) return 'bg-yellow-400 checked:outline-yellow-500';
    if (c.includes('purple') || c.includes('violet')) return 'bg-purple-500 checked:outline-purple-600';
    if (c.includes('pink')) return 'bg-pink-400 checked:outline-pink-500';
    if (c.includes('orange')) return 'bg-orange-400 checked:outline-orange-500';
    if (c.includes('brown')) return 'bg-amber-700 checked:outline-amber-800';
    return 'bg-gray-200 checked:outline-gray-400';
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 hidden bg-gray-500/75 transition-opacity data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in md:block"
      />

  <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-stretch justify-center text-center md:items-center md:px-2 lg:px-4">
          <DialogPanel
            transition
            className="flex w-full max-w-full box-border transform text-left text-base transition data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-enter:ease-out data-leave:duration-200 data-leave:ease-in md:my-8 md:max-w-2xl md:px-4 data-closed:md:translate-y-0 data-closed:md:scale-95 lg:max-w-4xl"
          >
            <div className="relative flex w-full items-center overflow-y-auto overflow-x-hidden max-h-[90vh] bg-white px-4 pt-14 pb-8 shadow-2xl sm:px-6 sm:pt-8 md:p-6 lg:p-8 border-2 border-black">
              <button
                type="button"
                onClick={() => onClose(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 sm:top-8 sm:right-6 md:top-6 md:right-6 lg:top-8 lg:right-8"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon aria-hidden="true" className="size-8" />
              </button>

              <div className="grid w-full grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-12 lg:gap-x-8">
                {qvProduct.imageSrc ? (
                  <img
                    alt={qvProduct.imageAlt}
                    src={qvProduct.imageSrc}
                    className="w-full max-w-full h-auto bg-gray-100 object-cover sm:col-span-4 lg:col-span-5"
                    style={{ maxHeight: '60vh', width: '100%', objectFit: 'cover', border: '3px solid #d1d5db', boxSizing: 'border-box' }}
                  />
                ) : (
                  <div className="w-full max-w-full h-auto bg-gray-100 sm:col-span-4 lg:col-span-5 flex items-center justify-center text-gray-400" style={{ maxHeight: '60vh', border: '3px solid #d1d5db', boxSizing: 'border-box' }}>No Image</div>
                )}
                <div className="sm:col-span-8 lg:col-span-7">
                  <h2 className="text-3xl font-semibold text-gray-900 sm:pr-12">{qvProduct.name}</h2>

                  <section aria-labelledby="information-heading" className="mt-2">
                    <h3 id="information-heading" className="sr-only">
                      Product information
                    </h3>

                    <p className="text-2xl text-gray-900">{
                      (function(){
                        // show matched variation price if available, otherwise product price
                        const varPrice = matchedVariation?.price;
                        if (varPrice != null) return formatCurrency(varPrice);
                        // try to format product.price (may be string like "LKR 1,234")
                        if (qvProduct.price == null) return '—';
                        const parsed = Number(String(qvProduct.price).replace(/[^0-9.]/g, ''));
                        return (!isNaN(parsed) && parsed !== 0) ? formatCurrency(parsed) : String(qvProduct.price);
                      })()
                    }</p>

                    {/* Reviews (use same StarReview component as product details) */}
                    <div className="mt-6">
                      <h4 className="sr-only">Reviews</h4>
                      {/* Inline stars and count for consistent alignment */}
                      <div className="flex items-center">
                        <StarReview rating={qvProduct.rating || 0} numReviews={qvProduct.reviewCount || 0} size={18} showCount={true} />
                      </div>
                    </div>
                  </section>

                  <section aria-labelledby="options-heading" className="mt-6">
                    <h3 id="options-heading" className="sr-only">
                      Product options
                    </h3>

                    <form onSubmit={(e) => { e.preventDefault(); navigate(qvProduct.href); }}>
                      {/* Colors */}
                      <fieldset aria-label="Choose a color" className="mt-3">
                        <legend className="text-sm font-medium text-gray-900">Color</legend>

                        <div className="mt-4 flex items-center gap-x-3">
                          {(colors?.length ? colors : qvProduct.colors)?.map((color) => (
                            <div key={color.id} className="flex outline -outline-offset-1 outline-black/10">
                              <input
                                type="radio"
                                name="color"
                                value={color.id}
                                checked={selectedColor === color.id}
                                aria-label={color.name}
                                onChange={() => setSelectedColor(color.id)}
                                className={`${color.classes || colorToClass(color.name || color.id)} size-8 appearance-none forced-color-adjust-none checked:outline-2 checked:outline-offset-2 focus-visible:outline-3 focus-visible:outline-offset-3`}
                              />
                            </div>
                          ))}
                        </div>
                      </fieldset>

                      {/* Sizes */}
                      <fieldset aria-label="Choose a size" className="mt-6">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">Size</div>
                        </div>

                        <div className="mt-4">
                          <div className="grid grid-cols-4 gap-3">
                            {(sizes?.length ? sizes : qvProduct.sizes)?.map((size) => (
                              <label
                                  key={size.id}
                                  aria-label={size.name}
                                  className={`group relative flex items-center justify-center border border-gray-300 p-2.5 cursor-pointer ${selectedSize === size.id ? 'bg-black border-black' : 'bg-white'}`}
                                >
                                <input
                                  type="radio"
                                  name="size"
                                  value={size.id}
                                  checked={selectedSize === size.id}
                                  onChange={() => setSelectedSize(size.id)}
                                  disabled={!size.inStock}
                                  className="absolute inset-0 appearance-none focus:outline-none"
                                />
                                <span className={`text-sm font-medium uppercase ${selectedSize === size.id ? 'text-white' : 'text-[#1e2a38]'}`}>
                                  {size.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </fieldset>

                      <div className="mt-6 flex items-center gap-2">
                        <div className="flex-1">
                          <div className="w-full">
                            <AddToCartBtn product={addToCartPayload} quantity={1} fullWidth={true} />
                          </div>
                        </div>
                        <div className="flex-1">
                          <button
                            type="submit"
                            className="flex h-12 w-full items-center justify-center border border-transparent bg-[#0bd964] px-3 py-2 text-sm font-semibold text-black hover:bg-[#0bd964] rounded-none"
                            aria-label="View details"
                          >
                            <FiInfo size={18} strokeWidth={2.4} className="mr-2" />
                            <span className="whitespace-nowrap">View details</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  </section>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
