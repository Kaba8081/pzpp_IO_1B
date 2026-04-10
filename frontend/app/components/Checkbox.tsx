import React from "react";
import { Check } from "lucide-react";

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
          className="sr-only"
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
          {checked && <Check className="w-4 h-4 text-primary-foreground stroke-[3px]" />}
        </div>

        <span className=" text-white/90 select-none">{label}</span>
      </label>

      {error && <p className="text-sm text-error ml-8 mt-0">{error}</p>}
    </div>
  );
};
