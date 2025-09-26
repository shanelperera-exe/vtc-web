import React from "react";
import assets from "../../assets/assets";

const categories = [
	{
		name: "Cleaning Items",
		img: assets.catImgs.cleaning,
		alt: "Cleaning Items",
	},
    {
		name: "Kitchen Utensils",
		img: assets.catImgs.kitchen,
		alt: "Kitchen Items",
	},
    {
		name: "Plastic items",
		img: assets.catImgs.plastic,
		alt: "Plastic Items",
	},
];

const ShopByCategory = () => {
	return (
		<section
			className="bg-white mt-6 p-6"
			aria-labelledby="shop-by-category-title"
		>
			<h2
				id="shop-by-category-title"
				className="text-2xl font-bold text-gray-800 mb-4"
			>
				Shop by Category
			</h2>
			<div className="flex flex-wrap justify-center gap-10">
				{categories.map((cat) => (
					<div key={cat.name} className="flex flex-col items-center">
						<div className="relative flex items-center justify-center mb-2">
							<span className="absolute w-24 h-24 md:w-36 md:h-36 rounded-full bg-green-100 md:bg-green-200" style={{zIndex: 0}}></span>
							<img
								src={cat.img}
								alt={cat.alt}
								className="w-24 h-24 md:w-36 md:h-36 object-contain transition-transform duration-300 ease-in-out hover:scale-110 hover:-translate-y-1 relative z-10"
							/>
						</div>
						<div className="text-[#1d794c] font-semibold text-lg mb-4 text-center w-32 md:w-44">
							{cat.name}
						</div>
					</div>
				))}
			</div>
		</section>
	);
};

export default ShopByCategory;
