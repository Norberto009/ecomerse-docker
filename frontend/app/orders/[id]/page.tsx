import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Alert } from "@/components/ui/Alert";
import { ApiError } from "@/lib/api/errors";
import { getOrder } from "@/lib/api/orders";
import { formatDate, formatPrice, toPositiveInt } from "@/lib/format";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Detalle de orden" };

export default async function OrderDetailPage({ params }: PageProps<"/orders/[id]">) {
  const id = toPositiveInt((await params).id, 0);
  await requireUser(`/orders/${id}`);
  if (id === 0) notFound();

  let order;
  try {
    order = await getOrder(id);
  } catch (error) {
    // 403 = la orden es de otro usuario: no revelamos que existe.
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/orders" className="text-sm text-primary-strong hover:underline">
        ← Volver al historial
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orden #{order.id}</h1>
          <p className="text-sm text-muted">{formatDate(order.created_at)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <ul className="divide-y divide-line-soft rounded-xl border border-line bg-surface">
        {order.items?.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 px-5 py-3 text-sm">
            <span>
              {item.product_name ?? `Producto #${item.product_id}`}{" "}
              <span className="text-faint">
                × {item.quantity} · {formatPrice(item.unit_price, order.currency)} c/u
              </span>
            </span>
            <span className="font-medium">{formatPrice(item.subtotal, order.currency)}</span>
          </li>
        ))}
        <li className="flex justify-between px-5 py-3 text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(order.total, order.currency)}</span>
        </li>
      </ul>

      {order.status === "pending" && (
        <Alert variant="info">
          Esta orden está pendiente de pago. El pago se registra manualmente y el estado se
          actualizará cuando se confirme.
        </Alert>
      )}
    </div>
  );
}
