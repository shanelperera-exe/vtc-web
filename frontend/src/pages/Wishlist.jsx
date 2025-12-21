import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Navbar from '../components/layout/Navbar';
import ProductCard from '../components/products/ProductCard';
import * as wishlist from '../utils/wishlist';
import { getProductDetails, getProduct } from '../api/productApi';
import { useNotifications } from '../components/ui/notificationsContext';

const Wishlist = () => {
	const [items, setItems] = useState(() => wishlist.list());
	const [loading, setLoading] = useState(false);
	const [details, setDetails] = useState(() => new Map()); // key -> product detail
	const notifier = useNotifications();

	// Subscribe to changes from other tabs or components
	useEffect(() => {
		const unsub = wishlist.subscribe(setItems);
		// On mount, ensure state reflects storage
		setItems(wishlist.list());
		return () => { unsub?.(); };
	}, []);

	const count = items.length;

	// Fetch full product details for items in wishlist (once per unique id)
	useEffect(() => {
		let cancelled = false;
		const run = async () => {
			const missing = [];
			const current = new Map(details);
			for (const it of items) {
				const key = String(it.id ?? it.sku ?? '');
				if (!key) continue;
				if (!current.has(key)) missing.push({ key, it });
			}
			if (missing.length === 0) return;
			setLoading(true);
			for (const { key, it } of missing) {
				if (cancelled) break;
				const idNum = Number(it.id);
				try {
					let p = null;
					if (!Number.isNaN(idNum) && idNum > 0) {
						try { p = await getProductDetails(idNum); } catch (_e) { p = await getProduct(idNum); }
					}
					// If id lookup fails but we have sku, try search by sku endpoint via productDetails fallback
					if (!p && it.sku) {
						// As a fallback we can only render basic item if no numeric id; skip extra fetch here
						p = null;
					}
					const enriched = normalizeForCard(it, p);
					current.set(key, enriched);
					if (!cancelled) setDetails(new Map(current));
				} catch {
					const enriched = normalizeForCard(it, null);
					current.set(key, enriched);
					if (!cancelled) setDetails(new Map(current));
				}
			}
			if (!cancelled) setLoading(false);
		};
		run();
		return () => { cancelled = true; };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [items]);

	const normalizeForCard = (saved, p) => {
		const product = p || {};
		const name = product.name ?? saved.name;
		const description = product.shortDescription || product.description || '';
		const image = product.primaryImageUrl || product.mainImageUrl || product.primaryImage || saved.image || (Array.isArray(product.imageUrls) ? product.imageUrls[0] : '');
		const price = Number(product.basePrice ?? product.price ?? saved.price ?? 0) || 0;
		const category = product.categoryName || product.category || '';
		const rating = Number(product.rating ?? 0) || 0;
		const numOfReviews = Number(product.numOfReviews ?? 0) || 0;
		const id = product.id ?? saved.id;
		const sku = product.sku ?? saved.sku;
		return { id, sku, name, description, image, price, category, rating, numOfReviews };
	};

	const onWishlistToggle = useCallback((product, next) => {
		if (next) {
			setItems(wishlist.add(product));
			notifier?.notify?.({ type: 'success', text: `Added ${product?.name || 'item'} to wishlist` });
		} else {
			// The button already removed from storage (and attempted backend sync).
			// Here, just optimistically update local UI without issuing another remove call.
			setItems((prev) => {
				const key = String(product?.id ?? product?.sku ?? '');
				return prev.filter((p) => String(p?.id ?? p?.sku ?? '') !== key);
			});
		}
	}, [notifier]);

	const gridItems = useMemo(() => {
		if (details.size === 0) {
			// basic fallback while details load
			return items.map((p) => ({ id: p.id, sku: p.sku, name: p.name, image: p.image, price: p.price, description: '', category: '' }));
		}
		return items.map((p) => {
			const key = String(p.id ?? p.sku ?? '');
			return details.get(key) || { id: p.id, sku: p.sku, name: p.name, image: p.image, price: p.price, description: '', category: '' };
		});
	}, [items, details]);

	return (
		<div className="bg-white min-h-screen">
			<Navbar />

			{/* Header */}
			<div className="pt-6">
				<nav aria-label="Breadcrumb">
					<ol role="list" className="flex max-w-2xl items-center space-x-2 pl-4 sm:pl-8 lg:max-w-7xl lg:pl-14">
						<li>
							<div className="flex items-center leading-none whitespace-nowrap">
								<a href="/" className="mr-2 text-sm font-medium text-gray-900">
									<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="inline-block mr-1 align-text-bottom" width="20" height="20">
										<path d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" fillRule="evenodd"></path>
									</svg>
									Home
								</a>
								<svg fill="currentColor" width={16} height={20} viewBox="0 0 16 20" aria-hidden="true" className="h-5 w-4 text-gray-300">
									<path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
								</svg>
								<a href="/wishlist" aria-current="page" className="text-sm text-gray-500 hover:text-gray-600 font-medium">
									Wishlist
								</a>
							</div>
						</li>
					</ol>
				</nav>
			</div>

			{/* Title and count */}
			<div className="flex flex-col justify-center text-left gap-1 px-14 mt-8">
				<h2 className="font-semibold tracking-tight leading-tight text-black text-4xl md:text-5xl lg:text-6xl m-0">
					Wishlist
				</h2>
				<div className="text-md font-medium text-gray-600 mt-0 ml-1">
					{count} item{count === 1 ? '' : 's'} saved
				</div>
				<hr className="mt-2 text-gray-300" />
			</div>

			{/* Empty state */}
			{count === 0 && (
				<div className="px-14 py-16">
					<div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-white shadow-sm">
						<h3 className="text-xl font-semibold text-gray-800">Your wishlist is empty</h3>
						<p className="text-gray-600 mt-2">Browse products and tap the heart to save items here.</p>
						<div className="mt-6">
							<a href="/" className="inline-block border-2 border-black px-4 py-2 font-semibold hover:bg-black hover:text-white transition-colors">Continue shopping</a>
						</div>
					</div>
				</div>
			)}

			{/* Grid */}
			{count > 0 && (
				<div className="mt-10 px-14">
					<div className="">
						<div className="flex flex-wrap gap-8 justify-start px-2">
							{gridItems.map((product) => (
								<ProductCard
									key={product.sku || product.id}
									id={product.id}
									sku={product.sku}
									name={product.name}
									description={product.description}
									image={product.image}
									price={product.price}
									category={product.category}
									rating={product.rating}
									numOfReviews={product.numOfReviews}
									isWishlisted={true}
									onWishlistToggle={onWishlistToggle}
								/>
							))}
						</div>
					</div>
					{loading && (
						<div className="px-12 pt-2 pb-8 text-sm text-gray-500">Loading product details…</div>
					)}
				</div>
			)}
		</div>
	);
};

export default Wishlist;

