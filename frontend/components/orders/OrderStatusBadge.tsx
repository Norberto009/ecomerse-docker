import type { OrderStatus } from "@/types";

const config: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pendiente de pago", className: "bg-primary-soft text-ink" },
  paid: { label: "Pagada", className: "bg-success-tint text-success-strong" },
  cancelled: { label: "Cancelada", className: "bg-skeleton text-ink-soft" },
  failed: { label: "Pago fallido", className: "bg-danger-tint text-danger-strong" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = config[status] ?? {
    label: status,
    className: "bg-sunken text-ink-soft",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>{label}</span>
  );
}
