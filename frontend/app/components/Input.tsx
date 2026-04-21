import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
}

export const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  return (
    <div className="flex flex-col w-full group">
      <div className={`
        relative w-full px-5 pt-6 pb-2 rounded-2xl hover:border-input-stroke-hover transition-all duration-300
        bg-input-bg text-white
        ${
          error
            ? "border-error ring-1 ring-error"
            : "border-input-border group-hover:border-input-stroke-hover focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/40"
        }
      `}>
        
        <label className="absolute top-2 left-5 text-xs text-white/70 uppercase tracking-[0.2em] font-cinzel">
          {label}
        </label>

        <input
          {...props}
          className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-input-placeholder placeholder:text-white/50 font-cinzel tracking-widest"
        />
      </div>

      {error && <p className="text-error text-xs font-bold ml-1 mt-1 uppercase tracking-wider">{error}</p>}
    </div>
  );
};
