import React from 'react';
import {
	ResponsiveContainer,
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	AreaChart,
	Area,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	ComposedChart,
	Treemap,
} from 'recharts';
import {
	FiDollarSign,
	FiTrendingUp,
	FiShoppingCart,
	FiPercent,
	FiBarChart2,
	FiGrid,
	FiLayers,
	FiInfo,
} from 'react-icons/fi';

import { getAdminSalesAnalytics } from '../../api/adminAnalyticsApi';
import SectionHeader from '../components/analytics/SectionHeader';
import ChartCard from '../components/analytics/ChartCard';
import KpiCard from '../components/analytics/KpiCard';
import {
	formatCurrencyLKR,
	formatCompactNumber,
	formatDayLabel,
} from '../components/analytics/formatters';

const RANGE_OPTIONS = [
	{ label: '7D', days: 7 },
	{ label: '30D', days: 30 },
	{ label: '90D', days: 90 },
];

export default function SalesAnalyticsSalesOnly() {
	const [days, setDays] = React.useState(30);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState(null);
	const [data, setData] = React.useState(null);

	React.useEffect(() => {
		let ignore = false;
		async function load() {
			setLoading(true);
			setError(null);
			try {
				const res = await getAdminSalesAnalytics({ days });
				if (!ignore) setData(res);
			} catch (e) {
				if (!ignore) setError(e?.message || 'Failed to load analytics');
			} finally {
				if (!ignore) setLoading(false);
			}
		}
		load();
		return () => {
			ignore = true;
		};
	}, [days]);

	const currency = data?.currency || 'LKR';
	const daily = data?.daily || [];
	const topProducts = data?.topProducts || [];
	const worstProducts = data?.worstProducts || [];
	const categories = data?.categories || [];
	const contributions = data?.productContributions || [];

	const dailyWithLabels = daily.map((p) => ({
		...p,
		dayLabel: formatDayLabel(p?.date),
		orders: Number(p?.orders || 0),	
		revenue: Number(p?.revenue || 0),
		aov: Number(p?.aov || 0),
		discounts: Number(p?.discounts || 0),
		onlineRevenue: Number(p?.onlineRevenue || 0),
		posRevenue: Number(p?.posRevenue || 0),
	}));

	const hasDaily = Array.isArray(dailyWithLabels) && dailyWithLabels.length > 0;
	const hasTopProducts = Array.isArray(topProducts) && topProducts.length > 0;
	const hasWorstProducts = Array.isArray(worstProducts) && worstProducts.length > 0;
	const hasCategories = Array.isArray(categories) && categories.length > 0;
	const hasTreemap = Array.isArray(contributions) && contributions.length > 0;

	return (
		<div className="w-full mb-16">
			<div className="mt-8 mb-4 px-8">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h1 className="text-4xl sm:text-6xl font-semibold text-gray-900 flex items-center gap-3">
							<span>Sales</span>
						</h1>
						<div className="mt-1 text-sm text-gray-600">
							A simple view of revenue, orders, and what sells.
						</div>
					</div>
					<div className="flex items-center gap-2">
						<div className="rounded-xl border border-gray-200 bg-white shadow-sm p-1 flex">
							{RANGE_OPTIONS.map((o) => (
								<button
									key={o.days}
									onClick={() => setDays(o.days)}
									className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
										days === o.days
											? 'bg-green-600 text-white'
											: 'text-gray-700 hover:bg-gray-50'
									}`}
								>
									{o.label}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="px-8">
				{loading ? (
					<div className="text-sm text-gray-500 mb-4">Loading…</div>
				) : error ? (
					<div className="text-sm text-red-600 mb-4">{error}</div>
				) : null}

				<div className="mb-10">
					<SectionHeader
						eyebrow="Quick answers"
						title={
							<span className="inline-flex items-center gap-2">
								<FiTrendingUp className="h-5 w-5 text-green-700" />
								KPI snapshot
							</span>
						}
						subtitle="Revenue, orders and average order size for the selected period."
					/>

					<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<KpiCard
							icon={<FiDollarSign />}
							label="Total Sales Revenue"
							value={formatCurrencyLKR(data?.kpis?.totalSalesRevenue?.value, currency)}
							changePct={data?.kpis?.totalSalesRevenue?.changePct}
							trend={data?.kpis?.totalSalesRevenue?.trend}
							accent="green"
							sparkline={dailyWithLabels}
							sparklineKey="revenue"
						/>
						<KpiCard
							icon={<FiTrendingUp />}
							label="Net Sales"
							value={formatCurrencyLKR(data?.kpis?.netSales?.value, currency)}
							changePct={data?.kpis?.netSales?.changePct}
							trend={data?.kpis?.netSales?.trend}
							accent="indigo"
							sparkline={dailyWithLabels}
							sparklineKey="revenue"
						/>
						<KpiCard
							icon={<FiShoppingCart />}
							label="Orders"
							value={formatCompactNumber(data?.kpis?.ordersCount?.value)}
							changePct={data?.kpis?.ordersCount?.changePct}
							trend={data?.kpis?.ordersCount?.trend}
							accent="blue"
							sparkline={dailyWithLabels}
							sparklineKey="orders"
						/>
						<KpiCard
							icon={<FiPercent />}
							label="Avg Order Value"
							value={formatCurrencyLKR(data?.kpis?.averageOrderValue?.value, currency)}
							changePct={data?.kpis?.averageOrderValue?.changePct}
							trend={data?.kpis?.averageOrderValue?.trend}
							accent="amber"
							sparkline={dailyWithLabels}
							sparklineKey="aov"
						/>
					</div>
				</div>

				<div className="mb-10">
					<SectionHeader
						eyebrow="Trends"
						title={
							<span className="inline-flex items-center gap-2">
								<FiLayers className="h-5 w-5 text-green-700" />
								Demand and revenue trends
							</span>
						}
						subtitle="Shows how sales change day-by-day and how much comes from each channel."
					/>

					<div className="mt-4 grid grid-cols-1 xl:grid-cols-12 gap-4">
						<div className="xl:col-span-8">
							<ChartCard
								title={
									<span className="inline-flex items-center gap-2">
										<FiDollarSign className="h-4 w-4 text-green-700" />
										Revenue vs Orders
									</span>
								}
								subtitle="Revenue is money earned; orders is number of purchases."
							>
								<div className="h-72">
									{hasDaily ? (
										<ResponsiveContainer width="100%" height="100%">
											<ComposedChart data={dailyWithLabels}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="dayLabel" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor((dailyWithLabels.length || 30) / 10))} />
												<YAxis yAxisId="rev" tick={{ fontSize: 10 }} />
												<YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 10 }} />
												<Tooltip content={<TooltipCard currency={currency} />} />
												<Legend />
												<Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue" fill="currentColor" stroke="currentColor" className="text-green-500" fillOpacity={0.18} strokeWidth={2} />
												<Line yAxisId="ord" type="monotone" dataKey="orders" name="Orders" stroke="currentColor" className="text-blue-600" strokeWidth={2} dot={false} />
											</ComposedChart>
										</ResponsiveContainer>
									) : (
										<EmptyState text="No sales trend data for this period yet." />
									)}
								</div>
							</ChartCard>
						</div>

						<div className="xl:col-span-4">
							<ChartCard
								title={
									<span className="inline-flex items-center gap-2">
										<FiBarChart2 className="h-4 w-4 text-green-700" />
										Channel mix
									</span>
								}
								subtitle="How much revenue comes from delivery vs pickup."
							>
								<div className="h-72">
									{hasDaily ? (
										<ResponsiveContainer width="100%" height="100%">
											<AreaChart data={dailyWithLabels}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="dayLabel" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor((dailyWithLabels.length || 30) / 7))} />
												<YAxis tick={{ fontSize: 10 }} />
												<Tooltip content={<TooltipCard currency={currency} />} />
												<Legend />
												<Area type="monotone" dataKey="onlineRevenue" name="Delivery" stackId="1" fill="currentColor" stroke="currentColor" className="text-indigo-500" fillOpacity={0.22} strokeWidth={2} />
												<Area type="monotone" dataKey="posRevenue" name="Pickup" stackId="1" fill="currentColor" stroke="currentColor" className="text-teal-500" fillOpacity={0.22} strokeWidth={2} />
											</AreaChart>
										</ResponsiveContainer>
									) : (
										<EmptyState text="No channel mix data to show." />
									)}
								</div>
							</ChartCard>
						</div>
					</div>
				</div>

				<div className="mb-10">
					<SectionHeader
						eyebrow="What sells"
						title={
							<span className="inline-flex items-center gap-2">
								<FiGrid className="h-5 w-5 text-green-700" />
								Top products & category mix
							</span>
						}
						subtitle="Use this to plan restocks, promotions, and homepage featuring."
					/>

					<div className="mt-4 grid grid-cols-1 xl:grid-cols-12 gap-4">
						<div className="xl:col-span-6">
							<ChartCard
								title={
									<span className="inline-flex items-center gap-2">
										<FiTrendingUp className="h-4 w-4 text-green-700" />
										Top products (revenue)
									</span>
								}
								subtitle="Best sellers in the selected period."
							>
								<div className="h-80">
									{hasTopProducts ? (
										<ResponsiveContainer width="100%" height="100%">
											<BarChart
												data={topProducts.map((p) => ({
													...p,
													name:
														(p?.productName || '').slice(0, 22) +
														((p?.productName || '').length > 22 ? '…' : ''),
													revenue: Number(p?.revenue || 0),
											}))}
										>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={60} />
											<YAxis tick={{ fontSize: 10 }} />
											<Tooltip content={<TooltipCard currency={currency} />} />
											<Bar dataKey="revenue" name="Revenue" fill="currentColor" className="text-green-600" radius={[10, 10, 0, 0]} />
										</BarChart>
									</ResponsiveContainer>
								) : (
									<EmptyState text="No product sales recorded in this period." />
								)}
								</div>
							</ChartCard>
						</div>

						<div className="xl:col-span-6">
							<ChartCard
								title={
									<span className="inline-flex items-center gap-2">
										<FiInfo className="h-4 w-4 text-green-700" />
										Needs attention (low sales)
									</span>
								}
								subtitle="Products with the lowest revenue in this period."
							>
								<div className="h-80">
									{hasWorstProducts ? (
										<ResponsiveContainer width="100%" height="100%">
											<BarChart
												data={worstProducts.map((p) => ({
													...p,
													name:
														(p?.productName || '').slice(0, 22) +
														((p?.productName || '').length > 22 ? '…' : ''),
													revenue: Number(p?.revenue || 0),
											}))}
										>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={60} />
											<YAxis tick={{ fontSize: 10 }} />
											<Tooltip content={<TooltipCard currency={currency} />} />
											<Bar dataKey="revenue" name="Revenue" fill="currentColor" className="text-rose-500" radius={[10, 10, 0, 0]} />
										</BarChart>
									</ResponsiveContainer>
								) : (
									<EmptyState text="No low-performing products to list." />
								)}
								</div>
							</ChartCard>
						</div>

						<div className="xl:col-span-5">
							<ChartCard
								title={
									<span className="inline-flex items-center gap-2">
										<FiGrid className="h-4 w-4 text-green-700" />
										Category share
									</span>
								}
								subtitle="Which categories bring the most revenue."
							>
								<div className="h-80">
									{hasCategories ? (
										<ResponsiveContainer width="100%" height="100%">
											<PieChart>
												<Tooltip content={<TooltipCard currency={currency} />} />
												<Legend />
												<Pie
													data={categories.map((c) => ({
														name: c?.categoryName || 'Uncategorized',
														value: Number(c?.revenue || 0),
													}))}
													dataKey="value"
													nameKey="name"
													innerRadius={55}
													outerRadius={95}
													paddingAngle={3}
													cornerRadius={12}
												>
													{categories.map((c, i) => (
														<Cell key={c?.categoryId || i} fill="currentColor" className={pieColorClass(i)} />
													))}
												</Pie>
											</PieChart>
									</ResponsiveContainer>
								) : (
									<EmptyState text="No category data for this period." />
								)}
								</div>
							</ChartCard>
						</div>

						<div className="xl:col-span-7">
							<ChartCard
								title={
									<span className="inline-flex items-center gap-2">
										<FiPercent className="h-4 w-4 text-green-700" />
										Discount pressure
									</span>
								}
								subtitle="Higher discounts often mean more promotions."
							>
								<div className="h-80">
									{hasDaily ? (
										<ResponsiveContainer width="100%" height="100%">
											<ComposedChart data={dailyWithLabels}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis dataKey="dayLabel" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor((dailyWithLabels.length || 30) / 10))} />
												<YAxis yAxisId="disc" tick={{ fontSize: 10 }} />
												<YAxis yAxisId="rev" orientation="right" tick={{ fontSize: 10 }} />
												<Tooltip content={<TooltipCard currency={currency} />} />
												<Legend />
												<Bar yAxisId="disc" dataKey="discounts" name="Discounts" fill="currentColor" className="text-amber-500" radius={[10, 10, 0, 0]} />
												<Line yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue" stroke="currentColor" className="text-green-600" strokeWidth={2} dot={false} />
											</ComposedChart>
										</ResponsiveContainer>
									) : (
										<EmptyState text="No discount data for this period." />
									)}
								</div>
							</ChartCard>
						</div>

						<div className="xl:col-span-12">
							<ChartCard
								title={
									<span className="inline-flex items-center gap-2">
										<FiLayers className="h-4 w-4 text-green-700" />
										Revenue concentration
									</span>
								}
								subtitle="Bigger blocks mean more revenue."
							>
								<div className="h-80">
									{hasTreemap ? (
										<ResponsiveContainer width="100%" height="100%">
											<Treemap
												data={toTreemap(contributions)}
												dataKey="size"
												nameKey="name"
												stroke="currentColor"
												className="text-white"
												content={<TreemapContent />}
											/>
										</ResponsiveContainer>
									) : (
										<EmptyState text="No contribution data for this period." />
									)}
								</div>
							</ChartCard>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function TooltipCard({ active, payload, label, currency }) {
	if (!active || !payload || payload.length === 0) return null;
	return (
		<div className="rounded-xl border border-gray-200 bg-white shadow-lg px-3 py-2">
			<div className="text-[11px] font-semibold text-gray-700">{label}</div>
			<div className="mt-1 space-y-0.5">
				{payload.map((p) => {
					const key = `${p?.name}-${p?.dataKey}`;
					const val = p?.value;
					const isMoney = /revenue|discount|aov/i.test(String(p?.dataKey || p?.name || ''));
					return (
						<div key={key} className="flex items-center justify-between gap-6 text-[11px]">
							<span className="text-gray-600">{p?.name || p?.dataKey}</span>
							<span className="font-semibold text-gray-900">
								{isMoney ? formatCurrencyLKR(val, currency) : formatCompactNumber(val)}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function pieColorClass(i) {
	const colors = [
		'text-indigo-500',
		'text-teal-500',
		'text-amber-500',
		'text-purple-500',
		'text-blue-500',
		'text-rose-500',
	];
	return colors[i % colors.length];
}

function toTreemap(contrib = []) {
	const byCategory = new Map();
	for (const row of contrib) {
		const cat = row?.categoryName || 'Uncategorized';
		if (!byCategory.has(cat)) byCategory.set(cat, []);
		byCategory.get(cat).push({
			name: row?.productName || 'Unknown',
			size: Number(row?.revenue || 0),
		});
	}
	return Array.from(byCategory.entries()).map(([name, children]) => ({ name, children }));
}

function TreemapContent({ depth, x, y, width, height, index, name }) {
	const palette = [
		'text-green-600',
		'text-indigo-600',
		'text-teal-600',
		'text-amber-600',
		'text-purple-600',
		'text-blue-600',
	];
	const cls = palette[(index || 0) % palette.length];
	return (
		<g>
			<rect
				x={x}
				y={y}
				width={width}
				height={height}
				fill="currentColor"
				className={cls}
				fillOpacity={depth === 1 ? 0.9 : 0.75}
				rx={10}
				ry={10}
			/>
			{width > 70 && height > 20 ? (
				<text x={x + 10} y={y + 20} fill="#fff" fontSize={12} fontWeight={600}>
					{name}
				</text>
			) : null}
		</g>
	);
}

function EmptyState({ text }) {
	return (
		<div className="h-full w-full rounded-xl border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center px-6">
			<div className="text-sm text-gray-600 text-center">{text}</div>
		</div>
	);
}
