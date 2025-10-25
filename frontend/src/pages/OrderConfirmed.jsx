import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import orderApi from '../api/orderApi';
import { getProductDetails } from '../api/productApi';
import {
  BadgeCheck,
  CalendarDays,
  CreditCard,
  Download,
  Home,
  MapPin,
  Package,
  Phone,
  Printer,
  ReceiptText,
  Truck,
  User,
} from 'lucide-react';

function formatCurrency(v) {
  if (v == null) return '—';
  return `LKR ${Number(v).toLocaleString()}`;
}

function shortDate(d) {
  if (!d) return '—';
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return String(d);
  }
}

function formatAddress(addr) {
  if (!addr) return '—';
  const parts = [
    addr.company,
    addr.line1,
    addr.line2,
    [addr.city, addr.state].filter(Boolean).join(', '),
    [addr.district, addr.postalCode].filter(Boolean).join(' '),
    addr.country,
  ].filter(Boolean);
  return parts.join('\n');
}

export default function OrderConfirmed() {
  const { orderNumber: paramOrderNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initial = location.state?.order || null;
  const [order, setOrder] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Cache of productId -> primary image URL for items missing snapshot
  const [productImages, setProductImages] = useState({});
  const id = paramOrderNumber || (order && (order.orderNumber || order.id || order.orderId)) || location.state?.orderNumber || location.state?.orderId;

  useEffect(() => {
    let active = true;
    async function fetchOrder() {
      if (!id) return;
      // if we already have full order with items, skip
      if (order && Array.isArray(order.items) && order.items.length > 0) return;
      setLoading(true);
      try {
        const o = await orderApi.getOrder(id, { withItems: true });
        if (active) setOrder(o);
      } catch (e) {
        if (active) setError(e?.message || 'Failed to load order.');
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchOrder();
    return () => { active = false; };
  }, [id]);

  // When order items load, fetch primary product image for any items missing imageUrl
  useEffect(() => {
    let cancelled = false;
    const fetchMissingImages = async () => {
      if (!Array.isArray(order?.items) || order.items.length === 0) return;
      const missing = order.items
        .filter(it => !it?.imageUrl && it?.productId)
        .map(it => it.productId);
      // Unique productIds not already cached
      const unique = Array.from(new Set(missing)).filter(pid => !(pid in productImages));
      if (unique.length === 0) return;
      try {
        const results = await Promise.allSettled(unique.map(pid => getProductDetails(pid)));
        const updates = {};
        results.forEach((res, idx) => {
          const pid = unique[idx];
          if (res.status === 'fulfilled' && res.value) {
            const p = res.value;
            const primary = p?.primaryImageUrl || p?.image || (Array.isArray(p?.imageUrls) ? p.imageUrls[0] : null);
            if (primary) updates[pid] = primary;
          }
        });
        if (!cancelled && Object.keys(updates).length > 0) {
          setProductImages(prev => ({ ...prev, ...updates }));
        }
      } catch {
        // ignore fetch errors, UI will show placeholder
      }
    };
    fetchMissingImages();
    return () => { cancelled = true; };
  }, [order?.items, productImages]);

  const onTrack = () => {
  if (!id) return;
  navigate(`/orders/${id}`);
  };

  const onDownloadInvoice = () => {
    if (!id) return;
    // best-effort: open invoice endpoint in a new tab
    (async () => {
      try {
        if (order?.id) {
          window.open(`/api/orders/${order.id}/invoice`, '_blank');
          return;
        }
        // fetch order to resolve numeric id
        const o = await orderApi.getOrder(id, { withItems: true });
        if (o && o.id) {
          window.open(`/api/orders/${o.id}/invoice`, '_blank');
        }
      } catch {
        // fallback: try number-based invoice (may not exist on server)
        window.open(`/api/orders/number/${id}/invoice`, '_blank');
      }
    })();
  };

  const onContinueShopping = () => navigate('/');

  const items = Array.isArray(order?.items) ? order.items : [];
  const createdAt = order?.placedAt || order?.createdAt || order?.created || order?.orderDate || null;
  const estimated = order?.estimatedDeliveryDate || null;
  const status = order?.status || 'PLACED';
  const orderNumber = order?.orderNumber || id || '—';

  // compute totals fallback
  const itemCost = order?.subtotal != null
    ? Number(order.subtotal)
    : items.reduce((s, it) => s + ((Number(it.unitPrice ?? it.price ?? 0)) * (it.quantity ?? it.qty ?? 1)), 0);
  const shippingCost = order?.shippingFee != null ? Number(order.shippingFee) : 0;
  const tax = order?.taxTotal != null ? Number(order.taxTotal) : 0;
  const coupon = order?.discountTotal != null ? Number(order.discountTotal) : 0;
  const totalCost = order?.total != null ? Number(order.total) : (itemCost + shippingCost + tax - (coupon || 0));

  const statusChip = useMemo(() => {
    const map = {
      PLACED: { label: 'Order placed', color: 'bg-teal-100 text-teal-800 border-teal-200' },
      CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      PROCESSING: { label: 'Processing', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      SHIPPED: { label: 'Shipped', color: 'bg-sky-100 text-sky-800 border-sky-200' },
      OUT_FOR_DELIVERY: { label: 'Out for delivery', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      DELIVERED: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border-rose-200' },
    };
    return map[status] || map.PLACED;
  }, [status]);

  return (
    <div className="min-h-screen bg-[#fbfaf6]">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center rounded-full bg-emerald-700 p-3 sm:p-4 shadow-md">
            <BadgeCheck className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-100" />
          </div>
          <h1 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-semibold text-gray-900">Thank you! Your order is confirmed.</h1>
          <p className="mt-2 text-sm text-gray-600">We’ve sent a confirmation email with the details.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white px-5 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${statusChip.color}`}>
                  <Package className="h-3.5 w-3.5" /> {statusChip.label}
                </span>
                <span className="text-xs text-emerald-100 inline-flex items-center gap-1">
                  <ReceiptText className="h-3.5 w-3.5" /> Order
                </span>
              </div>
              <div className="text-sm text-emerald-100">
                <span className="opacity-90">Order ID:</span> <span className="font-semibold">{orderNumber}</span>
              </div>
              <div className="text-xs mt-0.5 text-emerald-100/90 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Placed {shortDate(createdAt)}</span>
                <span className="inline-flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> ETA {shortDate(estimated || (createdAt ? new Date(new Date(createdAt).getTime() + 5*24*60*60*1000) : null))}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button onClick={onDownloadInvoice} className="inline-flex items-center gap-2 bg-white/95 hover:bg-white text-emerald-800 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm">
                <Download className="h-4 w-4" /> Invoice
              </button>
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border border-white/20">
                <Printer className="h-4 w-4" /> Print
              </button>
              <button onClick={onTrack} className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-emerald-900 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold">
                <Truck className="h-4 w-4" /> Track
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {loading && (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border animate-pulse">
                        <div className="w-16 h-16 bg-gray-200 rounded-md" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-1/2 bg-gray-200 rounded" />
                          <div className="h-3 w-1/3 bg-gray-200 rounded" />
                        </div>
                        <div className="w-24 h-3 bg-gray-200 rounded" />
                      </div>
                    ))}
                  </div>
                )}

                {!loading && items.length === 0 && (
                  <div className="text-sm text-gray-600 py-6 text-center">No item details available for this order.</div>
                )}

                {items.map((it, idx) => {
                  const qty = it.quantity ?? it.qty ?? 1;
                  const unit = Number(it.unitPrice ?? it.price ?? 0);
                  const lineTotal = unit * qty;
                  const title = it.productName || it.name || it.title || it.product?.name || 'Product';
                  const image = it.imageUrl || productImages[it.productId] || it.image || it.product?.image;
                  const variant = (() => {
                    // Prefer structured variation attributes if available
                    const attrs = it.variationAttributes || it.attributes || it.attributesMap || null;
                    if (attrs && typeof attrs === 'object' && Object.keys(attrs).length > 0) {
                      try {
                        return Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join(', ');
                      } catch {
                        // fallthrough
                      }
                    }
                    // Legacy or simpler fields
                    if (it.variant) return it.variant;
                    if (it.size) return `Size: ${it.size}`;
                    if (it.color) return `Color: ${it.color}`;
                    if (it.product?.variant) return it.product.variant;
                    return null;
                  })();
                  return (
                    <div key={it.id || idx} className="flex items-center gap-4 bg-white p-4 border">
                      <img src={image} alt={title} className="w-16 h-16 object-cover bg-gray-50" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{title}</div>
                        <div className="mt-1 text-xs text-gray-500 flex flex-wrap items-center gap-3">
                          <span>Qty: {qty}</span>
                          {variant && <span className="inline-flex items-center gap-1"><Package className="h-3 w-3" /> {String(variant)}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">{formatCurrency(lineTotal)}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(unit)} each</div>
                      </div>
                    </div>
                  );
                })}

                {/* Info grid */}
                <div className="mt-4 border-t pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                  <div className="border p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment</div>
                    <div className="flex items-start gap-3 text-sm text-gray-700">
                      <CreditCard className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div>
                        {order?.paymentInfo?.cardType ? (
                          <span className="font-medium">{order.paymentInfo.cardType}</span>
                        ) : (
                          <span className="font-medium">{String(order?.paymentMethod || '—').replaceAll('_',' ')}</span>
                        )}
                        {order?.paymentInfo?.cardLast4 && (
                          <span className="text-gray-500"> •••• {order.paymentInfo.cardLast4}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="border p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Delivery</div>
                    <div className="flex items-start gap-3 text-sm text-gray-700">
                      <Truck className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="font-medium">{String(order?.deliveryMethod || 'STANDARD_DELIVERY').replaceAll('_',' ')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Summary + addresses */}
            <aside className="space-y-4">
              <div className="border p-4 bg-gray-50">
                <div className="text-sm text-gray-600">Items subtotal</div>
                <div className="mt-1 text-right font-medium text-gray-900">{formatCurrency(itemCost)}</div>

                <div className="mt-3 text-sm flex justify-between text-gray-600"><span>Shipping</span><span>{formatCurrency(shippingCost)}</span></div>
                <div className="mt-1 text-sm flex justify-between text-gray-600"><span>Tax</span><span>{formatCurrency(tax)}</span></div>
                <div className="mt-1 text-sm flex justify-between text-gray-600"><span>Discount</span><span className="text-emerald-700">-{formatCurrency(coupon)}</span></div>

                <div className="mt-4 border-t pt-3 flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-700">Total</div>
                  <div className="text-lg font-semibold">{formatCurrency(totalCost)}</div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={onDownloadInvoice} className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white text-gray-800 text-xs font-medium border">
                    <Download className="h-4 w-4" /> Invoice
                  </button>
                  <button onClick={onTrack} className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-800 text-white text-xs font-semibold">
                    <Truck className="h-4 w-4" /> Track
                  </button>
                </div>
              </div>

              <div className="border p-4">
                <div className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><User className="h-4 w-4 text-gray-500" /> Contact</div>
                <div className="space-y-1 text-sm text-gray-700">
                  <div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /><span>{[order?.customerFirstName, order?.customerLastName].filter(Boolean).join(' ') || '—'}</span></div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /><span>{order?.customerPhone || '—'}</span></div>
                  <div className="flex items-center gap-2"><Home className="h-4 w-4 text-gray-400" /><span className="whitespace-pre-line">{formatAddress(order?.billingAddress)}</span></div>
                </div>
              </div>

              <div className="border p-4">
                <div className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-500" /> Shipping Address</div>
                <div className="text-sm text-gray-700 whitespace-pre-line">{formatAddress(order?.shippingAddress)}</div>
              </div>
            </aside>
          </div>

          {error && (
            <div className="px-5 sm:px-6 pb-6 -mt-3">
              <div className="border border-rose-200 bg-rose-50 text-rose-800 px-4 py-3 text-sm">{String(error)}</div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-center mt-8">
          <button onClick={onContinueShopping} className="bg-white px-4 py-2 shadow-sm text-sm font-medium rounded-full border hover:bg-gray-50">Continue shopping</button>
        </div>
      </div>
    </div>
  );
}
