import React, { useState } from 'react';
import styled from 'styled-components';
import { useCart } from '../../context/CartContext.jsx'
import { useNotifications } from './notificationsContext.js'

const AddItemButton = ({ product }) => {
  const { addToCart } = useCart()
  const { notify } = useNotifications()
  const [added, setAdded] = useState(false)

  const handleClick = () => {
    addToCart(product, 1)
    setAdded(true)
    notify({
      type: 'cart',
      text: `${product?.name ?? 'Item'} added to cart`,
      ttl: 3500,
    })
    setTimeout(() => setAdded(false), 1500)
  }
  return (
    <StyledWrapper>
      <button className={`button ${added ? 'button--added' : ''}`} type="button" onClick={handleClick}>
        <span className="button__text">{added ? 'Added!' : 'Add to cart'}</span>
        <span className="button__icon">
          {added ? (
            <svg className="svg" fill="none" height={24} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" width={24} xmlns="http://www.w3.org/2000/svg">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg className="svg" fill="none" height={24} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24" width={24} xmlns="http://www.w3.org/2000/svg">
              <line x1={12} x2={12} y1={5} y2={19} />
              <line x1={5} x2={19} y1={12} y2={12} />
            </svg>
          )}
        </span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .button {
    --main-focus: #2d8cf0;
    --font-color: #323232;
    --bg-color-sub: #dedede;
    --bg-color: #eee;
    --main-color: #323232;
    position: relative;
    display: inline-flex;
    align-items: center;
    min-width: 120px;
    height: 28px;
    padding: 0 12px 0 12px;
    cursor: pointer;
    border: 2px solid var(--main-color);
    box-shadow: 3px 3px var(--main-color);
    background-color: var(--bg-color);
    // border-radius: 8px;
    overflow: hidden;
  }

  @media (max-width: 640px) {
    .button {
      min-width: 100px;
      height: 24px;
      // border-radius: 7px;
    }
    .button .button__text {
      font-size: 0.8em;
      margin-right: 8px;
      transform: translateX(-4px);
    }
    .button .button__icon {
      right: 0;
      width: 32px;
    }
    .button .svg {
      width: 12px;
    }
    .button:hover .button__icon {
      width: 96px;
    }
  }

  .button, .button__icon, .button__text {
    transition: all 0.3s;
  }

  .button .button__text {
    color: var(--font-color);
    font-weight: 500;
    font-size: 0.85em;
    margin-right: 12px;
    transform: translateX(-6px);
  }

  .button .button__icon {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: 25px;
    background-color: var(--bg-color-sub);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .button .svg {
    width: 14px;
    fill: var(--main-color);
  }

  .button:hover {
    background: var(--bg-color);
  }

  .button:hover .button__text {
    color: transparent;
  }

  .button:hover .button__icon {
    width: 120px;
  }

  /* Added state: only the expanded icon area turns green */
  .button.button--added .button__icon {
    background-color: #22c55e; /* green-500 */
  }
  .button.button--added .button__icon .svg {
    fill: none;
    stroke: #ffffff;
  }

  .button:active {
    transform: translate(3px, 3px);
    box-shadow: 0px 0px var(--main-color);
  }`;

export default AddItemButton;