"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorFallbackProps {
  error: Error & { digest?: string };
  retry: () => void;
  title?: string;
}

/** UI común para los error.tsx de cada segmento. */
export function ErrorFallback({ error, retry, title = "Algo salió mal" }: ErrorFallbackProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-xl border border-danger-line bg-danger-soft p-8 text-center">
      <h2 className="text-lg font-bold text-danger-strong">{title}</h2>
      <p className="text-sm text-danger">
        No pudimos cargar esta sección. Revisa que la API esté disponible e inténtalo de nuevo.
      </p>
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={retry}
          className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger-hover"
        >
          Reintentar
        </button>
        <Link href="/" className="rounded-lg border border-danger-line px-4 py-2 text-sm text-danger hover:bg-danger-tint">
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
