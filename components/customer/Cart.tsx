"use client";

import { useCartStore } from "@/lib/store";
import { CartView } from "./CartView";

interface CartProps {
  onCheckout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Cart({ onCheckout, isOpen, onClose }: CartProps) {
  const { items, totalAmount, totalItems, updateQuantity } = useCartStore();

  return (
    <CartView
      items={items}
      totalItems={totalItems}
      totalAmount={totalAmount}
      onUpdateQuantity={updateQuantity}
      onCheckout={onCheckout}
      isOpen={isOpen}
      onClose={onClose}
    />
  );
}
