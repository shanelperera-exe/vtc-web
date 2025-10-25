import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function RevenueGrowthCard() {
  return (
    <div
      className="relative col-span-12 md:col-span-4 grid h-72 w-full place-content-center animated-gradient"
      style={{
        background: "linear-gradient(270deg, rgb(9, 168, 78), rgb(35, 244, 125), rgb(9, 168, 78))",
        backgroundSize: "400% 400%"
      }}
    >
      <style>{`
        .animated-gradient {
          animation: gradientMove 16s ease-in-out infinite;
        }
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      {/* Arrow Icon */}
      <ArrowUpRight
        className="absolute right-0 top-0 text-[12rem] opacity-70"
        style={{ color: "rgb(0,0,0)", width: "5rem", height: "5rem" }}
      />

      {/* Content */}
      <div className="flex flex-col items-center" style={{ color: "rgb(0,0,0)" }}>
        <span className="text-6xl font-bold md:text-7xl lg:text-8xl">9.5%</span>
        <span className="opacity-70">Rev. Growth</span>
      </div>
    </div>
  );
}
