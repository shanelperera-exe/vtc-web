import React, { useState } from 'react';
import Checkbox from '../ui/Checkbox';
import Slider from '../ui/Slider';

const ProductFilterSection = ({ onFilterChange }) => {
	// State for collapsible sections
	const [openSections, setOpenSections] = useState({
		availability: true,
		price: true,
		sort: true,
	});
	// State for filters
	const [availability, setAvailability] = useState({
		inStock: false,
		outOfStock: false,
	});
	const [priceRange, setPriceRange] = useState([0, 9500]);
	const [sortBy, setSortBy] = useState('Manual');

	// Helper: check if any filter is active
	const isAnyFilterActive = () => {
		return (
			availability.inStock ||
			availability.outOfStock ||
			priceRange[0] > 0 ||
			priceRange[1] < 9500 ||
			sortBy !== 'Manual'
		);
	};

	// Remove individual filter
	const removeFilter = (filter) => {
		if (filter === 'inStock') setAvailability(a => ({ ...a, inStock: false }));
		if (filter === 'outOfStock') setAvailability(a => ({ ...a, outOfStock: false }));
		if (filter === 'price') setPriceRange([0, 9500]);
		if (filter === 'sort') setSortBy('Manual');
	};

	// Reset all filters
	const resetFilters = () => {
		setAvailability({ inStock: false, outOfStock: false });
		setPriceRange([0, 9500]);
		setSortBy('Manual');
	};

	// Toggle section open/close
	const toggleSection = section => {
		setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
	};

	// Effect to notify parent of filter changes
	React.useEffect(() => {
		if (onFilterChange) {
			onFilterChange({ availability, priceRange, sortBy });
		}
	}, [availability, priceRange, sortBy, onFilterChange]);

	return (
		<div className="space-y-4 sticky top-[100px] min-w-[260px] max-w-[320px] h-fit">
			{/* Active Filters Section */}
			{isAnyFilterActive() && (
				<div style={{padding: '0px 0px', borderTop: '1px solid var(--text-color)'}}>
					<div className="flex justify-between mb-2">
						<div>Active Filters</div>
						<div style={{fontSize: '14px', cursor: 'pointer', textDecoration: 'underline'}} onClick={resetFilters}>Reset</div>
					</div>
					<div className="flex items-center flex-wrap gap-1">
						{availability.inStock && (
							<div className="flex gap-x-1 items-center text-xs" style={{cursor: 'pointer', borderRadius: 'var(--button-border-radius)', padding: '4px 10px', color: 'rgb(0,0,0)', flexShrink: 0, marginRight: '8px', backgroundColor: 'white', border: '1px solid black'}}>
								<span>In stock</span>
								<svg onClick={() => removeFilter('inStock')} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 22 24" strokeWidth="1.5" stroke="#000" fill="none" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
							</div>
						)}
						{availability.outOfStock && (
							<div className="flex gap-x-1 items-center text-xs" style={{cursor: 'pointer', borderRadius: 'var(--button-border-radius)', padding: '4px 10px', color: 'rgb(0,0,0)', flexShrink: 0, marginRight: '8px', backgroundColor: 'white', border: '1px solid black'}}>
								<span>Out of stock</span>
								<svg onClick={() => removeFilter('outOfStock')} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 22 24" strokeWidth="1.5" stroke="#000" fill="none" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
							</div>
						)}
						{(priceRange[0] > 0 || priceRange[1] < 9500) && (
							<div className="flex gap-x-1 items-center text-xs" style={{cursor: 'pointer', borderRadius: 'var(--button-border-radius)', padding: '4px 10px', color: 'rgb(0,0,0)', flexShrink: 0, marginRight: '8px', backgroundColor: 'white', border: '1px solid black'}}>
								<span>Price: LKR {priceRange[0]} - {priceRange[1]}</span>
								<svg onClick={() => removeFilter('price')} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 22 24" strokeWidth="1.5" stroke="#000" fill="none" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
							</div>
						)}
						{sortBy !== 'Manual' && (
							<div className="flex gap-x-1 items-center text-xs" style={{cursor: 'pointer', borderRadius: 'var(--button-border-radius)', padding: '4px 10px', color: 'rgb(0,0,0)', flexShrink: 0, marginRight: '8px', backgroundColor: 'white', border: '1px solid black'}}>
								<span>Sort: {sortBy}</span>
								<svg onClick={() => removeFilter('sort')} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 22 24" strokeWidth="1.5" stroke="#000" fill="none" strokeLinecap="round" strokeLinejoin="round" className="icon icon-tabler icon-tabler-x"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
							</div>
						)}
					</div>
				</div>
			)}
			<form className="collection-filters flex flex-col -mt-3">
				{/* Availability filter */}
				<div className="flex flex-col">
					<div className="relative">
						<div
							className="flex items-center justify-between cursor-pointer py-2 font-semibold w-full border-b border-gray-300 capitalize"
							onClick={() => toggleSection('availability')}
						>
							<div className="flex gap-x-1 items-center text-[16px]">Availability</div>
							<div className="z-10">
								<span className={`block transition-transform ${openSections.availability ? '' : 'rotate-180'}`}><svg fill="currentColor" width="24" height="24" viewBox="0 0 466 1000"><path d="M405 380c14.667-17.333 30.667-17.333 48 0 17.333 14.667 17.333 30.667 0 48L257 620c-14.667 14.667-30.667 14.667-48 0L13 428c-17.333-17.333-17.333-33.333 0-48 16-16 32.667-16 50 0l170 156 172-156"></path></svg></span>
							</div>
						</div>
						<div
							className={`transition-all duration-300 ease-in-out ${openSections.availability ? 'max-h-40 opacity-100 pt-2' : 'max-h-0 opacity-0 pt-0'}`}
						>
							<div className="flex flex-col gap-2">
								<label className="flex items-center gap-2 cursor-pointer text-sm">
									<Checkbox
										checked={availability.inStock}
										onChange={e => setAvailability(avail => ({ ...avail, inStock: e.target.checked }))}
									/>
									<div className="flex items-center text-xs md:text-sm">
										<span className="capitalize font-normal min-w-[75px] text-gray-700">In stock</span>
										<span className="text-xs ml-1 text-gray-400"></span>
									</div>
								</label>
								<label className="flex items-center gap-2 cursor-pointer text-sm">
									<Checkbox
										checked={availability.outOfStock}
										onChange={e => setAvailability(avail => ({ ...avail, outOfStock: e.target.checked }))}
									/>
									<div className="flex items-center text-xs md:text-sm">
										<span className="capitalize font-normal min-w-[75px] text-gray-700">Out of stock</span>
										<span className="text-xs ml-1 text-gray-400"></span>
									</div>
								</label>
							</div>
						</div>
					</div>
				</div>
				{/* Price filter */}
				<div className="flex flex-col mt-4 ">
					<div className="relative">
						<div
							className="flex items-center justify-between cursor-pointer py-2 font-semibold w-full border-b border-gray-300 capitalize"
							onClick={() => toggleSection('price')}
						>
							<div className="flex gap-x-1 items-center text-[16px]">Price</div>
							<div className="z-10">
								<span className={`block transition-transform ${openSections.price ? '' : 'rotate-180'}`}><svg fill="currentColor" width="24" height="24" viewBox="0 0 466 1000"><path d="M405 380c14.667-17.333 30.667-17.333 48 0 17.333 14.667 17.333 30.667 0 48L257 620c-14.667 14.667-30.667 14.667-48 0L13 428c-17.333-17.333-17.333-33.333 0-48 16-16 32.667-16 50 0l170 156 172-156"></path></svg></span>
							</div>
						</div>
						<div
							className={`transition-all duration-300 ease-in-out ${openSections.price ? 'max-h-96 opacity-100 pt-2' : 'max-h-0 opacity-0 pt-0'}`}
						>
							<Slider
								min={0}
								max={9500}
								step={100}
								currency="LKR"
								initialMin={priceRange[0]}
								initialMax={priceRange[1]}
								onApply={({ minValue, maxValue }) => setPriceRange([minValue, maxValue])}
							/>
						</div>
					</div>
				</div>

				{/* Sort by */}
				<div className="flex flex-col mt-4">
					<div className="relative">
						<div
							className="flex items-center justify-between cursor-pointer py-2 font-semibold w-full border-b border-gray-300"
							onClick={() => toggleSection('sort')}
						>
							<div className="flex gap-x-1 capitalize text-[16px]">
								<span>Sort by:</span>
								<span>{sortBy}</span>
							</div>
							<div className="z-10">
								<span className={`block transition-transform ${openSections.sort ? '' : 'rotate-180'}`}><svg fill="currentColor" width="24" height="24" viewBox="0 0 466 1000"><path d="M405 380c14.667-17.333 30.667-17.333 48 0 17.333 14.667 17.333 30.667 0 48L257 620c-14.667 14.667-30.667 14.667-48 0L13 428c-17.333-17.333-17.333-33.333 0-48 16-16 32.667-16 50 0l170 156 172-156"></path></svg></span>
							</div>
						</div>
						<div
							className={`transition-all duration-300 ease-in-out overflow-hidden ${openSections.sort ? 'max-h-40 opacity-100 pt-2' : 'max-h-0 opacity-0 pt-0'}`}
						>
							<div className="flex flex-col gap-0.1">
								{['Manual', 'Best Selling', 'Price: Low-High', 'Price: High-Low', 'Date, new to old'].map(sort => (
									<label key={sort} className="flex items-center gap-2 cursor-pointer text-sm">
										<input
											type="radio"
											className="hidden"
											name="sort_by"
											checked={sortBy === sort}
											onChange={() => setSortBy(sort)}
										/>
										<span className={`inline-block px-2 py-1 capitalize text-gray-700 ${sortBy === sort ? 'bg-gray-200' : ''}`}>{sort}</span>
									</label>
								))}
							</div>
						</div>
					</div>
				</div>
			</form>
		</div>
	);
};

export default ProductFilterSection;
