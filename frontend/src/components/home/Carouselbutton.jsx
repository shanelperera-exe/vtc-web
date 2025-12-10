import React from 'react';
import styled from 'styled-components';
import { HiShoppingBag } from 'react-icons/hi2';

const Button = ({ text = 'Hover me', icon }) => {
  const IconEl = icon || <HiShoppingBag className="button-icon" />;
  return (
    <StyledWrapper>
      <button className="button button-item">
        <span className="button-bg">
          <span className="button-bg-layers">
            <span className="button-bg-layer button-bg-layer-1 -purple" />
            <span className="button-bg-layer button-bg-layer-2 -turquoise" />
            <span className="button-bg-layer button-bg-layer-3 -yellow" />
          </span>
        </span>
        <span className="button-inner">
          <span className="button-inner-static">{IconEl}{text}</span>
          <span className="button-inner-hover">{IconEl}{text}</span>
        </span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  button {
    all: unset;
  }

  .button {
    position: relative;
    display: inline-flex;
    height: 3.4rem;
    align-items: center;
    border-radius: 9999px;
    padding-left: 1.75rem;
    padding-right: 1.9rem;
    font-size: 1.05rem;
    font-weight: 600;
    color: #020617;
    letter-spacing: -0.02em;
    box-shadow: 0 18px 40px rgba(15, 118, 110, 0.55);
    transform: translateY(0) scale(1);
    transition:
      transform 200ms cubic-bezier(0.16, 1, 0.3, 1),
      box-shadow 200ms ease-out;
  }

  .button-item {
    background-color: transparent;
    color: #020617;
  }

  .button-item .button-bg {
    border-color: rgba(15, 23, 42, 0.06);
    background: #ffffff;
  }

  .button-inner,
  .button-inner-hover,
  .button-inner-static {
    pointer-events: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem; /* space between icon and text */
  }

  .button-inner {
    position: relative;
  }

  .button-inner-hover {
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0;
    transform: translateY(110%) scale(0.98);
  }

  /* shopping bag icon inside the button */
  .button-icon {
    display: inline-block;
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 0; /* spacing handled by gap on the container */
    flex-shrink: 0;
    vertical-align: middle;
    color: inherit; /* inherit text color */
  }

  .button-bg {
    overflow: hidden;
    border-radius: 2rem;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: scale(1);
    transition: transform 700ms cubic-bezier(0.22, 0.61, 0.36, 1);
  }

  .button-bg,
  .button-bg-layer,
  .button-bg-layers {
    display: block;
  }

  .button-bg-layers {
    position: absolute;
    left: 50%;
    transform: translate(-50%);
    top: -60%;
    aspect-ratio: 1 / 1;
    width: max(200%, 10rem);
  }

  .button-bg-layer {
    border-radius: 9999px;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: scale(0.7);
    opacity: 0;
  }

  .button-bg-layer.-purple {
    background: radial-gradient(circle at 0% 0%, rgba(15, 118, 110, 0.5), rgba(45, 212, 191, 0.15));
  }

  .button-bg-layer.-turquoise {
    background: radial-gradient(circle at 100% 100%, rgba(16, 185, 129, 0.5), rgba(34, 197, 94, 0.15));
  }

  .button-bg-layer.-yellow {
    background: radial-gradient(circle at 50% 0%, rgba(248, 250, 252, 1), rgba(226, 232, 240, 0.5));
  }
  /* New hover animation: subtle lift + glow ring + text slide */
  .button:hover {
    transform: translateY(-3px) scale(1.03);
    box-shadow: 0 26px 60px rgba(15, 118, 110, 0.85);
  }

  .button:hover .button-inner-static {
    opacity: 0;
    transform: translateY(-100%) translateX(-6px) scale(1.02);
    transition:
      transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
      opacity 150ms ease-out;
  }

  .button:hover .button-inner-hover {
    opacity: 1;
    transform: translateY(0) translateX(0) scale(1);
    transition:
      transform 300ms cubic-bezier(0.16, 1, 0.3, 1),
      opacity 210ms ease-out;
  }

  .button:hover .button-bg-layer {
    opacity: 1;
    transition:
      transform 420ms cubic-bezier(0.22, 0.61, 0.36, 1),
      opacity 220ms ease-out;
  }

  .button:hover .button-bg-layer-1 {
    transform: scale(1);
  }

  .button:hover .button-bg-layer-2 {
    transition-delay: 45ms;
    transform: scale(1.12);
  }

  .button:hover .button-bg-layer-3 {
    transition-delay: 90ms;
    transform: scale(1.22);
  }
`;

export default Button;
