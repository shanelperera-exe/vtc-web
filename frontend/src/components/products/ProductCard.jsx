import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import AddWishlistBtn from '../ui/AddWishlistBtn';
import { StarIcon } from '@heroicons/react/20/solid'
import AddItemButton from '../ui/AddItemBtn';

const ProductCard = ({ id, name = 'Product title', description = 'Product description and details', image = '', price = 0, category = '', rating = 0, numOfReviews = 0 }) => {
  const navigate = useNavigate();
  const showPlaceholder = !image;
  // Ensure rating is a number between 0 and 5
  const productRating = Math.max(0, Math.min(5, typeof rating === 'number' ? rating : 0));
  return (
    <StyledWrapper>
      <div className="card" style={{ cursor: 'pointer' }}>
        {/* <div className="wishlist-btn-wrapper">
          <AddWishlistBtn />
        </div> */}
        <div>
          <div className="img-card" onClick={() => navigate(`/product/${id}`)}>
            <div className="image" style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {showPlaceholder ? (
                <div style={{
                  width: '80%',
                  height: '80%',
                  background: '#e0e0e0',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#aaa',
                  fontSize: '1.2em',
                  fontWeight: 'bold'
                }}>
                  No Image
                </div>
              ) : (
                <img
                  src={image}
                  alt={name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
          </div>
          <div>
            <div className="card-info">
              <p className="text-title" onClick={() => navigate(`/product/${id}`)}>{name}</p>
              <p className="text-body">{description}</p>
              <div className="flex items-center justify-between mb-2">
                {/* Category section (left) */}
                {category && (
                  <a
                    className="product-category"
                    href={`/collections/${category.toLowerCase()}`}
                    style={{cursor: 'pointer' }}
                  >
                    {category.split(' ')[0].toUpperCase()}
                  </a>
                )}
                {/* Reviews section (right) */}
                <div>
                  <h3 className="sr-only">Reviews</h3>
                  <div className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center">
                        {[0, 1, 2, 3, 4].map((i) => {
                          if (productRating >= i + 1) {
                            // Full star
                            return (
                              <StarIcon
                                key={i}
                                aria-hidden="true"
                                style={{ width: '16px', height: '16px' }}
                                className="text-gray-900 shrink-0"
                              />
                            );
                          } else if (productRating > i && productRating < i + 1) {
                            // True half star: overlay yellow left, gray right
                            return (
                              <span key={i} style={{ position: 'relative', width: '16px', height: '16px', display: 'inline-block' }}>
                                <StarIcon
                                  aria-hidden="true"
                                  style={{ width: '16px', height: '16px', position: 'absolute', left: 0, top: 0, clipPath: 'inset(0 8px 0 0)' }}
                                  className="text-gray-900 shrink-0"
                                />
                                <StarIcon
                                  aria-hidden="true"
                                  style={{ width: '16px', height: '16px', position: 'absolute', left: 0, top: 0, clipPath: 'inset(0 0 0 8px)' }}
                                  className="text-gray-200 shrink-0"
                                />
                              </span>
                            );
                          } else {
                            // Empty star
                            return (
                              <StarIcon
                                key={i}
                                aria-hidden="true"
                                style={{ width: '16px', height: '16px' }}
                                className="text-gray-200 shrink-0"
                              />
                            );
                          }
                        })}
                      </div>
                      <p className="sr-only">{productRating} out of 5 stars</p>
                      <span className="text-xs font-medium text-[#1d794c] mt-1">
                        {numOfReviews} reviews
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <span className="text-title">LKR {price}</span>
              <div>
                <AddItemButton product={{ id, name, image, price, category }} />
              </div>
              {/* <div className="card-button">
                <svg className="svg-icon" viewBox="0 0 20 20">
                  <path d="M17.72,5.011H8.026c-0.271,0-0.49,0.219-0.49,0.489c0,0.271,0.219,0.489,0.49,0.489h8.962l-1.979,4.773H6.763L4.935,5.343C4.926,5.316,4.897,5.309,4.884,5.286c-0.011-0.024,0-0.051-0.017-0.074C4.833,5.166,4.025,4.081,2.33,3.908C2.068,3.883,1.822,4.075,1.795,4.344C1.767,4.612,1.962,4.853,2.231,4.88c1.143,0.118,1.703,0.738,1.808,0.866l1.91,5.661c0.066,0.199,0.252,0.333,0.463,0.333h8.924c0.116,0,0.22-0.053,0.308-0.128c0.027-0.023,0.042-0.048,0.063-0.076c0.026-0.034,0.063-0.058,0.08-0.099l2.384-5.75c0.062-0.151,0.046-0.323-0.045-0.458C18.036,5.092,17.883,5.011,17.72,5.011z" />
                  <path d="M8.251,12.386c-1.023,0-1.856,0.834-1.856,1.856s0.833,1.853,1.856,1.853c1.021,0,1.853-0.83,1.853-1.853S9.273,12.386,8.251,12.386z M8.251,15.116c-0.484,0-0.877-0.393-0.877-0.874c0-0.484,0.394-0.878,0.877-0.878c0.482,0,0.875,0.394,0.875,0.878C9.126,14.724,8.733,15.116,8.251,15.116z" />
                  <path d="M13.972,12.386c-1.022,0-1.855,0.834-1.855,1.856s0.833,1.853,1.855,1.853s1.854-0.83,1.854-1.853S14.994,12.386,13.972,12.386z M13.972,15.116c-0.484,0-0.878-0.393-0.878-0.874c0-0.484,0.394-0.878,0.878-0.878c0.482,0,0.875,0.394,0.875,0.878C14.847,14.724,14.454,15.116,13.972,15.116z" />
                </svg>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .img-card {
    width: 100%;
  height: 240px;
  padding: 0.55em;
    background: #f5f5f5;
    position: relative;
    overflow: visible;
    border: 2px solid black;
    // border-radius: 1rem;
  }

  .card {
    width: 100%;
  max-width: 320px;
    height: auto;
    padding: 1.25em;
    position: relative;
    overflow: visible;
    background: white;
    // border-radius: 1rem;
    border: 2px solid black;
    box-sizing: border-box;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    .card {
      width: 90%;
      min-width: 180px;
      max-width: 260px;
      margin: 1vw auto;
      padding: 1em;
    }
    .img-card {
      width: 100%;
  max-width: 300px;
  min-width: 150px;
  height: 40vw;
  max-height: 220px;
  min-height: 130px;
    }
  }

  .wishlist-btn-wrapper {
    position: absolute;
    top: 22px;
    right: 2px;
    z-index: 2;
  }

  .card-img {
  height: 78%;
   width: 100%;
   border-radius: 1rem;
   transition: .3s ease;
  }

  .card-info {
   padding-top: 5%;
  }

  svg {
   width: 20px;
   height: 20px;
  }

  .card-footer {
   width: 100%;
   display: flex;
   justify-content: space-between;
   align-items: center;
  padding-top: 14px;
   border-top: 1px solid #ddd;
  }

  /*Text*/
  .text-title {
   font-weight: 600;
  font-size: 1.18em;
   line-height: 1.5;
  }

  .text-body {
  font-size: .92em;
   padding-bottom: 4px;
  }
  .product-category {
    font-size: 0.75em;
    font-weight: bold;
    color: #888;
    letter-spacing: 1px;
    margin-bottom: 10px;
    text-transform: uppercase;
  }

  /*Button*/
  .card-button {
   border: 1px solid #252525;
   display: flex;
   padding: .3em;
   cursor: pointer;
   border-radius: 50px;
   transition: .3s ease-in-out;
   background: #fff;
  }

  /*Hover*/
  .card-img:hover {
   transform: translateY(-25%);
   box-shadow: rgba(226, 196, 63, 0.25) 0px 13px 47px -5px, rgba(180, 71, 71, 0.3) 0px 8px 16px -8px;
  }

  .card-button:hover {
   border: 1px solid #1d794c;
   background-color: #1d794c;
  }
  .card-button:hover .svg-icon {
    fill: #fff;
    color: #fff;
  }
  .svg-icon {
    fill: #252525;
    color: #252525;
    transition: fill 0.3s, color 0.3s;
  }
`;

export default ProductCard;
