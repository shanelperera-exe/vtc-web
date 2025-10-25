import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import Navbar from '../components/layout/Navbar';
import ProductFilterSection from '../components/products/ProductFilterSection';
import { useProducts } from '../api/hooks/useProducts';
import { useCategories } from '../api/hooks/useCategories';
import { slugifyCategory, deslugifyCategory } from '../utils/slugify';

const ProductsByCategory = () => {
	const { category } = useParams();
	const { data: categories } = useCategories({ size: 200 });

	// Pagination state (match admin style)
	const [page, setPage] = useState(1); // 1-based for UI
	const [pageSize, setPageSize] = useState(12);
	// Filters need to be declared before any usage below to avoid TDZ errors
	const [filterState, setFilterState] = useState({
		availability: { inStock: false, outOfStock: false },
		priceRange: [0, 9500],
		sortBy: 'Manual',
	});
	const handleFilterChange = (filters) => setFilterState(filters);
	const slugToId = useMemo(() => {
		const map = new Map();
		(categories||[]).forEach(c => {
			const slug = slugifyCategory(c.name || '');
			map.set(slug, c.id);
		});
		return map;
	}, [categories]);
	const categoryId = slugToId.get((category||'').toLowerCase());
	// Reset to first page when category changes
	useEffect(() => { setPage(1); }, [categoryId]);
	// Map sidebar sort to backend sort param
	const sortToBackend = (val) => {
		switch(val) {
			case 'Price: Low-High': return 'basePrice,asc';
			case 'Price: High-Low': return 'basePrice,desc';
			default: return undefined;
		}
	};
	// Map availability (mutually exclusive) to backend stock filter
	const stockToBackend = (availability) => {
		const { inStock, outOfStock } = availability || {};
		if (inStock && !outOfStock) return 'in';
		if (outOfStock && !inStock) return 'out';
		return undefined;
	};

	const {
		data: products,
		page: pageMeta,
		loading,
		error,
		reload
	} = useProducts({
		page: page - 1,
		size: pageSize,
		categoryId,
		sort: sortToBackend(filterState.sortBy),
		stock: stockToBackend(filterState.availability),
		status: 'ACTIVE',
	});
	// Helper to convert string to title case
	const toTitleCase = (str) => deslugifyCategory(str);

	const breadcrumbs = [
		{ id: 1, name: 'Home', href: '/' },
		{ id: 2, name: 'Categories', href: '/categories' },
		{ id: 3, name: category ? toTitleCase(category) : 'Category', href: `/category/${category}` },
	];



	const filteredProducts = useMemo(() => {
		return (products||[]).filter(p => {
			const price = Number(p.basePrice || p.price || 0);
			if (price < filterState.priceRange[0] || price > filterState.priceRange[1]) return false;
			return true;
		});
	}, [products, filterState.priceRange]);

	// Sorting handled server-side; keep current order
	const sortedProducts = filteredProducts;

	const totalElements = Number(pageMeta?.totalElements || 0);
	const totalPages = Math.max(1, Number(pageMeta?.totalPages || 1));
	const showingFrom = totalElements === 0 ? 0 : ((page - 1) * pageSize + 1);
	const showingTo = Math.min(page * pageSize, Math.max(totalElements, products?.length || 0));

	return (
		<div className="bg-white">
			<Navbar />
			
			{/* Breadcrumbs */}
			<div className="pt-6">
				<nav aria-label="Breadcrumb">
					<ol role="list" className="flex max-w-2xl items-center space-x-2 pl-4 sm:pl-8 lg:max-w-7xl lg:pl-14">
						{breadcrumbs.map((breadcrumb, idx) => (
							<li key={breadcrumb.id}>
								<div className="flex items-center leading-none whitespace-nowrap">
											{idx < breadcrumbs.length - 1 ? (
												<a href={breadcrumb.href} className="mr-2 text-sm font-medium text-gray-900">
													{idx === 0 && (
														<svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon" aria-hidden="true" className="inline-block mr-1 align-text-bottom" width="20" height="20">
                                                            <path d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clip-rule="evenodd" fill-rule="evenodd"></path>
                                                        </svg>
													)}
													{breadcrumb.name}
												</a>
									) : (
										<a href={breadcrumb.href} aria-current="page" className="text-sm text-gray-500 hover:text-gray-600 font-medium">
											{breadcrumb.name}
										</a>
									)}
									{idx < breadcrumbs.length - 1 && (
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
									)}
								</div>
							</li>
						))}
					</ol>
				</nav>
			</div>
			
			<div>
				{/* Category Name */}
				<div className="flex flex-col justify-center text-left gap-1 px-14 mt-8">
					<h2 className="font-extrabold uppercase tracking-tight leading-tight text-[#1e2a38] text-4xl md:text-5xl lg:text-6xl m-0" style={{ fontFamily: "Jost, sans-serif" }}>
						{category ? category.replace(/-/g, ' ').toUpperCase() : 'CATEGORY'}
					</h2>

					{/* Product count */}
					<div className="text-md font-medium text-gray-600 mt-0 ml-1">
						{totalElements} product{totalElements === 1 ? '' : 's'} found
					</div>
					<hr className='mt-2 text-gray-300'/>
				</div>
				{/* Filter and sort sidebar + Products grid */}
				<div className="mt-10 flex flex-row gap-8 px-14">
					{/* Sidebar replaced with ProductFilterSection */}
					<ProductFilterSection onFilterChange={handleFilterChange} />
					{/* Product grid */}
					<div className="flex-1 flex flex-wrap gap-8 justify-start px-12">
						{loading && <div className="text-sm text-gray-500 py-8">Loading products…</div>}
						{!loading && sortedProducts.map(product => (
							<ProductCard
								key={product.id}
								id={product.id}
								sku={product.sku}
								name={product.name}
								description={product.shortDescription || product.description}
								image={(product.primaryImageUrl || (product.imageUrls && product.imageUrls[0]))}
								price={product.basePrice || product.price || 0}
								category={product.categoryName || product.category}
								rating={product.rating}
								numOfReviews={product.numOfReviews}
							/>
						))}
					</div>
				</div>

				{/* Pagination controls (mirroring admin style) */}
				<div className="mt-10 px-14 flex flex-col sm:flex-row items-center justify-between gap-3">
					<div className="flex items-center gap-2 text-sm">
						<span>Rows per page</span>
						<select
							value={pageSize}
							onChange={(e) => { setPageSize(parseInt(e.target.value)); setPage(1); }}
							className="border-2 border-black px-2 py-1 bg-white"
						>
							{[8, 12, 24].map((s) => (
								<option key={s} value={s}>{s}</option>
							))}
						</select>
						<span className="text-gray-600">Showing {showingFrom}-{showingTo} of {totalElements}</span>
					</div>
					<div className="inline-flex border-2 border-black">
						<button
							className="px-3 py-2 bg-white hover:bg-[#23f47d]"
							onClick={() => setPage(p => Math.max(1, p - 1))}
							disabled={page <= 1}
						>
							Prev
						</button>
						<div className="px-3 py-2 bg-black text-green-400 text-sm">{page} / {totalPages}</div>
						<button
							className="px-3 py-2 bg-white hover:bg-[#23f47d]"
							onClick={() => setPage(p => Math.min(totalPages, p + 1))}
							disabled={page >= totalPages}
						>
							Next
						</button>
					</div>
				</div>
			</div>

		</div>
	);
};

export default ProductsByCategory;
