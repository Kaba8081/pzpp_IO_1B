import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  icon?: React.ReactNode;
  wrapperClassName?: string;
  fieldClassName?: string;
  multiline?: boolean;
}

const cn = (...classes: Array<string | undefined | false>) => classes.filter(Boolean).join(" ");

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className,
  fieldClassName,
  wrapperClassName,
  multiline,
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const sharedClassName = cn(
    "w-full border-none bg-transparent outline-none placeholder-input-placeholder text-start",
    icon ? "pr-10" : "",
    className
  );

  return (
    <div className={cn("group flex w-full flex-col", wrapperClassName)}>
      <div
        className={cn(
          "relative flex w-full flex-col rounded-2xl border bg-input-bg px-5 transition-all duration-300",
          multiline ? "justify-start" : "justify-center",
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

        {multiline ? (
          <textarea
            id={inputId}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            className={cn(sharedClassName, "resize-none leading-relaxed")}
          />
        ) : (
          <input id={inputId} {...props} className={cn(sharedClassName, "leading-none")} />
        )}

        {icon && <div className="absolute right-6 top-1/2 -translate-y-1/2">{icon}</div>}
      </div>

      {error && <p className="text-error ml-1 mt-1">{error}</p>}
    </div>
  );
};
