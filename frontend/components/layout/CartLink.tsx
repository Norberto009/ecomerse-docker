"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-store";

export function CartLink() {
  const { count } = useCart();

  return (
    <Link href="/cart" className="relative hover:text-primary-strong">
      Carrito
      {count > 0 && (
        <span
          aria-label={`${count} productos en el carrito`}
          className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-primary-soft px-1.5 text-xs font-semibold text-ink"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
