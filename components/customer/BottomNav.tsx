"use client";

import { useCartStore } from "@/lib/store";

interface BottomNavProps {
  onCartToggle: () => void;
  isCartOpen: boolean;
}

export function BottomNav({ onCartToggle, isCartOpen }: BottomNavProps) {
  const { items, totalItems, totalAmount } = useCartStore();
  const count = totalItems();
  const amount = totalAmount();
  const hasItems = items.length > 0;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 nav-safe-bottom">
      <div className="max-w-lg mx-auto flex h-14">

        {/* MENU（現在地） */}
        <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
          <span className="text-[22px] leading-none">🍽️</span>
          <span className="text-[10px] font-bold text-orange-500">MENU</span>
        </div>

        {/* 検索（未実装） */}
        <div className="flex-1 flex flex-col items-center justify-center gap-0.5 opacity-30">
          <span className="text-[22px] leading-none">🔍</span>
          <span className="text-[10px] font-semibold text-gray-500">検索</span>
        </div>

        {/* 注文履歴（未実装） */}
        <div className="flex-1 flex flex-col items-center justify-center gap-0.5 opacity-30">
          <span className="text-[22px] leading-none">📋</span>
          <span className="text-[10px] font-semibold text-gray-500">注文履歴</span>
        </div>

        {/* カート */}
        <button
          type="button"
          onClick={hasItems ? onCartToggle : undefined}
          disabled={!hasItems}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors rounded-none ${
            hasItems
              ? isCartOpen
                ? "bg-orange-50 text-orange-600"
                : "text-orange-500 active:bg-orange-50"
              : "opacity-30 text-gray-500"
          }`}
          aria-label={isCartOpen ? "カートを閉じる" : "カートを開く"}
        >
          <div className="relative">
            <span className="text-[22px] leading-none">🛒</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 leading-none">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tabular-nums leading-none">
            {hasItems ? `¥${amount.toLocaleString()}` : "カート"}
          </span>
        </button>

      </div>
    </nav>
  );
}
