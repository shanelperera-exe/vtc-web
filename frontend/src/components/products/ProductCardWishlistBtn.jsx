import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FiHeart } from 'react-icons/fi';
import * as wishlist from '../../utils/wishlist';
import { useNotifications } from '../ui/notificationsContext';

// Wishlist button used inside ProductCard — keeps its own local state and calls
// onWishlistToggle when toggled. Includes pulse animation similar to the card.
const ProductCardWishlistBtn = ({ id, sku, name, image, price, isWishlisted, onWishlistToggle }) => {
  const { notify } = useNotifications();
  const [wishlisted, setWishlisted] = useState(() => {
    return typeof isWishlisted === 'boolean' ? Boolean(isWishlisted) : wishlist.has({ id, sku });
  });
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (typeof isWishlisted === 'boolean') {
      setWishlisted(Boolean(isWishlisted));
    } else {
      // keep in sync with storage if not controlled by prop
      setWishlisted(wishlist.has({ id, sku }));
      // subscribe to wishlist changes so heart updates when other UI/actions modify it
      const unsub = wishlist.subscribe(() => {
        setWishlisted(wishlist.has({ id, sku }));
      });
      return () => unsub();
    }
  }, [isWishlisted]);

  const handleClick = (e) => {
    e.stopPropagation();
    // Check current authoritative source (localStorage util)
    const currently = wishlist.has({ id, sku });
    if (!currently) {
      // Not present — add and show success
      setWishlisted(true);
      setPulse(true);
      setTimeout(() => setPulse(false), 400);
      wishlist.add({ id, sku, name, image, price });
      try { notify({ type: 'success', text: `Added ${name ?? 'item'} to wishlist` }); } catch {}
      if (typeof onWishlistToggle === 'function') onWishlistToggle({ id, sku, name, image, price }, true);
    } else {
      // Present — remove and inform parent + user
      setWishlisted(false);
      wishlist.removeWithSync({ id, sku });
      try { notify({ type: 'info', text: `Removed ${name ?? 'item'} from wishlist` }); } catch {}
      if (typeof onWishlistToggle === 'function') onWishlistToggle({ id, sku, name, image, price }, false);
    }
  };

  return (
    <Wrapper className="pc-wishlist-btn-wrapper">
      <button
        type="button"
        onClick={handleClick}
        className={[
          'relative inline-flex items-center justify-center rounded-full border-2',
          'bg-white transition-all duration-200 ease-out focus-visible:outline-none',
          'size-9 md:size-10 shadow-sm hover:shadow-lg',
          wishlisted ? 'border-red-600 is-wishlisted' : 'border-black'
        ].join(' ')}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={wishlisted}
        title={wishlisted ? 'Wishlisted' : 'Add to wishlist'}
      >
        {pulse && (
          <span className="absolute inset-0 rounded-full bg-red-400/30 animate-ping" aria-hidden />
        )}
        <FiHeart size={18} color={wishlisted ? '#dc2626' : '#000'} strokeWidth={wishlisted ? 2.8 : 2.2} />
      </button>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  /* Position this smaller into the top-right corner of the product card */
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 30;

  /* Provide scoped styles similar to ProductCard's heart styles so the icon fills */
  .is-wishlisted {
    border-color: #dc2626;
    color: #dc2626;
  }
  .is-wishlisted svg {
    transform: scale(1.05);
  }
  .is-wishlisted svg path {
    fill: #dc2626;
    stroke: #dc2626;
  }
  button { display: inline-flex; }
`;

export default ProductCardWishlistBtn;
