import type { Metadata } from "next";
import { formatDate } from "@/lib/format";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Mi perfil" };

export default async function ProfilePage() {
  const user = await requireUser("/profile");

  const fields = [
    { label: "Nombre", value: user.name },
    { label: "Correo electrónico", value: user.email },
    { label: "Estado de la cuenta", value: user.is_active === false ? "Inactiva" : "Activa" },
    ...(user.created_at
      ? [{ label: "Miembro desde", value: formatDate(user.created_at) }]
      : []),
  ];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <div
          aria-hidden
          className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white"
        >
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi perfil</h1>
          <p className="text-muted">Datos de tu cuenta</p>
        </div>
      </div>

      <dl className="divide-y divide-line-soft rounded-xl border border-line bg-surface">
        {fields.map(({ label, value }) => (
          <div key={label} className="flex justify-between gap-4 px-5 py-4 text-sm">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right font-medium text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
