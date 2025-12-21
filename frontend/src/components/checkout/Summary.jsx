import React, { useMemo } from 'react'
import { useCart } from '../../context/CartContext'
import { FiClipboard } from 'react-icons/fi'

export default function Summary({ couponCode, couponDiscount, onApplyCoupon, couponApplying, couponMessage, setCouponCode }) {
  const { cartItems } = useCart()
  const formatLKR = (amount) => {
    try {
      const n = Number(amount) || 0
      return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
    } catch (e) {
      return `LKR ${Number(amount || 0).toFixed(2)}`
    }
  }
  // Group identical variant items so quantities combine instead of repeated rows
  const { grouped, subtotal, shipping, total, count } = useMemo(() => {
    const map = new Map();
    for (const item of cartItems) {
      // Use variation id (id) as grouping key; fallback to cartItemId if present
      const key = String(item.id || item.variationId || item.cartItemId || item.productVariationId || item.productId || item.name);
      if (!map.has(key)) {
        map.set(key, { ...item });
      } else {
        const existing = map.get(key);
        existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
        // prefer a real image if missing
        if (!existing.image && item.image) existing.image = item.image;
      }
    }
    const grouped = Array.from(map.values());
    const subtotal = grouped.reduce((acc, p) => acc + (p.price || 0) * (p.quantity || 1), 0);
    const count = grouped.reduce((acc, p) => acc + (p.quantity || 1), 0);
    const shipping = subtotal > 10000 || subtotal === 0 ? 0 : 750;
    const total = subtotal + shipping;
    return { grouped, subtotal, shipping, total, count };
  }, [cartItems])

  const discount = Number(couponDiscount || 0)

  return (
    <aside className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">Order Summary</h3>
      <div className="divide-y">
        <div className="space-y-2 pb-3">
          {grouped.length === 0 && <p className="text-sm text-gray-500">Your cart is empty.</p>}
          {grouped.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3 max-w-[65%]">
                <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-gray-50 border border-black/10 overflow-hidden flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-gray-400">No image</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  {/* Show product variant details if available */}
                  {(item.color || item.size || item.variationKey) && (
                    <p className="text-xs text-gray-500">
                      {item.color && <span>Color: {item.color}</span>}
                      {item.color && item.size && <span className="mx-1">|</span>}
                      {item.size && <span>Size: {item.size}</span>}
                      {!item.color && !item.size && item.variationKey && <span>{item.variationKey}</span>}
                    </p>
                  )}
                  <p className="text-gray-700 font-medium text-sm">Qty: {item.quantity || 1}</p>
                </div>
              </div>
              <p className="font-medium">{formatLKR((item.price || 0) * (item.quantity || 1))}</p>
            </div>
          ))}
        </div>
        {/* Coupon input after items list */}
        <div className="py-3">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">Have a coupon?</label>
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={couponCode || ''}
                onChange={(e) => setCouponCode && setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
              <button
                type="button"
                onClick={() => onApplyCoupon && onApplyCoupon('apply')}
                disabled={couponApplying}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                {couponApplying ? 'Applying...' : 'Apply'}
              </button>
            </div>
            {couponMessage && <p className="mt-2 text-sm text-gray-600">{couponMessage}</p>}
          </div>
        </div>
        <div className="py-3 text-sm space-y-1">
          <div className="flex justify-between"><span>Items ({count})</span><span>{formatLKR(subtotal)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{shipping ? formatLKR(shipping) : 'Free'}</span></div>
          {discount > 0 && (
            <div className="flex justify-between text-emerald-700"><span>Discount {couponCode ? `(${couponCode})` : ''}</span><span>- {formatLKR(discount)}</span></div>
          )}
          <div className="flex justify-between font-semibold text-lg text-gray-900 pt-2"><span>Total</span><span>{formatLKR(Math.max(0, subtotal + shipping - discount))}</span></div>
        </div>
      </div>
    </aside>
  )
}
