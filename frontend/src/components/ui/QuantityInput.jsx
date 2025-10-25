import React, { useEffect, useState } from 'react';

const QuantityInput = ({ className = '', inputClassName = '', value: valueProp, onChange, min = 0, max = 15 }) => {
  const controlled = valueProp !== undefined && valueProp !== null;
  const [value, setValue] = useState(controlled ? Number(valueProp) : min || 0);

  useEffect(() => {
    if (controlled) {
      const next = clamp(Number(valueProp));
      setValue(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueProp]);

  const clamp = (v) => {
    if (isNaN(v)) v = min;
    if (v < min) v = min;
    if (max !== undefined && v > max) v = max;
    return v;
  };

  const setNext = (next) => {
    let v = Number(next);
    if (isNaN(v)) v = min;
    v = clamp(v);
    if (onChange) onChange(v);
    if (!controlled) setValue(v);
  };

  const handleChange = (e) => {
    const v = parseInt(e.target.value, 10);
    setNext(isNaN(v) ? min : v);
  };

  // use internal value for rendering
  const current = controlled ? clamp(Number(valueProp)) : value;

  return (
    <div className={`product-quantity-picker qty relative inline-flex items-center ${className}`}> 
      <input
        type="number"
        className={`product-quantity-picker__input product-quantity-picker-input border-2 border-gray-300 text-black text-center pl-6 pr-6 w-30 h-12 text-base font-medium focus:ring-0 ${inputClassName}`}
        value={current}
        min={min}
        {...(max !== undefined ? { max } : {})}
        onChange={handleChange}
      />

      <button
        type="button"
        aria-label="Decrease quantity"
        className="absolute left-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#00bf63] cursor-pointer px-2 py-0.5"
        onClick={() => setNext(current - 1)}
      >
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <button
        type="button"
        aria-label="Increase quantity"
        className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#00bf63] cursor-pointer px-2 py-1"
        onClick={() => setNext(current + 1)}
      >
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};

export default QuantityInput;
