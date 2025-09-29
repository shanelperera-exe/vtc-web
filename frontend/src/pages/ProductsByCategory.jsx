import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { products } from '../assets/data';
import ProductCard from '../components/products/ProductCard';
import Navbar from '../components/layout/Navbar';
import ProductFilterSection from '../components/products/ProductFilterSection';

const ProductsByCategory = () => {
	const { category } = useParams();
	// Helper to convert string to title case
	const toTitleCase = (str) =>
	  str.replace(/-/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase())
		.replace(/\s+/g, ' ');

	const breadcrumbs = [
		{ id: 1, name: 'Home', href: '/' },
		{ id: 2, name: 'Categories', href: '/categories' },
		{ id: 3, name: category ? toTitleCase(category) : 'Category', href: `/category/${category}` },
	];

    // Filter state managed here, passed to ProductFilterSection
    const [filterState, setFilterState] = useState({
        availability: { inStock: false, outOfStock: false },
        priceRange: [0, 9500],
        sortBy: 'Manual',
    });

    // Handler for filter changes from ProductFilterSection
    const handleFilterChange = (filters) => {
        setFilterState(filters);
    };

    // Filter products by category and filterState
    const isProductInStockByVariants = (product) => {
        // If product has a simple string availability
        if (typeof product.availability === 'string') {
            return product.availability.toLowerCase() === 'in stock';
        }
        // If product has nested availability by color/size
        if (product.availability && typeof product.availability === 'object') {
            for (const color of Object.keys(product.availability)) {
                const sizes = product.availability[color];
                for (const size of Object.keys(sizes)) {
                    if (String(sizes[size]).toLowerCase() === 'in stock') return true;
                }
            }
            return false;
        }
        // Fallback: treat as out of stock
        return false;
    };

    const isProductOutOfStockByVariants = (product) => {
        // Only true if all variants (if any) are out of stock OR explicit string 'out of stock'
        if (typeof product.availability === 'string') {
            return product.availability.toLowerCase() === 'out of stock';
        }
        if (product.availability && typeof product.availability === 'object') {
            let foundAny = false;
            for (const color of Object.keys(product.availability)) {
                const sizes = product.availability[color];
                for (const size of Object.keys(sizes)) {
                    foundAny = true;
                    if (String(sizes[size]).toLowerCase() === 'in stock') return false;
                }
            }
            // If there were variants and none were in stock, it's out of stock
            return foundAny;
        }
        return true;
    };

    const filteredProducts = products
        .filter(product => product.category && product.category.toLowerCase().replace(/ /g, '-') === (category || '').toLowerCase())
        .filter(product => {
            const { inStock, outOfStock } = filterState.availability;
            // If both selected, don't filter by availability
            if (inStock && outOfStock) {
                // continue
            } else if (inStock) {
                if (!isProductInStockByVariants(product)) return false;
            } else if (outOfStock) {
                if (!isProductOutOfStockByVariants(product)) return false;
            }
            // Price filter
            if (product.price < filterState.priceRange[0] || product.price > filterState.priceRange[1]) return false;
            return true;
        });

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (filterState.sortBy) {
            case 'Price: Low-High':
                return a.price - b.price;
            case 'Price: High-Low':
                return b.price - a.price;
            case 'Date, new to old':
                return new Date(b.date) - new Date(a.date);
            case 'Manual':
            case 'Best Selling':
            default:
                return 0;
        }
    });

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
                        {sortedProducts.length} product{sortedProducts.length === 1 ? '' : 's'} found
                    </div>
                    <hr className='mt-2 text-gray-300'/>
                </div>
                {/* Filter and sort sidebar + Products grid */}
                <div className="mt-10 flex flex-row gap-8 px-14">
                    {/* Sidebar replaced with ProductFilterSection */}
                    <ProductFilterSection onFilterChange={handleFilterChange} />
                    {/* Product grid */}
                    <div className="flex-1 flex flex-wrap gap-8 justify-start px-12">
                        {sortedProducts.map(product => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </div>
            </div>

		</div>
	);
};

export default ProductsByCategory;
