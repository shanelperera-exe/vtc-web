import React from 'react'
import styled from 'styled-components'
import { FiShoppingCart } from 'react-icons/fi'
import { useCart } from '../../context/CartContext.jsx'
import { useNotifications } from './notificationsContext.js'

const AddToCartBtn = ({ product, quantity = 1, className = '', fullWidth = false, minWidthEm }) => {
  const { addToCart } = useCart()
  const { notify } = useNotifications()

  const handleAdd = () => {
    // Basic client-side stock validation: prefer explicit `product.stock` if provided.
    const stockVal = product?.stock ?? product?.unitsLeft ?? product?.availableStock ?? null
    const parsedStock = stockVal != null ? Number(stockVal) : null
    if (parsedStock != null && Number(quantity) > parsedStock) {
      const name = product?.name ?? 'Item'
      notify({ type: 'error', text: `Cannot add ${quantity} × ${name} — only ${parsedStock} available`, ttl: 4500 })
      return
    }

    addToCart(product, quantity)
    const name = product?.name ?? 'Item'
    notify({ type: 'cart', text: `Added ${quantity} × ${name} to cart`, ttl: 3500 })
  }
  return (
    <div className={`bg-white flex items-start ${fullWidth ? 'w-full' : ''} ${className}`}>
      <StyledWrapper className={`${fullWidth ? 'w-full' : 'h-fit w-fit'}`} $heightPx={48} $fontSizePx={16} $minWidthEm={minWidthEm ?? 27} $fullWidth={fullWidth}>
        <button type="button" onClick={handleAdd} aria-label="Add to cart">
          <span className="btn-icon" aria-hidden="true"><FiShoppingCart size={18} strokeWidth={2.4} /></span>
          <span className="btn-label">Add to Cart</span>
        </button>
      </StyledWrapper>
    </div>
  );
};

export default AddToCartBtn;

// Reuse the same styled outline wrapper as BuyNow
const StyledWrapper = styled.div`
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0;
  width: ${p => (p.$fullWidth ? '100%' : 'auto')};

  --btn-color: #00bf63;
  --btn-border: #000;
  --anim-color: #000;
  --text-default: #000;
  --text-hover: #fff;

  button {
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: ${p => (p.$fullWidth ? '100%' : 'auto')};
    min-width: ${p => (p.$fullWidth ? '0' : (p.$minWidthEm ? `${p.$minWidthEm}em` : '8em'))};
    height: ${p => (p.$heightPx ? `${p.$heightPx}px` : '40px')};
    line-height: 1.2;
    position: relative;
    cursor: pointer;
    overflow: hidden;
    border: 2px solid var(--btn-border);
    transition: color 0.5s, transform 0.2s ease;
    z-index: 1;
    font-size: ${p => (p.$fontSizePx ? `${p.$fontSizePx}px` : '16px')};
    font-weight: 600;
    color: var(--text-default);
      padding: 0 16px;
      border-radius: 8px;
    background: transparent;
  }

  .btn-icon { display: inline-flex; }
  .btn-icon svg { stroke-width: 2.2; }
  .btn-label { white-space: nowrap; }

  button::before {
    content: "";
    position: absolute;
    z-index: -1;
    background: var(--anim-color);
    height: 200px;
    width: 700px;
    border-radius: 50%;
  }

  button:hover { color: var(--text-hover); }
  button::before { top: 100%; left: 100%; transition: all 0.7s; }
  button:hover::before { top: -50px; left: -50px; }
  button:active::before { background: var(--anim-color); transition: background 0s; }
`