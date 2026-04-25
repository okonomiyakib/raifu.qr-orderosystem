"use client";

import { Order, OrderStatus } from "@/lib/types";

interface OrderCardViewProps {
  order: Order & { id: string };
  loading: boolean;
  itemsDone: Record<string, number>;
  totalAll: number;
  doneAll: number;
  allServed: boolean;
  progressPct: number;
  timeStr: string;
  elapsedMin: number;
  isPending: boolean;
  isPreparing: boolean;
  isServed: boolean;
  cardClass: string;
  headerBgClass: string;
  onUpdateCount: (idx: number, delta: number) => void;
  onAllServed: () => void;
}

/**
 * Presentational component — ロジックなし、UIのみ
 * ロジック/状態管理は OrderCard.tsx (Container) が担当
 */
export function OrderCardView({
  order,
  loading,
  itemsDone,
  totalAll,
  doneAll,
  allServed,
  progressPct,
  timeStr,
  elapsedMin,
  isPending,
  isPreparing,
  isServed,
  cardClass,
  headerBgClass,
  onUpdateCount,
  onAllServed,
}: OrderCardViewProps) {
  return (
    <div className={`rounded-2xl relative ${cardClass}`}>

      {/* 新規注文のピンポン（pendingのみ） */}
      {isPending && (
        <span className="absolute -top-2.5 -right-2.5 flex h-6 w-6 z-10">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-6 w-6 bg-red-600" />
        </span>
      )}

      {/* ===== ヘッダー ===== */}
      <div className={`px-5 py-4 rounded-t-xl ${headerBgClass}`}>
        <div className="flex items-center justify-between">
          {/* テーブル番号（大） */}
          <div>
            <p className="text-white text-sm font-bold opacity-80 leading-none mb-0.5">
              テーブル
            </p>
            <p className="text-white text-5xl font-black leading-none">
              {order.tableNumber}
            </p>
          </div>
          {/* 状態 + 時刻 + 経過時間 */}
          <div className="text-right">
            <span className="block text-white text-2xl font-black leading-none mb-1">
              {isPending ? "未対応" : isPreparing ? "提供中" : "提供済"}
            </span>
            <span className="block text-white text-base font-semibold opacity-90">
              {timeStr}
            </span>
            {!isServed && (
              <span
                className={`block text-sm font-bold mt-0.5 ${
                  elapsedMin >= 10
                    ? "text-white opacity-100"
                    : "text-white opacity-70"
                }`}
              >
                {elapsedMin >= 10 ? "⚠ " : ""}
                {elapsedMin}分経過
              </span>
            )}
          </div>
        </div>

        {/* 進捗バー（提供済以外） */}
        {!isServed && (
          <div className="mt-3">
            <div className="flex justify-between text-white text-base font-bold mb-1.5 opacity-90">
              <span>提供進捗</span>
              <span>
                {doneAll} / {totalAll} 品
              </span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-5 overflow-hidden">
              <div
                className="bg-white h-5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ===== 品目一覧 ===== */}
      <div className="px-4 pt-4 pb-3 space-y-3">
        {order.items.map((item, idx) => {
          const served = itemsDone[String(idx)] ?? 0;
          const total = item.quantity;
          const itemDone = served >= total;

          return (
            <div
              key={idx}
              className={`rounded-xl px-4 py-3 transition-colors duration-200 ${
                itemDone
                  ? "bg-green-200 border border-green-400"
                  : "bg-white border border-gray-200"
              }`}
            >
              {/* 商品名と進捗 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className={`text-2xl font-black flex-shrink-0 ${
                      itemDone ? "text-green-600" : "text-gray-300"
                    }`}
                  >
                    {itemDone ? "✓" : "○"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-xl font-bold ${
                        itemDone
                          ? "line-through text-gray-400"
                          : "text-gray-900"
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.selectedOptions && item.selectedOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.selectedOptions.map((opt) => (
                          <span
                            key={opt.id}
                            className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium"
                          >
                            {opt.name}
                            {opt.price > 0 && ` +¥${opt.price.toLocaleString()}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xl font-black flex-shrink-0 ml-3 ${
                    itemDone ? "text-green-600" : "text-gray-800"
                  }`}
                >
                  {served}
                  <span className="text-base font-semibold text-gray-400">
                    /{total}
                  </span>
                </span>
              </div>

              {/* −/＋ボタン（提供済は非表示） */}
              {!isServed && (
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={() => onUpdateCount(idx, -1)}
                    disabled={served === 0 || loading}
                    className="w-14 h-14 rounded-full bg-gray-200 text-gray-700 text-3xl font-black flex items-center justify-center disabled:opacity-25 active:scale-90 transition-transform"
                    aria-label="戻す"
                  >
                    －
                  </button>
                  <span className="text-3xl font-black text-gray-900 w-10 text-center tabular-nums">
                    {served}
                  </span>
                  <button
                    onClick={() => onUpdateCount(idx, 1)}
                    disabled={served === total || loading}
                    className="w-14 h-14 rounded-full bg-green-500 text-white text-3xl font-black flex items-center justify-center disabled:opacity-25 active:scale-90 transition-transform"
                    aria-label="提供済み"
                  >
                    ＋
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ===== 備考 ===== */}
      {order.notes && (
        <div className="mx-4 mb-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
          <p className="text-base font-bold text-orange-800">📝 {order.notes}</p>
        </div>
      )}

      {/* ===== 全品まとめて完了ボタン ===== */}
      {!isServed && !allServed && (
        <div className="px-4 pb-4">
          <button
            onClick={onAllServed}
            disabled={loading}
            className="w-full py-4 rounded-xl text-lg font-black text-white bg-gray-600 hover:bg-gray-700 disabled:opacity-50 active:scale-95 transition-transform min-h-[56px]"
          >
            全品まとめて提供完了
          </button>
        </div>
      )}
    </div>
  );
}
