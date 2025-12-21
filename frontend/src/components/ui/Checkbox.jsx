import React from 'react';
import styled from 'styled-components';

const Checkbox = ({ checked = false, onChange, name, value, disabled = false, ariaLabel }) => {
  return (
    <StyledWrapper>
      <label className="container" aria-label={ariaLabel}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          name={name}
          value={value}
          disabled={disabled}
        />
        <div className="checkmark" />
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .container {
    --input-focus: #0bd964;
    --input-out-of-focus: #ccc;
    --bg-color: #fff;
    --bg-color-alt: #666;
    --main-color: #323232;
    position: relative;
    cursor: pointer;
  }

  .container input {
    position: absolute;
    opacity: 0;
  }

  .checkmark {
    width: 20px;
    height: 20px;
    position: relative;
    top: 0;
    left: 0;
    border: 2px solid var(--main-color);
    background-color: var(--input-out-of-focus);
    border-radius: 3px;
    transition: all 0.3s;
  }

  .container input:checked ~ .checkmark {
    background-color: var(--input-focus);
  }

  .checkmark:after {
    content: "";
    width: 6px;
    height: 12px;
    position: absolute;
    top: 1px;
    left: 5px;
    display: none;
    border: solid var(--bg-color);
    border-width: 0 2.5px 2.5px 0;
    transform: rotate(45deg);
  }

  .container input:checked ~ .checkmark:after {
    display: block;
  }`;

export default Checkbox;
