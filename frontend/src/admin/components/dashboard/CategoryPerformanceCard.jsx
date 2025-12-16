import React from 'react'
import { FiArrowDownRight, FiArrowUpRight } from 'react-icons/fi'

import { FaKitchenSet } from 'react-icons/fa6'
import { BsLamp } from 'react-icons/bs'
import { PiSprayBottleFill, PiPencilRulerFill } from 'react-icons/pi'
import { GiPlasticDuck } from 'react-icons/gi'
import { FaPlug } from 'react-icons/fa'

function normalizeCategoryKey(name) {
	return String(name || '')
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
}

function getCategoryIcon(categoryName) {
	const key = normalizeCategoryKey(categoryName)
	if (key.includes('cleaning')) return PiSprayBottleFill
	if (key.includes('electric')) return FaPlug
	if (key.includes('plastic')) return GiPlasticDuck
	if (key.includes('stationary') || key.includes('stationery')) return PiPencilRulerFill
	if (key.includes('homeware') || key.includes('home')) return BsLamp
	if (key.includes('kitchen')) return FaKitchenSet
	return null
}

function formatGrowth(pct) {
	if (pct === null || pct === undefined || Number.isNaN(Number(pct))) return '—'
	const v = Number(pct)
	const sign = v > 0 ? '+' : ''
	return `${sign}${v.toFixed(1)}%`
}

function growthPillClasses(trend) {
	if (trend === 'up') return 'bg-emerald-100 text-emerald-900'
	if (trend === 'down') return 'bg-rose-100 text-rose-900'
	return 'bg-gray-100 text-gray-700'
}

export default function CategoryPerformanceCard({ analytics }) {
	const rows = Array.isArray(analytics?.categoryPerformance30d)
		? analytics.categoryPerformance30d
		: []

	return (
		<div className="no-scrollbar col-span-12 md:col-span-6 w-full rounded-2xl p-4 border border-gray-200 bg-white/90 shadow-sm overflow-x-auto md:overflow-x-hidden">
			<span className="mb-4 block text-lg font-semibold text-gray-900">Category Performance</span>

			<table className="w-full min-w-[520px] md:min-w-full">
				<thead className="w-full">
					<tr className="text-sm uppercase md:text-base text-gray-900 border-b border-gray-200">
						<th className="p-4 pt-0 text-start font-semibold">ID</th>
						<th className="p-4 pt-0 text-start font-semibold">Category</th>
						<th className="p-4 pt-0 text-start font-semibold">Sales</th>
						<th className="p-4 pt-0 text-start font-semibold">Growth</th>
					</tr>
				</thead>
				<tbody className="text-gray-900">
					{rows.length === 0 ? (
						<tr>
							<td className="p-4 text-sm text-gray-500" colSpan={4}>No category performance data yet.</td>
						</tr>
					) : (
						rows.map((r) => {
							const Icon = getCategoryIcon(r?.categoryName)
							const trend = r?.trend
							return (
								<tr key={String(r?.categoryId ?? r?.categoryName ?? Math.random())}>
									<td className="p-4 text-gray-500">{r?.categoryId ?? '—'}</td>
									<td className="flex items-center gap-2 p-4">
										<span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center">
											{Icon ? React.createElement(Icon, { size: 36, className: 'text-gray-700' }) : (
												<span className="text-2xl font-semibold leading-none text-gray-600">
													{String(r?.categoryName || '?').trim().slice(0, 1).toUpperCase()}
												</span>
											)}
										</span>
										<div>
											<p className="text-lg font-semibold">{r?.categoryName || 'Category'}</p>
											<p className="text-xs text-gray-500">Last 30 days</p>
										</div>
									</td>
									<td className="p-4">{Number(r?.unitsSold ?? 0)}</td>
									<td className="p-4">
										<div className={`flex w-fit items-center gap-1 rounded-md px-2 py-0.5 ${growthPillClasses(trend)}`}>
											<span>{formatGrowth(r?.growthPct)}</span>
											{trend === 'up' ? <FiArrowUpRight /> : trend === 'down' ? <FiArrowDownRight /> : null}
										</div>
									</td>
								</tr>
							)
						})
					)}
				</tbody>
			</table>
		</div>
	)
}
