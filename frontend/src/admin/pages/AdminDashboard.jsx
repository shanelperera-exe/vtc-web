import React from "react";
import { StatCards } from "../components/dashboard/StatCards";
import RevenueChart from "../components/dashboard/RevenueChart";
import RevenueGrowthCard from "../components/dashboard/RevenueGrowthCard";


const AdminDashboard = () => {
	return (
		<div className="w-full">
			<div className="mt-8 mb-4 px-8">
				<h1 className="text-6xl font-semibold text-black">Dashboard</h1>
			</div>
			<div className="px-8">
				<div className="grid grid-cols-12 gap-4 mb-4">
					<StatCards />
				</div>
				<div className="grid grid-cols-12 gap-4">
					<RevenueChart />
					<RevenueGrowthCard />
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
