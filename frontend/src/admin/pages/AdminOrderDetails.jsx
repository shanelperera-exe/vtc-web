import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCheck, FiClock, FiRefreshCw, FiTruck, FiCheckCircle, FiXCircle, FiArrowRight, FiShoppingBag, FiUser, FiCreditCard, FiChevronDown } from 'react-icons/fi';
import { motion } from "framer-motion";
import ProductInOrder from "../../components/order/ProductInOrder";
import OrderStatusBar from "../../components/order/OrderStatusBar";
import BillingSummary from "../../components/order/BillingSummary";

const adminOrderWrapperVariants = {
	open: {
		scaleY: 1,
		opacity: 1,
		transition: {
			when: 'beforeChildren',
			staggerChildren: 0.06,
		},
	},
	closed: {
		scaleY: 0,
		opacity: 0,
		transition: {
			when: 'afterChildren',
			staggerChildren: 0.03,
			staggerDirection: -1,
		},
	},
};

const adminOrderItemVariants = {
	open: { opacity: 1, y: 0 },
	closed: { opacity: 0, y: -6 },
};

const adminOrderActionIconVariants = {
	open: { scale: 1 },
	closed: { scale: 0 },
};

const adminOrderIconVariants = {
	open: { rotate: 180 },
	closed: { rotate: 0 },
};
// Corrected paths to order and product APIs
import useOrders from "../../api/hooks/useOrders";
import { getProductDetails } from "../../api/productApi";
import orderApi from "../../api/orderApi";
import BackBtn from "../../components/ui/BackBtn";
import BackToTopBtn from "../../components/ui/BackToTopBtn";

const AdminOrderDetails = () => {
	const params = useParams();
	// Prefer friendly orderNumber param; fall back to legacy numeric id if present
	const rawKey = params.orderNumber ?? params.orderId;
	const isOrderNumber = typeof rawKey === 'string' && /^ORD\d{12}$/.test(rawKey);
	const orderNumber = isOrderNumber ? rawKey : undefined;
	const orderId = !isOrderNumber && rawKey != null ? rawKey : undefined;
	const navigate = useNavigate();
	// Request order in admin mode; use orderNumber when available
	const { order: foundOrder, loading, error, reload } = useOrders({ orderId, orderNumber, admin: true });
	const [order, setOrder] = useState(foundOrder);
	const [productCache, setProductCache] = useState({});

	useEffect(() => { setOrder(foundOrder); }, [foundOrder]);

	// Show BackToTopBtn only after scrolling (hook must be declared before any early return)
	const [showTopBtn, setShowTopBtn] = useState(false);
	useEffect(() => {
		const handleScroll = () => { setShowTopBtn(window.scrollY > 50); };
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// --- Admin status edit UI state & helpers (hooks must be top-level prior to returns) ---
	const [selectedProgress, setSelectedProgress] = useState(0);
	const [saving, setSaving] = useState(false);
	useEffect(() => {
		if (!order) return;
		const prog = Array.isArray(order?.items) && order.items.length
			? Math.max(0, ...order.items.map((it) => (it.status?.progress ?? 0)))
			: 0;
		setSelectedProgress(prog);
	}, [order]);

	// Preload product details for better image/category display
	useEffect(() => {
		let active = true;
		async function loadProducts() {
			if (!Array.isArray(order?.items)) return;
			for (const it of order.items) {
				const pid = it.productId;
				if (!pid || Object.prototype.hasOwnProperty.call(productCache, pid)) continue;
				try {
					// fetch detailed product (includes primaryImageUrl/image)
					const p = await getProductDetails(pid);
					if (active) setProductCache(c => ({ ...c, [pid]: p }));
				} catch (e) {
					if (active) setProductCache(c => ({ ...c, [pid]: null }));
				}
			}
		}
		loadProducts();
		return () => { active = false; };
	}, [order, productCache]);

	if (loading) {
		return (
			<main className="mx-auto w-full max-w-screen-2xl py-16 px-5 md:px-6">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-black tracking-tight">Loading order…</h1>
					<p className="text-sm text-gray-600 mt-2">Fetching order details and items.</p>
				</div>
			</main>
		);
	}

	if (error) {
		return (
			<main className="mx-auto w-full max-w-screen-2xl py-16 px-5 md:px-6">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-red-600">Failed to load order</h1>
					<button onClick={reload} className="mt-4 inline-flex items-center rounded-lg px-4 py-2 border border-black/10 bg-white text-sm font-semibold text-black hover:bg-black hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white">Retry</button>
				</div>
			</main>
		);
	}

	if (!order) {
		return (
			<>
				<main className="mx-auto w-full max-w-screen-2xl py-16 px-5 md:px-6">
					<div className="mb-8">
						<h1 className="text-3xl font-bold">Order not found</h1>
						<button
							onClick={() => navigate(-1)}
							className="mt-4 text-sm font-semibold text-emerald-700 hover:underline"
						>
							Go back
						</button>
					</div>
				</main>
			</>
		);
	}

	// Map order items to enriched products for ProductInOrder
	const enrichedProducts = (Array.isArray(order?.items) ? order.items : []).map((item, idx) => {
		const base = productCache[item.productId];
		const unit = item.unitPrice || item.price || 0;
		const qty = item.quantity ?? 1;
		const priceLkr = Number(unit) * qty;
		const attrs = item.variationAttributes || {};
		const color = item.color || attrs.color || attrs.Color || attrs.colour || attrs.Colour || '—';
		const size = item.size || attrs.size || attrs.Size || '—';
		const pickImage = (prod, ordItem) => {
			if (!prod) return ordItem?.imageUrl || ordItem?.image || '';
			const candidates = [
				prod.image,
				prod.primaryImageUrl,
				Array.isArray(prod.imageUrls) ? prod.imageUrls[0] : undefined,
				prod.mainImageUrl,
				prod.primaryImage,
				prod.imageUrl,
				prod.img,
				prod.primary,
			];
			for (const c of candidates) {
				if (!c) continue;
				if (typeof c === 'string' && c.trim()) return c;
				if (typeof c === 'object') {
					if (c.url) return c.url;
					if (c.path) return c.path;
					if (c.src) return c.src;
				}
			}
			if (Array.isArray(prod?.images)) {
				const first = prod.images.find(i => i && (i.url || i.path || i.src));
				if (first) return first.url || first.path || first.src || '';
			}
			return ordItem?.imageUrl || ordItem?.image || '';
		};
		const image = pickImage(base, item);
		return {
			id: item.id || `${item.productId}|${idx}`,
			name: base?.name || base?.title || item.productName || `Product ${item.productId}`,
			price: `LKR ${priceLkr.toLocaleString()}`,
			category: base?.category?.name || base?.category || item.categoryName || '—',
			description: base?.description || item.productName || '',
			image,
			color,
			size,
			quantity: qty,
			status: item.status || {},
		};
	});

	// Compute order-level progress as the max progress among items
	const mapOrderStatusToProgress = (s) => {
		if (!s) return 0;
		const str = typeof s === 'string' ? s.toLowerCase() : String(s).toLowerCase();
		if (str.includes('deliver')) return 3;
		if (str.includes('ship')) return 2;
		if (str.includes('process')) return 1;
		if (str.includes('cancel')) return 0; // cancelled handled via label
		return 0;
	};
	const orderProgress = mapOrderStatusToProgress(order?.status);

	// Derive a human-friendly order status label and detail (date/text)
	const statusSteps = ["Order placed", "Processing", "Shipped", "Delivered"];
	const statusLabel = statusSteps[orderProgress] ?? (typeof order?.status === 'string' ? order.status : String(order?.status || ''));
	const statusDetail = (() => {
		if (orderProgress === 0) {
			return `Order placed on ${order.placed || '—'}${order.placedTime ? ` ${order.placedTime}` : ''}`;
		}
		if (orderProgress === 1) {
			return 'Processing';
		}
		if (orderProgress === 2 || orderProgress === 3) {
			const matched = Array.isArray(order?.items) ? order.items.find((it) => it.status?.progress === orderProgress && it.status?.text) : undefined;
			if (matched) return matched.status.text;
			return typeof order.status === 'string' ? order.status : String(order.status || '');
		}
		return typeof order.status === 'string' ? order.status : String(order.status || '');
	})();


	// Helper to format time strings like "14:32" -> "2:32 PM"
	const formatToAmPm = (timeStr) => {
		if (!timeStr) return null;
		// expecting HH:MM (24h)
		const [hStr, mStr] = timeStr.split(":");
		const h = parseInt(hStr, 10);
		const m = mStr;
		const ampm = h >= 12 ? 'PM' : 'AM';
		const hour12 = ((h + 11) % 12) + 1; // convert 0-23 to 1-12
		return `${hour12}:${m} ${ampm}`;
	};

	// --- Admin status edit UI helpers ---
	const statusOptions = [
		{ label: 'Order placed', progress: 0, key: 'placed' },
		{ label: 'Processing', progress: 1, key: 'processing' },
		{ label: 'Shipped', progress: 2, key: 'shipped' },
		{ label: 'Delivered', progress: 3, key: 'delivered' },
		{ label: 'Cancelled', progress: -1, key: 'cancelled' },
	];

	// Backend allows cancel only from PLACED or PROCESSING.
	const visibleStatusOptions = statusOptions.filter((opt) => !(opt.key === 'cancelled' && orderProgress >= 2));

	const iconForProgress = (p) => {
		if (p === -1) return FiXCircle;
		if (p === 0) return FiCheck;
		if (p === 1) return FiRefreshCw;
		if (p === 2) return FiTruck;
		if (p === 3) return FiCheckCircle;
		return FiCheck;
	};

	const StatusProgressDropdown = ({ value, onChange, options, disabled = false }) => {
		const [open, setOpen] = useState(false);
		const current = options.find((o) => o.progress === value) || options[0];
		const CurrentIcon = iconForProgress(current?.progress);

		return (
			<div className="relative">
				<motion.div animate={open ? 'open' : 'closed'} className="relative">
					<button
						type="button"
						onClick={() => !disabled && setOpen((pv) => !pv)}
						disabled={disabled}
						className="inline-flex items-center justify-between gap-3 h-11 min-w-[180px] px-3 rounded-xl border border-black/10 bg-white text-sm font-semibold text-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50"
						aria-haspopup="listbox"
						aria-expanded={open}
					>
						<span className="inline-flex items-center gap-2">
							{CurrentIcon && <CurrentIcon className="w-4 h-4 text-black/60" />}
							<span>{current?.label || 'Select status'}</span>
						</span>
						<motion.span variants={adminOrderIconVariants}>
							<FiChevronDown className="w-4 h-4 text-black/60" />
						</motion.span>
					</button>

					<motion.ul
						initial={adminOrderWrapperVariants.closed}
						variants={adminOrderWrapperVariants}
						style={{ originY: 'top' }}
						className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-full rounded-xl border border-black/10 bg-white shadow-sm overflow-hidden p-2"
						role="listbox"
						aria-label="Order status"
					>
						{options.map((opt) => {
							const OptIcon = iconForProgress(opt.progress);
							const active = opt.progress === value;
							return (
								<motion.li
									key={opt.progress}
									variants={adminOrderItemVariants}
									role="option"
									aria-selected={active}
									onClick={() => {
										onChange(opt.progress);
										setOpen(false);
									}}
									className={`flex items-center gap-2 w-full p-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer rounded-lg hover:bg-gray-50 hover:text-black ${active ? 'bg-gray-50 text-black' : 'text-slate-700'}`}
								>
									<motion.span variants={adminOrderActionIconVariants} className="text-sm">
										<OptIcon />
									</motion.span>
									<span>{opt.label}</span>
								</motion.li>
							);
						})}
					</motion.ul>
				</motion.div>
			</div>
		);
	};

	const mapProgressToEnum = (p) => {
		switch (p) {
			case -1: return 'CANCELLED';
			case 0: return 'PLACED';
			case 1: return 'PROCESSING';
			case 2: return 'SHIPPED';
			case 3: return 'DELIVERED';
			default: return null;
		}
	};

	const mapEnumToProgress = (s) => {
		if (!s) return 0;
		const str = String(s).toUpperCase();
		if (str === 'CANCELLED') return -1;
		if (str === 'DELIVERED') return 3;
		if (str === 'SHIPPED') return 2;
		if (str === 'PROCESSING') return 1;
		return 0;
	};

	const applyStatusUpdate = async () => {
		if (!order?.id) return;
		try {
			setSaving(true);
			const currentProgress = mapEnumToProgress(order.status);
			if (selectedProgress === -1) {
				await orderApi.updateStatus(order.id, mapProgressToEnum(-1));
			} else {
				for (let p = currentProgress + 1; p <= selectedProgress; p++) {
					const target = mapProgressToEnum(p);
					if (!target) continue;
					await orderApi.updateStatus(order.id, target);
				}
			}
			await reload();
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error('Failed to update order status', e);
		} finally {
			setSaving(false);
		}
	};

	return (
		<>
			<div className="mx-auto w-full max-w-screen-2xl px-5 md:px-25 pt-8">
				<BackBtn onClick={() => navigate(-1)} />
			</div>
			<main className="mx-auto w-full max-w-screen-2xl py-6 px-5 md:px-25 relative">
				<div className="flex items-baseline justify-between mb-8 pb-2 px-0">
					<div className="flex-1">
						<div className="flex flex-col md:flex-row items-start md:items-center gap-0 md:gap-4">
							<div className="flex flex-col">
								<h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-gray-900 inline-flex items-center gap-3">
									<span>Order #{order?.orderNumber ?? order?.id ?? rawKey}</span>
								</h1>
								<a
									href="#"
									className="mt-3 inline-flex w-fit items-center gap-2 rounded-xl px-4 py-2 bg-white border border-black/10 text-sm font-semibold text-gray-900 hover:bg-black hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
								>
									View invoice <FiArrowRight className="inline-block" aria-hidden="true" />
								</a>
							</div>
						</div>
					</div>
					<div className="flex items-baseline gap-4 justify-end">
						<div className="text-md text-gray-500 text-right">
							<div>Order placed <time dateTime={order?.placed}><span className="text-gray-700 font-bold">{order?.placed || '—'}</span></time></div>
							{order?.placedTime && (
								<div className="text-gray-700 font-bold">{formatToAmPm(order.placedTime)}</div>
							)}
						</div>
					</div>
				</div>
				{/* Order-level status (delegated to OrderStatusBar) */}
				<section aria-labelledby="order-status-heading" className="mb-8">
					<OrderStatusBar
						progress={orderProgress}
						statusLabel={statusLabel}
						statusDetail={statusDetail}
						orderStatus={typeof order.status === 'string' ? order.status : String(order.status || '')}
						statusTimes={order.statusTimes}
						headerActions={(
							<div className="flex items-center gap-2">
								<StatusProgressDropdown
									value={selectedProgress}
									onChange={setSelectedProgress}
									options={visibleStatusOptions}
									disabled={saving}
								/>
								<button
									onClick={applyStatusUpdate}
									disabled={saving || (selectedProgress === -1 && orderProgress >= 2)}
									className={`text-sm font-semibold rounded-lg px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${saving ? 'bg-gray-200 text-gray-600 cursor-wait' : (selectedProgress === -1 && orderProgress >= 1 ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'bg-emerald-700 text-white hover:bg-black')}`}
									title={saving ? 'Saving…' : (selectedProgress === -1 && orderProgress >= 2 ? 'Cannot cancel after shipping has started' : 'Update order status')}
								>
									{saving ? 'Updating…' : 'Update'}
								</button>
							</div>
						)}
					/>
				</section>

				{/* Products and customer as separate sections side by side */}
				<div className="grid grid-cols-12 gap-15 mb-12">
					<section aria-labelledby="products-heading" className="col-span-12 md:col-span-6">
						<h2 id="products-heading" className="text-3xl font-semibold mb-6">
							<span className="inline-flex items-center gap-2">
								<FiShoppingBag className="w-6 h-6 text-emerald-700" aria-hidden="true" />
								<span>Products purchased</span>
							</span>
						</h2>
						<div className="rounded-xl border border-black/10 bg-white shadow-sm p-4 flex flex-col gap-4">
							{enrichedProducts.map((product) => (
								<div key={product.id} className="w-full">
									<ProductInOrder
										product={product}
										shippingUpdates={{ email: order?.customerEmail, phone: order?.customerPhone }}
										showStatus={false}
									/>
								</div>
							))}
							{enrichedProducts.length === 0 && (
								<div className="text-sm text-gray-600">No items in this order.</div>
							)}
						</div>
					</section>

					<section aria-labelledby="customer-details-heading" className="col-span-12 md:col-span-6">
						<h2 id="customer-details-heading" className="text-3xl font-semibold mb-6">
							<span className="inline-flex items-center gap-2">
								<FiUser className="w-6 h-6 text-emerald-700" aria-hidden="true" />
								<span>Customer details</span>
							</span>
						</h2>
						<div className="shadow-sm border border-black/10 rounded-xl p-6 relative overflow-hidden bg-gradient-to-r from-emerald-400/20 to-emerald-600/20">
							{/* Avatar (DiceBear Notionist) - seeded per customer */}
							{(order?.address && order.address[0]) && (
								<img
									alt={`Avatar for ${order.address[0]}`}
									src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent([order?.customerFirstName, order?.customerLastName].filter(Boolean).join(' ') || order?.customerEmail || 'Customer')}`}
									className="w-40 h-40 md:w-70 md:h-70 absolute top-6 right-6 rounded-xl border border-black/10 bg-white shadow-sm"
								/>
							)}

							{/* Name + contact first */}
							<div className="text-sm text-gray-900 mb-4 pr-0 md:pr-56">
								<div className="font-semibold text-lg mb-1 text-black">{[order?.customerFirstName, order?.customerLastName].filter(Boolean).join(' ') || order?.customerEmail || 'Customer'}</div>
								<div className="mb-1">Email: <span className="font-medium">{order?.customerEmail || '-'}</span></div>
								<div>Phone: <span className="font-medium">{order?.customerPhone || '-'}</span></div>
							</div>

							{/* Billing address */}
							{order?.billing?.address && (
								<div className="text-sm text-gray-900 mb-4">
									<div className="font-semibold mb-2">Billing address</div>
									<address className="not-italic">
										{order.billing.address.map((line, i) => (
											<div key={`bill-${i}`}>{line}</div>
										))}
									</address>
								</div>
							)}

							{/* Delivery address */}
							<div className="text-sm text-gray-900">
								<div className="font-semibold mb-2 text-black">Delivery address</div>
								<address className="not-italic">
									{(order?.address || []).map((line, i) => (
										<div key={`del-${i}`}>{line}</div>
									))}
									{(!order?.address || order.address.length === 0) && (
										<div>—</div>
									)}
								</address>
							</div>
						</div>
					</section>
				</div>

				{/* Delivery details (order-level) */}
				<section aria-labelledby="delivery-details-heading" className="mb-12">
					<h2 id="delivery-details-heading" className="text-3xl font-semibold mb-4">
						<span className="inline-flex items-center gap-2">
							<FiTruck className="w-6 h-6 text-emerald-700" aria-hidden="true" />
							<span>Delivery details</span>
						</span>
					</h2>
					<div className="bg-white shadow-sm border border-black/10 rounded-xl p-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<h3 className="text-sm font-semibold text-gray-700 mb-2">Delivery address</h3>
								<address className="not-italic text-sm text-gray-700">
									{(order?.address || []).map((line, i) => (
										<div key={i}>{line}</div>
									))}
									{(!order?.address || order.address.length === 0) && (
										<div>—</div>
									)}
								</address>
							</div>
							<div>
								<h3 className="text-sm font-semibold text-gray-700 mb-2">Delivery method</h3>
								<p className="text-sm text-gray-700">{order?.deliveryMethod ?? 'Standard delivery'}</p>
							</div>
						</div>
					</div>
				</section>
				{/* Billing Summary */}
				<section aria-labelledby="billing-summary-heading" className="mb-12">
					<h2 id="billing-summary-heading" className="text-3xl font-semibold mb-6">
						<span className="inline-flex items-center gap-2">
							<FiCreditCard className="w-6 h-6 text-emerald-700" aria-hidden="true" />
							<span>Billing Summary</span>
						</span>
					</h2>
					<BillingSummary billing={order?.billing || { address: [], payment: { type: 'Cash on Delivery', last4: '----' }, summary: { subtotal: 0, shipping: 0, tax: 0, total: 0 } }} />
				</section>
				{/* Back to Top Button */}
				{showTopBtn && (
					<div className="fixed bottom-8 right-6 z-50">
						<BackToTopBtn />
					</div>
				)}
			</main>
		</>
	);
}

export default AdminOrderDetails;

