import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function formatPct(p) {
	if (p === null || p === undefined || Number.isNaN(Number(p))) return '—';
	return `${Number(p).toFixed(2)}%`;
}

export default function TrendingProductCard({ analytics }) {
	const navigate = useNavigate();
	const t = analytics?.trendingProduct30d;

	return (
		<div
			className="col-span-12 md:col-span-6 w-full rounded-2xl p-4 border border-gray-200 bg-white/90 shadow-sm"
		>
			<div
				className="relative h-36 md:h-40 w-full overflow-hidden rounded-2xl shadow-sm bg-gray-100"
			>
				{t?.imageUrl ? (
					<img
						src={t.imageUrl}
						alt={t?.productName || 'Trending product'}
						className="h-full w-full object-cover object-top"
					/>
				) : null}
				<span className="absolute left-0 top-0 block rounded-br-2xl px-2 py-1.5 text-xs font-semibold uppercase bg-rose-600 text-white">
					Trending
				</span>
			</div>

			<div className="mt-4 flex flex-col gap-4">
				<div>
					<h3 className="mb-2 flex items-center gap-1 text-xl font-semibold text-stone-500">
						<span className="font-normal">{t?.categoryName || 'Category'}</span>
						<FiChevronRight className="opacity-70" />
						<span className="text-gray-900">{t?.productName || 'Top product'}</span>
					</h3>
					<p className="text-gray-600">
						{t
							? (
								<>
									This product has seen a <span className="font-semibold">{formatPct(t.growthMoMPct)}</span> growth since last month,
									paired with a <span className="font-semibold">{formatPct(t.growthYoYPct)}</span> growth year over year.
									Click below to learn more about how your efforts have been impacting your business.
								</>
							)
							: (
								'No trending product data yet.'
							)}
					</p>
				</div>

				<button
					className="mt-auto block w-full rounded-3xl px-4 py-2 font-semibold uppercase bg-emerald-700 hover:bg-black text-white"
					onClick={() => {
						if (!t?.sku) return;
						navigate(`/admin/products/${encodeURIComponent(t.sku)}/stats`);
					}}
					disabled={!t?.sku}
				>
					Product Insights
				</button>
			</div>
		</div>
	);
}
