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
}: MenuCardViewProps) {
  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-200 hover:-translate-y-0.5">
      {/* 商品画像 */}
      <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
        <Image
          src={
            item.imageUrl ||
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
          }
          alt={item.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
        />
        {/* 底部グラデーション（文字視認性向上） */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white font-bold text-xl tracking-wider drop-shadow">
              売り切れ
            </span>
          </div>
        )}

        {/* カート内数量バッジ */}
        {cartQuantity != null && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-base font-bold shadow-md ring-2 ring-white">
            {cartQuantity}
          </div>
        )}

        {item.taxType === "reduced" && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">
            軽減税率
          </div>
        )}
      </div>

      {/* 商品情報 */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-1 leading-snug">
          {item.name}
        </h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* トッピング選択UIスロット */}
        {optionSelector}

        <div className="flex items-center justify-between gap-2 mt-4">
          {/* 価格 */}
          <div>
            <span className="text-2xl font-bold text-orange-600">
              ¥{amount.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400 ml-1">（{label}）</span>
          </div>

          {/* カートに入っていれば −/数量/＋、なければ「注文」ボタン */}
          {cartQuantity != null ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(cartQuantity - 1)}
                className="w-12 h-12 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-2xl font-bold active:scale-90 transition-transform"
                aria-label="減らす"
              >
                −
              </button>
              <span className="text-xl font-bold text-gray-800 w-7 text-center tabular-nums">
                {cartQuantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(cartQuantity + 1)}
                className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold active:scale-90 transition-transform"
                aria-label="増やす"
              >
                ＋
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
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
