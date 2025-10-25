import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { FiCheckCircle } from 'react-icons/fi';
import ReviewSection from "../reviews/ReviewSection";

export default function ProductTabs({ product = null, selectedColor = null, selectedSize = null }) {
  const [activeTab, setActiveTab] = useState("description");
  // visualTab is used for the tab indicator so it can move immediately when a tab is clicked
  const [visualTab, setVisualTab] = useState(activeTab);
  const [contentVisible, setContentVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const ANIM_MS = 300; // match Tailwind duration-300

  const handleTabClick = (id) => {
    if (id === activeTab || isAnimating) return;
    // move indicator immediately
    setVisualTab(id);
    setIsAnimating(true);
    // fade out
    setContentVisible(false);
    setTimeout(() => {
      // switch tab content
      setActiveTab(id);
      // fade in new content
      setContentVisible(true);
      // finish animation after fade-in completes
      setTimeout(() => setIsAnimating(false), ANIM_MS);
    }, ANIM_MS);
  };

  // refs for measuring tab button positions
  const tabsContainerRef = useRef(null);
  const tabRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const updateIndicator = () => {
    const container = tabsContainerRef.current;
    const activeEl = tabRefs.current[visualTab];
    if (!container || !activeEl) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    const left = elRect.left - containerRect.left + container.scrollLeft;
    const width = elRect.width;
    setIndicator({ left, width });
  };

  // position indicator on mount, visualTab change, and window resize
  useLayoutEffect(() => {
    updateIndicator();
    // small timeout to ensure fonts/DOM settled
    const t = setTimeout(updateIndicator, 50);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualTab]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, []);

  const tabs = [
    { id: "description", label: "Product Description" },
    { id: "additional", label: "Additional Information" },
    { id: "shipping", label: "Shipping & Returns" },
    { id: "reviews", label: "Product Reviews" },
  ];

  // helpers to render product-driven content
  const getAvailabilityForSelection = () => {
    if (!product) return null;
    if (product.availability && typeof product.availability === "object") {
      const color = selectedColor || Object.keys(product.availability)[0];
      const size = selectedSize || (color && product.availability[color] ? Object.keys(product.availability[color])[0] : null);
      if (color && size && product.availability[color] && product.availability[color][size]) {
        return product.availability[color][size];
      }
      return null;
    }
    return product.availability || null;
  };

  const availabilityStatus = getAvailabilityForSelection();

  return (
    // Full width container with page padding so tabs span full browser width
    <div className="w-full">
      {/* Full-bleed tab bar */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 border-b border-gray-200">
          <div className="relative">
            <div
              ref={tabsContainerRef}
              className="flex justify-center space-x-6"
              role="tablist"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  ref={(el) => (tabRefs.current[tab.id] = el)}
                  onClick={() => handleTabClick(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={`px-4 py-2 text-base lg:text-md font-medium transition-colors duration-200
                    ${activeTab === tab.id
                      ? "text-black"
                      : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* sliding indicator */}
            <div
              aria-hidden
              className="absolute bottom-0 h-0.5 bg-[#00bf63] transition-all duration-300"
              style={{
                left: indicator.left,
                width: indicator.width,
                transform: `translateX(0px)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6 text-gray-700 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div
          className={`transition-opacity duration-300 transform ${contentVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            } ${isAnimating ? "pointer-events-none" : ""}`}
          aria-live="polite"
        >
          {activeTab === "description" && (
            <div>
              <p className="whitespace-pre-line">{product?.detailedDescription || product?.description || 'No details available.'}</p>

              {/* Product highlights row */}
              {product?.highlights && product.highlights.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-3xl font-semibold mb-3">Highlights</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {product.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-3 px-2 py-2 border border-transparent">
                        <FiCheckCircle className="text-[#00bf63] shrink-0 mt-1" size={20} aria-hidden />
                        <span className="text-md text-gray-700 leading-6">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

          )}
          {activeTab === "additional" && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-md text-left border-collapse">
                  <tbody>
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <th className="py-2 pr-0 pl-4 align-top font-medium text-gray-700">Name</th>
                      <td className="py-2 text-gray-500">{product?.name || '—'}</td>
                    </tr>
                    <tr className="bg-white border-t border-gray-200">
                      <th className="py-2 pr-0 pl-4 align-top font-medium text-gray-700">SKU</th>
                      <td className="py-2 text-gray-500">{product?.sku || product?.skuId || 'CLN-001'}</td>
                    </tr>
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <th className="py-2 pr-0 pl-4 align-top font-medium text-gray-700">Vendor</th>
                      <td className="py-2 text-gray-500">{product?.vendor || product?.brand || '—'}</td>
                    </tr>
                    <tr className="bg-white border-t border-gray-200">
                      <th className="py-2 pr-0 pl-4 align-top font-medium text-gray-700">Color</th>
                      <td className="py-2 text-gray-500">
                        {product?.availableColors && product.availableColors.length > 0
                          ? product.availableColors.join(', ')
                          : selectedColor || '—'}
                      </td>
                    </tr>
                  </tbody>
              </table>
            </div>
          )}
          {activeTab === "shipping" && (
            <div className="content-wrap">
                <h6 className="text-3xl font-semibold mb-2">Returns policy</h6>
                <ul className="list-disc pl-6 text-gray-900 mb-6">
                  <li>We accept returns and exchanges within 30 days of delivery.</li>
                  <li>Items must be unused, unworn, and in their original packaging with tags attached.</li>
                  <li>Refunds will be issued to the original payment method within 7–10 business days after inspection.</li>
                  <li>Sale items, gift cards, and personalized products are non-returnable.</li>
                  <li>Customers are responsible for return shipping costs unless the item is defective or incorrect.</li>
                </ul>
                <h6 className="text-3xl font-semibold mb-2">Shipping policy</h6>
                <div className="space-y-1 text-gray-600">
                  <p><span className="font-medium text-gray-900">Processing:</span> Orders are processed and dispatched within 24 hours on business days.</p>

                  <p><span className="font-medium text-gray-900">Domestic delivery:</span> Estimated 1–3 business days after dispatch, depending on carrier and delivery location.</p>

                  <p><span className="font-medium text-gray-900">International delivery:</span> Estimated 7–14 business days. Customs clearance and local carrier delays may extend delivery times.</p>

                  <p><span className="font-medium text-gray-900">Shipping costs:</span> Calculated at checkout. Free shipping applies on domestic orders over LKR 20,000.</p>

                  <p><span className="font-medium text-gray-900">Tracking:</span> A tracking number will be provided by email once your order has shipped.</p>

                  <p><span className="font-medium text-gray-900">Delays & exceptions:</span> Unexpected events such as severe weather, customs inspections, or courier disruptions may delay your shipment. We will notify you promptly of any major changes.</p>

                  <p><span className="font-medium text-gray-900">Cash on Delivery (COD):</span> Available for eligible products and regions. Please ensure exact payment is ready at delivery.</p>

                  <p><span className="font-medium text-gray-900">Returns:</span> For returns and exchanges, please follow the Returns Policy above. Contact support for assistance with return labels and instructions.</p>

                  <p><span className="font-medium text-gray-900">Questions?</span> Reach our support team at <a href="mailto:support@example.com" className="text-blue-600 hover:underline">support@vtc.com</a> or via live chat.</p>
                </div>
            </div>
          )}

          {activeTab === "reviews" && (
            product ? (
              <ReviewSection product={product} />
            ) : (
              <p>No reviews available.</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
