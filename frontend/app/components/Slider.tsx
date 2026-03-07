import React from "react";

interface SliderProps {
  label: string;
  error?: string | null;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export const Slider: React.FC<SliderProps> = ({ label, error, min, max, value, onChange }) => (
  <div>
    <label>
      {label}: {value}
    </label>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
    {error && <span>{error}</span>}
  </div>
);
