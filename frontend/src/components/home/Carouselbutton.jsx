import React from 'react';
import styled from 'styled-components';
import { HiShoppingBag } from 'react-icons/hi2';

const Button = ({ text = 'Hover me' }) => {
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
          <span className="button-inner-static"><HiShoppingBag className="button-icon" />{text}</span>
          <span className="button-inner-hover"><HiShoppingBag className="button-icon" />{text}</span>
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
    height: 3.5rem;
    align-items: center;
    border-radius: 9999px;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    font-size: 1.2rem;
    font-weight: 640;
    color: #fafaf6;
    letter-spacing: -0.06em;
  }

  .button-item {
    background-color: transparent;
    color: #1d1d1f;
  }

  .button-item .button-bg {
    border-color: black;
    background-color: white;
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
    transform: translateY(70%);
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
    transition: transform 1.8s cubic-bezier(0.19, 1, 0.22, 1);
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
    transform: scale(0);
  }

  .button-bg-layer.-purple {
    /* primary darker green */
    background-color: #0a9747;
  }

  .button-bg-layer.-turquoise {
    /* lighter/bright green */
    background-color: #0bd964;
  }

  .button-bg-layer.-yellow {
    --tw-bg-opacity: 1;
    background-color: white;
  }

  .button:hover .button-inner-static {
    opacity: 0;
    transform: translateY(-70%);
    transition:
      transform 1.4s cubic-bezier(0.19, 1, 0.22, 1),
      opacity 0.3s linear;
  }

  .button:hover .button-inner-hover {
    opacity: 1;
    transform: translateY(0);
    transition:
      transform 1.4s cubic-bezier(0.19, 1, 0.22, 1),
      opacity 1.4s cubic-bezier(0.19, 1, 0.22, 1);
  }

  .button:hover .button-bg-layer {
    transition:
      transform 1.3s cubic-bezier(0.19, 1, 0.22, 1),
      opacity 0.3s linear;
  }

  .button:hover .button-bg-layer-1 {
    transform: scale(1);
  }

  .button:hover .button-bg-layer-2 {
    transition-delay: 0.1s;
    transform: scale(1);
  }

  .button:hover .button-bg-layer-3 {
    transition-delay: 0.2s;
    transform: scale(1);
  }
`;

export default Button;
