"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { MenuItem } from "@/lib/types";

interface MenuCardViewProps {
  item: MenuItem;
  cartQuantity: number | undefined;
  amount: number;
  label: string;
  onAdd: () => void;
  onUpdateQuantity: (newQty: number) => void;
  optionSelector?: ReactNode; // トッピング選択UIスロット（任意）
  onClick?: () => void;       // カード全体のタップハンドラ（任意）
}

/**
 * Presentational component — ロジックなし、UIのみ
 * ロジック/状態管理は MenuCard.tsx (Container) が担当
 */
export function MenuCardView({
  item,
  cartQuantity,
  amount,
  label,
  onAdd,
  onUpdateQuantity,
  optionSelector,
  onClick,
}: MenuCardViewProps) {
  return (
    <div
      className="bg-white rounded-xl border border-[#E8E0D5] shadow-[0_2px_8px_rgba(0,0,0,0.07)] overflow-hidden active:scale-95 transition-transform"
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      {/* 商品画像: aspect-ratio固定でサイズ統一 */}
      <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
        <Image
          src={
            item.imageUrl ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
          }
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, 33vw"
          unoptimized
        />

        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white font-bold text-base tracking-wider drop-shadow">
              売り切れ
            </span>
          </div>
        )}

        {/* カート内数量バッジ */}
        {cartQuantity != null && (
          <div className="absolute top-1.5 right-1.5 bg-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow-md ring-2 ring-white">
            {cartQuantity}
          </div>
        )}

        {item.taxType === "reduced" && (
          <div className="absolute top-1.5 left-1.5 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium shadow-sm">
            軽減
          </div>
        )}
      </div>

      {/* 商品情報: 価格→名前 の順（高速選択優先） */}
      <div className="p-2.5 flex flex-col gap-1">
        {/* 価格（最優先表示） */}
        <p className="text-base font-bold text-[#B22222] leading-none">
          ¥{amount.toLocaleString()}
          <span className="text-xs text-gray-400 font-normal ml-1">({label})</span>
        </p>

        {/* 商品名: 2行まで */}
        <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 min-h-[2.5rem]">
          {item.name}
        </h3>

        {/* トッピング選択UIスロット */}
        {optionSelector}

        {/* 注文ボタン */}
        {cartQuantity != null ? (
          <div className="flex items-center justify-between gap-1 mt-1">
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateQuantity(cartQuantity - 1); }}
              className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xl font-bold active:scale-90 transition-transform"
              aria-label="減らす"
            >
              −
            </button>
            <span className="text-lg font-bold text-gray-800 w-6 text-center tabular-nums">
              {cartQuantity}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onUpdateQuantity(cartQuantity + 1); }}
              className="w-10 h-10 rounded-full bg-[#B22222] text-white flex items-center justify-center text-xl font-bold active:scale-90 transition-transform"
              aria-label="増やす"
            >
              ＋
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(); }}
            disabled={!item.isAvailable}
            className="mt-1 w-full py-2.5 bg-[#B22222] disabled:bg-gray-300 text-white rounded-lg text-sm font-bold active:scale-95 transition-transform shadow-sm"
          >
            ＋ 注文
          </button>
        )}
      </div>
    </div>
  );
}
