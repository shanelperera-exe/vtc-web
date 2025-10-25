import React from 'react'
import styled from 'styled-components'

export const OutilineButton = ({ onClick, disabled = false, label = 'Change Password', className = '', type = 'button', color = '#0bd964', size = 'md', icon = null }) => {
  return (
    <StyledWrapper className={className} $size={size} style={{ ['--color']: color }}>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        aria-disabled={disabled}
      >
        {icon ? <span className="btn-icon" aria-hidden="true">{icon}</span> : null}
        <span className="btn-label">{label}</span>
      </button>
    </StyledWrapper>
  )
}

const StyledWrapper = styled.div`
  display: inline-flex;
  justify-content: flex-start;
  align-items: center;
  padding: 0; /* remove default padding so it lines up with container */

  button {
    font-family: inherit;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: auto; /* let it size to content */
    min-width: ${p => p.$size === 'sm' ? '5.2em' : '6em'};
    height: ${p => p.$size === 'md' ? '2.5em' : '2.5em'};
    line-height: 1.2;
    position: relative;
    cursor: pointer;
    overflow: hidden;
    border: 3px solid var(--color);
    transition: color 0.5s;
    z-index: 1;
    font-size: ${p => p.$size === 'md' ? '13px' : '15px'};
    font-weight: 500;
    color: var(--color);
    padding: ${p => p.$size === 'sm' ? '0 10px' : '0 16px'}; /* horizontal padding */
    background: transparent;
  }

  button:before {
    content: "";
    position: absolute;
    z-index: -1;
    background: var(--color);
    height: 150px;
    width: 300px;
    border-radius: 50%;
  }

  button:hover {
    color: #fff;
  }

  button:before {
    top: 100%;
    left: 100%;
    transition: all 0.7s;
  }

  button:hover:before {
    top: -30px;
    left: -30px;
  }

  button:active:before {
    background: #0bd964;
    transition: background 0s;
  }
`

export default OutilineButton;
