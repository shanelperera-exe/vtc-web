import React from 'react';
import {
	ResponsiveContainer,
	LineChart,
	Line,
} from 'recharts';

function TrendPill({ trend, changePct }) {
	const isUp = trend === 'up' || (typeof changePct === 'number' && changePct > 0);
	const isDown = trend === 'down' || (typeof changePct === 'number' && changePct < 0);
	const cls = isUp
		? 'bg-green-50 text-green-700 ring-1 ring-green-200'
		: isDown
			? 'bg-red-50 text-red-700 ring-1 ring-red-200'
			: 'bg-gray-50 text-gray-700 ring-1 ring-gray-200';

	return (
		<span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
			{typeof changePct === 'number' ? `${changePct > 0 ? '+' : ''}${changePct.toFixed(2)}%` : '—'}
		</span>
	);
}

/**
 * KPI card with optional sparkline.
 * Accent color is intentionally configurable to avoid making everything green.
 */
export default function KpiCard({
	icon,
	label,
	value,
	changePct,
	trend,
	accent = 'green',
	sparkline,
	sparklineKey,
}) {
	const accentMap = {
		green: 'border-t-green-500',
		blue: 'border-t-blue-500',
		purple: 'border-t-purple-500',
		amber: 'border-t-amber-500',
		teal: 'border-t-teal-500',
		red: 'border-t-red-500',
		indigo: 'border-t-indigo-500',
	};
	const border = accentMap[accent] || accentMap.green;

	const sparkTextMap = {
		green: 'text-green-500',
		blue: 'text-blue-500',
		purple: 'text-purple-500',
		amber: 'text-amber-500',
		teal: 'text-teal-500',
		red: 'text-red-500',
		indigo: 'text-indigo-500',
	};
	const sparkText = sparkTextMap[accent] || sparkTextMap.green;

	return (
		<div className={`rounded-2xl border border-gray-200 bg-white shadow-sm border-t-4 ${border}`}>
			<div className="p-4">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<div className="flex items-center gap-2">
							<div className="text-lg text-gray-900">{icon}</div>
							<div className="text-xs font-semibold text-gray-600">{label}</div>
						</div>
						<div className="mt-2 text-2xl font-semibold text-gray-900 truncate">
							{value}
						</div>
					</div>
					<div className="shrink-0">
						<TrendPill trend={trend} changePct={changePct} />
					</div>
				</div>

				{Array.isArray(sparkline) && sparkline.length > 1 && sparklineKey ? (
					<div className={`mt-3 h-10 ${sparkText}`}>
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={sparkline}>
								<Line
									type="monotone"
									dataKey={sparklineKey}
									stroke="currentColor"
									strokeWidth={2}
									dot={false}
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				) : null}
			</div>
		</div>
	);
}
