"use client";

import { MenuItem, TaxSettings } from "@/lib/types";
import { displayPrice } from "@/lib/tax";
import { useRouter, useParams } from "next/navigation";
import { MenuCardView } from "./MenuCardView";

interface MenuCardProps {
  item: MenuItem;
  taxSettings: TaxSettings;
}

export function MenuCard({ item, taxSettings }: MenuCardProps) {
  const router = useRouter();
  const { tableId } = useParams<{ tableId: string }>();
  const { amount, label } = displayPrice(
    item.price,
    item.taxType ?? "standard",
    taxSettings
  );

  const navigateToDetail = () => {
    router.push(`/menu/${tableId}/${item.id}`);
  };

  return (
    <MenuCardView
      item={item}
      cartQuantity={undefined}
      amount={amount}
      label={label}
      onAdd={navigateToDetail}
      onUpdateQuantity={() => {}}
      onClick={navigateToDetail}
    />
  );
}
