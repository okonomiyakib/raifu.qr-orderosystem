"use client";

import { CartItem } from "@/lib/types";

interface CartViewProps {
  items: CartItem[];
  totalItems: () => number;
  totalAmount: () => number;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onCheckout: () => void;
}

/**
 * Presentational component — ロジックなし、UIのみ
 * ロジック/状態管理は Cart.tsx (Container) が担当
 */
export function CartView({
  items,
  totalItems,
  totalAmount,
  onUpdateQuantity,
  onCheckout,
}: CartViewProps) {
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-lg mx-auto px-3 cart-safe-bottom">
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">

          {/* カートヘッダー */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <span className="text-base">🛒</span>
              <span className="text-white font-bold text-sm">カート</span>
            </div>
            <span className="text-gray-400 text-xs">{totalItems()}点</span>
          </div>

          {/* カートアイテム一覧 */}
          <div className="max-h-[35vh] sm:max-h-52 overflow-y-auto px-4 divide-y divide-gray-700">
            {items.map((item) => (
              <div key={item.itemId} className="flex items-center gap-3 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-base font-semibold truncate">
                    {item.name}
                  </p>
                  <p className="text-orange-400 text-sm mt-0.5">
                    ¥{item.price.toLocaleString()}
                  </p>
                </div>
                {/* ＋／－ボタン */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <button
                    onClick={() => onUpdateQuantity(item.itemId, item.quantity - 1)}
                    className="w-11 h-11 rounded-full bg-gray-600 hover:bg-gray-500 text-white flex items-center justify-center text-2xl font-bold active:scale-90 transition-all"
                    aria-label="減らす"
                  >
                    −
                  </button>
                  <span className="text-white text-xl font-bold w-7 text-center tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.itemId, item.quantity + 1)}
                    className="w-11 h-11 rounded-full bg-orange-500 hover:bg-orange-400 text-white flex items-center justify-center text-2xl font-bold active:scale-90 transition-all"
                    aria-label="増やす"
                  >
                    ＋
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 合計 & 注文ボタン */}
          <div className="px-4 py-3.5 flex items-center gap-3 border-t border-gray-700">
            <div className="flex-1">
              <p className="text-white text-2xl font-bold leading-tight tabular-nums">
                ¥{totalAmount().toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">税込合計</p>
            </div>
            <button
              onClick={onCheckout}
              className="bg-orange-500 hover:bg-orange-400 text-white px-8 py-3.5 rounded-xl text-xl font-bold active:scale-95 transition-all shadow-lg shadow-orange-900/30 min-h-[52px]"
            >
              注文する
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
