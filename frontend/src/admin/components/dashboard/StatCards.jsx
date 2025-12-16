import React from "react";
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";


function formatCurrency(n, cur = 'LKR') {
	try {
		return new Intl.NumberFormat('en-LK', {
			style: 'currency',
			currency: cur,
			maximumFractionDigits: 2,
		}).format(Number(n || 0));
	} catch {
		return `${cur} ${Number(n || 0)}`;
	}
}

function formatPct(p) {
	if (p === null || p === undefined || Number.isNaN(Number(p))) return '—';
	return `${Number(p).toFixed(2)}%`;
}

export const StatCards = ({ analytics }) => {
	const cur = analytics?.currency || 'LKR';
	const gross = analytics?.grossRevenue30d;
	const avg = analytics?.averageOrderValue30d;
	const trailing = analytics?.revenueTrailingYear;

	return (
		<>
			<Card
				title={gross?.title || "Gross Revenue"}
				value={formatCurrency(gross?.value, cur)}
				pillText={formatPct(gross?.changePct)}
				trend={gross?.trend || (Number(gross?.changePct || 0) >= 0 ? 'up' : 'down')}
				period={gross?.periodLabel || ''}
			/>
			<Card
				title={avg?.title || "Avg Order"}
				value={formatCurrency(avg?.value, cur)}
				pillText={formatPct(avg?.changePct)}
				trend={avg?.trend || (Number(avg?.changePct || 0) >= 0 ? 'up' : 'down')}
				period={avg?.periodLabel || ''}
			/>
			<Card
				title={trailing?.title || "Trailing Year"}
				value={formatCurrency(trailing?.value, cur)}
				pillText={formatPct(trailing?.changePct)}
				trend={trailing?.trend || (Number(trailing?.changePct || 0) >= 0 ? 'up' : 'down')}
				period={trailing?.periodLabel || "Previous 365 days"}
			/>
		</>
	);
};

const Card = ({
	title,
	value,
	pillText,
	trend,
	period,
}) => {
	return (
		<div className="col-span-4 p-4 rounded-2xl border border-gray-200 bg-white/90 shadow-sm hover:shadow-md transition-shadow">
			<div className="flex mb-8 items-start justify-between">
				<div>
					<h3 className="text-stone-500 mb-2 text-sm">{title}</h3>
					<p className="text-3xl font-semibold">{value}</p>
				</div>

				<span
					className={`text-xs flex items-center gap-1 font-medium px-2 py-1 rounded-full ${
						trend === "up"
							? "bg-green-100 text-green-700"
							: "bg-red-100 text-red-700"
					}`}
				>
					{trend === "up" ? <FiTrendingUp /> : <FiTrendingDown />} {pillText}
				</span>
			</div>

			<p className="text-xs text-stone-500">{period}</p>
		</div>
	);
};
