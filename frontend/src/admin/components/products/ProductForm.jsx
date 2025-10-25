import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiCheckCircle, FiXCircle, FiHash, FiInfo, FiImage, FiUpload, FiLink, FiTrash2, FiPlus } from 'react-icons/fi';
import CropModal from '../categories/CropModal';
import Dropdown from '../../../components/ui/Dropdown';
// Correct path to product API module (from admin/components/products to src/api)
import { previewNextSku } from '../../../api/productApi';

const normalizeInitialProduct = (initial = {}) => {
  const categoryId = initial.categoryId ?? initial.category;
  const base = Number(initial.price ?? initial.basePrice ?? 0);
  const price = Number.isFinite(base) ? base.toFixed(2) : '';
  const primaryImage = initial.primaryImage || initial.primaryImageUrl || initial.mainImage || initial.image || '';
  const imageList = Array.isArray(initial.secondaryImages)
    ? [...initial.secondaryImages]
    : (Array.isArray(initial.imageUrls) ? [...initial.imageUrls] : []);
  const filteredImages = primaryImage ? imageList.filter((url) => url && url !== primaryImage) : imageList;
  const highlights = Array.isArray(initial.highlights) ? [...initial.highlights] : [];
  const variants = Array.isArray(initial.variants)
    ? initial.variants.map((v) => ({
      id: v.id ?? Date.now() + Math.random(),
      color: v.attributes?.color || v.color || '',
      size: v.attributes?.size || v.size || '',
      stock: typeof v.stock === 'number' ? v.stock : 0,
      price: (() => {
        const n = Number(v.price ?? base);
        return Number.isFinite(n) ? n.toFixed(2) : '';
      })(),
      imageUrl: v.imageUrl || ''
    }))
    : [];

  return {
    id: initial.id ?? null,
    name: initial.name || '',
    sku: initial.sku || '',
    status: initial.status || 'active',
    categoryId: categoryId ? String(categoryId) : '',
    price,
    // 'description' in form state represents the short description field (maps to backend shortDescription)
    // 'detailedDescription' represents the full product description (backend description)
    description: initial.shortDescription ?? initial.short_description ?? initial.shortDesc ?? '',
    detailedDescription: initial.detailedDescription ?? initial.detailed_description ?? initial.fullDescription ?? initial.description ?? '',
    highlights,
    variants,
    primaryImage,
    secondaryImages: filteredImages,
  };
};

export default function ProductForm({ initial, onSubmit, onCancel, categories = [], saving = false }) {
  const [form, setForm] = useState(() => normalizeInitialProduct(initial));
  const [skuLoading, setSkuLoading] = useState(false);
  const [skuError, setSkuError] = useState(null);
  const skuRequestRef = useRef(0);
  const skuCategoryRef = useRef(null);
  // Inputs for bulk variant generation
  const [colorsInput, setColorsInput] = useState('');
  const [sizesInput, setSizesInput] = useState('');

  useEffect(() => {
    const normalized = normalizeInitialProduct(initial);
    setForm(normalized);
    if (normalized?.id) {
      skuCategoryRef.current = `${normalized.id}:${normalized.categoryId || ''}`;
    } else {
      skuCategoryRef.current = null;
    }
    setSkuError(null);
    setSkuLoading(false);
  }, [initial]);

  useEffect(() => {
    const categoryId = form.categoryId;
    const productKey = `${form.id ?? 'new'}:${categoryId || ''}`;

    if (!categoryId) {
      skuCategoryRef.current = form.id ? `${form.id}:` : null;
      setSkuLoading(false);
      setSkuError(null);
      if (form.sku) {
        setForm(prev => ({ ...prev, sku: '' }));
      }
      return;
    }

    if (skuCategoryRef.current === productKey) {
      return;
    }

    const numericCategory = Number(categoryId);
    if (!Number.isFinite(numericCategory)) {
      setSkuError('Invalid category');
      return;
    }

    skuRequestRef.current += 1;
    const requestId = skuRequestRef.current;
    setSkuLoading(true);
    setSkuError(null);

    previewNextSku(numericCategory)
      .then((sku) => {
        if (skuRequestRef.current !== requestId) return;
        skuCategoryRef.current = productKey;
        setForm(prev => ({ ...prev, sku: sku || '' }));
      })
      .catch((err) => {
        if (skuRequestRef.current !== requestId) return;
        skuCategoryRef.current = null;
        setSkuError(err?.message || 'Failed to fetch SKU');
        setForm(prev => ({ ...prev, sku: '' }));
      })
      .finally(() => {
        if (skuRequestRef.current === requestId) {
          setSkuLoading(false);
        }
      });
  }, [form.categoryId, form.id]);

  const categoryOptions = useMemo(() => {
    return (categories || []).map((c) => ({ value: String(c.value ?? c.id ?? ''), label: c.label ?? c.name ?? '' }));
  }, [categories]);

  const PRICE_FULL = /^\d+\.\d{2}$/;
  const PRICE_PARTIAL = /^\d{0,9}(\.\d{0,2})?$/; // typing-friendly

  const basePriceStr = String(form.price ?? '');
  const basePriceValid = PRICE_FULL.test(basePriceStr);
  const allVariantPricesValid = (form.variants || []).every(v => PRICE_FULL.test(String(v.price ?? '')));

  const canSave = Boolean((form.name || '').trim()) && Boolean(form.categoryId) && basePriceValid && allVariantPricesValid;

  const update = (patch) => setForm(f => ({ ...f, ...patch }));

  return (
    <form
      onSubmit={e => {
        e.preventDefault(); if (canSave) {
          const basePrice = Number(form.price);
          const payload = {
            ...form,
            categoryId: form.categoryId,
            price: basePrice,
            basePrice,
            shortDescription: (form.description || '').trim(),
            detailedDescription: (form.detailedDescription || '').trim(),
          };
          // Legacy compatibility: also send old key if backend still expecting it anywhere
          payload.description = payload.detailedDescription;
          // Normalize variants (if any): remove empty rows & coerce numbers
          payload.variants = (payload.variants || [])
            .filter(v => (v.color || v.size || '').trim().length)
            .map(v => ({
              id: v.id || Date.now() + Math.random(),
              color: (v.color || '').trim(),
              size: (v.size || '').trim(),
              stock: Number(v.stock || 0),
              price: Number(v.price || 0)
            }));
          // Ensure secondaryImages is array
          payload.secondaryImages = (payload.secondaryImages || []).filter(v => (v || '').trim().length);
          // Normalize highlights: remove empty entries and trim
          payload.highlights = (payload.highlights || []).map(h => (h || '').trim()).filter(h => h.length);
          onSubmit(payload);
        }
      }}
      className="w-full max-w-[1200px] mx-auto bg-white rounded-xl p-6 min-h-[70vh]"
    >
      {/* Header */}
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h3 className="text-4xl font-semibold text-gray-900">{form.id ? 'Edit Product' : 'Add Product'}</h3>
        <p className="text-sm text-gray-500 mt-1">Fill in the product details below.</p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-xl font-semibold text-gray-900">Basic Product Data</h4>
          <p className="text-xs text-gray-500 mt-1">Core product identifiers and settings.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Field label="Name" required helper="Product display name">
            <input value={form.name || ''} onChange={e => update({ name: e.target.value })} placeholder="Product name" className="w-full h-11 px-3 border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none" />
          </Field>

          <Field label="SKU" required helper="Auto-generated from category (read-only)">
            <div className="relative">
              <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={form.sku || ''}
                readOnly
                placeholder={skuLoading ? 'Generating…' : 'Select a category'}
                className="w-full h-11 pl-10 pr-10 border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none tracking-wide bg-gray-50 text-gray-800"
              />
              {skuLoading && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 inline-block w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              )}
            </div>
            {skuError && <p className="text-[11px] text-red-500 mt-2">{skuError}</p>}
          </Field>

          <Field label="Category" required>
            <Dropdown
              value={form.categoryId || ''}
              onChange={(v) => update({ categoryId: v })}
              options={[{ value: '', label: 'Select category...' }, ...categoryOptions]}
              className="w-full h-11 px-3"
            />
          </Field>

          <Field label="Base Price" required helper="Retail price in format LKR 000000.00">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-sm font-regular">LKR</span>
              <input
                type="text"
                inputMode="decimal"
                value={basePriceStr}
                onChange={(e) => {
                  const next = e.target.value.replace(/[^\d.]/g, '');
                  if (next === '' || PRICE_PARTIAL.test(next)) update({ price: next });
                }}
                onBlur={(e) => {
                  const val = e.target.value;
                  if (/^\d+(?:\.\d{1,2})?$/.test(val)) {
                    const n = Number(val);
                    if (Number.isFinite(n)) update({ price: n.toFixed(2) });
                  }
                }}
                placeholder="000000.00"
                className={`w-full h-11 pl-14 pr-3 border ${basePriceValid || basePriceStr === '' ? 'border-gray-300' : 'border-red-400'} focus:ring-2 focus:ring-green-400 focus:outline-none`}
              />
            </div>
            {!basePriceValid && basePriceStr !== '' && (
              <p className="text-[11px] text-red-600 mt-1">Use format LKR 000000.00</p>
            )}
          </Field>

          <Field label="Status" required>
            <div className="inline-flex items-center gap-2">
              {['active', 'inactive'].map(s => {
                const isActive = form.status === s;
                const bg = isActive ? (s === 'active' ? 'bg-green-100' : 'bg-red-100') : 'bg-white';
                const txt = isActive ? (s === 'active' ? 'text-green-800' : 'text-red-800') : 'text-gray-700';
                const Icon = s === 'active' ? FiCheckCircle : FiXCircle;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update({ status: s })}
                    className={`${bg} ${txt} inline-flex items-center text-sm font-semibold px-3 py-1 rounded-full border border-gray-200 hover:opacity-90 transition`}
                  >
                    <Icon className="w-3.5 h-3.5 mr-1" />
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Description" helper="Short description of the product">
            <textarea rows={3} value={form.description || ''} onChange={e => update({ description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none" placeholder="Short description..." />
          </Field>

          <div className="col-span-1 md:col-span-2">
            <Field label="Detailed Description" helper="Long form description for product page (supports basic HTML)">
              <textarea rows={6} value={form.detailedDescription || ''} onChange={e => update({ detailedDescription: e.target.value })} className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none" placeholder="Detailed description for product page..." />
            </Field>
          </div>

          <div className="col-span-1 md:col-span-2">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-sm font-semibold text-gray-900">Highlights</h5>
                  <p className="text-xs text-gray-500">Short bullet-point highlights (used in product listing/quick info).</p>
                </div>
                <button type="button" onClick={() => update({ highlights: [...(form.highlights || []), ''] })} className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white text-xs font-medium hover:bg-black/90">
                  <FiPlus className="w-4 h-4" />
                  <span>Add Highlight</span>
                </button>
              </div>

              {!(form.highlights && form.highlights.length) && (
                <p className="text-[11px] text-gray-500 mt-2">No highlights added yet.</p>
              )}

              <div className="mt-3 space-y-2">
                {(form.highlights || []).map((h, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <input
                      value={h || ''}
                      onChange={e => {
                        const arr = (form.highlights || []).slice(); arr[idx] = e.target.value; update({ highlights: arr });
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none"
                      placeholder={`Highlight ${idx + 1}`}
                    />
                    <button type="button" onClick={() => { const arr = (form.highlights || []).slice(); arr.splice(idx, 1); update({ highlights: arr }); }} className="inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-red-600">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 my-4" />

        {/* Variants Section */}

        <div className="pt-2">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
            <div>
              <h4 className="text-xl font-semibold text-gray-900 tracking-tight">Variants</h4>
              <p className="text-xs text-gray-500 mt-1">Define product variations (color, size, individual stock & price).</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const base = form.price || 0;
                const next = { id: Date.now() + Math.random(), color: '', size: '', stock: 0, price: base };
                update({ variants: [...(form.variants || []), next] });
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white text-xs font-medium hover:bg-black/90"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Variant</span>
            </button>
          </div>

          {/* Bulk colors/sizes to auto-generate combinations */}
          <div className="border border-gray-200 bg-gray-50 p-3 mb-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-5">
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Colors</label>
                <input
                  value={colorsInput}
                  onChange={(e) => setColorsInput(e.target.value)}
                  placeholder="e.g. Red, Blue, Green"
                  className="w-full h-9 px-3 text-sm border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
                <p className="text-[10px] text-gray-500 mt-1">Separate multiple colors with commas.</p>
              </div>
              <div className="md:col-span-5">
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Sizes</label>
                <input
                  value={sizesInput}
                  onChange={(e) => setSizesInput(e.target.value)}
                  placeholder="e.g. S, M, L"
                  className="w-full h-9 px-3 text-sm border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
                <p className="text-[10px] text-gray-500 mt-1">Separate multiple sizes with commas. Leave empty if not applicable.</p>
              </div>
              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={() => {
                    const parseList = (str) => Array.from(new Set((str || '')
                      .split(',')
                      .map(s => s.trim())
                      .filter(Boolean)
                    ));
                    const colors = parseList(colorsInput);
                    const sizes = parseList(sizesInput);

                    if (!colors.length && !sizes.length) return; // nothing to add

                    const existing = (form.variants || []);
                    const existingKeys = new Set(existing.map(v => `${(v.color || '').trim().toLowerCase()}|${(v.size || '').trim().toLowerCase()}`));
                    const base = Number(form.price || 0);
                    const next = [];

                    if (colors.length && sizes.length) {
                      colors.forEach(c => {
                        sizes.forEach(s => {
                          const key = `${c.toLowerCase()}|${s.toLowerCase()}`;
                          if (!existingKeys.has(key)) {
                            next.push({ id: Date.now() + Math.random(), color: c, size: s, stock: 0, price: base });
                            existingKeys.add(key);
                          }
                        });
                      });
                    } else if (colors.length) {
                      colors.forEach(c => {
                        const key = `${c.toLowerCase()}|`;
                        if (!existingKeys.has(key)) {
                          next.push({ id: Date.now() + Math.random(), color: c, size: '', stock: 0, price: base });
                          existingKeys.add(key);
                        }
                      });
                    } else if (sizes.length) {
                      sizes.forEach(s => {
                        const key = `|${s.toLowerCase()}`;
                        if (!existingKeys.has(key)) {
                          next.push({ id: Date.now() + Math.random(), color: '', size: s, stock: 0, price: base });
                          existingKeys.add(key);
                        }
                      });
                    }

                    if (next.length) {
                      update({ variants: [...existing, ...next] });
                    }
                  }}
                  className="w-full h-9 inline-flex items-center justify-center gap-2 px-3 bg-black text-white text-xs font-medium hover:bg-black/90"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Generate Variants</span>
                </button>
              </div>
            </div>
          </div>

          {!(form.variants && form.variants.length) && (
            <p className="text-[11px] text-gray-500 mb-3">No variants added yet.</p>
          )}

          {(form.variants || []).length > 0 && (
            <div className="space-y-3">
              {(form.variants || []).map((v, idx) => (
                <div key={v.id || idx} className="grid grid-cols-12 gap-3 items-end p-3">
                  <div className="col-span-12 sm:col-span-3">
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Color</label>
                    <input
                      value={v.color || ''}
                      onChange={e => {
                        const variants = [...(form.variants || [])]; variants[idx] = { ...variants[idx], color: e.target.value }; update({ variants });
                      }}
                      placeholder="e.g. Red"
                      className="w-full h-8 px-2 text-xs border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Size</label>
                    <input
                      value={v.size || ''}
                      onChange={e => {
                        const variants = [...(form.variants || [])]; variants[idx] = { ...variants[idx], size: e.target.value }; update({ variants });
                      }}
                      placeholder="M / 32 / 1L"
                      className="w-full h-8 px-2 text-xs border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={v.stock ?? 0}
                      onChange={e => {
                        const variants = [...(form.variants || [])]; variants[idx] = { ...variants[idx], stock: e.target.value }; update({ variants });
                      }}
                      className="w-full h-8 px-2 text-xs border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-[11px] font-medium text-gray-600 mb-1">Price (LKR)</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={String(v.price ?? '')}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d.]/g, '');
                        if (raw === '' || PRICE_PARTIAL.test(raw)) {
                          const variants = [...(form.variants || [])]; variants[idx] = { ...variants[idx], price: raw }; update({ variants });
                        }
                      }}
                      onBlur={(e) => {
                        const val = e.target.value;
                        if (/^\d+(?:\.\d{1,2})?$/.test(val)) {
                          const n = Number(val);
                          if (Number.isFinite(n)) {
                            const variants = [...(form.variants || [])]; variants[idx] = { ...variants[idx], price: n.toFixed(2) }; update({ variants });
                          }
                        }
                      }}
                      placeholder="000000.00"
                      className={`w-full h-8 px-2 text-xs border ${PRICE_FULL.test(String(v.price ?? '')) || String(v.price ?? '') === '' ? 'border-gray-300' : 'border-red-400'} focus:ring-2 focus:ring-green-400 focus:outline-none`}
                    />
                    {!(PRICE_FULL.test(String(v.price ?? '')) || String(v.price ?? '') === '') && (
                      <p className="text-[10px] text-red-600 mt-1">Use format LKR 000000.00</p>
                    )}
                  </div>
                  <div className="col-span-6 sm:col-span-1 flex items-center">
                    <button
                      type="button"
                      onClick={() => {
                        const variants = [...(form.variants || [])]; variants.splice(idx, 1); update({ variants });
                      }}
                      className="inline-flex items-center gap-1 h-8 px-2 text-[11px] font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 w-full justify-center rounded-full"
                      title="Remove variant"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 my-4" />

        {/* Images (CategoryForm style) */}
        <div className="pt-4">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
            <div>
              <h4 className="text-xl font-semibold text-gray-900 tracking-tight">Images</h4>
              <p className="text-xs text-gray-500 mt-1">Primary thumbnail (1:1) and optional secondary (gallery) images.</p>
            </div>
            <ImageGuidelines />
          </div>

          <div className="grid gap-6 md:grid-cols-3 items-start">
            {/* Primary image subsection (left column) */}
            <div className="md:col-span-1 border bg-white border-gray-100 p-4">
              <div className="mb-3">
                <h5 className="text-sm font-semibold text-gray-900">Primary Image</h5>
                <p className="text-xs text-gray-500">Used as the product thumbnail (1:1)</p>
              </div>
              <ProductImageCard
                label="Primary Image (1:1)"
                required
                helper="Shown in listings and as default product image"
                value={form.primaryImage || form.mainImage}
                onChange={(v) => update({ primaryImage: v })}
                aspect="square"
              />
            </div>

            {/* Secondary images subsection (right, spans two columns) */}
            <div className="md:col-span-2 bg-white border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h5 className="text-sm font-semibold text-gray-900">Secondary Images</h5>
                  <p className="text-xs text-gray-500">Optional gallery images (1:1). Add as many as needed.</p>
                </div>
                <button
                  type="button"
                  onClick={() => update({ secondaryImages: [...(form.secondaryImages || []), ''] })}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white text-xs font-medium hover:bg-black/90"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Image</span>
                </button>
              </div>

              {!(form.secondaryImages && form.secondaryImages.length) && (
                <p className="text-[11px] text-gray-500 mb-3">No secondary images added yet.</p>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(form.secondaryImages || []).map((val, idx) => (
                  <ProductImageCard
                    key={`sec-${idx}`}
                    label={`Secondary ${idx + 1}`}
                    helper="Optional"
                    value={val}
                    compactControls={true}
                    onChange={(v) => {
                      const arr = (form.secondaryImages || []).slice();
                      arr[idx] = v; update({ secondaryImages: arr });
                    }}
                    onRemove={() => {
                      const arr = (form.secondaryImages || []).slice();
                      arr.splice(idx, 1); update({ secondaryImages: arr });
                    }}
                    aspect="square"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={() => { setForm(normalizeInitialProduct(initial)); if (typeof onCancel === 'function') onCancel(); }} className="px-4 py-2 text-sm border-2 border-black rounded-none text-black bg-white hover:bg-gray-50 disabled:opacity-50" disabled={saving}>Cancel</button>
          <button type="submit" disabled={!canSave || saving} className="px-4 py-2 text-sm border-2 border-black bg-[#00bf63] font-medium text-black hover:bg-black hover:text-white disabled:opacity-50 flex items-center gap-2">
            {saving && <span className="inline-block w-3 h-3 border-2 border-black border-t-transparent animate-spin rounded-full" aria-hidden="true" />}
            {form.id ? (saving ? 'Saving…' : 'Save Changes') : (saving ? 'Creating…' : 'Create Product')}
          </button>
        </div>
      </div>
    </form>
  );
}

/* Field Component (styled like CategoryForm) */
function Field({ label, children, required, helper }) {
  return (
    <div className="flex flex-col md:flex-row md:items-start md:gap-2">
      <div className="md:w-32 mb-2 md:mb-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-gray-900">{label}</span>
          {required && <span className="text-red-500">*</span>}
        </div>
        {helper && (
          <div className="text-xs text-gray-500 mt-1">{helper}</div>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

/* Hover portal guidelines cloned from CategoryForm (slightly generalized) */
function ImageGuidelines() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative mt-7">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-help"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <FiInfo className="w-4 h-4 text-gray-500" />
        <span className="text-xs font-medium text-gray-700">Image guidelines</span>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 bg-gray-50 border border-gray-200 p-3 text-gray-600 text-xs shadow-lg" role="dialog" aria-label="Image guidelines">
          <div className="flex items-center gap-2 font-semibold text-sm text-gray-700 mb-1">
            <FiInfo className="w-4 h-4 text-gray-500" />
            <span>Image guidelines</span>
          </div>
          <ul className="list-disc ml-4 space-y-1">
            <li>Accepted formats: jpg, jpeg, png, svg.</li>
            <li>Primary & gallery: square 800–1000px (1:1).</li>
            <li>Keep files under ~2–5MB for faster loads.</li>
            <li>Use public, CORS-enabled URLs for remote previews.</li>
            <li>Prefer sRGB; avoid animated SVGs for previews.</li>
          </ul>
        </div>
      )}
    </div>
  );
}

/* Unified Image Card for product */
function ProductImageCard({ label, helper, value, onChange, onRemove, required, aspect = 'square', compactControls = false }) {
  const [mode, setMode] = useState(value && value.startsWith('data:') ? 'upload' : 'url');
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const fileRef = useRef(null);
  const [cropOpen, setCropOpen] = useState(false);

  const readFileAsDataURL = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = (e) => reject(e); reader.readAsDataURL(file);
  });

  const resizeDataUrl = (dataUrl, fileType, maxW = 1400, maxH = 1400) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { const ratio = Math.min(1, maxW / img.width, maxH / img.height); const w = Math.round(img.width * ratio); const h = Math.round(img.height * ratio); const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, w, h); const outType = fileType === 'image/png' ? 'image/png' : 'image/jpeg'; resolve(c.toDataURL(outType, outType === 'image/png' ? 1 : 0.9)); };
    img.onerror = () => resolve(dataUrl); img.src = dataUrl;
  });

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
  const allowedExt = ['png', 'jpg', 'jpeg', 'svg'];
  const resetFileInput = () => { try { if (fileRef.current) fileRef.current.value = null; } catch (e) { } };

  const handleFileSelect = async (file) => {
    setFileError(''); if (!file) return; const okType = allowedTypes.includes(file.type); const ext = (file.name || '').split('.').pop().toLowerCase(); const okExt = allowedExt.includes(ext); if (!okType || !okExt) { setFileError('Only png, jpg, jpeg, svg allowed.'); resetFileInput(); setFileName(''); onChange(''); return; }
    setFileName(file.name); try { const data = await readFileAsDataURL(file); const resized = await resizeDataUrl(data, file.type); onChange(resized); } catch { const fallback = await readFileAsDataURL(file); onChange(fallback); }
  };

  const clearImage = () => { setFileName(''); onChange(''); resetFileInput(); if (onRemove) onRemove(); };
  const truncateName = (n, max = 22) => { if (!n) return ''; const parts = n.split('.'); if (parts.length === 1) return n.length > max ? n.slice(0, max - 1) + '…' : n; const ext = parts.pop(); const base = parts.join('.'); return base.length > max ? base.slice(0, max - 1) + '….' + ext : base + '.' + ext; };

  const aspectClass = aspect === 'square' ? 'aspect-square' : (aspect === 'video' ? 'aspect-video' : '');

  return (
    <div className="relative group bg-white border-2 border-gray-200 p-4 flex flex-col hover:shadow-md transition">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h5 className="text-sm font-semibold text-gray-900 leading-tight flex items-center gap-1">{label} {required && <span className="text-red-500">*</span>}</h5>
          {helper && <p className="text-[11px] text-gray-500 mt-0.5">{helper}</p>}
        </div>
        {(value || onRemove) && (
          <button type="button" onClick={clearImage} className="opacity-0 group-hover:opacity-100 transition inline-flex items-center justify-center w-7 h-7 rounded-md border border-gray-300 text-gray-500 hover:text-red-600 hover:border-red-400 bg-white" title="Remove image">
            <FiTrash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className={`relative mb-3 overflow-hidden bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center ${aspectClass} w-full`}>
        {value ? (
          <>
            <img src={value} alt={label} className="w-full h-full object-cover" />
            {compactControls ? (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 items-center">
                  <button type="button" onClick={() => { if (mode === 'upload') { fileRef.current?.click(); } else { setMode('upload'); } }} className="inline-flex items-center gap-2 px-2 py-1 bg-white/95 text-[11px] font-medium text-gray-800 border border-gray-200 shadow-sm hover:bg-white">
                    <FiUpload className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Change</span>
                  </button>
                  <button type="button" onClick={() => setCropOpen(true)} className="inline-flex items-center gap-2 px-2 py-1 bg-white/95 text-[11px] font-medium text-gray-800 border border-gray-200 shadow-sm hover:bg-white">
                    <FiImage className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Crop</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                <div className="flex gap-2">
                  <button type="button" onClick={() => { if (mode === 'upload') { fileRef.current?.click(); } else { setMode('upload'); } }} className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-2 px-3 py-1.5 bg-white/95 text-xs font-medium text-gray-800 shadow-sm hover:bg-white">
                    <FiUpload className="w-4 h-4" />
                    <span>Change</span>
                  </button>

                  <button type="button" onClick={() => setCropOpen(true)} className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-2 px-3 py-1.5 bg-white/95 text-xs font-medium text-gray-800 shadow-sm hover:bg-white">
                    <FiImage className="w-4 h-4" />
                    <span>Crop</span>
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center text-gray-400 text-xs gap-1 py-6">
            <FiImage className="w-6 h-6" />
            <span>No image</span>
          </div>
        )}
      </div>

      <div className="inline-flex items-center bg-gray-100 rounded-full p-0.5 mb-2 self-start" role="tablist" aria-label="Image input mode">
        <button type="button" onClick={() => { setMode('url'); setFileError(''); resetFileInput(); }} aria-pressed={mode === 'url'} className={`flex items-center gap-2 px-3 py-1 text-[11px] font-medium rounded-full transition ${mode === 'url' ? 'bg-white shadow-sm' : 'text-gray-600'}`}>
          <FiLink className="w-4 h-4" />
          <span>URL</span>
        </button>
        <button type="button" onClick={() => { setMode('upload'); setFileError(''); }} aria-pressed={mode === 'upload'} className={`flex items-center gap-2 px-3 py-1 text-[11px] font-medium rounded-full transition ${mode === 'upload' ? 'bg-white shadow-sm' : 'text-gray-600'}`}>
          <FiUpload className="w-4 h-4" />
          <span>Upload</span>
        </button>
      </div>

      {mode === 'url' ? (
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full h-9 px-3 border border-gray-300 focus:ring-2 focus:ring-green-400 focus:outline-none text-xs" placeholder="https://.../image.jpg" />
      ) : (
        <div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e.target.files && e.target.files[0])} />
          <button type="button" onClick={() => fileRef.current && fileRef.current.click()} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-black text-white text-xs font-medium hover:bg-black/90">
            <FiUpload className="w-4 h-4" />
            <span>{value ? 'Replace image' : 'Upload image'}</span>
          </button>
          {(fileName || fileError || (value && value.startsWith('data:'))) && (
            <div className="mt-2 text-[11px] flex items-center gap-2">
              {!fileError && (fileName || (value && value.startsWith('data:'))) && (
                <>
                  <span className="text-gray-600 truncate" title={fileName || 'Uploaded image'}>{truncateName(fileName || 'uploaded-image.png')}</span>
                  <button type="button" onClick={clearImage} className="inline-flex items-center justify-center w-6 h-6 text-gray-500 hover:text-red-600" aria-label="Remove image" title="Remove">
                    <FiXCircle className="w-3 h-3 -ml-2" />
                  </button>
                </>
              )}
              {fileError && <span className="text-red-600">{fileError}</span>}
            </div>
          )}
        </div>
      )}
      <CropModal
        src={value}
        aspect={(aspect || '').includes('video') ? 16 / 9 : 1}
        open={cropOpen}
        onClose={() => setCropOpen(false)}
        onComplete={(dataUrl) => {
          onChange(dataUrl);
        }}
      />
    </div>
  );
}
