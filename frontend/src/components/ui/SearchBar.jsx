import React from 'react';
import styled from 'styled-components';
import { FiSearch } from 'react-icons/fi';

// Props: name, value, onChange, placeholder, autoFocus, width
const SearchBar = ({ name = 'q', value, onChange, placeholder = 'I am looking for ...', autoFocus = false, width = '560px', borderColor = 'black', showIcon = true }) => {
  const inputProps = onChange
    ? { value, onChange }
    : { defaultValue: value };

  return (
    <StyledWrapper width={width} borderColor={borderColor}>
      <div className="input-container">
        <input type="text" name={name} className="input" placeholder={placeholder} {...inputProps} autoFocus={autoFocus} />
        {showIcon && (
          <span className="icon">
            <FiSearch size={19} />
          </span>
        )}
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
  }

  .input {
    width: 100%;
    height: 40px;
    padding: 10px 10px 10px 36px; /* extra left padding for icon */
    transition: .2s linear;
    border: 2.5px solid ${props => props.borderColor || 'black'};
    font-size: 14px;
    letter-spacing: 0px;
  }

  .input:focus {
    outline: none;
  }

`;

export default SearchBar;
