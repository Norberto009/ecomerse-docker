import { redirect } from "next/navigation";
import Link from "next/link";
import { ApiError } from "@/lib/api/errors";
import { getOrdersByUser } from "@/lib/api/orders";
import { formatDate, formatPrice } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { Pagination } from "@/components/ui/Pagination";
import { OrderStatusBadge } from "./OrderStatusBadge";

/** Server Component async para el historial; se envuelve en <Suspense> en la página. */
export async function OrdersList({ page }: { page: number }) {
  const user = await requireUser("/orders");

  let result;
  try {
    result = await getOrdersByUser(user.id, page);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect("/login?next=/orders");
    throw error; // lo captura app/orders/error.tsx
  }

  const { data: orders, meta } = result;

  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-line-strong bg-surface p-10 text-center text-muted">
        Todavía no tienes compras.{" "}
        <Link href="/" className="font-medium text-primary-strong hover:underline">
          Ir al catálogo
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="rounded-xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <Link href={`/orders/${order.id}`} className="font-semibold text-ink hover:text-primary-strong">
                  Orden #{order.id}
                </Link>
                <p className="text-xs text-muted">{formatDate(order.created_at)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <OrderStatusBadge status={order.status} />
                <span className="text-lg font-bold">{formatPrice(order.total, order.currency)}</span>
              </div>
            </div>

            <ul className="mt-3 space-y-1 border-t border-line-soft pt-3 text-sm text-muted">
              {order.items?.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.product_name ?? `Producto #${item.product_id}`} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.subtotal, order.currency)}</span>
                </li>
              ))}
            </ul>

          </li>
        ))}
      </ul>

      <Pagination basePath="/orders" page={meta.current_page} lastPage={meta.last_page} />
    </div>
  );
}

export function OrdersListSkeleton() {
  return (
    <ul className="space-y-4" aria-hidden>
      {Array.from({ length: 3 }, (_, i) => (
        <li key={i} className="space-y-3 rounded-xl border border-line bg-surface p-5">
          <div className="h-5 w-32 animate-pulse rounded bg-skeleton" />
          <div className="h-4 w-48 animate-pulse rounded bg-skeleton" />
          <div className="h-4 w-full animate-pulse rounded bg-skeleton" />
        </li>
      ))}
    </ul>
  );
}
