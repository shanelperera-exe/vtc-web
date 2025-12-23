import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import CartItem from './CartItem'
import { useCart } from '../../context/CartContext.jsx'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { FiShoppingCart, FiCreditCard } from 'react-icons/fi'

export default function CartSidebar({ open, onClose }) {
    const navigate = useNavigate()
    const { cartItems, removeFromCart } = useCart()
    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0)
    const subtotalLKR = new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(subtotal)
    return (
        <div>
            <Dialog open={open} onClose={onClose} className="relative z-[60]">
                <DialogBackdrop
                    transition
                    className="fixed inset-0 bg-gray-500/75 transition-opacity duration-500 ease-in-out data-closed:opacity-0"
                />

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                            <DialogPanel
                                transition
                                className="pointer-events-auto w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
                            >
                                <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl rounded-l-lg overflow-hidden">
                                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                                        <div className="flex items-start justify-between">
                                            <DialogTitle className="text-4xl font-semibold text-gray-900">Shopping Cart</DialogTitle>
                                            <div className="ml-3 flex h-7 items-center">
                                                <button
                                                    type="button"
                                                    onClick={onClose}
                                                    className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                                                >
                                                    <span className="absolute -inset-0.5" />
                                                    <span className="sr-only">Close panel</span>
                                                    <XMarkIcon aria-hidden="true" className="size-8" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-8">
                                            <div className="flow-root">
                                                <ul role="list" className="-my-6 divide-y divide-gray-200">
                                                    {cartItems.map((product) => (
                                                        <li key={product.id} className="flex py-6">
                                                            <CartItem product={product} onRemove={() => removeFromCart(product.id)} />
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                                        <div className="flex justify-between text-base font-medium text-gray-900">
                                            <p>Subtotal</p>
                                            <p>{subtotalLKR}</p>
                                        </div>
                                        <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                                        <div className="mt-6 space-y-3">
                                            <StyledAction $variant="buy" $fullWidth $heightPx={48} $fontSizePx={16}>
                                                <button
                                                    type="button"
                                                    onClick={() => { onClose(); navigate('/checkout'); }}
                                                >
                                                    <FiCreditCard className="size-5" aria-hidden="true" />
                                                    <span className="btn-label">Checkout</span>
                                                </button>
                                            </StyledAction>

                                            <StyledAction $variant="add" $fullWidth $heightPx={48} $fontSizePx={16}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        onClose()
                                                        navigate('/cart')
                                                    }}
                                                >
                                                    <FiShoppingCart className="size-5" aria-hidden="true" />
                                                    <span className="btn-label">View cart</span>
                                                </button>
                                            </StyledAction>
                                        </div>
                                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                                            <p>
                                                or{' '}
                                                <button
                                                    type="button"
                                                    onClick={onClose}
                                                    className="font-medium text-[#1d794c] hover:text-[#0bd964]"
                                                >
                                                    Continue Shopping
                                                    <span aria-hidden="true"> &rarr;</span>
                                                </button>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

// Reusable styled action for cart sidebar buttons. Variant 'buy' => filled animated, 'add' => outlined animated
const StyledAction = styled.div`
    display: inline-flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0;
    width: ${p => (p.$fullWidth ? '100%' : 'auto')};

    --btn-color: ${p => (p.$variant === 'buy' ? '#0bd964' : 'transparent')};
    --btn-border: ${p => (p.$variant === 'add' ? '#000' : 'transparent')};
    --anim-color: #000;
    --text-default: ${p => (p.$variant === 'buy' ? '#000' : '#000')};
    --text-hover: #fff;

    button {
        font-family: inherit;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: ${p => (p.$fullWidth ? '100%' : 'auto')};
        min-width: ${p => (p.$fullWidth ? '0' : (p.$minWidthEm ? `${p.$minWidthEm}em` : '8em'))};
        height: ${p => (p.$heightPx ? `${p.$heightPx}px` : '40px')};
        line-height: 1.2;
        position: relative;
        cursor: pointer;
        overflow: hidden;
    border: ${p => (p.$variant === 'add' ? '2px solid var(--btn-border)' : 'none')};
        transition: color 0.5s, transform 0.2s ease;
        z-index: 1;
        font-size: ${p => (p.$fontSizePx ? `${p.$fontSizePx}px` : '16px')};
        font-weight: 600;
        color: var(--text-default);
        padding: 0 20px;
        background: var(--btn-color);
        border-radius: 0.5rem;
    }

    .btn-label { white-space: nowrap; }

    button::before {
        content: "";
        position: absolute;
        z-index: -1;
        background: var(--anim-color);
        height: ${p => (p.$variant === 'buy' ? '450px' : '200px')};
        width: ${p => (p.$variant === 'buy' ? '920px' : '700px')};
        border-radius: 50%;
    }

    button:hover { color: var(--text-hover); }
    button::before { top: 100%; left: 100%; transition: all ${p => (p.$variant === 'buy' ? '1s' : '0.7s')}; }
    button:hover::before { top: ${p => (p.$variant === 'buy' ? '-100px' : '-50px')}; left: ${p => (p.$variant === 'buy' ? '-100px' : '-50px')}; }
    button:active::before { background: var(--anim-color); transition: background 0s; }
`
