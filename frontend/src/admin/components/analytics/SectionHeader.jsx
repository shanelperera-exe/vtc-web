import React from 'react';

/**
 * Section header used across the Sales Analytics page.
 * Keeps hierarchy consistent and readable in a dense dashboard.
 */
export default function SectionHeader({ eyebrow, title, subtitle, right }) {
	return (
		<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
			<div>
				{eyebrow ? (
					<div className="text-[11px] font-semibold tracking-wide text-green-700 uppercase">
						{eyebrow}
					</div>
				) : null}
				<h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{title}</h2>
				{subtitle ? (
					<p className="mt-1 text-sm text-gray-600 max-w-3xl">{subtitle}</p>
				) : null}
			</div>
			{right ? <div className="shrink-0">{right}</div> : null}
		</div>
	);
}
