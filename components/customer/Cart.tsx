"use client";

import { useCartStore } from "@/lib/store";

interface CartProps {
  onCheckout: () => void;
}

export function Cart({ onCheckout }: CartProps) {
  const { items, totalAmount, totalItems, updateQuantity, removeItem } = useCartStore();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-lg mx-auto px-4 pb-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* カートアイテム一覧（展開時） */}
          <div className="max-h-64 overflow-y-auto px-4 pt-4 divide-y divide-gray-700">
            {items.map((item) => (
              <div key={item.itemId} className="flex items-center gap-3 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.name}</p>
                  <p className="text-orange-400 text-sm">¥{item.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-600 text-white flex items-center justify-center text-lg font-bold"
                  >
                    −
                  </button>
                  <span className="text-white w-5 text-center font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg font-bold"
                  >
                    ＋
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 合計＆注文ボタン */}
          <div className="px-4 py-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-gray-400 text-xs">合計（{totalItems()}点）</p>
              <p className="text-white text-xl font-bold">
                ¥{totalAmount().toLocaleString()}
              </p>
            </div>
            <button
              onClick={onCheckout}
              className="bg-orange-500 text-white px-8 py-4 rounded-xl text-lg font-bold active:scale-95 transition-transform shadow-lg"
            >
              注文する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
