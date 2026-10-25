import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCartOnMount } from "@/components/cart/ClearCartOnMount";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Alert } from "@/components/ui/Alert";
import { ApiError } from "@/lib/api/errors";
import { getOrder } from "@/lib/api/orders";
import { firstParam, formatPrice, toPositiveInt } from "@/lib/format";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Confirmación de compra" };

export default async function CheckoutSuccessPage({
  searchParams,
}: PageProps<"/checkout/success">) {
  const orderId = toPositiveInt(firstParam((await searchParams).order_id), 0);
  await requireUser(`/checkout/success?order_id=${orderId}`);
  if (orderId === 0) notFound();

  let order;
  try {
    order = await getOrder(orderId);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) notFound();
    throw error;
  }

  const isPaid = order.status === "paid";

  return (
    <div className="mx-auto max-w-xl space-y-6 text-center">
      <ClearCartOnMount />

      <div className="space-y-2">
        <p className="text-5xl">{isPaid ? "✅" : "⏳"}</p>
        <h1 className="text-3xl font-bold tracking-tight">
          {isPaid ? "¡Compra confirmada!" : "¡Orden registrada!"}
        </h1>
        <p className="text-muted">
          Orden #{order.id} · <OrderStatusBadge status={order.status} />
        </p>
      </div>

      {!isPaid && (
        <Alert variant="info">
          Tu orden quedó pendiente de pago. El pago se registra manualmente (efectivo,
          transferencia, etc.) y el estado se actualizará aquí cuando se confirme.
        </Alert>
      )}

      <ul className="divide-y divide-line-soft rounded-xl border border-line bg-surface text-left">
        {order.items?.map((item) => (
          <li key={item.id} className="flex justify-between gap-4 px-5 py-3 text-sm">
            <span>
              {item.product_name ?? `Producto #${item.product_id}`}{" "}
              <span className="text-faint">× {item.quantity}</span>
            </span>
            <span className="font-medium">{formatPrice(item.subtotal, order.currency)}</span>
          </li>
        ))}
        <li className="flex justify-between px-5 py-3 font-bold">
          <span>Total</span>
          <span>{formatPrice(order.total, order.currency)}</span>
        </li>
      </ul>

      <div className="flex justify-center gap-3">
        <Link
          href="/orders"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-strong"
        >
          Ver mis órdenes
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-line-strong px-4 py-2 text-sm font-medium hover:bg-sunken"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
