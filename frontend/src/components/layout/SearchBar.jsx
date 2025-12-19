import React from 'react';
import styled from 'styled-components';
import { FiSearch } from 'react-icons/fi';

// Props: name, value, onChange, placeholder, autoFocus, width
const SearchBar = ({ name = 'q', value, onChange, placeholder = 'I am looking for ...', autoFocus = false, width = '560px' }) => {
  const inputProps = onChange
    ? { value, onChange }
    : { defaultValue: value };

  return (
    <StyledWrapper width={width}>
      <div className="input-container">
        <input type="text" name={name} className="input" placeholder={placeholder} {...inputProps} autoFocus={autoFocus} />
        <span className="icon">
          <FiSearch size={19} />
        </span>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .input-container {
    width: ${props => props.width || '560px'};
    position: relative;
  }

  @media (max-width: 768px) {
    .input-container {
      width: 90%;
    }
  }

  .icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(0, 0, 0, 0.55);
  }

  .input {
    width: 100%;
    height: 40px;
    padding: 10px 10px 10px 36px; /* extra left padding for icon */
    transition: .2s linear;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 12px;
    background: #fff;
    font-size: 14px;
    letter-spacing: 0px;
  }

  .input:focus {
    outline: none;
    border-color: rgba(0, 0, 0, 0.35);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.10);
  }

  .input::placeholder {
    color: rgba(0, 0, 0, 0.45);
  }

`;

export default SearchBar;
