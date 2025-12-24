import OrderStatusBar from "./OrderStatusBar";

const ProductInOrder = ({ product, address, shippingUpdates, showStatus = true, children }) => {
  return (
    <div className="bg-white p-4 flex flex-col gap-4 mb-4 overflow-hidden rounded-2xl border border-black/10">
      {/* Product details + spec + address arranged: image | details | (spec + address) */}
      <div className="w-full">
        <div className="flex flex-row md:flex-row md:items-start md:gap-8 gap-4 w-full">
          {/* image wrapper uses responsive fixed size and won't force overflow */}
          <div className="flex-shrink-0 w-20 h-20 md:w-36 md:h-36">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-xl border border-black/10 bg-gray-100"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center rounded-xl border border-black/10 bg-gray-50 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <path d="M8 14s1.5-2 4-2 4 2 4 2"></path>
                  <circle cx="12" cy="10" r="2"></circle>
                </svg>
              </div>
            )}
          </div>

          {/* allow the text column to shrink and let children truncate */}
          <div className="flex-1 flex flex-col justify-center min-w-0">
            <div className="flex items-start">
              <h3 className="text-base md:text-xl font-semibold text-gray-900 flex-1 mr-2 overflow-hidden">
                <a href="#" className="truncate block max-w-full">{product.name}</a>
              </h3>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-0.5">
              <span title={product.category} className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 truncate max-w-full overflow-hidden">{product.category}</span>
            </p>

            <div className="mt-1">
              <div className="text-base md:text-lg text-gray-900 font-semibold">{product.price}.00</div>
            </div>

            <div className="mt-1">
              <dd className="text-xs text-gray-700 break-words">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2 py-1">
                    <span className="font-semibold">Color:</span> {product.color || 'N/A'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2 py-1">
                    <span className="font-semibold">Size:</span> {product.size || 'N/A'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-2 py-1">
                    <span className="font-semibold">Qty:</span> {product.quantity ?? 1}
                  </span>
                </div>
              </dd>
            </div>
          </div>
        </div>
      </div>
      {/* optional children (actions, buttons) rendered under image/details */}
      {children && (
        <div className="pt-2">
          {children}
        </div>
      )}
      {showStatus && (
        <div className="pt-2">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Status</h4>
          <p className="text-xs text-gray-700 mb-2">{product.status.text}</p>
          <div className="w-full">
            <OrderStatusBar progress={product.status.progress} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInOrder;
