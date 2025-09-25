import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const QuantityInput = ({ className, value: valueProp, onChange, min = 1, max = 15 }) => {
  const controlled = valueProp !== undefined && valueProp !== null;
  const [value, setValue] = useState(controlled ? Number(valueProp) : 1);

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
    if (v > max) v = max;
    return v;
  };

  const setNext = (next) => {
    const v = clamp(next);
    if (onChange) onChange(v);
    if (!controlled) setValue(v);
  };

  const handleChange = (e) => {
    let val = parseInt(e.target.value, 10);
    setNext(val);
  };

  return (
    <StyledWrapper className={className}>
      <div className="number-control">
        <div className="number-left" onClick={() => setNext((value || min) - 1)} />
        <input
          type="number"
          name="number"
          className="number-quantity"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
        />
        <div className="number-right" onClick={() => setNext((value || min) + 1)}></div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .number-control {
    display: flex;
    align-items: center;
  }

  .number-left::before,
  .number-right::after {
    content: attr(data-content);
    background-color: #222222;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid black;
    width: 40px;
    height: 40px;
    color: white;
    transition: background-color 0.3s;
    cursor: pointer;
  }

  .number-left::before {
    content: "-";
    font-size: 2.8rem;
    line-height: 1;
  }

  .number-right::after {
    content: "+";
    font-size: 2.8rem;
    line-height: 1;
  }

  .number-quantity {
    padding: 0;
    height: 40px;
    border: 1px solid #222;
    width: 90px;
    font-size: 1.1rem;
    text-align: center;
    background: #fff;
    margin: 0 0.25rem;
    -moz-appearance: textfield;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
    line-height: 38px;
    vertical-align: middle;
  }

  .number-left:hover::before,
  .number-right:hover::after {
    background-color: #444444;
  }

  &.qty-large-number {
    .number-quantity {
      font-size: 1.35rem;
    }
  }

  &.qty-compact {
    .number-quantity {
      width: 70px;
    }
  }
`;

export default QuantityInput;
