interface AlertProps {
  children: React.ReactNode;
  variant?: "error" | "success" | "info";
}

const styles = {
  error: "border-danger-line bg-danger-soft text-danger",
  success: "border-success-line bg-success-soft text-success",
  info: "border-primary-soft bg-primary-tint text-primary-strong",
} as const;

export function Alert({ children, variant = "error" }: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 text-sm ${styles[variant]}`}
    >
      {children}
    </div>
  );
}
