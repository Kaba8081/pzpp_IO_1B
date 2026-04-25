import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  icon?: React.ReactNode;
  wrapperClassName?: string;
  fieldClassName?: string;
}

const cn = (...classes: Array<string | undefined | false>) => classes.filter(Boolean).join(" ");

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  fieldClassName,
  wrapperClassName,
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={cn("group flex w-full flex-col", wrapperClassName)}>
      <div
        className={cn(
          "relative flex w-full flex-col justify-center rounded-2xl border bg-input-bg px-5 transition-all duration-300",
          label ? "pb-2 pt-6" : "py-4",
          error
            ? "border-error ring-1 ring-error"
            : "border-input-border group-hover:border-input-stroke-hover focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/40",
          fieldClassName
        )}
      >
        {label && (
          <label htmlFor={inputId} className="pointer-events-none absolute left-5 top-2">
            {label}
          </label>
        )}

        <input
          id={inputId}
          {...props}
          className={cn(
            "w-full border-none bg-transparent leading-none tracking-widest outline-none placeholder-input-placeholder",
            icon ? "pr-10" : "",
            className
          )}
        />

        {icon && <div className="absolute right-6 top-1/2 -translate-y-1/2">{icon}</div>}
      </div>

      {error && <p className="text-error ml-1 mt-1 tracking-wider">{error}</p>}
    </div>
  );
};
