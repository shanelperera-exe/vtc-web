import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion'
import { FiChevronRight } from 'react-icons/fi'

const NxtButton = ({ onClick, disabled = false, children = 'Next' }) => {
  return (
    <StyledWrapper>
      <motion.button
        type="button"
        className="button"
        onClick={onClick}
        disabled={disabled}
        whileHover={disabled ? {} : { scale: 1.03 }}
        whileTap={disabled ? {} : { scale: 0.97 }}
      >
        {children}
        <FiChevronRight className="icon" aria-hidden="true" />
      </motion.button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  button {
    font-family: "Poppins", sans-serif;
    font-size: 1.125rem; /* larger text */
    border: 3px solid black;
    padding: 0.45rem 0.75rem;
    background-color: #0bd964;
    cursor: pointer;
    text-align: center;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .icon {
    width: 24px;
    height: 24px;
    transition: all 0.3s ease-in-out;
  }`;

export default NxtButton;
