import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { listReviewsByProduct } from '../../api/reviewApi';
import StarReview from '../ui/StarReview';
import ProductQuickView from './ProductQuickView';
import { FiEye } from 'react-icons/fi';
import ProductCardWishlistBtn from './ProductCardWishlistBtn';
import { slugifyCategory } from '../../utils/slugify';

// Simple in-memory cache for review summaries per session
const _reviewSummaryCache = (typeof window !== 'undefined') ? (window.__vtcReviewSummaryCache ||= new Map()) : new Map();

const ProductCard = ({ id, sku, name = 'Product title', description = '', image = '', price = 0, category = '', rating = 0, numOfReviews = 0, onWishlistToggle, isWishlisted }) => {
  const navigate = useNavigate();
  const showPlaceholder = !image;
  const productKey = sku || id;
  // Local rating/count, seeded from props
  const [localRating, setLocalRating] = useState(typeof rating === 'number' ? rating : 0);
  const [localCount, setLocalCount] = useState(typeof numOfReviews === 'number' ? numOfReviews : 0);
  const [quickOpen, setQuickOpen] = useState(false);
  const titleRef = useRef(null);
  const [titleTwoLines, setTitleTwoLines] = useState(false);
  // wishlist state moved into ProductCardWishlistBtn

  // Lazy-load review summary if not provided or zero
  useEffect(() => {
    let active = true;
    async function load() {
      if (!id) return;
      // If both rating and numOfReviews are positive numbers, skip fetching
      const hasRating = typeof rating === 'number' && rating > 0;
      const hasCount = typeof numOfReviews === 'number' && numOfReviews > 0;
      if (hasRating && hasCount) return;
      // Try cache first
      const cacheKey = String(id);
      const cached = _reviewSummaryCache.get(cacheKey);
      if (cached) {
        if (active) { setLocalRating(cached.rating); setLocalCount(cached.count); }
        return;
      }
      try {
        const revs = await listReviewsByProduct(id);
        const count = Array.isArray(revs) ? revs.length : 0;
        const avg = count ? (revs.reduce((s, r) => {
          const val = (r && (r.rating ?? r.stars ?? r.value));
          const num = Number(val) || 0;
          return s + num;
        }, 0) / count) : 0;
        const rounded = Math.round(avg * 10) / 10;
        _reviewSummaryCache.set(cacheKey, { rating: rounded, count });
        if (active) { setLocalRating(rounded); setLocalCount(count); }
      } catch {
        void 0; // ignore
      }
    }
    load();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Detect whether the product title occupies two or more lines so we can
  // give it priority and reduce the description to one line when needed.
  useEffect(() => {
    if (typeof window === 'undefined' || !titleRef.current) return undefined;
    const el = titleRef.current;

    const checkLines = () => {
      try {
        const style = window.getComputedStyle(el);
        const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2 || 16;
        const height = el.getBoundingClientRect().height;
        const lines = Math.round(height / lineHeight) || 1;
        setTitleTwoLines(lines >= 2);
      } catch (e) {
        // ignore measurement errors
      }
    };

    // Initial check
    checkLines();

    // Watch for resizes (responsive layouts) and text changes.
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(checkLines);
      ro.observe(el);
      // also observe parent width changes just in case wrapping changes
      if (el.parentElement) ro.observe(el.parentElement);
    } else {
      // Fallback: window resize
      window.addEventListener('resize', checkLines);
    }

    return () => {
      if (ro) {
        try { ro.disconnect(); } catch (e) { /* ignore */ }
      } else {
        window.removeEventListener('resize', checkLines);
      }
    };
  }, [name]);

  // Ensure rating is a number between 0 and 5
  const productRating = useMemo(() => Math.max(0, Math.min(5, typeof localRating === 'number' ? localRating : 0)), [localRating]);

  const formattedPrice = typeof price === 'number' ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(price);

  const qvProduct = {
    productId: id,
    name,
    price: `LKR ${formattedPrice}`,
    rating: Number(productRating) || 0,
    reviewCount: Number(localCount) || 0,
    href: `/product/${productKey}`,
    imageSrc: image || '',
    imageAlt: name || 'Product image',
    // colors and sizes intentionally omitted here so QuickView reads real variations
    // provided by the backend via listAllVariations(productId).
  };
  qvProduct.productId = id; // Pass productId from ProductCard to QuickView
  return (
    <StyledWrapper>
      <div className="card" style={{ cursor: 'pointer' }}>
        {/* Wishlist button - top right */}
        <div className="absolute right-3 top-3 z-10">
          <ProductCardWishlistBtn
            id={id}
            sku={sku}
            name={name}
            image={image}
            price={price}
            // Pass isWishlisted only if explicitly provided as boolean; otherwise let the button auto-detect via storage
            isWishlisted={typeof isWishlisted === 'boolean' ? isWishlisted : undefined}
            onWishlistToggle={onWishlistToggle}
          />
        </div>
        <div>
          <div className="img-card group" onClick={() => navigate(`/product/${productKey}`)}>
            <div className="image">
              {showPlaceholder ? (
                <div className="placeholder">No Image</div>
              ) : (
                <img
                  src={image}
                  alt={name}
                  className="product-img"
                />
              )}
            </div>
            {/* Quick View hover overlay inside image bottom area */}
            <div className="quick-view-overlay">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setQuickOpen(true); }}
                className="quick-view-btn"
                aria-label="Quick view"
              >
                <span className="quick-view-icon" aria-hidden>
                  <FiEye size={12} strokeWidth={2.4} />
                </span>
                <span className="quick-view-label">Quick view</span>
              </button>
            </div>
          </div>
          <div>
            <div className={`card-info ${titleTwoLines ? 'title-multiline' : ''}`}>
              <p ref={titleRef} className="text-title" onClick={() => navigate(`/product/${productKey}`)}>{name}</p>
              <p className="text-body text-xs mt-1 mb-3">{description}</p>
              <div className="flex items-center justify-between mb-2">
                {/* Category section (left) */}
                {category && (
                  <a
                    className="product-category"
                    href={`/category/${slugifyCategory(category)}`}
                    style={{ cursor: 'pointer' }}
                  >
                    {category.split(' ')[0].toUpperCase()}
                  </a>
                )}
                {/* Reviews section (right) */}
                <div className="flex flex-col items-end space-y-1">
                  <h3 className="sr-only">Reviews</h3>
                  {/* Show stars; count is below the stars */}
                  <StarReview rating={productRating} size={16} showCount={false} />
                  <div className="text-xs font-medium text-[#1d794c]">
                    {localCount ?? 0} {Number(localCount) === 1 ? 'review' : 'reviews'}
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <span className="text-title price">LKR {formattedPrice}</span>
              {/* Quick view moved into image hover overlay */}
              {/* add-to-cart removed */}
              {/* <div className="card-button">
                <svg className="svg-icon" viewBox="0 0 20 20">
                  <path d="M17.72,5.011H8.026c-0.271,0-0.49,0.219-0.49,0.489c0,0.271,0.219,0.489,0.49,0.489h8.962l-1.979,4.773H6.763L4.935,5.343C4.926,5.316,4.897,5.309,4.884,5.286c-0.011-0.024,0-0.051-0.017-0.074C4.833,5.166,4.025,4.081,2.33,3.908C2.068,3.883,1.822,4.075,1.795,4.344C1.767,4.612,1.962,4.853,2.231,4.88c1.143,0.118,1.703,0.738,1.808,0.866l1.91,5.661c0.066,0.199,0.252,0.333,0.463,0.333h8.924c0.116,0,0.22-0.053,0.308-0.128c0.027-0.023,0.042-0.048,0.063-0.076c0.026-0.034,0.063-0.058,0.08-0.099l2.384-5.75c0.062-0.151,0.046-0.323-0.045-0.458C18.036,5.092,17.883,5.011,17.72,5.011z" />
                  <path d="M8.251,12.386c-1.023,0-1.856,0.834-1.856,1.856s0.833,1.853,1.856,1.853c1.021,0,1.853-0.83,1.853-1.853S9.273,12.386,8.251,12.386z M8.251,15.116c-0.484,0-0.877-0.393-0.877-0.874c0-0.484,0.394-0.878,0.877-0.878c0.482,0,0.875,0.394,0.875,0.878C9.126,14.724,8.733,15.116,8.251,15.116z" />
                  <path d="M13.972,12.386c-1.022,0-1.855,0.834-1.855,1.856s0.833,1.853,1.855,1.853s1.854-0.83,1.854-1.853S14.994,12.386,13.972,12.386z M13.972,15.116c-0.484,0-0.878-0.393-0.878-0.874c0-0.484,0.394-0.878,0.878-0.878c0.482,0,0.875,0.394,0.875,0.878C14.847,14.724,14.454,15.116,13.972,15.116z" />
                </svg>
              </div> */}
            </div>
          </div>
        </div>
      </div>

      <ProductQuickView product={qvProduct} open={quickOpen} onClose={setQuickOpen} />
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .img-card {
    width: 100%;
    /* removed outer padding so image can reach edges */
    padding: 0;
    background: #f5f5f5;
    position: relative;
    overflow: visible;
    border: 2px solid black;
    /* border-radius: 1rem; */
  }

  /* Make image container a square using aspect-ratio when supported, fallback to fixed height */
  .img-card .image {
    width: 100%;
    aspect-ratio: 1 / 1;
    height: auto;
    /* Fallback for older browsers: ensure a reasonable square-ish min height */
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: transparent;
  }

  /* Ensure image area takes roughly 60% of the card height */
  .img-card {
    flex: 0 0 60%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-info {
    flex: 1 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }

  .card-footer {
    flex-shrink: 0;
  }

  .img-card .placeholder {
    width: 80%;
    height: 80%;
    background: #e0e0e0;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #aaa;
    font-size: 1.2em;
    font-weight: bold;
  }

  .img-card .product-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Quick View overlay: hidden until hover, sits at bottom of image */
  .img-card {
    position: relative;
  }
  .img-card .quick-view-overlay {
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: 8px;
    display: flex;
    justify-content: center;
    pointer-events: none; /* allow clicks to pass unless on button */
    opacity: 0;
    transform: translateY(6px);
    transition: opacity 150ms ease, transform 150ms ease;
  }
  .img-card:hover .quick-view-overlay,
  .img-card:focus-within .quick-view-overlay {
    opacity: 1;
    transform: translateY(0);
  }
  .img-card .quick-view-btn {
    pointer-events: auto; /* re-enable on button */
    background: rgba(255,255,255,0.96);
    color: #0b0b0b;
    border: 2px solid black;
    border-radius: 9999px; /* pill */
    padding: 0.24rem 0.64rem;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: .02em;
    box-shadow: 0 6px 16px rgba(0,0,0,0.12);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease, border-color 120ms ease, color 120ms ease;
  }

  /* smaller icon inside quick view */
  .img-card .quick-view-icon svg {
    width: 14px;
    height: 14px;
  }

  .img-card .quick-view-btn:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 10px 22px rgba(0,0,0,0.14);
    background-color: #fff;
    border-color: black;
  }

  /* hide the textual label on very small screens to keep the button compact */
  .img-card .quick-view-label {
    display: inline-block;
  }
  @media (max-width: 420px) {
    .img-card .quick-view-label { display: none; }
  }

  .card {
    width: 100%;
  max-width: 300px; /* slightly larger */
    height: 470px; /* slightly taller */
    padding: 1em;
    position: relative;
    overflow: visible;
    background: white;
    // border-radius: 1rem;
    border: 2px solid black;
    box-sizing: border-box;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  @media (max-width: 768px) {
    .card {
      width: 90%;
      min-width: 140px;
      max-width: 260px;
      margin: 1vw auto;
      padding: 0.85em;
      height: 440px; /* slightly larger mobile height */
    }
    .img-card {
      width: 100%;
      max-width: 260px;
      min-width: 140px;
      padding: 0; /* removed mobile padding as well */
      /* mobile fallback for aspect-ratio */
      min-height: 240px;
    }
  }

  .wishlist-btn-wrapper {
    position: absolute;
    top: 22px;
    right: 2px;
    z-index: 2;
  }

  .card-img {
  height: 78%;
   width: 100%;
   border-radius: 1rem;
   transition: .3s ease;
  }

  .card-info {
   padding-top: 5%;
  }

  svg {
   width: 20px;
   height: 20px;
  }

  .card-footer {
   width: 100%;
   display: flex;
   justify-content: space-between;
   align-items: center;
  padding-top: 14px;
   border-top: 1px solid #ddd;
  }

  /*Text*/
  .text-title {
   font-weight: 600;
  font-size: 1.08em;
    /* Allow up to 2 lines and reduce line-height so two-line titles are tighter */
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    /* ensure max-height matches the used line-height to avoid partial clipping */
    max-height: calc(1.2em * 2);
  }

  /* Price styling: make price slightly larger and more prominent */
  .price {
    font-size: 1.18em;
    font-weight: 700;
    color: #0b0b0b;
  }

  .text-body {
  font-size: 0.78em; /* slightly smaller to de-emphasize short description */
   padding-bottom: 4px;
  /* Reserve two lines for the short description */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.2em;
  /* prefer max-height so the element cannot show extra partial lines */
  max-height: calc(1.2em * 2);
  }
  /* When title occupies two lines, give title priority and reduce
     the short description to a single line. */
  .card-info.title-multiline .text-body {
    -webkit-line-clamp: 1;
    /* force exact single-line height to avoid any visible half-line */
    height: calc(1.2em * 1);
    max-height: calc(1.2em * 1);
    line-height: 1.2em;
  }
  .product-category {
    display: inline-block;
    font-size: 0.72em;
    font-weight: 700;
    color: #000; /* black text to match pill */
    letter-spacing: 1px;
    margin-bottom: 10px;
    text-transform: uppercase;
    padding: 0.18rem 0.6rem;
    border: 2px solid #000; /* black pill outline */
    border-radius: 9999px;
    background: transparent;
    line-height: 1;
    box-sizing: border-box;
  }

  /*Button*/
  .card-button {
   border: 1px solid #252525;
   display: flex;
   padding: .3em;
   cursor: pointer;
   border-radius: 50px;
   transition: .3s ease-in-out;
   background: #fff;
  }

  /*Hover*/
  .card-img:hover {
   transform: translateY(-25%);
   box-shadow: rgba(226, 196, 63, 0.25) 0px 13px 47px -5px, rgba(180, 71, 71, 0.3) 0px 8px 16px -8px;
  }

  .card-button:hover {
   border: 1px solid #1d794c;
   background-color: #1d794c;
  }
  .card-button:hover .svg-icon {
    fill: #fff;
    color: #fff;
  }
  .svg-icon {
    fill: #252525;
    color: #252525;
    transition: fill 0.3s, color 0.3s;
  }

  /* Wishlist heart styles */
  .heart-icon svg {
    /* default outline heart */
    fill: transparent;
    transition: transform 0.2s ease-out, fill 0.2s ease, color 0.2s ease;
  }
  .heart-icon.is-wishlisted svg {
    /* fill red when in wishlist */
    color: #dc2626; /* stroke color */
    transform: scale(1.05);
  }
  .heart-icon.is-wishlisted svg path {
    fill: #dc2626; /* ensure inner heart is filled */
    stroke: #dc2626;
  }
  .heart-icon:hover svg {
    transform: scale(1.06);
  }
  .heart-icon:active svg {
    transform: scale(0.95);
  }
`;

export default ProductCard;
