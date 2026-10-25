import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-sm transition hover:shadow-md">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] bg-sunken">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
              priority={priority}
            />
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex-1 space-y-1">
          <Link
            href={`/products/${product.id}`}
            className="line-clamp-2 font-semibold text-ink hover:text-primary-strong"
          >
            {product.name}
          </Link>
          <p className="text-lg font-bold text-ink">{formatPrice(product.price)}</p>
          <p className={`text-xs ${product.stock > 0 ? "text-muted" : "text-danger"}`}>
            {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
          </p>
        </div>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
