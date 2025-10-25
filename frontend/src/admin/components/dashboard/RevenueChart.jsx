import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

// Example Sri Lankan Revenue Data (LKR Millions)
const data = [
  { date: "Sep 10", revenue: 250 },
  { date: "Sep 11", revenue: 320 },
  { date: "Sep 12", revenue: 480 },
  { date: "Sep 13", revenue: 610 },
  { date: "Sep 14", revenue: 720 },
  { date: "Sep 15", revenue: 540 },
  { date: "Sep 16", revenue: 860 },
];

export default function RevenueChart() {
  return (
    <div
      className="col-span-12 md:col-span-8 h-72 w-full p-4"
      style={{
        background: "rgb(251, 251, 251)",
        border: "2px solid rgb(221, 226, 223)",
      }}
    >
      <span
        className="mb-2 block text-lg font-semibold"
        style={{ color: "rgb(35, 41, 38)" }}
      >
        Revenue (LKR Millions)
      </span>

      <ResponsiveContainer width="100%" height={208}>
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          {/* Grid */}
          <CartesianGrid stroke="#84958b55" />

          {/* X Axis */}
          <XAxis
            dataKey="date"
            axisLine={{ stroke: "#5e6e65" }}
            tickLine={{ stroke: "#5e6e65" }}
            tick={{ fontSize: "0.8rem", fill: "#5e6e65" }}
          />

          {/* Y Axis */}
          <YAxis
            axisLine={{ stroke: "#5e6e65" }}
            tickLine={{ stroke: "#5e6e65" }}
            tick={{ fontSize: "0.8rem", fill: "#5e6e65" }}
            tickFormatter={(value) => `Rs ${value}`}
          />

          {/* Tooltip */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              padding: "10px",
            }}
            labelStyle={{ marginBottom: "5px" }}
          />

          {/* Area with animation */}
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="20%" stopColor="#0bd964" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#0bd964" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#0bd964"
            strokeWidth={2}
            fill="url(#colorRevenue)"
            fillOpacity={0.6}
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
