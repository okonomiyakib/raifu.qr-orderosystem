"use client";

import Image from "next/image";
import { MenuItem, TaxSettings } from "@/lib/types";
import { useCartStore } from "@/lib/store";
import { displayPrice } from "@/lib/tax";
import toast from "react-hot-toast";

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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 商品画像 */}
      <div className="relative h-44 w-full bg-gray-100">
        <Image
          src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-xl">売り切れ</span>
          </div>
        )}
        {/* カート内数量バッジ */}
        {cartItem && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-base font-bold shadow">
            {cartItem.quantity}
          </div>
        )}
        {item.taxType === "reduced" && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            軽減税率
          </div>
        )}
      </div>

      {/* 商品情報 */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-1 leading-snug">{item.name}</h3>
        <p className="text-base text-gray-500 mb-4 line-clamp-2 leading-snug">{item.description}</p>

        <div className="flex items-center justify-between gap-2">
          {/* 価格 */}
          <div>
            <span className="text-2xl font-bold text-orange-600">
              ¥{amount.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400 ml-1">（{label}）</span>
          </div>

          {/* カートに入っていれば −/数量/＋、なければ「注文」ボタン */}
          {cartItem ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(cartItem.itemId, cartItem.quantity - 1)}
                className="w-12 h-12 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-2xl font-bold active:scale-90 transition-transform"
                aria-label="減らす"
              >
                −
              </button>
              <span className="text-xl font-bold text-gray-800 w-7 text-center">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => updateQuantity(cartItem.itemId, cartItem.quantity + 1)}
                className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold active:scale-90 transition-transform"
                aria-label="増やす"
              >
                ＋
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={!item.isAvailable}
              className="flex items-center gap-1 bg-orange-500 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl text-lg font-bold active:scale-95 transition-transform min-h-[52px]"
            >
              <span className="text-xl leading-none">+</span>
              注文
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
