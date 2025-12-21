import React from "react";
import Navbar from "../components/layout/Navbar";
import QuantityInput from "../components/ui/QuantityInput";
import CartSummary from "../components/cart/CartSummary";
import { useCart } from "../context/CartContext.jsx";

export default function ShoppingCart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();

  function formatLKR(amount) {
    try {
      return new Intl.NumberFormat("en-LK", { style: "currency", currency: "LKR" }).format(Number(amount) || 0);
    } catch {
      return `Rs ${amount}`;
    }
  }

  return (
    <div className="min-h-screen overflow-y-hidden">
      <Navbar />

      <main className="max-w-7xl mx-auto py-8">
        <div className="cart-header flex items-baseline gap-2 mt-6 lg:-ml-14">
          <h1 className="cart-header-title cart-title special-heading-size-medium text-5xl font-semibold">Shopping cart</h1>

          <p className="cart-header-count rte text-gray-600 ml-2">
            <span className="cart-count font-medium">{cartItems.length}</span>
            <span className="ml-1">item{cartItems.length !== 1 ? "s" : ""}</span>
          </p>
        </div>

        <div className="cart-contents mt-8">
          {cartItems.length === 0 ? (
            <div className="page-width">
              <div className="cart__warnings p-6 text-center">
                <h6 className="cart__empty-text text-lg font-medium">Your cart is currently empty.</h6>
                <a href="/collections/all" className="inline-block mt-4 px-4 py-2 bg-black text-white text-sm" aria-label="Return to store">
                  <span className="inline-block mr-2">←</span>Return to store
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-9 lg:pr-2 lg:-ml-4">
                <div className="overflow-x-visible">
                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-3 w-8"></th>
                        <th className="py-3 pl-0" colSpan={2}>Product</th>
                        <th className="py-3 pl-8">Unit Price</th>
                        <th className="py-3 pl-8">Qty</th>
                        <th className="py-3 pl-8">Total</th>
                      </tr>
                    </thead>

                    <tbody className="cart-contents-products-list cart-products">
                      {cartItems.map((product) => (
                        <tr key={product.id} className="cart-contents-product cart-product border-b">
                          <td className="p-2 align-top text-center relative overflow-visible">
                            <button aria-label="Remove item" onClick={() => removeFromCart(product.id)} className="absolute -left-8 md:-left-10 top-1/2 transform -translate-y-1/2 text-gray-700 text-3xl leading-none hover:text-red-600 z-20">×</button>
                          </td>

                          <td className="cart-contents-product__thumbnail cart-product-thumbnail w-15 p-2 pl-0">
                            <a href="#" className="block">
                              <figure className="w-20 h-20 overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-700 rounded-sm">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover rounded-sm" />
                              </figure>
                            </a>
                          </td>

                          <td className="cart-contents-product__title py-4">
                            <h3 className="cart-product-title font-medium text-base"><a href="#">{product.name}</a></h3>
                            <div className="cart-product-variant text-sm text-gray-600 mt-1">
                              {product.color ? `Color: ${product.color}` : null}
                              {product.color && product.size ? <span className="mx-1">|</span> : null}
                              {product.size ? `Size: ${product.size}` : null}
                            </div>
                          </td>

                          <td className="cart-contents-product__price cart-product-price py-4 pl-6">{formatLKR(product.price)}</td>

                          <td className="cart-contents-product__qty cart-product-qty py-4 pl-6">
                            <div className="flex items-center gap-2">
                              <QuantityInput value={product.quantity || 1} onChange={(v) => updateQuantity(product.id, v)} min={0} max={15} />
                            </div>
                          </td>

                          <td className="cart-contents-product__total cart-product-total py-4 pl-6">{formatLKR((product.price || 0) * (product.quantity || 1))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-3">
                <CartSummary />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
