import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import orderApi from '../api/orderApi';
import shippingApi from '../api/shippingApi';
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
  Mail,
  DollarSign,
} from 'lucide-react';

function formatCurrency(v) {
  if (v == null) return '—';
  // Always show two decimal places and use locale thousands separator
  const n = Number(v) || 0;
  return `LKR ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  // Support multiple shapes returned by different APIs (line1 / address1 / street, state / province, postalCode / postal)
  const line1 = addr.line1 || addr.address1 || addr.street || addr.address || addr.line || '';
  const line2 = addr.line2 || addr.address2 || addr.address_2 || '';
  const city = addr.city || addr.town || addr.village || '';
  const state = addr.state || addr.province || '';
  const district = addr.district || '';
  const postal = addr.postalCode || addr.postal || addr.postcode || addr.zip || '';
  const company = addr.company || addr.org || addr.organization || '';
  const country = addr.country || '';

  const parts = [
    company,
    line1,
    line2,
    [city, state].filter(Boolean).join(', '),
    [district, postal].filter(Boolean).join(' '),
    country,
  ].filter(Boolean);
  return parts.join('\n');
}

function getOrderName(o) {
  if (!o) return null;
  const fromFlat = [o.customerFirstName, o.customerLastName].filter(Boolean).join(' ');
  if (fromFlat) return fromFlat;
  if (o.customer && (o.customer.firstName || o.customer.lastName)) return [o.customer.firstName, o.customer.lastName].filter(Boolean).join(' ');
  if (o.customer && o.customer.name) return o.customer.name;
  if (o.name) return o.name;
  return null;
}

function getOrderEmail(o) {
  if (!o) return null;
  return o.customerEmail || o.customer?.email || o.email || null;
}

function getOrderPhone(o) {
  if (!o) return null;
  return o.customerPhone || o.customer?.phone || o.phone || null;
}

function getAddress(o, which) {
  if (!o) return null;
  // prefer explicit DTO properties
  if (which === 'billing') return o.billingAddress || o.billing || o.billing_address || o.billingAddressDTO || null;
  if (which === 'shipping') return o.shippingAddress || o.shipping || o.shipping_address || o.shippingAddressDTO || null;
  return null;
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
  const [shippingFromConfig, setShippingFromConfig] = useState(null);
  const id = paramOrderNumber || (order && (order.orderNumber || order.id || order.orderId)) || location.state?.orderNumber || location.state?.orderId;

  useEffect(() => {
    let active = true;
    async function fetchOrder() {
      if (!id) return;
      // If we already have an order with items and contact/address info, skip fetch.
      // But if items are present but billing/shipping/contact are missing (e.g. location.state from checkout may have partial data), fetch full order details.
      const hasItems = order && Array.isArray(order.items) && order.items.length > 0;
      const hasContactOrAddress = order && (order.billingAddress || order.shippingAddress || order.customerPhone || order.customerFirstName || order.customerEmail);
      const hasShipping = order && (order.shippingFee != null || order.shipping != null || order.shippingAmount != null || order.summary?.shipping != null || order.shipping_amount != null);
      // If we already have items, contact info and shipping, skip fetching. Otherwise fetch full order from API.
      if (hasItems && hasContactOrAddress && hasShipping) return;
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
  }, [id, order]);

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
  const displayName = getOrderName(order) || '—';
  const displayEmail = getOrderEmail(order) || '—';
  const displayPhone = getOrderPhone(order) || '—';
  const displayBilling = formatAddress(getAddress(order, 'billing'));
  const displayShipping = formatAddress(getAddress(order, 'shipping'));
  const displayPaymentMethod = (order?.paymentInfo?.cardType ? order.paymentInfo.cardType : (order?.paymentMethod || '—')).replaceAll ? String(order?.paymentMethod || (order?.paymentInfo?.cardType || '—')).replaceAll('_',' ') : (order?.paymentMethod || order?.paymentInfo?.cardType || '—');
  const displayCardLast4 = order?.paymentInfo?.cardLast4 ? `•••• ${order.paymentInfo.cardLast4}` : null;
  const displayCardExpiry = (order?.paymentInfo?.cardExpMonth || order?.paymentInfo?.cardExpYear) ? `${order.paymentInfo.cardExpMonth || ''}/${order.paymentInfo.cardExpYear ? String(order.paymentInfo.cardExpYear).slice(-2) : ''}` : null;
  const isCash = String(order?.paymentMethod || displayPaymentMethod || '').toUpperCase().includes('CASH');

  // compute totals fallback
  const itemCost = order?.subtotal != null
    ? Number(order.subtotal)
    : items.reduce((s, it) => s + ((Number(it.unitPrice ?? it.price ?? 0)) * (it.quantity ?? it.qty ?? 1)), 0);
  const parseNumber = (v) => {
    if (v == null) return 0
    if (typeof v === 'number') return v
    if (typeof v === 'string') return Number(v) || 0
    if (typeof v === 'object') return Number(v.amount ?? v.value ?? v.shippingFee ?? v.fee ?? 0) || 0
    return 0
  }
  const shippingCandidates = (
    order?.shippingFee ?? order?.shipping ?? order?.shippingAmount ?? order?.shipping_amount ?? order?.summary?.shipping ?? order?.billing?.summary?.shipping ?? null
  )
  const shippingCost = parseNumber(shippingCandidates)
  const effectiveShipping = (shippingFromConfig != null) ? Number(shippingFromConfig) : shippingCost;
  const tax = 0
  const coupon = order?.discountTotal != null ? Number(order.discountTotal) : 0;
  const totalCost = itemCost + effectiveShipping - (coupon || 0)

  useEffect(() => {
    let active = true;
    async function fetchShippingConfig() {
      // If shipping already present or a positive amount, skip config fetch.
      if (!order) return;
      if (shippingCost && Number(shippingCost) > 0) return;
      try {
        const amt = await shippingApi.getShippingAmount();
        if (!active) return;
        if (amt != null) setShippingFromConfig(Number(amt) || 0);
      } catch {
        // ignore errors, leave as null
      }
    }
    fetchShippingConfig();
    return () => { active = false; };
  }, [order, shippingCost]);

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
    <div className="min-h-screen bg-gray-50">
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
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-black/10">
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
              <button onClick={onDownloadInvoice} className="inline-flex items-center gap-2 bg-white/95 hover:bg-white text-emerald-800 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm">
                <Download className="h-4 w-4" /> Invoice
              </button>
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-white/20">
                <Printer className="h-4 w-4" /> Print
              </button>
              <button onClick={onTrack} className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold">
                <Truck className="h-4 w-4" /> Track
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {/* Test Order Items header */}
                <div className="px-2 sm:px-0">
                  <div className="text-xl font-semibold text-gray-700 mb-2">Order Items</div>
                </div>
                {loading && (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border-2 rounded-md animate-pulse">
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
                    <div key={it.id || idx} className="flex items-center gap-4 bg-white p-4 border border-black/10 rounded-xl shadow-sm">
                      <img src={image} alt={title} className="w-16 h-16 rounded-lg object-cover bg-gray-50 border border-black/10" />
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
                <div className="mt-4 border-t-2 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                  <div className="border-2 rounded-lg p-4">
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
                  <div className="border-2 rounded-lg p-4">
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
              <div className="border border-black/10 rounded-2xl p-5 bg-gray-50">
                <div className="text-sm mt-0 flex justify-between items-center text-gray-600"><span>Items subtotal</span><span className="font-medium text-gray-900">{formatCurrency(itemCost)}</span></div>

                <div className="mt-3 text-sm flex justify-between text-gray-600"><span>Shipping</span><span>{formatCurrency(effectiveShipping)}</span></div>
                <div className="mt-1 text-sm flex justify-between text-gray-600"><span>Tax</span><span>{formatCurrency(tax)}</span></div>
                <div className="mt-1 text-sm flex justify-between text-gray-600"><span>Discount</span><span className="text-emerald-700">-{formatCurrency(coupon)}</span></div>

                <div className="mt-4 border-t border-black/10 pt-3 flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-700">Total</div>
                  <div className="text-lg font-semibold">{formatCurrency(totalCost)}</div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={onDownloadInvoice} className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 bg-white text-gray-800 text-xs font-semibold border border-black/10 hover:bg-gray-50">
                    <Download className="h-4 w-4" /> Invoice
                  </button>
                  <button onClick={onTrack} className="inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold">
                    <Truck className="h-4 w-4" /> Track
                  </button>
                </div>
              </div>

              <div className="border border-black/10 rounded-2xl p-5 bg-white">
                <div className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><User className="h-4 w-4 text-gray-500" /> Contact</div>
                <div className="space-y-1 text-sm text-gray-700">
                  <div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /><span>{displayName}</span></div>
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /><span>{displayEmail}</span></div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /><span>{displayPhone}</span></div>
                  <div className="flex items-center gap-2"><Home className="h-4 w-4 text-gray-400" /><span className="whitespace-pre-line">{displayBilling}</span></div>
                </div>
              </div>

              <div className="border border-black/10 rounded-2xl p-5 bg-white">
                <div className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">{isCash ? <DollarSign className="h-4 w-4 text-gray-500" /> : <CreditCard className="h-4 w-4 text-gray-500" />} Payment details</div>
                <div className="space-y-1 text-sm text-gray-700">
                  <div className="flex items-center gap-2">{isCash ? <DollarSign className="h-4 w-4 text-gray-400" /> : <CreditCard className="h-4 w-4 text-gray-400" />}<span className="font-medium">{displayPaymentMethod}</span></div>
                  {displayCardLast4 && <div className="flex items-center gap-2"><span className="text-sm text-gray-600">{displayCardLast4}</span>{displayCardExpiry && <span className="text-sm text-gray-500"> • Exp {displayCardExpiry}</span>}</div>}
                  {order?.paymentInfo?.cardType && order?.paymentInfo?.cardLast4 == null && <div className="text-sm text-gray-600">{String(order.paymentMethod || '').replaceAll('_',' ')}</div>}
                </div>
              </div>

              <div className="border border-black/10 rounded-2xl p-5 bg-white">
                <div className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-500" /> Shipping Address</div>
                <div className="text-sm text-gray-700 whitespace-pre-line">{displayShipping}</div>
              </div>
            </aside>
          </div>

          {error && (
            <div className="px-5 sm:px-6 pb-6 -mt-3">
              <div className="border border-rose-200 rounded-xl bg-rose-50 text-rose-800 px-4 py-3 text-sm">{String(error)}</div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-center mt-8">
          <button onClick={onContinueShopping} className="bg-white px-5 py-2.5 shadow-sm text-sm font-semibold rounded-xl border border-black/10 hover:bg-gray-50">Continue shopping</button>
        </div>
      </div>
    </div>
  );
}
