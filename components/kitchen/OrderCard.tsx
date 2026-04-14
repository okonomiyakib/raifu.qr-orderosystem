"use client";

import { useState } from "react";
import { Order, OrderStatus } from "@/lib/types";

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-red-500 text-white",
  preparing: "bg-yellow-500 text-white",
  served: "bg-green-500 text-white",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "未対応",
  preparing: "提供中",
  served: "提供済",
};

interface OrderCardProps {
  order: Order & { id: string };
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onItemDoneChange: (orderId: string, itemsDone: Record<string, number>) => void;
}

export function OrderCard({ order, onStatusChange, onItemDoneChange }: OrderCardProps) {
  const itemsDone: Record<string, number> = order.itemsDone ?? {};
  const [loading, setLoading] = useState(false);

  const createdAt =
    order.createdAt instanceof Date
      ? order.createdAt
      : typeof order.createdAt === "string"
      ? new Date(order.createdAt)
      : (order.createdAt as { toDate?: () => Date })?.toDate?.() ?? new Date();

  const timeStr = createdAt.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // 全品目の合計数と提供済み合計数
  const totalAll = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const doneAll = order.items.reduce((sum, _, idx) => sum + (itemsDone[String(idx)] ?? 0), 0);
  const allServed = doneAll === totalAll;

  const cardColor =
    order.status === "served"
      ? "bg-green-100 border-green-400 border-2"
      : doneAll > 0
      ? "bg-yellow-100 border-yellow-400 border-2"
      : "bg-red-100 border-red-400 border-2";

  const updateCount = async (idx: number, delta: number) => {
    if (order.status === "served" || loading) return;
    setLoading(true);

    const current = itemsDone[idx] ?? 0;
    const max = order.items[idx].quantity;
    const newCount = Math.min(max, Math.max(0, current + delta));

    const newDone: Record<string, number> = { ...itemsDone, [String(idx)]: newCount };
    await onItemDoneChange(order.id, newDone);

    // 1品でも提供されたら「提供中」に
    const newDoneAll = order.items.reduce((sum, _, i) => sum + (newDone[String(i)] ?? 0), 0);
    if (order.status === "pending" && newDoneAll > 0) {
      await onStatusChange(order.id, "preparing");
    }

    // 全品提供完了 → 自動で提供済
    const newTotalDone = order.items.reduce((sum, item, i) => {
      return (newDone[String(i)] ?? 0) >= item.quantity ? sum + 1 : sum;
    }, 0);
    if (newTotalDone === order.items.length) {
      await onStatusChange(order.id, "served");
    }

    setLoading(false);
  };

  const handleAllServed = async () => {
    if (loading) return;
    setLoading(true);
    const allDone: Record<string, number> = {};
    order.items.forEach((item, idx) => { allDone[idx] = item.quantity; });
    await onItemDoneChange(order.id, allDone);
    await onStatusChange(order.id, "served");
    setLoading(false);
  };

  return (
    <div className={`rounded-2xl p-4 ${cardColor} relative`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-gray-800">
            テーブル {order.tableNumber}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-bold ${STATUS_BADGE[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
        </div>
        <span className="text-sm text-gray-500">{timeStr}</span>
      </div>

      {/* 全体進捗バー */}
      {order.status !== "served" && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>提供進捗</span>
            <span className="font-bold text-gray-700">{doneAll} / {totalAll} 品</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${totalAll > 0 ? (doneAll / totalAll) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* 品目一覧 */}
      <div className="space-y-2 mb-3">
        {order.items.map((item, idx) => {
          const served = itemsDone[String(idx)] ?? 0;
          const total = item.quantity;
          const itemDone = served >= total;

          return (
            <div
              key={idx}
              className={`rounded-xl px-3 py-2.5 ${itemDone ? "bg-green-200" : "bg-white/70"}`}
            >
              {/* 品目名と完了マーク */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-lg font-black leading-none ${itemDone ? "text-green-600" : "text-gray-300"}`}>
                    {itemDone ? "✓" : "○"}
                  </span>
                  <span className={`font-semibold text-base truncate ${itemDone ? "line-through text-gray-400" : "text-gray-800"}`}>
                    {item.name}
                  </span>
                </div>
                {/* 提供済み数 / 注文数 */}
                <span className={`text-sm font-bold flex-shrink-0 ml-2 ${itemDone ? "text-green-600" : "text-gray-700"}`}>
                  {served} / {total} 品
                </span>
              </div>

              {/* ＋／－ボタン */}
              {order.status !== "served" && (
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => updateCount(idx, -1)}
                    disabled={served === 0 || loading}
                    className="w-9 h-9 rounded-full bg-gray-200 text-gray-600 text-xl font-bold flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform"
                  >
                    －
                  </button>
                  <span className="text-lg font-black text-gray-800 w-6 text-center">{served}</span>
                  <button
                    onClick={() => updateCount(idx, 1)}
                    disabled={served === total || loading}
                    className="w-9 h-9 rounded-full bg-green-500 text-white text-xl font-bold flex items-center justify-center disabled:opacity-30 active:scale-95 transition-transform"
                  >
                    ＋
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 備考 */}
      {order.notes && (
        <div className="bg-white/60 rounded-lg px-3 py-2 text-sm text-gray-600 mb-3">
          📝 {order.notes}
        </div>
      )}

      {/* 全品まとめて完了ボタン */}
      {order.status !== "served" && !allServed && (
        <button
          onClick={handleAllServed}
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gray-500 hover:bg-gray-600 transition-colors disabled:opacity-50 active:scale-95"
        >
          全品まとめて提供完了
        </button>
      )}
    </div>
  );
}
