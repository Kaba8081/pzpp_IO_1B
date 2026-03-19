import React from "react";

interface SliderProps {
  label: string;
  error?: string | null;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = ({ label, error, min, max, value, onChange }) => {
  return (
    <div className="flex flex-col gap-1 w-full mb-6">
      {/* Etykieta z wartością */}
      <div className="flex justify-between items-baseline ml-1 mb-1">
        <label className="font-cinzel text-[10px] tracking-widest uppercase text-primary/80">
          {label}
        </label>
        <span className="font-cinzel text-[10px] text-white font-bold bg-primary/10 px-1.5 py-0 border border-primary/20 rounded-sm">
          {value}
        </span>
      </div>

      {/* Kontener Slidera */}
      <div className="relative flex items-center group">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`
            w-full h-2 bg-input-bg rounded-2xl appearance-none cursor-pointer border transition-all
            ${error ? "border-error/50" : "border-input-border group-hover:border-input-stroke-hover"}
            
            /* Stylowanie kółka (Thumb) - Chrome/Safari/Edge */
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-primary
            [&::-webkit-slider-thumb]:shadow-[0_0_15px_rgba(6,140,124,0.4)]
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:duration-150
            [&::-webkit-slider-thumb]:active:scale-125

            /* Stylowanie kółka (Thumb) - Firefox */
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-primary
            [&::-moz-range-thumb]:shadow-[0_0_15px_rgba(6,140,124,0.4)]
            [&::-moz-range-thumb]:transition-transform
            [&::-moz-range-thumb]:active:scale-125
            [&::-moz-range-thumb]:border-none
          `}
          style={{
            // Dynamiczny pasek postępu (to co jest przed kółkiem)
            background: `linear-gradient(to right, #068C7C 0%, #068C7C ${((value - min) / (max - min)) * 100}%, #0c1a1a ${((value - min) / (max - min)) * 100}%, #0c1a1a 100%)`,
          }}
        />
      </div>

      {/* Błąd */}
      {error && (
        <p className="font-cinzel text-[10px] text-error tracking-wider uppercase ml-1">{error}</p>
      )}
    </div>
  );
};
