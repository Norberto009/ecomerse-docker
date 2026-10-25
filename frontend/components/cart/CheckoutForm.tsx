"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { ActionResult } from "@/types";
import { checkoutAction } from "@/app/actions/orders";
import { Alert } from "@/components/ui/Alert";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart-store";

export function CheckoutForm() {
  const { items, total } = useCart();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult>({});

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line-strong bg-surface p-10 text-center">
        <p className="text-muted">No hay productos para pagar.</p>
        <Link href="/" className="mt-4 inline-block font-medium text-primary-strong hover:underline">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = items.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    startTransition(async () => {
      // Si todo sale bien la Server Action redirige a la confirmación y no vuelve aquí.
      setResult(await checkoutAction(payload));
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-line bg-surface p-6">
      {result.error && <Alert>{result.error}</Alert>}

      <ul className="divide-y divide-line-soft">
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="flex justify-between gap-4 py-3 text-sm">
            <span className="text-ink-soft">
              {product.name} <span className="text-faint">× {quantity}</span>
            </span>
            <span className="font-medium">{formatPrice(product.price * quantity)}</span>
          </li>
        ))}
      </ul>

      <div className="flex justify-between border-t border-line pt-4 text-lg font-bold">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-strong disabled:opacity-60"
      >
        {isPending ? "Creando orden..." : "Confirmar compra"}
      </button>
      <p className="text-center text-xs text-muted">
        Se registrará tu orden con estos productos. El stock se reserva al confirmarla.
      </p>
    </form>
  );
}
