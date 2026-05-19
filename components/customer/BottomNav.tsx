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
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#1A1A3E] border-t border-[#2A2A5A] nav-safe-bottom">
      <div className="max-w-lg mx-auto flex h-14">

        {/* MENU（現在地）🥷ブランドマーク */}
        <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
          <span className="text-[20px] leading-none">🥷</span>
          <span className="text-[10px] font-bold text-[#C8973D]">MENU</span>
        </div>

        {/* 検索（未実装） */}
        <div className="flex-1 flex flex-col items-center justify-center gap-0.5 opacity-25">
          <span className="text-[20px] leading-none">🔍</span>
          <span className="text-[10px] font-semibold text-gray-400">検索</span>
        </div>

        {/* 注文履歴（未実装） */}
        <div className="flex-1 flex flex-col items-center justify-center gap-0.5 opacity-25">
          <span className="text-[20px] leading-none">📋</span>
          <span className="text-[10px] font-semibold text-gray-400">注文履歴</span>
        </div>

        {/* カート */}
        <button
          type="button"
          onClick={hasItems ? onCartToggle : undefined}
          disabled={!hasItems}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors rounded-none ${
            hasItems
              ? isCartOpen
                ? "bg-[#2A2A5A] text-[#C8973D]"
                : "text-[#C8973D] active:bg-[#2A2A5A]"
              : "opacity-25 text-gray-400"
          }`}
          aria-label={isCartOpen ? "カートを閉じる" : "カートを開く"}
        >
          <div className="relative">
            <span className="text-[20px] leading-none">🛒</span>
            {count > 0 && (
              <span
                key={count}
                className="absolute -top-1.5 -right-2 bg-[#B22222] text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5 leading-none animate-badge-bounce"
              >
                {count > 9 ? "9+" : count}
              </span>
            )}
          </div>
          <span
            key={hasItems ? amount : "empty"}
            className={`text-[10px] font-bold tabular-nums leading-none${hasItems ? " animate-amount-flash" : ""}`}
          >
            {hasItems ? `¥${amount.toLocaleString()}` : "カート"}
          </span>
        </button>

      </div>
    </nav>
  );
}
