import React from 'react';
import styled from 'styled-components';

const NxtButton = ({ onClick, disabled = false, children = 'Next' }) => {
  return (
    <StyledWrapper>
      <button type="button" className="button" onClick={onClick} disabled={disabled}>
        {children}
        <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm4.28 10.28a.75.75 0 000-1.06l-3-3a.75.75 0 10-1.06 1.06l1.72 1.72H8.25a.75.75 0 000 1.5h5.69l-1.72 1.72a.75.75 0 101.06 1.06l3-3z" clipRule="evenodd" />
        </svg>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  button {
    font-family: "Poppins", sans-serif;
    font-size: 0.9rem;
    border: 2px solid black;
    padding: 0.3rem 0.5rem;
    background-color: #0bd964;
    box-shadow: 5px 5px 0px black;
    cursor: pointer;
    text-align: center;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
  }

  button:not(:disabled):hover {
    box-shadow: 0 0 0 black;
    transform: translateY(3px) translateX(3px);
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    box-shadow: 5px 5px 0px black;
    transform: none;
  }

  .icon {
    width: 24px;
    height: 24px;
    transition: all 0.3s ease-in-out;
  }`;

export default NxtButton;
