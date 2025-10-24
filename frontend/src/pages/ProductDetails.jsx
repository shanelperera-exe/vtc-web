import { StarIcon } from '@heroicons/react/20/solid';
import { products } from '../assets/data';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import BuyNowBtn from '../components/ui/BuyNowBtn';
import AddToCartBtn from '../components/ui/AddToCartBtn';
import QuantityInput from '../components/ui/QuantityInput';

export default function ProductDetails() {
  const { id } = useParams();
  // Find product by id (id from params is string, product.id is number)
  const product = products.find(p => String(p.id) === String(id));
  if (!product) {
    return <div className="p-8 text-center text-xl text-red-500">Product not found.</div>;
  }

  // Image selection state
  const allImages = [product.image, ...(product.secondaryImages || [])];
  const [selectedImg, setSelectedImg] = useState(allImages[0]);
  // Rating helpers (support `rating` or `review` fields)
  const rating = (typeof product.rating === 'number' ? product.rating : (typeof product.review === 'number' ? product.review : 0));
  const numReviews = typeof product.numOfReviews === 'number' ? product.numOfReviews : 0;

  // Color selection state (for products with color options)
  const colorOptions = product.availableColors || [];
  const [selectedColor, setSelectedColor] = useState(colorOptions.length > 0 ? colorOptions[0] : null);

  // Size selection state (for products with size options)
  const sizeOptions = product.availableSizes || [];
  const [selectedSize, setSelectedSize] = useState(sizeOptions.length > 0 ? sizeOptions[0] : null);
  const [qty, setQty] = useState(1);


  // Example breadcrumbs using category
  const breadcrumbs = [
    { id: 0, name: 'Home', href: '/' },
    { id: 1, name: product.category, href: `/category/${encodeURIComponent(product.category)}` },
  ];


  return (
    <>
      <Navbar />
      <div className="bg-white">
      <div className="pt-6">
        <nav aria-label="Breadcrumb">
          <ol role="list" className="flex max-w-2xl items-center space-x-2 pl-6 sm:pl-10 lg:max-w-7xl lg:pl-16">
            {breadcrumbs.map((breadcrumb) => (
              <li key={breadcrumb.id}>
                <div className="flex items-center leading-none whitespace-nowrap">
                  <a href={breadcrumb.href} className="mr-2 text-sm font-medium text-gray-900">
                    {breadcrumb.id === 0 && (
                      <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" className="inline-block mr-1 align-text-bottom" width="20" height="20">
                        <path d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clip-rule="evenodd" fill-rule="evenodd"></path>
                      </svg>
                    )}
                    {breadcrumb.name}
                  </a>
                  <svg
                    fill="currentColor"
                    width={16}
                    height={20}
                    viewBox="0 0 16 20"
                    aria-hidden="true"
                    className="h-5 w-4 text-gray-300"
                  >
                    <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                  </svg>
                </div>
              </li>
            ))}
            <li className="text-sm">
              <a href="#" aria-current="page" className="font-large text-gray-500 hover:text-gray-600">
                {product.name}
              </a>
            </li>
          </ol>
        </nav>

        {/* Product main flex layout */}
        <div className="mt-6 max-w-5xl pl-6 sm:pl-10 lg:max-w-[800px] lg:pl-16">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Image gallery */}
            <div className="flex-1 flex justify-start items-start">
              {/* Side images - sticky gallery */}
              <div className="flex flex-row gap-8 sticky top-24 self-start">
                <div className="flex flex-col gap-4 justify-start">
                  {allImages.slice(0, 3).map((img, idx) => (
                    <div
                      key={img}
                      className={`bg-gray-100 p-2 flex items-center justify-center w-[110px] h-[110px] cursor-pointer border ${selectedImg === img ? 'border-black' : 'border-transparent'}`}
                      onClick={() => setSelectedImg(img)}
                    >
                      <img
                        alt={product.name + ' thumb ' + (idx + 1)}
                        src={img}
                        className="object-contain w-full h-full"
                      />
                    </div>
                  ))}
                </div>
                <div className="bg-gray-100 p-4 flex items-center justify-center w-[550px] h-[550px] min-w-[300px] min-h-[300px]">
                  <img
                    alt={product.name}
                    src={selectedImg}
                    className="object-contain w-full h-full aspect-square"
                  />
                </div>
              </div>
            </div>
            {/* Product info and options */}
            <div className="flex-[1.2] flex flex-col gap-3 lg:ml-6 w-full">
              <h1 className="text-6xl font-black tracking-tight" style={{ color: '#1e2a38' }}>{product.name.toUpperCase()}</h1>
              <div className="">
                <h3 className="sr-only">Description</h3>
                <div className="space-y-1">
                    <p className="text-base text-gray-900">{product.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-3xl font-medium tracking-tight mb-0 pb-0 text-[#1e2a38]" style={{ fontFamily: 'Jost, sans-serif' }}>Rs. {product.price}.00</p>
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((i) => {
                    if (rating >= i + 1) {
                      return (
                        <StarIcon
                          key={i}
                          aria-hidden="true"
                          style={{ width: '16px', height: '16px' }}
                          className="text-gray-900 shrink-0"
                        />
                      );
                    } else if (rating > i && rating < i + 1) {
                      return (
                        <span key={i} style={{ position: 'relative', width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
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
                  <span className="ml-3 text-sm font-medium text-[#1d794c] align-middle mt-1">
                    {numReviews} reviews
                  </span>
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 -mt-2 pt-0"><span className='underline'><a href="">Shipping</a></span> calculated at checkout.</p>
                <hr className="my-0 border-gray-300 w-165 mx-0" />
              {/* Description and details below on large screens */}
                <div className="">
                  {/* Highlights removed, not present in products data */}
                  <div className="mt-2">
                    <h2 className="text-sm font-medium text-gray-900">Details</h2>
                    <div className="mt-4 space-y-6 max-w-[650px]">
                        <p className="text-sm text-gray-600">{product.details}</p>
                        {product.highlights && product.highlights.length > 0 && (
                          <div className="mt-6">
                            <h3 className="text-sm font-medium text-gray-900">Highlights</h3>
                            <div className="mt-3">
                              <ul role="list" className="list-disc space-y-1 pl-4 text-sm">
                                {product.highlights.map((highlight) => (
                                  <li key={highlight} className="text-gray-400">
                                    <span className="text-gray-600">{highlight}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="mt-5">
                    {/* Color option chooser (if available) */}
                    {colorOptions.length > 0 && (
                      <form className="mb-5">
                        <div>
                          <h3 className="mb-2 text-sm font-medium text-gray-700">Color: <span className="font-semibold text-gray-900">{selectedColor}</span></h3>
                          <fieldset aria-label="Choose a color" className="mt-3">
                            <div className="flex items-center gap-x-3">
                              {colorOptions.map((color) => (
                                <div key={color} className="flex rounded-full outline -outline-offset-1 outline-black/10">
                                  <input
                                    type="radio"
                                    name="color"
                                    value={color}
                                    checked={selectedColor === color}
                                    aria-label={color}
                                    className={`size-8 appearance-none rounded-full forced-color-adjust-none checked:outline-2 checked:outline-offset-2 focus-visible:outline-3 focus-visible:outline-offset-3 ${color === 'White' ? 'bg-white checked:outline-gray-400' : color === 'Black' ? 'bg-gray-900 checked:outline-gray-900' : color === 'Red' ? 'bg-red-500 checked:outline-red-500' : color === 'Blue' ? 'bg-blue-500 checked:outline-blue-500' : color === 'Green' ? 'bg-green-500 checked:outline-green-500' : color === 'Silver' ? 'bg-gray-300 checked:outline-gray-400' : 'bg-gray-200 checked:outline-gray-400'}`}
                                    onChange={() => setSelectedColor(color)}
                                  />
                                </div>
                              ))}
                            </div>
                          </fieldset>
                        </div>
                      </form>
                    )}

                    {/* Size option chooser (if available) */}
                    {product.availableSizes && product.availableSizes.length > 0 && (
                      <div className="mt-6 mb-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">Size</h3>
                          {/* <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Size guide</a> */}
                        </div>
                        <fieldset aria-label="Choose a size" className="mt-4">
                          <div className="grid grid-cols-4 gap-3">
                            {product.availableSizes.map((size) => (
                              <label
                                key={size}
                                aria-label={size}
                                className={`group relative flex items-center justify-center border border-gray-300 bg-white p-2.5 cursor-pointer`}
                                style={selectedSize === size ? { backgroundColor: 'rgb(30, 42, 56)', borderColor: 'rgb(30, 42, 56)' } : {}}
                              >
                                <input
                                  type="radio"
                                  name="size"
                                  value={size}
                                  checked={selectedSize === size}
                                  onChange={() => setSelectedSize(size)}
                                  className="absolute inset-0 appearance-none focus:outline-none"
                                />
                                <span
                                  className="text-sm font-medium uppercase"
                                  style={selectedSize === size ? { color: '#fff' } : { color: '#1e2a38' }}
                                >
                                  {size}
                                </span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                      </div>
                    )}
                    {/* Availability display */}
                    <div className="mb-4">
                      {(() => {
                        // If product has option-based availability
                        if (product.availability && typeof product.availability === 'object') {
                          // Use selectedColor and selectedSize
                          const color = selectedColor || Object.keys(product.availability)[0];
                          const size = selectedSize || (color && product.availability[color] ? Object.keys(product.availability[color])[0] : null);
                          let status = 'in stock';
                          if (color && size && product.availability[color][size]) {
                            status = product.availability[color][size];
                          }
                          return (
                            <span className={status === 'in stock' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                              {status === 'in stock' ? 'In Stock' : 'Out of Stock'}
                            </span>
                          );
                        } else if (product.availability) {
                          // Simple availability
                          return (
                            <span className={product.availability === 'in stock' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                              {product.availability === 'in stock' ? 'In Stock' : 'Out of Stock'}
                            </span>
                          );
                        } else {
                          // Default fallback
                          return null;
                        }
                      })()}
                    </div>
                    <div className="flex flex-row items-center gap-4 mb-6">
                      <QuantityInput value={qty} onChange={setQty} min={1} max={15} />
                      <BuyNowBtn product={product} />
                      <AddToCartBtn product={{...product, color: selectedColor, size: selectedSize}} quantity={qty} />
                    </div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}
