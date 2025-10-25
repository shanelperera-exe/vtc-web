import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductStatsBySku } from '../../api/productApi';
import StarReview from '../../components/ui/StarReview';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function ProductStats() {
  const { sku } = useParams();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [stats, setStats] = React.useState(null);

  React.useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true); setError(null);
      try {
        const s = await getProductStatsBySku(sku, { days: 90 });
        if (!ignore) setStats(s);
      } catch (e) {
        if (!ignore) setError(e?.message || 'Failed to load stats');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    if (sku) load();
    return () => { ignore = true; };
  }, [sku]);

  const rating = 0;
  const reviewCount = 0;

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Product performance</h1>
          <p className="text-sm text-gray-500">SKU: {sku}</p>
        </div>
        <Link to="/admin/products" className="text-sm font-medium text-gray-700 hover:text-black">Back to products</Link>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : (
        <div className="space-y-6">
          {/* Header card */}
          <div className="border border-gray-200 p-4 bg-white">
            <div className="flex items-center gap-4">
              {stats?.primaryImageUrl ? (
                <img src={stats.primaryImageUrl} alt={stats?.name || 'Product'} className="w-16 h-16 object-cover border" />
              ) : (
                <div className="w-16 h-16 bg-gray-100 border" />
              )}
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 truncate">{stats?.name || 'Product'}</h2>
                <div className="text-xs text-gray-600">SKU: {stats?.sku || '—'}</div>
                <div className="mt-1">
                  <StarReview rating={rating} numReviews={reviewCount} size={16} showCount={true} />
                </div>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Units sold" value={stats?.totalUnitsSold ?? 0} />
            <KpiCard label="Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} />
            <KpiCard label="Orders" value={stats?.orderCount ?? 0} />
            <KpiCard label="Avg price" value={formatCurrency(stats?.averagePrice ?? 0)} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="col-span-2 border border-gray-200 bg-white p-3">
              <div className="mb-2 text-sm font-semibold">Daily sales (last 90 days)</div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={(stats?.dailySales || []).map(d => ({ ...d, date: formatShortDate(d.date) }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor((stats?.dailySales?.length || 30)/10))} />
                    <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} hide />
                    <Legend />
                    <RTooltip formatter={(value, name) => name === 'revenue' ? formatCurrency(value) : value} />
                    <Line yAxisId="left" type="monotone" dataKey="units" name="Units" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="border border-gray-200 bg-white p-3">
              <div className="mb-2 text-sm font-semibold">Top variants</div>
              <div className="h-64">
                {(stats?.topVariants?.length || 0) > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.topVariants}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <RTooltip />
                      <Bar dataKey="units" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-xs text-gray-500">No variant breakdown.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value }) {
  return (
    <div className="border border-gray-200 p-3 bg-white">
      <div className="text-[11px] text-gray-600">{label}</div>
      <div className="text-lg font-semibold text-gray-900">{value}</div>
    </div>
  );
}

const PIE_COLORS = ['#111827', '#10B981', '#6366F1', '#F59E0B', '#EF4444', '#06B6D4'];
function shortCurrency(n) { try { const num = Number(n||0); if (num >= 1_000_000) return `${(num/1_000_000).toFixed(1)}M`; if (num >= 1_000) return `${(num/1_000).toFixed(1)}k`; return `${num}`; } catch { return String(n||0); } }
function formatCurrency(n, cur = 'LKR') { try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(Number(n||0)); } catch { return `${cur} ${Math.round(Number(n||0))}`; } }

// Format YYYY-MM-DD into a short, readable label like "Oct 5"
function formatShortDate(dateStr) {
  try {
    if (!dateStr || typeof dateStr !== 'string') return String(dateStr || '');
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const y = Number(parts[0]);
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return dateStr;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[Math.max(0, Math.min(11, m - 1))]} ${d}`;
  } catch {
    return String(dateStr || '');
  }
}
