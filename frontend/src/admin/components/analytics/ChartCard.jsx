import React from 'react';

/**
 * Standard card wrapper for any chart.
 * Enforces consistent padding, border, and header layout.
 */
export default function ChartCard({
	title,
	subtitle,
	action,
	children,
	className = '',
}) {
	return (
		<div className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}>
			<div className="px-4 pt-4">
				<div className="flex items-start justify-between gap-3">
					<div className="min-w-0">
						<div className="text-sm font-semibold text-gray-900 truncate">{title}</div>
						{subtitle ? (
							<div className="mt-1 text-xs text-gray-500">{subtitle}</div>
						) : null}
					</div>
					{action ? <div className="shrink-0">{action}</div> : null}
				</div>
			</div>
			<div className="px-4 pb-4 pt-3">{children}</div>
		</div>
	);
}
