"use client";

import { useState } from "react";
import { MenuItem, TaxSettings, Option } from "@/lib/types";
import { useCartStore } from "@/lib/store";
import { displayPrice } from "@/lib/tax";
import toast from "react-hot-toast";
import { MenuCardView } from "./MenuCardView";
import { OptionModal } from "./OptionModal";

interface MenuCardProps {
  item: MenuItem;
  taxSettings: TaxSettings;
}

export function MenuCard({ item, taxSettings }: MenuCardProps) {
  const { addItem, items, updateQuantity } = useCartStore();
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <>
      <MenuCardView
        item={item}
        cartQuantity={cartItem?.quantity}
        amount={amount}
        label={label}
        onAdd={handleAdd}
        onUpdateQuantity={(newQty) => updateQuantity(item.id, newQty)}
        optionSelector={
          hasOptions ? (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-2 border border-orange-400 text-orange-500 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
              >
                トッピングを選択
                {selectedOptions.length > 0 && `（${selectedOptions.length}件）`}
              </button>
              {selectedOptions.length > 0 && (
                <p className="text-xs text-gray-500 mt-2 truncate">
                  {selectedOptions.map((o) => o.name).join("、")}
                </p>
              )}
            </div>
          ) : undefined
        }
      />
      {hasOptions && isModalOpen && (
        <OptionModal
          options={item.options!}
          selectedOptions={selectedOptions}
          onToggle={handleToggleOption}
          basePrice={item.price}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
