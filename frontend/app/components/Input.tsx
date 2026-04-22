import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, icon, ...props }) => {
  return (
    <div className="flex flex-col w-full group">
      <div className={`
        relative w-full px-5 rounded-2xl transition-all duration-300
        bg-input-bg text-white flex flex-col justify-center
        ${label ? "pt-6 pb-2" : "py-4"}
        ${
          error
            ? "border-error ring-1 ring-error"
            : "border-input-border group-hover:border-input-stroke-hover focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/40"
        }
      `}>
        
        {label && (
          <label className="absolute top-2 left-5 text-[10px] text-white/50 uppercase tracking-[0.2em] font-cinzel pointer-events-none">
            {label}
          </label>
        )}

        <input
          {...props}
          className={`
            w-full bg-transparent border-none outline-none text-sm text-white 
            placeholder-input-placeholder placeholder:text-white/50 font-cinzel tracking-widest leading-none
            ${icon ? "pr-10" : ""} // Zrób miejsce na ikonkę, żeby tekst na nią nie nachodził
          `}
        />

        {icon && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-white">
            {icon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-error text-[10px] font-bold ml-1 mt-1 uppercase tracking-wider">
          {error}
        </p>
      )}
    </div>
  );
};