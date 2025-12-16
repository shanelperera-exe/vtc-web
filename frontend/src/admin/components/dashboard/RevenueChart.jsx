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

function shortMoney(n, cur = 'LKR') {
  const num = Number(n || 0);
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) return `${cur} ${(num / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${cur} ${(num / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${cur} ${(num / 1_000).toFixed(1)}k`;
  return `${cur} ${num.toFixed(0)}`;
}

function shortNumber(n) {
  const num = Number(n || 0);
  const abs = Math.abs(num);
  if (abs >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
  return `${num.toFixed(0)}`;
}

function formatShortDate(dateStr) {
  try {
    if (!dateStr || typeof dateStr !== 'string') return String(dateStr || '');
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const m = Number(parts[1]);
    const d = Number(parts[2]);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[Math.max(0, Math.min(11, m - 1))]} ${d}`;
  } catch {
    return String(dateStr || '');
  }
}

export default function RevenueChart({ analytics }) {
  const cur = analytics?.currency || 'LKR';
  const series = (analytics?.revenueLast7Days || []).map(p => ({
    date: formatShortDate(p?.date),
    revenue: Number(p?.revenue || 0),
  }));

  return (
    <div
        className="col-span-12 md:col-span-8 h-72 w-full p-4 rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        style={{
          background: "rgb(251, 251, 251)",
        }}
    >
      <span
        className="mb-2 block text-lg font-semibold"
        style={{ color: "rgb(35, 41, 38)" }}
      >
        Revenue ({cur})
      </span>

      <ResponsiveContainer width="100%" height={208}>
        <AreaChart data={series} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
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
            tickFormatter={(value) => shortNumber(value)}
          />

          {/* Tooltip */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              padding: "10px",
            }}
            labelStyle={{ marginBottom: "5px" }}
            formatter={(value) => shortMoney(value, cur)}
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
