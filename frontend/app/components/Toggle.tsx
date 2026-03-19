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
        {/* Kontener suwaka */}
        <div
          onClick={() => onChange(!checked)}
          className={`
            relative w-14 h-7 shrink-0 transition-all duration-300 rounded-[16px] border
            ${
              checked
                ? "bg-primary border-primary"
                : "bg-input-bg border-input-border group-hover:border-input-stroke-hover"
            }
          `}
        >
          {/* Kółko (Thumb) */}
          <div
            className={`
            absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-sm
            ${checked ? "translate-x-7" : "translate-x-0"}
          `}
          />
        </div>

        {/* Etykieta obok suwaka */}
        <span className="font-cinzel text-sm text-white/90 tracking-wide uppercase select-none">
          {label}
        </span>
      </label>

      {/* Komunikat o błędzie */}
      {error && (
        <p className="font-cinzel text-[10px] text-error tracking-wider uppercase ml-1">{error}</p>
      )}
    </div>
  );
};
