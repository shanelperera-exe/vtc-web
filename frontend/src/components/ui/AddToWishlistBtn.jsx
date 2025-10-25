import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { FiHeart } from 'react-icons/fi'
import { useNotifications } from './notificationsContext.js'
import * as wishlist from '../../utils/wishlist'

const AddToWishlistBtn = ({ product }) => {
  const { notify } = useNotifications()

  const key = String(product?.id ?? product?.productId ?? product?.sku ?? '')
  const [wishlisted, setWishlisted] = useState(() => (key ? wishlist.has({ id: product?.id ?? product?.productId, sku: product?.sku }) : false))
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    // keep in sync with global wishlist changes
    const unsub = wishlist.subscribe(() => {
      setWishlisted(key ? wishlist.has({ id: product?.id ?? product?.productId, sku: product?.sku }) : false)
    })
    // initial sync in case storage changed before mount
    setWishlisted(key ? wishlist.has({ id: product?.id ?? product?.productId, sku: product?.sku }) : false)
    return () => { unsub?.() }
  }, [key, product?.id, product?.productId, product?.sku])

  const handleAdd = () => {
    const name = product?.name ?? 'Item'
    const exists = wishlist.has({ id: product?.id ?? product?.productId, sku: product?.sku })
    if (exists) {
      setWishlisted(true)
      notify?.({ type: 'warning', text: `${name} is already in your wishlist` })
      return
    }
    // add to local (and background sync to server if authed)
    wishlist.add({
      id: product?.id ?? product?.productId,
      sku: product?.sku,
      name: product?.name,
      image: product?.primaryImageUrl || product?.image,
      price: product?.basePrice || product?.price
    })
    setWishlisted(true)
    setPulse(true)
    setTimeout(() => setPulse(false), 450)
    notify?.({ type: 'success', text: `Added ${name} to wishlist` })
  }

  return (
    <div className="bg-white flex items-start">
      <StyledWrapper className="h-fit w-fit" $heightPx={48} $fontSizePx={16} $minWidthEm={3}>
        <button type="button" onClick={handleAdd} aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={wishlisted} className={wishlisted ? 'is-wishlisted' : ''}>
          {pulse && <span className="pulse-ring" aria-hidden="true" />}
          <span className="btn-icon" aria-hidden="true"><FiHeart size={18} strokeWidth={2.4} /></span>
        </button>
      </StyledWrapper>
    </div>
  )
}

export default AddToWishlistBtn

// Styled similar to AddToCartBtn
const StyledWrapper = styled.div`
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0;

  --btn-color: transparent;
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
    /* make this an icon-only square button */
    height: ${p => (p.$heightPx ? `${p.$heightPx}px` : '40px')};
    width: ${p => (p.$heightPx ? `${p.$heightPx}px` : '40px')};
    min-width: ${p => (p.$minWidthEm ? `${p.$minWidthEm}em` : '2.5em')};
    line-height: 1.2;
    position: relative;
    cursor: pointer;
    overflow: visible;
    border: 2px solid #d1d5db; /* lighter gray */
    transition: color 0.2s ease, transform 0.15s ease, border-color 0.2s ease;
    z-index: 1;
    font-size: ${p => (p.$fontSizePx ? `${p.$fontSizePx}px` : '16px')};
    font-weight: 600;
    color: var(--text-default);
    padding: 0;
    background: var(--btn-color);
  }

  .btn-icon { display: inline-flex; align-items: center; justify-content: center; }
  .btn-icon svg { stroke-width: 2.2; }

  /* fill heart when wishlisted */
  button.is-wishlisted { border-color: #dc2626; color: #dc2626; }
  button.is-wishlisted .btn-icon svg { fill: #dc2626; stroke: #dc2626; transform: scale(1.05); }

  /* pulse ring animation like product card */
  .pulse-ring {
    position: absolute;
    inset: -4px;
    border-radius: 9999px;
    background: rgba(220, 38, 38, 0.25); /* red-600 at 25% */
    animation: aw-ping 0.45s ease-out forwards;
    pointer-events: none;
  }
  @keyframes aw-ping {
    0% { transform: scale(0.9); opacity: 0.6; }
    80% { transform: scale(1.15); opacity: 0.25; }
    100% { transform: scale(1.25); opacity: 0; }
  }
`
