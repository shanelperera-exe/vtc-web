import { useState, useEffect } from "react";

export default function Slider({
  min = 0,
  max = 15000,
  step = 100,
  currency = "₨",
  initialMin,
  initialMax,
  onApply,
}) {
  const [minValue, setMinValue] = useState(initialMin ?? min);
  const [maxValue, setMaxValue] = useState(initialMax ?? max);

  // Auto-apply whenever values change
  useEffect(() => {
    if (onApply) {
      onApply({ minValue, maxValue });
    }
  }, [minValue, maxValue, onApply]);

  return (
    <div className="bg-white w-full max-w-md">
      {/* Inputs */}
      <div className="flex items-center space-x-4 mb-6">
        <label className="flex flex-col text-sm text-gray-700 w-1/2">
          From
          <div className="flex items-center border px-2 py-1">
            <span className="mr-1">{currency}</span>
            <input
              type="number"
              min={min}
              max={maxValue - step}
              step={step}
              value={minValue}
              onChange={(e) =>
                setMinValue(Math.min(Number(e.target.value), maxValue - step))
              }
              className="w-full outline-none"
            />
          </div>
        </label>
        <label className="flex flex-col text-sm text-gray-700 w-1/2">
          To
          <div className="flex items-center border px-2 py-1">
            <span className="mr-1">{currency}</span>
            <input
              type="number"
              min={minValue + step}
              max={max}
              step={step}
              value={maxValue}
              onChange={(e) =>
                setMaxValue(Math.max(Number(e.target.value), minValue + step))
              }
              className="w-full outline-none"
            />
          </div>
        </label>
      </div>

      {/* Dual Range Slider */}
      <div className="relative w-full h-2">
        {/* Track */}
        <div className="absolute w-full h-2 bg-gray-200 rounded" />

        {/* Highlighted range */}
        <div
          className="absolute h-2 bg-[#1e2a38] rounded"
          style={{
            left: `${(minValue / max) * 100}%`,
            right: `${100 - (maxValue / max) * 100}%`,
          }}
        />

        {/* Min handle */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={(e) =>
            setMinValue(Math.min(Number(e.target.value), maxValue - step))
          }
          className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none vtc-range
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:pointer-events-auto
          [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1e2a38]
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5
          [&::-moz-range-thumb]:bg-white
          [&::-moz-range-thumb]:
          [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1e2a38]
          [&::-moz-range-thumb]:cursor-pointer"
        />

        {/* Max handle */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={(e) =>
            setMaxValue(Math.max(Number(e.target.value), minValue + step))
          }
          className="absolute w-full h-2 bg-transparent appearance-none pointer-events-none vtc-range
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:pointer-events-auto
          [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:
          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#1e2a38]
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5
          [&::-moz-range-thumb]:bg-white
          [&::-moz-range-thumb]:
          [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#1e2a38]
          [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
    </div>
  );
}
