import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Carrito" };

export default function CartPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Carrito</h1>
      <h5 className="text-xl font-bold tracking-tight">Ahora con Envio domicilio</h5>
      <CartView />
    </div>
  );
}
