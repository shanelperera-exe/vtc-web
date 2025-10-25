import React from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { FiShoppingBag } from 'react-icons/fi'

// Props: product (with selectedVariationId or id), quantity (default 1)
const BuyNowBtn = ({ product, quantity = 1, className = '', fullWidth = false }) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const onBuy = async () => {
    if (!product) return
    try {
      await addToCart(product, quantity)
      navigate('/checkout')
    } catch {
      void 0
    }
  }

  return (
    <div className={`bg-white flex items-start ${fullWidth ? 'w-full' : ''} ${className}`}>
      <StyledWrapper className={`${fullWidth ? 'w-full' : 'h-fit w-fit'}`} $heightPx={48} $fontSizePx={16} $minWidthEm={16} $fullWidth={fullWidth}>
        <button type="button" onClick={onBuy} aria-label="Buy now">
          <span className="btn-icon" aria-hidden="true"><FiShoppingBag size={18} strokeWidth={2.4} /></span>
          <span className="btn-label">Buy Now</span>
        </button>
      </StyledWrapper>
    </div>
  )
}

export default BuyNowBtn

// Styled outline button adapted per request
const StyledWrapper = styled.div`
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0;
  width: ${p => (p.$fullWidth ? '100%' : 'auto')};

  /* Expose CSS vars for easy control */
  --btn-color: #0bd964; /* default color */
  --btn-border: #0bd964;   /* border black */
  --anim-color: #000;   /* animation fill color */
  --text-default: #000; /* default text color */
  --text-hover: #fff;   /* text on animation */

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
    transition: color 0.5s, transform 0.2s ease;
    z-index: 1;
    font-size: ${p => (p.$fontSizePx ? `${p.$fontSizePx}px` : '16px')};
    font-weight: 600;
    color: var(--text-default);
    padding: 0 16px;
    background: var(--btn-color);
  }

  .btn-icon { display: inline-flex; }
  .btn-icon svg { stroke-width: 2.2; }
  .btn-label { white-space: nowrap; }

  button::before {
    content: "";
    position: absolute;
    z-index: -1;
    background: var(--anim-color);
    height: 450px;
    width: 920px;
    border-radius: 50%;
  }

  button:hover {
    color: var(--text-hover);
  }

  button::before {
    top: 100%;
    left: 100%;
    transition: all 1s;
  }

  button:hover::before {
    top: -100px;
    left: -100px;
  }

  button:active::before {
    background: var(--anim-color);
    transition: background 0s;
  }
`