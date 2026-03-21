import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
}

export const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full mb-4">
      <label className="font-cinzel text-xs tracking-widest uppercase text-primary/80 ml-1">
        {label}
      </label>

      <input
        {...props}
        className={`
          w-full px-4 py-3 rounded-2xl border-t border-b border-l border-r transition-all duration-300
          bg-input-bg text-white font-cinzel placeholder:text-gray-700 outline-none
          ${
            error
              ? "border-error ring-1 ring-error"
              : "border-input-border hover:border-input-stroke-hover focus:border-primary focus:ring-1 focus:ring-primary/40"
          }
        `}
      />

      {error && (
        <p className="font-cinzel text-[10px] text-error tracking-wider uppercase ml-1 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
