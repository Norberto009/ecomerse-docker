import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="rounded-lg border border-primary px-3 py-1.5 text-primary-strong transition hover:bg-primary-tint"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="rounded-lg bg-primary px-3 py-1.5 text-white transition hover:bg-primary-strong"
        >
          Registrarse
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/orders" className="hover:text-primary-strong">
        Mis órdenes
      </Link>
      <Link
        href="/profile"
        title="Mi perfil"
        className="hidden text-muted hover:text-primary-strong sm:inline"
      >
        {user.name}
      </Link>
      <form action="/api/auth/logout" method="post">
        <button type="submit" className="text-muted hover:text-danger">
          Salir
        </button>
      </form>
    </div>
  );
}
