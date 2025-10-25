import React from "react";

const PlaceholderSection = ({ title }) => (
  <div className="w-full">
    <div className="mt-8 mb-4 px-8">
      <h1 className="text-6xl font-semibold text-black">{title}</h1>
    </div>
    <div className="px-8 text-black">Coming soon…</div>
  </div>
);

export default PlaceholderSection;
