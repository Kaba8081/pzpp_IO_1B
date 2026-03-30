import React from "react";

interface ToggleProps {
  label: string;
  error?: string | null;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ label, error, checked, onChange }) => {
  return (
    <div className="flex flex-col gap-2 w-full mb-4">
      <label className="flex items-center gap-4 cursor-pointer group">
        {/* Prawdziwy input - ukryty, ale funkcjonalny */}
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />

        {/* Wizualny kontener przełącznika (reaguje na stan peer) */}
        <div
          className={`
            relative w-14 h-7 shrink-0 transition-all duration-300 rounded-2xl border
            bg-input-bg border-input-border 
            group-hover:border-input-stroke-hover
            peer-checked:bg-primary peer-checked:border-primary
            peer-focus-visible:ring-2 peer-focus-visible:ring-primary/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background
          `}
        >
          {/* Kropka przełącznika - poprawiona linia */}
          <div
            className={`
              absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm
              ${checked ? "translate-x-7" : "translate-x-0"}
            `}
          />
        </div>

        <span className="font-cinzel text-sm text-white/90 tracking-wide uppercase select-none">
          {label}
        </span>
      </label>

      {error && <p className="font-cinzel text-error tracking-wider ml-1">{error}</p>}
    </div>
  );
};
