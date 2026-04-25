"use client";

import { useState } from "react";
import { CartItem } from "@/lib/types";

interface CartViewProps {
  items: CartItem[];
  totalItems: () => number;
  totalAmount: () => number;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onCheckout: () => void;
}

/**
 * Presentational component — UIのみ
 * ロジック/状態管理は Cart.tsx (Container) が担当
 * isExpanded: 展開/折りたたみはUIのみのローカルstate
 */
export function CartView({
  items,
  totalItems,
  totalAmount,
  onUpdateQuantity,
  onCheckout,
}: CartViewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-lg mx-auto px-3 cart-safe-bottom">
        <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">

          {/* アイテム一覧：展開時のみ表示 */}
          {isExpanded && (
            <div className="max-h-[40vh] overflow-y-auto px-4 divide-y divide-gray-700">
              {items.map((item) => (
                <div key={item.itemId} className="flex items-center gap-3 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-base font-semibold truncate">
                      {item.name}
                    </p>
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <p className="text-gray-400 text-xs mt-0.5 truncate">
                        {item.selectedOptions.map((o) => o.name).join("、")}
                      </p>
                    )}
                    <p className="text-orange-400 text-sm mt-0.5">
                      ¥{item.price.toLocaleString()}
                    </p>
                  </div>
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
          )}

          {/* 常時表示バー */}
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className="w-full flex items-center gap-3 px-4 py-4 border-t border-gray-700 text-left"
            aria-label={isExpanded ? "カートを閉じる" : "カートを開く"}
          >
            {/* 商品数バッジ */}
            <div className="relative flex-shrink-0">
              <span className="text-2xl">🛒</span>
              <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-xs font-black rounded-full w-5 h-5 flex items-center justify-center tabular-nums leading-none">
                {totalItems()}
              </span>
            </div>

            {/* 合計金額 */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-xl font-bold tabular-nums leading-tight">
                ¥{totalAmount().toLocaleString()}
              </p>
              <p className="text-gray-400 text-xs leading-none mt-0.5">
                税込合計 · {isExpanded ? "▼ 閉じる" : "▲ 内容を見る"}
              </p>
            </div>

            {/* 注文ボタン */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onCheckout(); }}
              className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-3 rounded-xl text-base font-bold active:scale-95 transition-all shadow-lg shadow-orange-900/30 min-h-[52px] flex-shrink-0"
            >
              注文する
            </button>
          </button>

        </div>
      </div>
    </div>
  );
}
