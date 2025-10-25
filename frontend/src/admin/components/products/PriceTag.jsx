import React from 'react';

/**
 * PriceTag
 * Props:
 *  - price: number
 *  - compareAtPrice: number | null
 */
export default function PriceTag({ price, compareAtPrice = null, currency = 'LKR' }) {
  const isOnSale = typeof compareAtPrice === 'number' && compareAtPrice > price;
  const savedPercent = isOnSale ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0;

  const fmt = (n) => {
    const num = typeof n === 'number' ? n : Number(n ?? 0);
    if (!Number.isFinite(num)) return '0.00';
    return num.toFixed(2);
  };

  return (
    <div className="price__sale flex items-center gap-2">
      {isOnSale ? (
        <>
          <span className="price-item price-item--sale product-price text-2xl font-medium text-[#1e2a38]" data-price={price}>
            {currency} {fmt(price)}
          </span>
          <div className="price__compare">
            <s className="price-item price-item--regular product-sale text-xs text-gray-500" data-sale={compareAtPrice}>{currency} {fmt(compareAtPrice)}</s>
          </div>
          <span className="badge sold-out save-lable bg-green-600 text-white text-xs font-semibold px-1 py-0.5">save <span className="sav-per">{savedPercent}</span>%</span>
        </>
      ) : (
        <p className="text-2xl font-medium tracking-tight mb-0 pb-0 text-[#1e2a38]">{currency} {fmt(price)}</p>
      )}
    </div>
  );
}
