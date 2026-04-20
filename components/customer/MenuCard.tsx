"use client";

import { useState } from "react";
import { MenuItem, TaxSettings, Option } from "@/lib/types";
import { useCartStore } from "@/lib/store";
import { displayPrice } from "@/lib/tax";
import toast from "react-hot-toast";
import { MenuCardView } from "./MenuCardView";
import { OptionSelector } from "./OptionSelector";

interface MenuCardProps {
  item: MenuItem;
  taxSettings: TaxSettings;
}

export function MenuCard({ item, taxSettings }: MenuCardProps) {
  const { addItem, items, updateQuantity } = useCartStore();
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

  const hasOptions = (item.options ?? []).length > 0;

  // オプションなし商品のカート状態（既存ロジック維持）
  const cartItem = hasOptions ? undefined : items.find((i) => i.itemId === item.id);

  const optionTotal = selectedOptions.reduce((sum, o) => sum + o.price, 0);
  const { amount, label } = displayPrice(
    item.price + optionTotal,
    item.taxType ?? "standard",
    taxSettings
  );

  const handleToggleOption = (option: Option) => {
    setSelectedOptions((prev) =>
      prev.some((o) => o.id === option.id)
        ? prev.filter((o) => o.id !== option.id)
        : [...prev, option]
    );
  };

  /**
   * オプション込みでカートに追加するラッパー関数
   * 既存の addItem は変更せずそのまま呼び出す
   */
  const addItemWithOptions = () => {
    // 選択オプションの組み合わせごとに一意のIDを生成（既存dedup機能を活用）
    const cartItemId =
      selectedOptions.length > 0
        ? `${item.id}::${selectedOptions.map((o) => o.id).sort().join(",")}`
        : item.id;

    addItem({
      itemId: cartItemId,
      name: item.name,
      price: item.price + optionTotal,
      taxType: item.taxType ?? "standard",
      quantity: 1,
      selectedOptions: selectedOptions.length > 0 ? selectedOptions : undefined,
    });
    toast.success(`${item.name}をカートに追加しました`);
  };

  const handleAdd = () => {
    if (hasOptions) {
      addItemWithOptions();
    } else {
      // 既存ロジックをそのまま維持
      addItem({
        itemId: item.id,
        name: item.name,
        price: item.price,
        taxType: item.taxType ?? "standard",
        quantity: 1,
      });
      toast.success(`${item.name}をカートに追加しました`);
    }
  };

  return (
    <MenuCardView
      item={item}
      cartQuantity={cartItem?.quantity}
      amount={amount}
      label={label}
      onAdd={handleAdd}
      onUpdateQuantity={(newQty) => updateQuantity(item.id, newQty)}
      optionSelector={
        hasOptions ? (
          <OptionSelector
            options={item.options!}
            selectedOptions={selectedOptions}
            onToggle={handleToggleOption}
            basePrice={item.price}
          />
        ) : undefined
      }
    />
  );
}
