import React from "react";
import CategoryTile from "./CategoryTile";

export default function CategoryGrid({ data = [], onEdit, onDelete }) {
	if (!Array.isArray(data)) data = [];

	if (data.length === 0) {
		return (
			<div className="mt-4 border-2 border-neutral-300 p-6 text-center">
				<p className="text-gray-700">No categories found.</p>
			</div>
		);
	}

		return (
				<section className="rounded-none w-full">
					{/* remove horizontal padding so the grid lines up with page UI (search bar) */}
					<div className="w-full">
					<div className="w-full grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-4">
					{data.map((cat) => (
						<CategoryTile key={cat.id} cat={cat} onEdit={onEdit} onDelete={onDelete} />
					))}
				</div>
			</div>
		</section>
	);
}

