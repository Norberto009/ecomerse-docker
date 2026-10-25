interface TextFieldProps extends React.ComponentProps<"input"> {
  label: string;
  name: string;
  errors?: string[];
}

export function TextField({ label, name, errors, className = "", ...props }: TextFieldProps) {
  const errorId = `${name}-error`;
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-ink-soft">
        {label}
      </label>
      <input
        id={name}
        name={name}
        aria-invalid={errors ? true : undefined}
        aria-describedby={errors ? errorId : undefined}
        className={`w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-ink shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-soft/40 disabled:opacity-60 ${className}`}
        {...props}
      />
      {errors && (
        <p id={errorId} className="text-xs text-danger">
          {errors.join(" ")}
        </p>
      )}
    </div>
  );
}
