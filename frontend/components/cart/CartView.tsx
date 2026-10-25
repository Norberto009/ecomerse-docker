"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { removeFromCart, setQuantity, useCart } from "@/lib/cart-store";

export function CartView() {
  const { items, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line-strong bg-surface p-10 text-center">
        <p className="text-muted">No hay productos, puedes agregar productos a tu Carrito.</p>
        <Link href="/" className="mt-4 inline-block font-medium text-primary-strong hover:underline">
          Ver Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="flex gap-4 p-4">
            <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-sunken">
              {product.image_url && (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between gap-2">
              <div className="flex justify-between gap-3">
                <Link href={`/products/${product.id}`} className="font-medium text-ink hover:text-primary-strong">
                  {product.name}
                </Link>
                <span className="font-semibold">{formatPrice(product.price * quantity)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center rounded-lg border border-line-strong">
                  <button
                    type="button"
                    aria-label={`Quitar una unidad de ${product.name}`}
                    onClick={() => setQuantity(product.id, quantity - 1)}
                    className="px-3 py-1 text-muted hover:bg-sunken"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-sm" aria-live="polite">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Agregar una unidad de ${product.name}`}
                    onClick={() => setQuantity(product.id, quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="px-3 py-1 text-muted hover:bg-sunken disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(product.id)}
                  className="inline-flex items-center gap-1 text-sm text-danger hover:underline"
                >
                  <svg
                    aria-hidden
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    className="size-3.5"
                  >
                    <path d="M5 5l10 10M15 5L5 15" />
                  </svg>
                  Remover del Carrito
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit space-y-4 rounded-xl border border-line bg-surface p-5">
        <h2 className="font-semibold text-ink">Resumen</h2>
        <div className="flex justify-between text-sm text-muted">
          <span>Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-lg font-bold">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
        <Link
          href="/checkout"
          className="block rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-primary-strong"
        >
          Continuar con la compra
        </Link>
      </aside>
    </div>
  );
}
