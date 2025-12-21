import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Checkbox from '../ui/Checkbox';
import { FiInfo, FiCreditCard } from 'react-icons/fi';
import { useCart } from '../../context/CartContext.jsx';

export default function CartSummary() {
  const [agreed, setAgreed] = useState(false);
  const { cartItems } = useCart();
  const navigate = useNavigate();

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + price * qty;
    }, 0);
  }, [cartItems]);

  // Detect any items whose quantity exceeds known available stock
  const hasExceededStock = useMemo(() => {
    return cartItems.some(item => {
      const avail = item?.availableStock ?? item?.stock ?? null
      if (avail == null) return false
      return Number(item.quantity || 0) > Number(avail)
    })
  }, [cartItems])

  function formatLKR(amount) {
    try {
      return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(Number(amount) || 0);
    } catch {
      return `Rs ${amount}`;
    }
  }

  return (
    <aside className="w-full lg:w-90">
      <div className="checkout-sidebar bg-white border-2 p-5 shadow-sm rounded-lg lg:sticky lg:top-28 overflow-hidden">
        <h3 className="text-xl font-semibold mb-4">Cart Summary</h3>
        <div className="cart-footer pt-0">
          <div className="cart-subtotal flex items-center justify-between mb-3">
            <span className="font-medium">Subtotal</span>
            <span className="font-semibold">{formatLKR(subtotal)}</span>
          </div>

          <div className="tax-note flex items-center gap-2 text-xs text-gray-500 mb-4">
            <FiInfo className="w-4 h-4 text-gray-400" aria-hidden="true" />
            <span>Taxes and shipping calculated at checkout</span>
          </div>

          <div className="sidebar-bottom">
            <div className="cart-agreement flex items-start gap-3 mb-4">
              <Checkbox
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                ariaLabel="Agree to terms and conditions"
              />
              <label className="text-sm cursor-pointer" onClick={() => setAgreed(prev => !prev)}>
                I agree with the <a href="/pages/term-and-conditions" target="_blank" rel="noreferrer" className="underline">terms &amp; conditions</a>
              </label>
            </div>

            <div className="cart__ctas">
              <noscript>
                <button type="submit" className="w-full mb-3 py-2 text-sm border">Update</button>
              </noscript>
              {hasExceededStock && (
                <div className="text-sm text-rose-700 bg-rose-100 border border-rose-200 p-2 mb-3">
                  Some items exceed available stock. Please adjust quantities before checkout.
                </div>
              )}
              <button
                type="button"
                className={`w-full text-white py-2 rounded-lg ${agreed && !hasExceededStock ? 'bg-black' : 'bg-gray-400 cursor-not-allowed'}`}
                disabled={!agreed || hasExceededStock}
                aria-disabled={!agreed || hasExceededStock}
                onClick={() => { if (agreed && !hasExceededStock) navigate('/checkout'); }}
              >
                <FiCreditCard className="w-5 h-5 inline-block mb-0.5 mr-2" aria-hidden="true" />
                Proceed to checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
