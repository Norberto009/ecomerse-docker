import { Suspense } from "react";
import Link from "next/link";
import { CartLink } from "./CartLink";
import { UserMenu } from "./UserMenu";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-primary">
          Basic Ecommerse
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium text-ink-soft">
          <Link href="/" className="hover:text-primary-strong">
            Catálogo
          </Link>
          <CartLink />
          {/* Lee la cookie de sesión: va en Suspense para no bloquear el resto de la página. */}
          <Suspense fallback={<span className="h-5 w-24 animate-pulse rounded bg-skeleton" />}>
            <UserMenu />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
