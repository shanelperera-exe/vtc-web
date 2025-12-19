import React, { useMemo, useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiLink, FiCopy, FiCheckCircle, FiXCircle, FiEye, FiBarChart2, FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { listAllVariations } from '../../../api/productApi';
import PriceTag from './PriceTag';
import { useNavigate } from 'react-router-dom';
import { deleteProduct } from '../../../api/productApi';
import StarReview from '../../../components/ui/StarReview';
import { listReviewsByProduct } from '../../../api/reviewApi';

const TooltipPortal = ({ anchorRef, children, visible }) => {
    if (typeof document === 'undefined' || !anchorRef || !anchorRef.current || !visible) return null;
    const rect = anchorRef.current.getBoundingClientRect();
    const left = rect.left + rect.width / 2 + window.scrollX;
    const top = rect.top + window.scrollY - 4; // slightly above the element (reduced to move tooltip down)

    const node = (
        <div
            style={{ position: 'absolute', left: `${left}px`, top: `${top}px`, transform: 'translate(-50%, -100%)', zIndex: 9999 }}
        >
            <div className="bg-gray-900 text-white text-[10px] px-2 py-1 whitespace-nowrap">{children}</div>
        </div>
    );

    return createPortal(node, document.body);
};

const AdminProductCard = ({ product = {}, onToggleStatus, onEdit, onDelete }) => {
    const [linkCopied, setLinkCopied] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const buttonRef = useRef(null);

    // Refs for dynamic variants scroll handling
    const cardRef = useRef(null);
    const variantsWrapperRef = useRef(null);
    const variantsInnerRef = useRef(null);
    const [variantsMaxHeight, setVariantsMaxHeight] = useState(null);
    const [variantsShouldScroll, setVariantsShouldScroll] = useState(false);

    const [skuCopied, setSkuCopied] = useState(false);
    const [isSkuHovered, setIsSkuHovered] = useState(false);
    const skuRef = useRef(null);

    // Variants & stock
    const [variants, setVariants] = useState([]);
    const [variantsLoading, setVariantsLoading] = useState(false);
    const [variantsError, setVariantsError] = useState(null);
    const [activeTab, setActiveTab] = useState('variants'); // 'variants' | 'stats'

    const skuVal = product.sku || product.SKU || product.skuCode || product.id || product._id || '';

    const categoryName = product.categoryName || product.category?.name || product.category || '';

    const imageUrl = useMemo(() => {
        if (!product) return '';
        if (product.primaryImageUrl) return product.primaryImageUrl;
        if (product.primaryImage) return product.primaryImage;
        if (product.imageUrl) return product.imageUrl;
        if (product.image) return product.image;
        if (Array.isArray(product.images) && product.images.length) {
            const first = product.images[0];
            return typeof first === 'string' ? first : first?.url || '';
        }
        return '';
    }, [product]);

    // Load variants/stock for this product
    const productId = product?.id || product?.productId || product?._id || null;
    const lowStockThreshold = typeof product?.lowStockThreshold === 'number' ? product.lowStockThreshold : 5;

    // Local rating state (loaded from reviews endpoint if product doesn't include it)
    const [fetchedRating, setFetchedRating] = useState(null);
    const [fetchedReviewCount, setFetchedReviewCount] = useState(null);

    React.useEffect(() => {
        let ignore = false;
        async function loadReviews() {
            if (!productId) return;
            try {
                const list = await listReviewsByProduct(productId);
                if (ignore) return;
                const reviews = Array.isArray(list) ? list : [];
                const count = reviews.length;
                const avg = count ? +(reviews.reduce((s, r) => s + (typeof r.rating === 'number' ? r.rating : (r.stars || 0)), 0) / count).toFixed(1) : null;
                setFetchedReviewCount(count);
                setFetchedRating(avg);
            } catch (err) {
                // ignore fetch errors; leave nulls so fallback to product props
            }
        }
        loadReviews();
        return () => { ignore = true; };
    }, [productId]);

    React.useEffect(() => {
        let ignore = false;
        async function load() {
            if (!productId) return;
            setVariantsLoading(true); setVariantsError(null);
            try {
                const res = await listAllVariations(productId);
                if (ignore) return;
                setVariants(Array.isArray(res) ? res : []);
            } catch (e) {
                if (!ignore) setVariantsError(e?.message || 'Failed to load variants');
            } finally {
                if (!ignore) setVariantsLoading(false);
            }
        }
        load();
        return () => { ignore = true; };
    }, [productId]);

    function stockStatus(stock, threshold = lowStockThreshold) {
        const n = Number(stock ?? 0) || 0;
        const t = typeof threshold === 'number' && !Number.isNaN(threshold) ? threshold : lowStockThreshold;
        if (n <= 0) return { label: 'Out of stock', color: 'text-red-700 bg-red-50 border-red-600', icon: 'out' };
        if (n <= t) return { label: 'Low stock', color: 'text-amber-700 bg-amber-50 border-amber-600', icon: 'low' };
        return { label: 'In stock', color: 'text-green-700 bg-green-50 border-green-600', icon: 'in' };
    }

    function attrsToLabel(attrs) {
        const a = attrs || {};
        const keys = Object.keys(a || {}).filter(k => a[k] != null && String(a[k]).trim() !== '');
        if (!keys.length) return 'Variant';
        // Render keys in darker color (e.g., text-gray-800) and values normal
        return keys.map((k, idx) => (
            <span key={k} className="text-xs">
                <span className="text-gray-800 font-medium">{String(k).trim()}:</span>
                <span className="ml-1 text-gray-700">{String(a[k]).trim()}</span>
                {idx < keys.length - 1 ? <span className="mx-2 text-gray-400">•</span> : null}
            </span>
        ));
    }

    const handleCopyLink = async (e) => {
        e && e.stopPropagation();
        try {
            const id = product.sku || product.id || product._id || '';
            const url = `${window.location.origin}/product/${id}`;
            await navigator.clipboard.writeText(url);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 1800);
        } catch (err) {
            // ignore
        }
    };

    const handleCopySku = async (e) => {
        e && e.stopPropagation();
        try {
            const text = String(skuVal || '');
            await navigator.clipboard.writeText(text);
            setSkuCopied(true);
            setTimeout(() => setSkuCopied(false), 1800);
        } catch (err) {
            // ignore
        }
    };

    const navigate = useNavigate();
    const status = (product.status || '').toLowerCase() === 'inactive' ? 'inactive' : 'active';
    const isActive = status === 'active';
    useLayoutEffect(() => {
        // compute available height for variants area based on card height and wrapper offset
        function compute() {
            try {
                if (!cardRef.current || !variantsWrapperRef.current || !variantsInnerRef.current) {
                    setVariantsMaxHeight(null);
                    setVariantsShouldScroll(false);
                    return;
                }
                const cardRect = cardRef.current.getBoundingClientRect();
                const wrapperRect = variantsWrapperRef.current.getBoundingClientRect();
                // offset from top of card to top of wrapper
                const offsetTop = Math.max(0, wrapperRect.top - cardRect.top);
                // allow a small bottom padding
                const bottomPadding = 12;
                const available = Math.max(48, Math.floor(cardRect.height - offsetTop - bottomPadding));
                const contentHeight = variantsInnerRef.current.scrollHeight || 0;
                if (contentHeight > available) {
                    setVariantsMaxHeight(available);
                    setVariantsShouldScroll(true);
                } else {
                    setVariantsMaxHeight(null);
                    setVariantsShouldScroll(false);
                }
            } catch (e) {
                // ignore measurement errors
            }
        }

        compute();

        // Observe resizes of card and variants content
        let roCard;
        let roContent;
        if (typeof ResizeObserver !== 'undefined') {
            try {
                roCard = new ResizeObserver(compute);
                roContent = new ResizeObserver(compute);
                if (cardRef.current) roCard.observe(cardRef.current);
                if (variantsInnerRef.current) roContent.observe(variantsInnerRef.current);
            } catch (ignored) {
            }
        }

        const onResize = () => compute();
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
            try {
                if (roCard && cardRef.current) roCard.unobserve(cardRef.current);
                if (roContent && variantsInnerRef.current) roContent.unobserve(variantsInnerRef.current);
            } catch (ignored) {}
        };
    }, [variants, variantsLoading, productId, activeTab]);

    return (
        <div
            ref={cardRef}
            className="relative w-full md:col-span-2 lg:col-span-2 xl:col-span-2 bg-white rounded-xl border border-black/10 shadow-sm hover:shadow-md transition-shadow overflow-visible flex flex-col md:flex-row items-start"
            style={{ minHeight: '23.5rem' }}
        >
            {/* Image area with padding */}
            <div className="relative flex-shrink-0 p-3 self-start w-full md:w-60 md:h-60 flex flex-col">
                {/* Image occupies remaining space; actions sit at the bottom inside the same fixed-height column */}
                <div className="w-full flex-1 md:h-full">
                    {imageUrl ? (
                        <div className="w-full h-full rounded-lg overflow-hidden border border-black/10 bg-gray-50">
                            <img src={imageUrl} alt={product.name || 'Product image'} className="block w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="w-full h-full rounded-lg border border-black/10 bg-gray-100 flex items-center justify-center text-xs text-gray-500">No image</div>
                    )}
                </div>

                {/* Actions menu placed under the image but inside the same h-65 container so card size doesn't change */}
                <div className="mt-4 w-full">
                    <div className="text-xs font-semibold uppercase tracking-wide text-black/60 mb-2">Actions</div>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                const id = product.sku || product.id || product._id;
                                if (id) window.open(`/product/${id}`,'_blank','noopener,noreferrer');
                            }}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold border border-black/10 bg-white text-gray-900 hover:bg-black hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            aria-label="View product"
                            title="View"
                        >
                            <FiEye className="w-4 h-4" />
                            <span className="hidden sm:inline">View</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                const key = product.sku || product.SKU || product.skuCode || product.id || product._id;
                                if (key) navigate(`/admin/products/${encodeURIComponent(key)}/stats`);
                            }}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold border border-black/10 bg-white text-gray-900 hover:bg-black hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            aria-label="Product stats"
                            title="Stats"
                        >
                            <FiBarChart2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Stats</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                // Prefer parent-provided edit handler (opens modal in AllProductsManager)
                                if (typeof onEdit === 'function') {
                                    try {
                                        onEdit(product);
                                        return;
                                    } catch (_) {
                                        // fall through to navigation
                                    }
                                }
                                const id = product?.id || product?._id;
                                if (id) navigate(`/admin/products?edit=${encodeURIComponent(id)}`);
                            }}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold border border-black/10 bg-white text-gray-900 hover:bg-black hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            aria-label="Edit product"
                            title="Edit"
                        >
                            <FiEdit2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Edit</span>
                        </button>

                        <button
                            type="button"
                            onClick={async () => {
                                // Prefer parent-provided delete handler to show confirmation modal
                                if (typeof onDelete === 'function') {
                                    try { onDelete(product); return; } catch (_) { /* fall back */ }
                                }
                                const id = product?.id || product?._id;
                                if (!id) return;
                                const name = product?.name || 'this product';
                                if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
                                try {
                                    await deleteProduct(id);
                                    if (typeof window !== 'undefined') {
                                        // optional: emit custom event so parent can refresh
                                        document.dispatchEvent(new CustomEvent('product:deleted', { detail: { id } }));
                                    }
                                } catch (e) {
                                    // eslint-disable-next-line no-alert
                                    alert(e?.message || 'Failed to delete product');
                                }
                            }}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold border border-rose-300 bg-white text-rose-700 hover:bg-rose-700 hover:text-white hover:border-rose-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            aria-label="Delete product"
                            title="Delete"
                        >
                            <FiTrash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Content: product name + copy link */}
            <div className="flex-1 pt-3 pl-3 pr-3 md:pl-4 md:pr-4 flex items-start md:items-center">
                <div className="min-w-0">
                    <div className="flex items-start md:items-center gap-2 group pb-1">
                        <h3 className="font-semibold text-2xl text-black whitespace-normal break-words leading-snug" title={product.name || ''}>
                            {product.name || 'Product title'}
                        </h3>

                        <button
                            type="button"
                            ref={buttonRef}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onClick={handleCopyLink}
                            className="relative hidden group-hover:inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:text-black border border-transparent hover:border-black/10"
                            aria-label="Copy product link"
                        >
                            <FiLink className="w-4 h-4" />
                            <span className="sr-only" aria-live="polite">
                                {linkCopied ? 'Product link copied to clipboard' : ''}
                            </span>
                        </button>

                        <TooltipPortal anchorRef={buttonRef} visible={isHovered || linkCopied}>
                            {linkCopied ? 'Copied!' : 'Copy product link'}
                        </TooltipPortal>
                    </div>
                    <hr className="my-2 border-t border-gray-200" />
                    <div>
                        <div className="mt-1 flex items-center flex-wrap gap-2 text-sm text-gray-600">
                            <span className="text-xs font-semibold uppercase tracking-wide text-black/60">SKU</span>
                            <span className="text-sm font-semibold text-gray-900 break-all">{skuVal || '—'}</span>

                            <div className="relative group">
                                <button
                                    type="button"
                                    ref={skuRef}
                                    onMouseEnter={() => setIsSkuHovered(true)}
                                    onMouseLeave={() => setIsSkuHovered(false)}
                                    onClick={handleCopySku}
                                    className="relative inline-flex items-center justify-center rounded-lg p-1.5 text-gray-500 hover:text-black border border-transparent hover:border-black/10"
                                    aria-label="Copy SKU"
                                >
                                    <FiCopy className="w-4 h-4" />
                                    <span className="sr-only" aria-live="polite">
                                        {skuCopied ? 'SKU copied to clipboard' : ''}
                                    </span>
                                </button>

                                <TooltipPortal anchorRef={skuRef} visible={isSkuHovered || skuCopied}>
                                    {skuCopied ? 'Copied!' : 'Copy SKU'}
                                </TooltipPortal>
                            </div>

                            {categoryName && (
                                <span className="ml-1 inline-flex items-center rounded-full bg-gray-50 text-gray-800 text-[11px] px-2 py-0.5 font-semibold border border-black/10">{String(categoryName).toUpperCase()}</span>
                            )}

                            {/* Status indicator moved next to category with icon */}
                            <span className="ml-2 text-gray-800 text-[12px] font-medium">Status:</span>
                            <span
                                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0 rounded-full border ${isActive
                                    ? 'border-emerald-600 text-emerald-700 bg-emerald-50'
                                    : 'border-rose-600 text-rose-700 bg-rose-50'
                                    }`}
                                title={isActive ? 'Product is active' : 'Product is inactive'}
                            >
                                {isActive ? (
                                    <FiCheckCircle className="w-3 h-3" />
                                ) : (
                                    <FiXCircle className="w-3 h-3" />
                                )}
                                {isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        {/* Price tag row (placed under SKU/category/status) */}
                        <div className="mt-3">
                            <PriceTag price={product.price ?? 0} compareAtPrice={product.originalPrice ?? product.compareAtPrice ?? null} currency={product.currency || 'LKR'} />
                        </div>

                        {/* Variants & stock: now in tabs (keeps original variants styling) */}
                        <div className="mt-3">
                            {/* Tabs header */}
                            <div className="mb-1 flex items-center justify-between">
                                <div className="inline-flex rounded-lg border border-black/10 overflow-hidden bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('variants')}
                                        className={`px-3 py-1.5 text-xs font-semibold ${
                                            activeTab === 'variants' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        Variants
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('stats')}
                                        className={`px-3 py-1.5 text-xs font-semibold border-l border-black/10 ${
                                            activeTab === 'stats' ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        Quick Stats
                                    </button>
                                </div>

                                <div className="ml-3 flex items-center whitespace-nowrap">
                                    <StarReview
                                        rating={typeof fetchedRating === 'number' ? fetchedRating : (typeof product?.rating === 'number' ? product.rating : 0)}
                                        numReviews={typeof fetchedReviewCount === 'number' ? fetchedReviewCount : (product?.reviewCount ?? product?.numReviews ?? 0)}
                                        size={16}
                                        showCount={true}
                                    />
                                </div>
                            </div>

                            {activeTab === 'variants' ? (
                                <div className="rounded-lg border border-black/10 overflow-hidden">
                                    <div ref={variantsWrapperRef} className="w-full">
                                        <div
                                            ref={variantsInnerRef}
                                            style={variantsShouldScroll && variantsMaxHeight ? { maxHeight: `${variantsMaxHeight}px`, overflowY: 'auto' } : undefined}
                                            className="w-full"
                                        >
                                            {variantsLoading ? (
                                                <div className="p-2 text-xs text-gray-500">Loading variants…</div>
                                            ) : variantsError ? (
                                                <div className="p-2 text-xs text-red-600">{variantsError}</div>
                                            ) : variants?.length ? (
                                                <table className="min-w-full text-xs">
                                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                                        <tr>
                                                            <th className="text-left font-semibold text-gray-700 px-2 py-1">Variant</th>
                                                            <th className="text-right font-semibold text-gray-700 px-2 py-1">Stock</th>
                                                            <th className="text-left font-semibold text-gray-700 px-2 py-1">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {variants.map((v) => {
                                                            const stock = v?.stock ?? v?.stockLevel ?? 0;
                                                            const vThreshold = typeof v?.lowStockThreshold === 'number' ? v.lowStockThreshold : lowStockThreshold;
                                                            const st = stockStatus(stock, vThreshold);
                                                            return (
                                                                <tr key={v?.id} className="odd:bg-white even:bg-gray-50">
                                                                    <td className="px-2 py-1 text-gray-800">
                                                                        <div className="flex flex-wrap items-center gap-1">
                                                                            {attrsToLabel(v?.attributes)}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-2 py-1 text-right tabular-nums">{Number(stock || 0)}</td>
                                                                    <td className="px-2 py-1">
                                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded-full ${st.color}`}>
                                                                            {st.icon === 'in' ? (
                                                                                <FiCheckCircle className="w-3 h-3" />
                                                                            ) : st.icon === 'low' ? (
                                                                                <FiAlertTriangle className="w-3 h-3" />
                                                                            ) : (
                                                                                <FiXCircle className="w-3 h-3" />
                                                                            )}
                                                                            {st.label}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="p-2 text-xs text-gray-500">No variants</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border border-black/10 bg-gray-50 p-2">
                                    {variantsLoading ? (
                                        <div className="text-xs text-gray-500">Loading stats…</div>
                                    ) : variantsError ? (
                                        <div className="text-xs text-red-600">{variantsError}</div>
                                    ) : !variants?.length ? (
                                        <div className="text-xs text-gray-500">No variants</div>
                                    ) : (
                                        <QuickStatsPanel variants={variants} defaultThreshold={lowStockThreshold} />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProductCard;

// Compact stats panel for the Quick Stats tab
function QuickStatsPanel({ variants, defaultThreshold }) {
    const totals = React.useMemo(() => {
        const result = {
            count: 0,
            stockTotal: 0,
            inStock: 0,
            lowStock: 0,
            outOfStock: 0,
            minPrice: null,
            maxPrice: null,
        };
        (variants || []).forEach(v => {
            const stock = Number(v?.stock ?? 0) || 0;
            const th = typeof v?.lowStockThreshold === 'number' ? v.lowStockThreshold : defaultThreshold;
            result.count += 1;
            result.stockTotal += stock;
            const price = v?.price != null ? Number(v.price) : null;
            if (price != null && !Number.isNaN(price)) {
                result.minPrice = result.minPrice == null ? price : Math.min(result.minPrice, price);
                result.maxPrice = result.maxPrice == null ? price : Math.max(result.maxPrice, price);
            }
            if (stock <= 0) result.outOfStock += 1;
            else if (stock <= (typeof th === 'number' ? th : defaultThreshold)) result.lowStock += 1;
            else result.inStock += 1;
        });
        return result;
    }, [variants, defaultThreshold]);

    return (
        <div className="grid grid-cols-2 gap-1.5">
            <StatCard label="Total stock" value={totals.stockTotal} />
            <StatCard label="Price range" value={formatRange(totals.minPrice, totals.maxPrice)} />
            <StatCard label="In stock" value={totals.inStock} tone="good" />
            <StatCard label="Low stock" value={totals.lowStock} tone="warn" />
            <StatCard label="Out of stock" value={totals.outOfStock} tone="bad" />
            <StatCard label="Variants" value={totals.count} />
        </div>
    );
}

function StatCard({ label, value, tone }) {
    const toneClass =
        tone === 'good'
            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
            : tone === 'warn'
                ? 'text-amber-800 bg-amber-50 border-amber-200'
                : tone === 'bad'
                    ? 'text-rose-700 bg-rose-50 border-rose-200'
                    : 'text-gray-900 bg-white border-black/10';
    return (
        <div className={`rounded-md border p-1.5 ${toneClass}`}>
            <div className="text-[9px] font-semibold uppercase tracking-wide text-black/50 leading-none">{label}</div>
            <div className="mt-0.5 text-xs font-semibold tabular-nums leading-tight">{value ?? '—'}</div>
        </div>
    );
}

function formatRange(min, max) {
    if (min == null && max == null) return '—';
    if (min == null) return `≤ ${max}`;
    if (max == null) return `≥ ${min}`;
    if (min === max) return String(min);
    return `${min} - ${max}`;
}

