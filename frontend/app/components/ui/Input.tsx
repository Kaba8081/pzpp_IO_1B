import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  wrapperClassName?: string;
  fieldClassName?: string;
  multiline?: boolean;
}

const cn = (...classes: Array<string | undefined | false>) => classes.filter(Boolean).join(" ");

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  iconPosition = "right",
  className,
  fieldClassName,
  wrapperClassName,
  multiline,
  id,
  disabled,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  const hasLeftIcon = !!icon && iconPosition === "left";
  const hasRightIcon = !!icon && iconPosition === "right";

  const fieldClasses = cn(
    "w-full bg-transparent border-none outline-none text-white placeholder-input-placeholder/70",
    "disabled:cursor-not-allowed",
    multiline ? "leading-relaxed resize-none min-h-[6rem]" : "py-3 leading-none",
    hasLeftIcon ? "pl-11" : "pl-4",
    hasRightIcon ? "pr-11" : "pr-4",
    className
  );

  return (
    <div className={cn("group flex w-full flex-col gap-1.5", wrapperClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            "px-1 text-sm font-medium tracking-wide transition-colors",
            error ? "text-error" : "text-white/70 group-focus-within:text-primary",
            disabled && "opacity-50"
          )}
        >
          {label}
        </label>
      )}

      <div
        className={cn(
          "relative flex w-full items-center rounded-xl border bg-input-bg",
          "transition-[border-color,box-shadow,background-color] duration-200",
          error
            ? "border-error/70"
            : "border-input-stroke-hover/60 hover:border-input-stroke-hover focus-within:border-primary focus-within:bg-input-bg/80",
          disabled && "opacity-60 pointer-events-none",
          fieldClassName
        )}
      >
        {hasLeftIcon && (
          <div
            className={cn(
              "pointer-events-none absolute left-3.5 flex items-center justify-center text-white/50 transition-colors",
              "group-focus-within:text-primary",
              multiline ? "top-3" : "top-1/2 -translate-y-1/2"
            )}
          >
            {icon}
          </div>
        )}

        {multiline ? (
          <textarea
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            className={fieldClasses}
          />
        ) : (
          <input
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            {...props}
            className={fieldClasses}
          />
        )}

        {hasRightIcon && (
          <div
            className={cn(
              "absolute right-3 flex items-center justify-center text-white/50 transition-colors",
              "group-focus-within:text-white/80",
              multiline ? "top-3" : "top-1/2 -translate-y-1/2"
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="px-1 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  );
};
