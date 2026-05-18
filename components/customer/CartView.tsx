"use client";

import { CartItem } from "@/lib/types";

interface CartViewProps {
  items: CartItem[];
  totalItems: () => number;
  totalAmount: () => number;
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onCheckout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Presentational component — UIのみ
 * ロジック/状態管理は Cart.tsx (Container) が担当
 * isOpen/onClose: BottomNav のカートタブから制御（page.tsx で管理）
 */
export function CartView({
  items,
  totalItems,
  totalAmount,
  onUpdateQuantity,
  onCheckout,
  isOpen,
  onClose,
}: CartViewProps) {
  if (items.length === 0) return null;

  return (
    <>
      {/* バックドロップ */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ボトムシート: bottom-14 で BottomNav の上に表示 */}
      <div
        className={`fixed left-0 right-0 bottom-14 z-50 transition-transform duration-300 ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-lg mx-auto px-3">
          <div className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">

            {/* シートヘッダー */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-700">
              <p className="text-white font-bold text-base">
                カートの内容（{totalItems()}点）
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700 text-gray-300 text-lg leading-none"
                aria-label="閉じる"
              >
                ✕
              </button>
            </div>

            {/* アイテム一覧 */}
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
                      className="w-11 h-11 rounded-full bg-gray-600 text-white flex items-center justify-center text-2xl font-bold active:scale-90 transition-all"
                      aria-label="減らす"
                    >
                      −
                    </button>
                    <span className="text-white text-xl font-bold w-7 text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.itemId, item.quantity + 1)}
                      className="w-11 h-11 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold active:scale-90 transition-all"
                      aria-label="増やす"
                    >
                      ＋
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 合計・注文ボタン */}
            <div className="px-4 py-4 border-t border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm">税込合計</span>
                <span className="text-white text-2xl font-bold tabular-nums">
                  ¥{totalAmount().toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={onCheckout}
                className="w-full py-4 bg-orange-500 text-white rounded-xl text-lg font-bold active:scale-95 transition-transform shadow-lg"
              >
                注文する
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
