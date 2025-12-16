import React from "react";
import { StatCards } from "../components/dashboard/StatCards";
import RevenueChart from "../components/dashboard/RevenueChart";
import RevenueGrowthCard from "../components/dashboard/RevenueGrowthCard";
import TrendingProductCard from "../components/dashboard/TrendingProductCard";
import CategoryPerformanceCard from "../components/dashboard/CategoryPerformanceCard";
import { getAdminDashboardAnalytics } from "../../api/adminAnalyticsApi";


const AdminDashboard = () => {
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState(null);
	const [analytics, setAnalytics] = React.useState(null);

	React.useEffect(() => {
		let ignore = false;
		async function load() {
			setLoading(true);
			setError(null);
			try {
				const data = await getAdminDashboardAnalytics({ chartDays: 7, windowDays: 30 });
				if (!ignore) setAnalytics(data);
			} catch (e) {
				if (!ignore) setError(e?.message || 'Failed to load dashboard analytics');
			} finally {
				if (!ignore) setLoading(false);
			}
		}
		load();
		return () => { ignore = true; };
	}, []);

	return (
		<div className="w-full mb-16">
			<div className="mt-8 mb-4 px-8">
				<h1 className="text-6xl font-semibold text-black">Dashboard</h1>
			</div>
			<div className="px-8">
				{loading ? (
					<div className="text-sm text-gray-500 mb-4">Loading…</div>
				) : error ? (
					<div className="text-sm text-red-600 mb-4">{error}</div>
				) : null}
				<div className="grid grid-cols-12 gap-4 mb-4">
					<StatCards analytics={analytics} />
				</div>
				<div className="grid grid-cols-12 gap-4">
					<RevenueChart analytics={analytics} />
					<RevenueGrowthCard analytics={analytics} />
				</div>
				<div className="grid grid-cols-12 gap-4 mt-4">
					<TrendingProductCard analytics={analytics} />
					<CategoryPerformanceCard analytics={analytics} />
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
