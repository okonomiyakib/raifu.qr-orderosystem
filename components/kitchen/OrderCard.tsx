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
  preparing: "調理中",
  served: "提供済",
};

interface OrderCardProps {
  order: Order & { id: string };
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onItemDoneChange: (orderId: string, itemsDone: number[]) => void;
}

export function OrderCard({ order, onStatusChange, onItemDoneChange }: OrderCardProps) {
  const itemsDone: number[] = order.itemsDone ?? [];
  const totalItems = order.items.length;
  const doneCount = itemsDone.length;
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

  const cardColor =
    order.status === "served"
      ? "bg-green-100 border-green-400 border-2"
      : doneCount > 0
      ? "bg-yellow-100 border-yellow-400 border-2"
      : "bg-red-100 border-red-400 border-2";

  const handleToggleItem = async (idx: number) => {
    if (order.status === "served" || loading) return;
    setLoading(true);

    const newDone = itemsDone.includes(idx)
      ? itemsDone.filter((i) => i !== idx)
      : [...itemsDone, idx];

    await onItemDoneChange(order.id, newDone);

    // 調理中ステータスに移行
    if (order.status === "pending" && newDone.length > 0) {
      await onStatusChange(order.id, "preparing");
    }

    // 全品完了 → 提供済に自動移行
    if (newDone.length === totalItems) {
      await onStatusChange(order.id, "served");
    }

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

      {/* 進捗 */}
      {order.status !== "served" && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>提供進捗</span>
            <span className="font-bold text-gray-700">{doneCount} / {totalItems} 品</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${totalItems > 0 ? (doneCount / totalItems) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* 品目一覧 */}
      <div className="space-y-2 mb-3">
        {order.items.map((item, idx) => {
          const isDone = itemsDone.includes(idx);
          return (
            <div
              key={idx}
              className={`flex justify-between items-center rounded-xl px-3 py-2.5 ${
                isDone ? "bg-green-200" : "bg-white/70"
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isDone ? (
                  <span className="text-green-600 text-lg font-black">✓</span>
                ) : (
                  <span className="text-gray-300 text-lg font-black">○</span>
                )}
                <span className={`font-semibold text-base ${isDone ? "line-through text-gray-400" : "text-gray-800"}`}>
                  {item.name}
                </span>
                <span className={`text-sm ${isDone ? "text-gray-400" : "text-gray-600"}`}>
                  × {item.quantity}
                </span>
              </div>

              {order.status !== "served" && (
                <button
                  onClick={() => handleToggleItem(idx)}
                  disabled={loading}
                  className={`ml-2 flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold border-2 transition-all active:scale-95 disabled:opacity-50 ${
                    isDone
                      ? "bg-white border-gray-300 text-gray-500"
                      : "bg-green-500 border-green-600 text-white shadow-sm"
                  }`}
                >
                  {isDone ? "戻す" : "提供完了"}
                </button>
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

      {/* 全品まとめて完了ボタン（まだ全部終わっていない場合のみ） */}
      {order.status !== "served" && doneCount < totalItems && (
        <button
          onClick={async () => {
            if (loading) return;
            setLoading(true);
            const allIndices = order.items.map((_, i) => i);
            await onItemDoneChange(order.id, allIndices);
            await onStatusChange(order.id, "served");
            setLoading(false);
          }}
          disabled={loading}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gray-500 hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          全品まとめて提供完了
        </button>
      )}
    </div>
  );
}
