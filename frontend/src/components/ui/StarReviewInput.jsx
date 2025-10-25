import React from 'react';
import styled from 'styled-components';
import { StarIcon } from '@heroicons/react/20/solid';

// Controlled StarReviewInput — styles unchanged. Props:
// - rating: number (current selected rating)
// - onChange(value): called when user selects a rating
// - onHover(value): called on mouse enter/leave for hover effect
const StarReviewInput = ({ rating = 0, hover = 0, onChange = () => {}, onHover = () => {} }) => {
  const displayValue = hover || rating;
  return (
    <StyledWrapper>
      <div className="rating-wrap">
        <div className="rating">
        <input type="radio" id="star5" name="rate" value={5} checked={rating === 5} onChange={() => onChange(5)} />
        <label title="Excellent!" htmlFor="star5" onMouseEnter={() => onHover(5)} onMouseLeave={() => onHover(0)}>
          <StarIcon aria-hidden style={{ width: '1em', height: '1em' }} />
        </label>
        <input defaultValue={4} name="rate" id="star4" type="radio" value={4} checked={rating === 4} onChange={() => onChange(4)} />
        <label title="Great!" htmlFor="star4" onMouseEnter={() => onHover(4)} onMouseLeave={() => onHover(0)}>
          <StarIcon aria-hidden style={{ width: '1em', height: '1em' }} />
        </label>
        <input defaultValue={3} name="rate" id="star3" type="radio" value={3} checked={rating === 3} onChange={() => onChange(3)} />
        <label title="Good" htmlFor="star3" onMouseEnter={() => onHover(3)} onMouseLeave={() => onHover(0)}>
          <StarIcon aria-hidden style={{ width: '1em', height: '1em' }} />
        </label>
        <input defaultValue={2} name="rate" id="star2" type="radio" value={2} checked={rating === 2} onChange={() => onChange(2)} />
        <label title="Okay" htmlFor="star2" onMouseEnter={() => onHover(2)} onMouseLeave={() => onHover(0)}>
          <StarIcon aria-hidden style={{ width: '1em', height: '1em' }} />
        </label>
        <input defaultValue={1} name="rate" id="star1" type="radio" value={1} checked={rating === 1} onChange={() => onChange(1)} />
        <label title="Bad" htmlFor="star1" onMouseEnter={() => onHover(1)} onMouseLeave={() => onHover(0)}>
          <StarIcon aria-hidden style={{ width: '1em', height: '1em' }} />
        </label>
        </div>
        <div className="rating-value ml-2 mt-2 font-medium" aria-hidden>
          {displayValue || 0} / 5 Stars
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .rating {
    /* keep the visual order 1..5 but size the group to its content and align left */
    display: inline-flex;
    /* DOM order is star5..star1; reverse rows so visual order is 1..5 */
    flex-direction: row-reverse;
    gap: 4px;
    align-items: center;
    justify-content: flex-start;
  }

  .rating > input {
    display: none;
  }

  .rating > label {
    cursor: pointer;
    font-size: 30px;
    /* default to Tailwind's text-gray-200 */
    color: #e5e7eb;
    display: inline-flex;
    align-items: center;
  }

  .rating > label > svg {
    fill: currentColor;
    transition: color 0.15s ease, fill 0.15s ease;
  }

  /* checked star uses Tailwind's text-gray-900 */
  .rating > input:checked ~ label {
    color: #00bf63;
  }

  /* hover darkens current and preceding (visual) stars by changing color on label and siblings */
  .rating > label:hover,
  .rating > label:hover ~ label {
    color: #00bf63;
  }

  .rating-wrap {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .rating-value {
    font-size: 0.875rem;
    color: #374151; /* gray-700 */
    min-width: 3rem;
    text-align: left;
  }
`;

export default StarReviewInput;
