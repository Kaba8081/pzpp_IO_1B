import React from "react";

interface SliderProps {
  label: string;
  error?: string | null;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}
const THUMB_STYLES = `
  [&::-webkit-slider-thumb]:appearance-none
  [&::-webkit-slider-thumb]:w-5
  [&::-webkit-slider-thumb]:h-5
  [&::-webkit-slider-thumb]:rounded-full
  [&::-webkit-slider-thumb]:bg-white
  [&::-webkit-slider-thumb]:border-2
  [&::-webkit-slider-thumb]:border-primary
  [&::-webkit-slider-thumb]:transition-transform
  [&::-webkit-slider-thumb]:duration-150
  [&::-webkit-slider-thumb]:active:scale-125

  [&::-moz-range-thumb]:w-5
  [&::-moz-range-thumb]:h-5
  [&::-moz-range-thumb]:rounded-full
  [&::-moz-range-thumb]:bg-white
  [&::-moz-range-thumb]:border-2
  [&::-moz-range-thumb]:border-primary
  [&::-moz-range-thumb]:transition-transform
  [&::-moz-range-thumb]:active:scale-125
  [&::-moz-range-thumb]:border-none
`
  .replace(/\s+/g, " ")
  .trim();

export const Slider: React.FC<SliderProps> = ({ label, error, min, max, value, onChange }) => {
  const fillPercentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-1 w-full mb-6">
      <div className="flex justify-between items-baseline ml-1 mb-1">
        <label className=" text-primary/80">{label}</label>
        <span className=" text-white bg-primary/10 px-1.5 py-0 border border-primary/20 rounded-sm">
          {value}
        </span>
      </div>

      <div className="relative flex items-center group">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`
            w-full h-2 bg-input-bg rounded-2xl appearance-none cursor-pointer border transition-all ${THUMB_STYLES}
            ${error ? "border-error/50" : "border-input-border group-hover:border-input-stroke-hover"}

            /* Stylowanie kółka (Thumb) - Chrome/Safari/Edge */

          `}
          style={{
            background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${fillPercentage}%, transparent ${fillPercentage}%)`,
          }}
        />
      </div>

      {error && <p className="  text-error ml-1">{error}</p>}
    </div>
  );
};
