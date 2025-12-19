export function formatCurrencyLKR(value, currency = 'LKR') {
	try {
		return new Intl.NumberFormat(undefined, {
			style: 'currency',
			currency,
			maximumFractionDigits: 0,
		}).format(Number(value || 0));
	} catch {
		return `${currency} ${Math.round(Number(value || 0))}`;
	}
}

export function formatCompactNumber(value) {
	const n = Number(value || 0);
	if (!Number.isFinite(n)) return String(value ?? '');
	if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
	return `${Math.round(n)}`;
}

export function formatPct(value, digits = 2) {
	const n = Number(value);
	if (!Number.isFinite(n)) return '—';
	return `${n > 0 ? '+' : ''}${n.toFixed(digits)}%`;
}

export function formatDayLabel(dateStr) {
	try {
		if (!dateStr || typeof dateStr !== 'string') return String(dateStr || '');
		const [y, m, d] = dateStr.split('-').map(Number);
		if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return dateStr;
		const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		return `${months[Math.max(0, Math.min(11, m - 1))]} ${d}`;
	} catch {
		return String(dateStr || '');
	}
}
