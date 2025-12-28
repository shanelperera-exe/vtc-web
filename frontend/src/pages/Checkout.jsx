
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { Stepper } from '../components/checkout/Stepper';
import { checkoutSteps } from '../components/checkout/checkoutSteps';
import BillingForm from '../components/checkout/BillingForm';
import DeliveryForm from '../components/checkout/DeliveryForm';
import PaymentForm from '../components/checkout/PaymentForm';
import Summary from '../components/checkout/Summary';
import NxtButton from '../components/ui/NextBtn';
import PrevBtn from '../components/ui/PrevBtn';
import PlaceOrder from '../components/ui/PlaceOrder';
import AuthPopup from '../components/auth/AuthPopup';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import orderApi from '../api/orderApi';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import addressApi from '../api/addressApi';
import userApi from '../api/userApi';

export default function Checkout() {
		// Shipping amount state
		const [shippingAmount, setShippingAmount] = useState(0);
		useEffect(() => {
			const parseShipping = (v) => {
				if (v == null) return 0
				if (typeof v === 'number') return v
				if (typeof v === 'string') return Number(v) || 0
				if (typeof v === 'object') return Number(v.amount ?? v.value ?? v.shippingFee ?? v.fee ?? 0) || 0
				return 0
			}
			const fetchShipping = async () => {
				try {
					const res = await axios.get('/api/shipping-config');
					setShippingAmount(parseShipping(res.data));
				} catch {
					setShippingAmount(0);
				}
			};
			fetchShipping();
		}, []);
	const [active, setActive] = useState(0)
	const [authOpen, setAuthOpen] = useState(false)
	const [billing, setBilling] = useState({ firstName: '', lastName: '', company: '', email: '', phone: '', address1: '', address2: '', city: '', province: '', district: '', postal: '', country: 'Sri Lanka', orderNotes: '' })
	const [delivery, setDelivery] = useState({
		shipToDifferent: false,
		shippingAddress: '',
		shippingAddress2: '',
		shippingCity: '',
		shippingProvince: '',
		shippingDistrict: '',
		shippingPostal: '',
		shippingNotes: '',
		deliveryMethod: 'delivery',
	})
	const [payment, setPayment] = useState({ method: 'cod', cardName: '', cardNumber: '', expiry: '', cvc: '' })
	const [couponCode, setCouponCode] = useState('')
	const [couponApplying, setCouponApplying] = useState(false)
	const [couponMessage, setCouponMessage] = useState(null)
	const [couponDiscount, setCouponDiscount] = useState(0)
	const [errors, setErrors] = useState({})
	const isFirst = active === 0
	const isLast = active === checkoutSteps.length - 1

	const { isAuthenticated } = useAuth() || {}

	// Auto-fill from saved addresses when authenticated
	useEffect(() => {
		let mounted = true
		async function loadSaved() {
			if (!isAuthenticated) return
			try {
					// Try to fetch basic user profile to auto-fill email/name/phone
					const me = await userApi.getMe().catch(() => null)
					if (me && mounted) {
						setBilling(prev => ({
							...prev,
							firstName: prev.firstName || me.firstName || '',
							lastName: prev.lastName || me.lastName || '',
							email: prev.email || me.email || '',
							phone: prev.phone || me.phone || '',
						}))
					}
				const [billingList, shippingList] = await Promise.all([
					addressApi.listBilling(),
					addressApi.listShipping(),
				])
				const b = Array.isArray(billingList) && billingList.length > 0 ? billingList[0] : null
				if (b && mounted) {
					setBilling(prev => ({
						...prev,
						address1: b.line1 || '',
						address2: b.line2 || '',
						city: b.city || '',
						province: b.province || '',
						district: b.district || '',
						postal: b.postalCode || '',
						country: b.country || 'Sri Lanka',
					}))
				}
				const s = Array.isArray(shippingList) && shippingList.length > 0 ? shippingList[0] : null
				if (s && mounted) {
					setDelivery(prev => ({
						...prev,
						shipToDifferent: true,
						shippingAddress: s.line1 || '',
						shippingAddress2: s.line2 || '',
						shippingCity: s.city || '',
						shippingProvince: s.province || '',
						shippingDistrict: s.district || '',
						shippingPostal: s.postalCode || '',
					}))
				}
			} catch {
				// ignore silently for now
			}
		}
		loadSaved()
		return () => { mounted = false }
	}, [isAuthenticated])

	const validateStep = (stepIndex) => {
		const newErrors = {}
		if (stepIndex === 0) {
			if (!billing.firstName?.trim()) newErrors.firstName = true
			if (!billing.lastName?.trim()) newErrors.lastName = true
			if (!/\S+@\S+\.\S+/.test(billing.email || '')) newErrors.email = true
			if (!billing.phone?.trim()) newErrors.phone = true
			// Address fields under Billing
			if (!billing.country || (typeof billing.country === 'string' && !billing.country.trim())) newErrors.country = true
			if (!billing.address1?.trim()) newErrors.address1 = true
			if (!billing.city?.trim()) newErrors.city = true
			if (!billing.province?.trim()) newErrors.province = true
			if (!billing.postal?.trim()) newErrors.postal = true
		}
		if (stepIndex === 1) {
			if (delivery.shipToDifferent) {
				if (!delivery.shippingAddress?.trim()) newErrors.shippingAddress = true
				if (!delivery.shippingCity?.trim()) newErrors.shippingCity = true
				if (!delivery.shippingProvince?.trim()) newErrors.shippingProvince = true
				if (!delivery.shippingDistrict?.trim()) newErrors.shippingDistrict = true
				if (!delivery.shippingPostal?.trim()) newErrors.shippingPostal = true
			}
		}
		if (stepIndex === 2 && payment.method === 'card') {
			if (!payment.cardName?.trim()) newErrors.cardName = true
			if (!/^\d{15,16}$/.test(payment.cardNumber || '')) newErrors.cardNumber = true
			if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(payment.expiry || '')) newErrors.expiry = true
			if (!/^\d{3,4}$/.test(payment.cvc || '')) newErrors.cvc = true
		}
		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleNext = () => {
		if (!validateStep(active)) return
		if (!isLast) setActive((s) => s + 1)
	}
	const handlePrev = () => {
		if (!isFirst) setActive((s) => s - 1)
	}

	// Clear a specific validation error as the user edits
	const clearError = (field) => {
		if (!field) return
		setErrors((prev) => {
			if (!prev || !(field in prev)) return prev
			const next = { ...prev }
			delete next[field]
			return next
		})
	}

	// Cart helpers and navigation
	const { cartItems, clearLocal } = useCart();
	const navigate = useNavigate();

		// If cart is somehow empty while on this page, send back to cart
		useEffect(() => {
			if (!Array.isArray(cartItems) || cartItems.length === 0) {
				navigate('/cart', { replace: true });
			}
		}, [cartItems, navigate]);

	const handlePlaceOrder = async () => {
		if (!validateStep(2)) return;
		// Require authentication before placing an order
		if (!isAuthenticated) {
			setAuthOpen(true);
			return;
		}

		// Map frontend state to backend CheckoutRequestDTO
		const billingAddress = {
			company: billing.company || '',
			line1: billing.address1,
			line2: billing.address2 || '',
			city: billing.city,
			province: billing.province || '',
			district: billing.district || '',
			postalCode: billing.postal,
			country: billing.country || 'Sri Lanka',
		};
		const shippingAddress = delivery.shipToDifferent ? {
			company: billing.company || '',
			line1: delivery.shippingAddress,
			line2: delivery.shippingAddress2 || '',
			city: delivery.shippingCity,
			province: delivery.shippingProvince || '',
			district: delivery.shippingDistrict || '',
			postalCode: delivery.shippingPostal,
			country: 'Sri Lanka',
		} : billingAddress;

		const deliveryMethod = delivery.deliveryMethod === 'pickup' ? 'IN_STORE_PICKUP' : 'STANDARD_DELIVERY';
		const paymentMethod = payment.method === 'card' ? 'CARD' : 'CASH_ON_DELIVERY';

		let paymentInfo;
		if (paymentMethod === 'CARD') {
			const expMatch = (payment.expiry || '').match(/^(\d{2})\/(\d{2})$/);
			const cardExpMonth = expMatch ? parseInt(expMatch[1], 10) : undefined;
			const cardExpYear = expMatch ? 2000 + parseInt(expMatch[2], 10) : undefined;
			// naive card type inference
			let cardType = undefined;
			const digits = String(payment.cardNumber || '').replace(/\D/g, '');
			if (/^4/.test(digits)) cardType = 'VISA';
			else if (/^(5[1-5])/.test(digits)) cardType = 'MASTERCARD';
			else if (/^3[47]/.test(digits)) cardType = 'AMEX';

			paymentInfo = {
				cardType,
				cardLast4: (digits || '').slice(-4),
				cardExpMonth,
				cardExpYear,
			};
		}

			// compute subtotal and applied shipping to include in checkout snapshot
			const subtotal = cartItems.reduce((acc, p) => acc + (p.price || 0) * (p.quantity || 1), 0)
			const parseShippingVal = (v) => {
				if (v == null) return 0
				if (typeof v === 'number') return v
				if (typeof v === 'string') return Number(v) || 0
				if (typeof v === 'object') return Number(v.amount ?? v.value ?? v.shippingFee ?? v.fee ?? 0) || 0
				return 0
			}
			const appliedShipping = subtotal > 10000 || subtotal === 0 ? 0 : parseShippingVal(shippingAmount);
			const payload = {
			// Optional customer snapshot fields (backend will fallback to auth user details)
			customerFirstName: billing.firstName || undefined,
			customerLastName: billing.lastName || undefined,
			customerEmail: billing.email || undefined,
			customerPhone: billing.phone || undefined,
			billingAddress,
			shippingAddress,
			deliveryMethod,
			paymentMethod,
			paymentInfo,
			couponCode: couponCode || undefined,
			orderNotes: billing.orderNotes || delivery.shippingNotes || undefined,
		};
			// include explicit shippingFee and zeroed tax to avoid server applying taxes
			payload.shippingFee = appliedShipping
			payload.taxTotal = 0

		try {
			const response = await orderApi.checkout(payload);
			// Clear guest cart locally (server cart is cleared by backend on success)
			clearLocal();

			// Navigate to an Order Confirmed page (so user sees a friendly confirmation)
			if (response?.orderId || response?.orderNumber) {
				// pass the response (order summary) in location state so the confirmed page
				// can show a quick summary without needing an extra API call
				const routeId = response.orderNumber ? response.orderNumber : response.orderId;
				navigate(`/order-confirmed/${routeId}`, { state: { order: response, orderNumber: response.orderNumber, orderId: response.orderId } });
			} else {
				alert('Order placed successfully!');
			}
		} catch (err) {
			alert(err?.message || 'Failed to place order.');
		}
	}

	const doApplyCoupon = async (action, val) => {
		if (action === 'typing') {
			setCouponCode(val || '')
			setCouponMessage(null)
			return
		}
		if (action === 'apply') {
			// compute subtotal from cart (client-side) and call backend
			setCouponApplying(true)
			setCouponMessage(null)
			try {
				const subtotal = cartItems.reduce((acc, p) => acc + (p.price || 0) * (p.quantity || 1), 0)
				const res = await (await import('../api/couponApi')).default.applyCoupon({ code: couponCode, subtotal })
				if (res && res.valid) {
					setCouponDiscount(res.discountAmount || 0)
					setCouponMessage(`Applied: ${new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 2 }).format(Number(res.discountAmount || 0))}.`)
				} else {
					setCouponDiscount(0)
					setCouponMessage(res?.message || 'Invalid coupon')
				}
			} catch (e) {
				setCouponDiscount(0)
				setCouponMessage(e?.message || 'Failed to apply coupon')
			} finally {
				setCouponApplying(false)
			}
		}
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<Navbar />
			<div className="mx-auto max-w-6xl px-4 py-6 mt-2">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
					<h1 className="text-4xl sm:text-6xl font-semibold text-gray-900">Checkout</h1>
					<button
						type="button"
						onClick={() => navigate('/cart')}
						className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200"
					>
						<FiShoppingCart className="w-4 h-4" aria-hidden="true" />
						<span>View cart</span>
					</button>
				</div>

				<Stepper active={active} onStepClick={(idx) => setActive(idx)} />

				<div className="mt-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
					<div className="lg:col-span-3">
						{active === 0 && !isAuthenticated && (
							<div className="mb-4 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm">
								Returning customer?{' '}
								<button type="button" onClick={() => setAuthOpen(true)} className="font-semibold text-emerald-600 hover:underline">Click here to sign in</button>
							</div>
						)}
						<div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
							{active === 0 && (
								<section>
									<h2 className="text-xl font-semibold text-gray-900 mb-4">Billing Details</h2>
									<BillingForm data={billing} onChange={setBilling} errors={errors} clearError={clearError} />
								</section>
							)}
							{active === 1 && (
								<section>
									<h2 className="text-xl font-semibold text-gray-900 mb-4">Delivery Details</h2>
									<DeliveryForm
										data={delivery}
										onChange={setDelivery}
										errors={errors}
										billing={billing}
										onEditBilling={() => setActive(0)}
										clearError={clearError}
									/>
								</section>
							)}
							{active === 2 && (
								<section>
									<h2 className="text-xl font-semibold text-gray-900 mb-4">Payment</h2>
									<PaymentForm data={payment} onChange={setPayment} errors={errors} clearError={clearError}
										couponCode={couponCode}
										onApplyCoupon={doApplyCoupon}
										couponApplying={couponApplying}
										couponMessage={couponMessage}
									/>
								</section>
							)}

							<div className="mt-6 flex items-center justify-between">
								<PrevBtn onClick={handlePrev} disabled={isFirst}>Prev</PrevBtn>

								{isLast ? (
									<PlaceOrder onClick={handlePlaceOrder}>Place Order</PlaceOrder>
								) : (
									<NxtButton onClick={handleNext}>Next</NxtButton>
								)}
							</div>
						</div>
					</div>

					<div className="lg:col-span-2">
						<Summary
							couponCode={couponCode}
							couponDiscount={couponDiscount}
							onApplyCoupon={doApplyCoupon}
							couponApplying={couponApplying}
							couponMessage={couponMessage}
							setCouponCode={(val) => setCouponCode(val)}
							shippingAmount={shippingAmount}
						/>
					</div>
				</div>
				{/* Auth Popup */}
				<AuthPopup isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode="login" />
			</div>
		</div>
	)
}

