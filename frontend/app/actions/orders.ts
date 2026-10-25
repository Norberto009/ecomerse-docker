"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import type { ActionResult, Order, OrderItemInput } from "@/types";
import { apiFetch } from "@/lib/api/client";
import { toActionResult } from "@/lib/api/errors";
import { ORDERS_TAG } from "@/lib/api/orders";
import { PRODUCTS_TAG } from "@/lib/api/products";

function isValidItem(item: OrderItemInput) {
  return Number.isInteger(item.product_id) && Number.isInteger(item.quantity) && item.quantity > 0;
}

/** Una orden nueva descuenta stock y aparece en el historial: invalidamos ambas lecturas. */
function refreshAfterOrderChange() {
  updateTag(PRODUCTS_TAG);
  updateTag(ORDERS_TAG);
  revalidatePath("/orders");
  revalidatePath("/");
}

/**
 * Crea la orden con el carrito (POST /orders) y lleva a la confirmación.
 * La API valida stock y congela precios; la orden queda en estado "pending".
 */
export async function checkoutAction(items: OrderItemInput[]): Promise<ActionResult> {
  if (items.length === 0 || !items.every(isValidItem)) {
    return { error: "Tu carrito está vacío o tiene cantidades inválidas." };
  }

  let orderId: number;

  try {
    const { data: order } = await apiFetch<{ data: Order }>("/orders", {
      method: "POST",
      body: { items },
    });
    orderId = order.id;
  } catch (error) {
    return toActionResult(error);
  }

  refreshAfterOrderChange();
  redirect(`/checkout/success?order_id=${orderId}`);
}
