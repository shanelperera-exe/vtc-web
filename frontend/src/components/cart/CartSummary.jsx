import React, { useMemo, useState } from 'react';
import Checkbox from '../ui/Checkbox';
import { FiInfo } from 'react-icons/fi';
import { useCart } from '../../context/CartContext.jsx';

export default function CartSummary() {
  const [agreed, setAgreed] = useState(false);
  const { cartItems } = useCart();

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + price * qty;
    }, 0);
  }, [cartItems]);

  function formatLKR(amount) {
    try {
      return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(Number(amount) || 0);
    } catch {
      return `Rs ${amount}`;
    }
  }

  return (
    <aside className="w-full lg:w-90">
      <div className="checkout-sidebar bg-white border-2 p-5 shadow-sm lg:sticky lg:top-28">
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
              <button
                type="button"
                className={`w-full text-white py-2 ${agreed ? 'bg-black' : 'bg-gray-400 cursor-not-allowed'}`}
                disabled={!agreed}
                aria-disabled={!agreed}
              >
                Proceed to checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
