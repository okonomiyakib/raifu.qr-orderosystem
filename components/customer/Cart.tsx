"use client";

import { useCartStore } from "@/lib/store";
import { CartView } from "./CartView";

interface CartProps {
  onCheckout: () => void;
}

export function Cart({ onCheckout }: CartProps) {
  const { items, totalAmount, totalItems, updateQuantity } = useCartStore();

  return (
    <CartView
      items={items}
      totalItems={totalItems}
      totalAmount={totalAmount}
      onUpdateQuantity={updateQuantity}
      onCheckout={onCheckout}
    />
  );
}
