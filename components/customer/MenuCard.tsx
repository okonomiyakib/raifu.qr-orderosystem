"use client";

import { MenuItem, TaxSettings } from "@/lib/types";
import { useCartStore } from "@/lib/store";
import { displayPrice } from "@/lib/tax";
import toast from "react-hot-toast";
import { MenuCardView } from "./MenuCardView";

interface MenuCardProps {
  item: MenuItem;
  taxSettings: TaxSettings;
}

export function MenuCard({ item, taxSettings }: MenuCardProps) {
  const { addItem, items, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.itemId === item.id);
  const { amount, label } = displayPrice(item.price, item.taxType ?? "standard", taxSettings);

  const handleAdd = () => {
    addItem({
      itemId: item.id,
      name: item.name,
      price: item.price,
      taxType: item.taxType ?? "standard",
      quantity: 1,
    });
    toast.success(`${item.name}をカートに追加しました`);
  };

  return (
    <MenuCardView
      item={item}
      cartQuantity={cartItem?.quantity}
      amount={amount}
      label={label}
      onAdd={handleAdd}
      onUpdateQuantity={(newQty) => updateQuantity(item.id, newQty)}
    />
  );
}
