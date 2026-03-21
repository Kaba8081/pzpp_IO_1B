import React from "react";

interface CheckboxProps {
  label: string;
  checked: boolean;
  error?: string | null;
  onChange: (checked: boolean) => void;
}

export const Checkbox: React.FC<CheckboxProps> = ({ label, checked, error, onChange }) => {
  return (
    <div className="flex flex-col gap-1 w-full mb-4">
      <label className="flex items-center gap-3 cursor-pointer group w-fit">
        <input
          type="checkbox"
          className="hidden"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />

        <div
          className={`
            w-5 h-5 shrink-0 rounded-md border-2 transition-all duration-200 flex items-center justify-center
            ${
              checked
                ? "bg-primary border-primary"
                : "bg-input-bg border-input-border group-hover:border-input-stroke-hover"
            }
            ${error ? "border-error" : ""}
          `}
        >
          {checked && (
            <svg
              className="w-3.5 h-3.5 text-white stroke-[3px]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <span className="font-cinzel text-xs text-white/90 tracking-wide uppercase select-none">
          {label}
        </span>
      </label>

      {error && (
        <p className="font-cinzel text-[10px] text-error tracking-wider uppercase ml-8 mt-0">
          {error}
        </p>
      )}
    </div>
  );
};
