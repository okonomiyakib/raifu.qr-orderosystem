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
 * isOpen: ボトムシートの開閉はUIのみのローカルstate
 */
export function CartView({
  items,
  totalItems,
  totalAmount,
  onUpdateQuantity,
  onCheckout,
}: CartViewProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      {/* ── バックドロップ ── */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── ボトムシート ── */}
      <div
        className={`fixed left-0 right-0 bottom-[72px] z-50 transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-lg mx-auto px-3">
          <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">

            {/* シートヘッダー */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-700">
              <p className="text-white font-bold text-base">カートの内容</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 text-gray-300 text-lg leading-none"
                aria-label="閉じる"
              >
                ✕
              </button>
            </div>

            {/* アイテム一覧 */}
            <div className="max-h-[50vh] overflow-y-auto px-4 divide-y divide-gray-700">
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

          </div>
        </div>
      </div>

      {/* ── 常時表示バー（固定）── */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-lg mx-auto px-3 cart-safe-bottom">
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="w-full bg-gray-800 rounded-2xl shadow-2xl ring-1 ring-white/10 flex items-center gap-3 px-4 py-4 text-left"
            aria-label={isOpen ? "カートを閉じる" : "カートを開く"}
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
                税込合計 · {isOpen ? "▼ 閉じる" : "▲ 内容を見る"}
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
    </>
  );
}
