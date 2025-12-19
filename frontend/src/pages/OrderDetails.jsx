import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { useAuth } from '../context/AuthContext';
// Order status icons are handled inside OrderStatusBar; no direct icon imports needed here
import ProductInOrder from "../components/order/ProductInOrder";
import OrderStatusBar from "../components/order/OrderStatusBar";
import BillingSummary from "../components/order/BillingSummary";
// Removed static orders/products import
import useOrders from "../api/hooks/useOrders";
import { getProductDetails } from "../api/productApi";
import orderApi from "../api/orderApi";
import BackBtn from "../components/ui/BackBtn";
import BackToTopBtn from "../components/ui/BackToTopBtn";
import PopupModal from "../components/ui/PopupModal";
import ReviewForm from "../components/reviews/ReviewForm";
import { createReview } from '../api/reviewApi';
import { FiEdit, FiShoppingBag, FiTruck, FiCreditCard, FiFileText, FiPackage } from 'react-icons/fi';

const OrderDetails = () => {
    const { orderNumber } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth() || {};
    const { order, loading: ordersLoading, reload } = useOrders({ orderNumber });
    const [fallbackOrder, setFallbackOrder] = useState(null);
    const [loadingOrder, setLoadingOrder] = useState(false);
    const [productCache, setProductCache] = useState({});

    // Show BackToTopBtn only after scrolling (keep hooks near top so they run unconditionally)
    const [showTopBtn, setShowTopBtn] = useState(false);
    // State for currently open review modal (product id)
    // Moved here so hooks order remains stable across renders (avoid conditional hooks)
    const [activeReviewProductId, setActiveReviewProductId] = useState(null);
    useEffect(() => {
        const handleScroll = () => {
            setShowTopBtn(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // If auth is still loading, show a small placeholder
    if (authLoading) {
        return (
            <>
                <Navbar />
                <main className="mx-auto max-w-7xl py-16 px-8">
                    <div className="p-6 text-sm text-gray-500">Checking authentication...</div>
                </main>
            </>
        );
    }

    // If user is not authenticated, show an error page — only authenticated users may view order details
    if (!isAuthenticated) {
        return (
            <>
                <Navbar />
                <main className="mx-auto max-w-3xl py-16 px-8">
                    <div className="bg-white shadow-sm border border-black/10 rounded-xl p-8 text-center">
                        <h1 className="text-2xl font-semibold mb-4">Access denied</h1>
                        <p className="text-gray-600 mb-6">You must be signed in to view order details. Please sign in with the account that placed this order.</p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold border border-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            >
                                Sign in
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="px-4 py-2 rounded-lg bg-white border border-black/10 text-gray-900 font-semibold hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                            >
                                Go to home
                            </button>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    const effectiveOrder = order || fallbackOrder;

    useEffect(() => {
        let active = true;
        async function loadProducts() {
            if (!effectiveOrder?.items) return;
            for (const it of effectiveOrder.items) {
                const pid = it.productId;
                // don't refetch already cached entries
                if (!pid || Object.prototype.hasOwnProperty.call(productCache, pid)) continue;
                try {
                    // fetch product details (includes images)
                    const p = await getProductDetails(pid);
                    if (active) setProductCache(c => ({ ...c, [pid]: p }));
                } catch {
                    if (active) setProductCache(c => ({ ...c, [pid]: null }));
                }
            }
        }
        loadProducts();
        return () => { active = false; };
    }, [effectiveOrder]);

    if (!isAuthenticated && !authLoading) {
        return (
            <>
                <Navbar />
                <main className="mx-auto max-w-7xl py-16 px-8">
                    <div className="p-6 text-sm text-red-600">You must be logged in to view order details. Please <a href="/auth/login" className="text-blue-600 underline">sign in</a>.</div>
                </main>
            </>
        );
    }

    if (!effectiveOrder) {
        if (ordersLoading || loadingOrder) {
            return (
                <>
                    <Navbar />
                    <main className="mx-auto max-w-7xl py-16 px-8">
                        <div className="p-6 text-sm text-gray-500">Loading order...</div>
                    </main>
                </>
            );
        }
        return (
            <>
                <Navbar />
                <main className="mx-auto max-w-7xl py-16 px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold">Order not found</h1>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 text-sm font-semibold text-emerald-700 hover:underline"
                        >
                            Go back
                        </button>
                    </div>
                </main>
            </>
        );
    }

    // Helper to enrich products (outside render)
    function getEnrichedProducts(orderItems, productCache) {
        if (!Array.isArray(orderItems)) return [];
        return orderItems.map((item) => {
            const base = productCache[item.productId];
            const unit = item.unitPrice || item.price || 0;
            const qty = item.quantity ?? 1;
            const priceLkr = Number(unit) * qty;
            const attrs = item.variationAttributes || {};
            const color = item.color || attrs.color || attrs.Color || attrs.colour || attrs.Colour;
            const size = item.size || attrs.size || attrs.Size;
            const pickImage = (prod, ordItem) => {
                if (!prod) return ordItem?.imageUrl || ordItem?.image || '';
                const candidates = [
                    prod.image,
                    prod.primaryImageUrl,
                    Array.isArray(prod.imageUrls) ? prod.imageUrls[0] : undefined,
                    prod.mainImageUrl,
                    prod.primaryImage,
                    prod.imageUrl,
                    prod.img,
                    prod.primary,
                ];
                for (const c of candidates) {
                    if (!c) continue;
                    if (typeof c === 'string' && c.trim()) return c;
                    if (typeof c === 'object') {
                        if (c.url) return c.url;
                        if (c.path) return c.path;
                        if (c.src) return c.src;
                    }
                }
                if (Array.isArray(prod.images)) {
                    const first = prod.images.find(i => i && (i.url || i.path || i.src));
                    if (first) return first.url || first.path || first.src || '';
                }
                return ordItem?.imageUrl || ordItem?.image || '';
            };
            const image = pickImage(base, item);
            if (!image && process.env.NODE_ENV !== 'production') {
                // eslint-disable-next-line no-console
                console.debug('OrderDetails: no image found for product', item.productId, item.variationId, base);
            }
            return {
                // use the productId (not the order item id) so review actions target the real product
                id: item.productId,
                name: base?.name || base?.title || item.productName || `Product ${item.productId}`,
                price: `LKR ${priceLkr.toLocaleString()}`,
                category: base?.category?.name || base?.category || item.categoryName || '',
                description: base?.description || item.productName || '',
                image,
                color,
                size,
                quantity: qty,
                status: item.status || {},
            };
        });
    }

    const enrichedProducts = getEnrichedProducts(effectiveOrder.items, productCache);

    if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('OrderDetails - effectiveOrder.items', effectiveOrder?.items);
        // eslint-disable-next-line no-console
        console.debug('OrderDetails - enrichedProducts', enrichedProducts);
    }

    const onViewInvoice = (e) => {
        if (e?.preventDefault) e.preventDefault();
        const id = effectiveOrder?.id;
        if (!id) return;
        // best-effort: open invoice endpoint in a new tab
        try { window.open(`/api/orders/${id}/invoice`, '_blank'); } catch {}
    };

    const canCancel = (() => {
        const st = String(effectiveOrder?.status || '').toUpperCase();
        return st === 'PLACED' || st === 'PROCESSING';
    })();

    const onCancelOrder = async () => {
        const id = effectiveOrder?.id;
        if (!id) return;
        // keep it simple; avoid accidental cancels
        try {
            const ok = window.confirm('Cancel this order?');
            if (!ok) return;
        } catch {
            // if confirm is blocked, proceed without it
        }
        try {
            await orderApi.cancelOrder(id);
            await reload();
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Failed to cancel order', e);
        }
    };

    // Compute order-level progress based on backend order.status enum
    const mapOrderStatusToProgress = (s) => {
        if (!s) return 0;
        const str = String(s).toUpperCase();
        if (str === 'CANCELLED') return -1;
        if (str === 'DELIVERED') return 3;
        if (str === 'SHIPPED') return 2;
        if (str === 'PROCESSING') return 1;
        // PLACED maps to 0
        return 0;
    };
    const orderProgress = mapOrderStatusToProgress(effectiveOrder?.status);

    // Derive a human-friendly order status label and detail (date/text)
    const statusSteps = ["Order placed", "Processing", "Shipped", "Delivered"];
    const statusLabel = orderProgress === -1 ? 'Cancelled' : (statusSteps[orderProgress] ?? effectiveOrder.status);
    const statusDetail = (() => {
        const times = effectiveOrder?.statusTimes || {};
        if (orderProgress === -1) {
            const dt = times.cancelled;
            if (dt?.date) return `Order cancelled on ${dt.date}${dt.time ? ` ${dt.time}` : ''}`;
            return 'Order cancelled';
        }
        if (orderProgress === 0) {
            const dt = times.placed;
            if (dt?.date) return `Order placed on ${dt.date}${dt.time ? ` ${dt.time}` : ''}`;
            return `Order placed on ${effectiveOrder.placed}${effectiveOrder.placedTime ? ` ${effectiveOrder.placedTime}` : ''}`;
        }
        if (orderProgress === 1) return 'Processing';
        if (orderProgress === 2) return 'Shipped';
        if (orderProgress === 3) return 'Delivered';
        return effectiveOrder?.status;
    })();


    // Helper to format time strings like "14:32" -> "2:32 PM"
    const formatToAmPm = (timeStr) => {
        if (!timeStr) return null;
        // expecting HH:MM (24h)
        const [hStr, mStr] = timeStr.split(":");
        const h = parseInt(hStr, 10);
        const m = mStr;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = ((h + 11) % 12) + 1; // convert 0-23 to 1-12
        return `${hour12}:${m} ${ampm}`;
    };

    return (
        <>
            <Navbar />
            <div className="mx-auto max-w-7xl px-8 pt-8">
                <BackBtn onClick={() => navigate(-1)} />
            </div>
            <main className="mx-auto max-w-7xl py-8 px-8 relative">
                <div className="flex items-baseline justify-between mb-8 pb-2 px-0">
                    <div className="flex flex-col md:flex-row items-baseline gap-0 md:gap-4">
                        <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 inline-flex items-center gap-3">
                            <FiPackage className="w-7 h-7 text-emerald-700" aria-hidden="true" />
                            <span>Order {effectiveOrder?.orderNumber ? `#${effectiveOrder.orderNumber}` : `#${effectiveOrder?.id}`}</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-3 md:mt-0">
                            <button
                                type="button"
                                onClick={onViewInvoice}
                                className="inline-flex w-fit items-center gap-2 rounded-xl px-4 py-2 bg-white border border-black/10 text-sm font-semibold text-gray-900 hover:bg-black hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                                title="View invoice"
                            >
                                <span>View invoice</span>
                                <span aria-hidden="true">→</span>
                            </button>
                            {canCancel && (
                                <button
                                    type="button"
                                    onClick={onCancelOrder}
                                    className="inline-flex w-fit items-center gap-2 rounded-xl px-4 py-2 bg-white border border-rose-200 text-sm font-semibold text-rose-700 hover:bg-rose-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                                    title="Cancel order"
                                >
                                    Cancel order
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-baseline gap-4 justify-end">
                        <div className="text-md text-gray-500 text-right">
                            <div>Order placed <time dateTime={effectiveOrder.placed}><span className="text-gray-700 font-bold">{effectiveOrder.placed}</span></time></div>
                            {effectiveOrder.placedTime && (
                                <div className="text-gray-700 font-bold">{formatToAmPm(effectiveOrder.placedTime)}</div>
                            )}
                        </div>
                    </div>
                </div>
                {/* Order-level status (delegated to OrderStatusBar) */}
                <section aria-labelledby="order-status-heading" className="mb-8">
                    <OrderStatusBar
                        progress={orderProgress}
                        statusLabel={statusLabel}
                        statusDetail={statusDetail}
                        orderStatus={effectiveOrder.status}
                        statusTimes={effectiveOrder.statusTimes}
                    />
                </section>

                {/* Products in order */}
                <section aria-labelledby="products-heading" className="mb-12">
                    <h2 id="products-heading" className="text-3xl font-semibold mb-6">
                        <span className="inline-flex items-center gap-2">
                            <FiShoppingBag className="w-6 h-6 text-emerald-700" aria-hidden="true" />
                            <span>Products purchased</span>
                        </span>
                    </h2>
                    <div className="grid grid-cols-12 gap-8">
                        {enrichedProducts.map((product, idx) => {
                            const safeKey = `${product.name || 'product'}|${product.color || ''}|${product.size || ''}|${idx}`;
                            return (
                                <div key={safeKey} className="col-span-12 md:col-span-6">
                                    <ProductInOrder
                                        product={product}
                                        shippingUpdates={effectiveOrder.shippingUpdates}
                                        showStatus={false}
                                    >
                                        <hr className="-mt-3 mb-3 border-t border-gray-200" />
                                        <div>
                                            <div className="flex items-start justify-between gap-4">
                                                <h3 className="text-md font-semibold text-gray-900">Share your thoughts</h3>
                                                <a
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); setActiveReviewProductId(product.id); }}
                                                    className="inline-flex items-center gap-2 rounded-lg bg-black border border-black text-white text-sm font-semibold px-4 py-2 hover:bg-white hover:text-black transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                                                >
                                                    <FiEdit className="text-white group-hover:text-black" aria-hidden />
                                                    <span>Write a review</span>
                                                </a>
                                            </div>
                                            <p
                                                className="text-gray-600 text-xs -mt-3 max-w-[34rem]"
                                                style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                If you’ve used this product, <br />share your thoughts with other customers.
                                            </p>
                                        </div>
                                    </ProductInOrder>
                                </div>
                            );
                        })}
                    </div>
                    {/* Render PopupModal for the active product at the root level */}
                    {activeReviewProductId && (
                        <PopupModal isOpen={true} onClose={() => setActiveReviewProductId(null)} maxWidthClass="max-w-4xl">
                            <ReviewForm
                                productId={activeReviewProductId}
                                onCancel={() => setActiveReviewProductId(null)}
                                onSubmit={async (payload) => {
                                    try {
                                        // Build payload matching backend CreateReviewRequest
                                        const body = {
                                            // ensure productId is present for backend validation
                                            productId: activeReviewProductId,
                                            rating: payload.rating,
                                            title: payload.title,
                                            body: payload.body,
                                            name: payload.name,
                                            email: payload.email,
                                        };
                                        // debug logging to help trace why form submissions may not persist
                                        // eslint-disable-next-line no-console
                                        console.debug('Submitting review from UI', { productId: activeReviewProductId, body, payload });
                                        const res = await createReview(activeReviewProductId, body);
                                        // eslint-disable-next-line no-console
                                        console.debug('createReview response', res);
                                        // simple UX feedback for manual testing
                                        try { window.alert('Review submitted successfully'); } catch {}
                                        // Refresh product details in cache so new review shows up
                                        try {
                                            const p = await getProductDetails(activeReviewProductId);
                                            setProductCache(c => ({ ...c, [activeReviewProductId]: p }));
                                        } catch (e) {
                                            // ignore refresh errors
                                        }
                                    } catch (e) {
                                        // eslint-disable-next-line no-console
                                        console.error('Failed to submit review', e);
                                        try { window.alert('Failed to submit review: ' + (e?.message || e)); } catch {}
                                    } finally {
                                        setActiveReviewProductId(null);
                                    }
                                }}
                            />
                        </PopupModal>
                    )}
                </section>

                {/* Delivery details (order-level) */}
                <section aria-labelledby="delivery-details-heading" className="mb-12">
                    <h2 id="delivery-details-heading" className="text-3xl font-semibold mb-4">
                        <span className="inline-flex items-center gap-2">
                            <FiTruck className="w-6 h-6 text-emerald-700" aria-hidden="true" />
                            <span>Delivery details</span>
                        </span>
                    </h2>
                    <div className="bg-white shadow-sm border border-black/10 rounded-xl p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Delivery address</h3>
                                <address className="not-italic text-sm text-gray-700">
                                    {Array.isArray(effectiveOrder.address)
                                        ? effectiveOrder.address.map((line, i) => (
                                            <div key={i}>{line}</div>
                                        ))
                                        : null}
                                </address>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">Delivery method</h3>
                                <p className="text-sm text-gray-700">{effectiveOrder.deliveryMethod ?? 'Standard delivery'}</p>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Billing Summary */}
                <section aria-labelledby="billing-summary-heading" className="mb-12">
                    <h2 id="billing-summary-heading" className="text-3xl font-semibold mb-6">
                        <span className="inline-flex items-center gap-2">
                            <FiCreditCard className="w-6 h-6 text-emerald-700" aria-hidden="true" />
                            <span>Billing Summary</span>
                        </span>
                    </h2>
                    <BillingSummary billing={effectiveOrder.billing || { address: [], payment: {}, summary: {} }} />
                </section>

                {/* Order Notes */}
                {effectiveOrder.orderNotes && (
                    <section aria-labelledby="order-notes-heading" className="mb-12">
                        <h2 id="order-notes-heading" className="text-3xl font-semibold mb-4">
                            <span className="inline-flex items-center gap-2">
                                <FiFileText className="w-6 h-6 text-emerald-700" aria-hidden="true" />
                                <span>Order notes</span>
                            </span>
                        </h2>
                        <div className="bg-white shadow-sm border border-black/10 rounded-xl p-6">
                            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{effectiveOrder.orderNotes}</p>
                        </div>
                    </section>
                )}
                {/* Back to Top Button */}
                {showTopBtn && (
                    <div className="fixed bottom-8 right-6 z-50">
                        <BackToTopBtn />
                    </div>
                )}
            </main>
        </>
    );
}

export default OrderDetails;