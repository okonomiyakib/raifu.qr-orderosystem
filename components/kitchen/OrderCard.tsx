"use client";

import { Order, OrderStatus } from "@/lib/types";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; nextStatus: OrderStatus | null; nextLabel: string | null }
> = {
  pending: {
    label: "未対応",
    color: "bg-red-100 border-red-400 border-2",
    nextStatus: "preparing",
    nextLabel: "調理開始",
  },
  preparing: {
    label: "調理中",
    color: "bg-yellow-100 border-yellow-400 border-2",
    nextStatus: "served",
    nextLabel: "全品まとめて提供完了",
  },
  served: {
    label: "提供済",
    color: "bg-green-100 border-green-400 border-2",
    nextStatus: null,
    nextLabel: null,
  },
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-red-500 text-white",
  preparing: "bg-yellow-500 text-white",
  served: "bg-green-500 text-white",
};

interface OrderCardProps {
  order: Order & { id: string };
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onItemDoneChange: (orderId: string, itemsDone: number[]) => void;
}

export function OrderCard({ order, onStatusChange, onItemDoneChange }: OrderCardProps) {
  const config = STATUS_CONFIG[order.status];
  const itemsDone: number[] = order.itemsDone ?? [];
  const totalItems = order.items.length;
  const doneCount = itemsDone.length;
  const allDone = doneCount === totalItems;

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

  const toggleItem = (idx: number) => {
    if (order.status !== "preparing") return;
    let newDone: number[];
    if (itemsDone.includes(idx)) {
      newDone = itemsDone.filter((i) => i !== idx);
    } else {
      newDone = [...itemsDone, idx];
    }
    onItemDoneChange(order.id, newDone);

    // 全品完了したら自動で提供済に
    if (newDone.length === totalItems) {
      onStatusChange(order.id, "served");
    }
  };

  return (
    <div className={`rounded-2xl p-4 ${config.color} relative`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-gray-800">
            テーブル {order.tableNumber}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-bold ${STATUS_BADGE[order.status]}`}>
            {config.label}
          </span>
        </div>
        <span className="text-sm text-gray-500">{timeStr}</span>
      </div>

      {/* 進捗バー（調理中のみ） */}
      {order.status === "preparing" && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>調理進捗</span>
            <span className="font-bold">{doneCount} / {totalItems} 品完了</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${totalItems > 0 ? (doneCount / totalItems) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* 注文内容 */}
      <div className="space-y-2 mb-3">
        {order.items.map((item, idx) => {
          const isDone = itemsDone.includes(idx);
          return (
            <div
              key={idx}
              className={`flex justify-between items-center rounded-xl px-3 py-2 transition-colors ${
                isDone ? "bg-green-200/70" : "bg-white/50"
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isDone && <span className="text-green-600 font-bold text-lg leading-none">✓</span>}
                <span className={`font-medium text-base ${isDone ? "line-through text-gray-400" : "text-gray-700"}`}>
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`font-bold ${isDone ? "text-gray-400" : "text-gray-800"}`}>
                  × {item.quantity}
                </span>
                {order.status === "preparing" && (
                  <button
                    onClick={() => toggleItem(idx)}
                    className={`text-xs px-2 py-1 rounded-lg font-bold border transition-colors ${
                      isDone
                        ? "bg-gray-100 border-gray-300 text-gray-400"
                        : "bg-green-500 border-green-600 text-white"
                    }`}
                  >
                    {isDone ? "戻す" : "完了"}
                  </button>
                )}
              </div>
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

      {/* ステータス変更ボタン */}
      {config.nextStatus && (
        <button
          onClick={() => onStatusChange(order.id, config.nextStatus!)}
          className={`w-full py-3 rounded-xl text-base font-bold text-white transition-colors ${
            order.status === "pending"
              ? "bg-yellow-500 hover:bg-yellow-600"
              : allDone
              ? "bg-green-500 hover:bg-green-600"
              : "bg-green-300 hover:bg-green-400"
          }`}
        >
          {config.nextLabel}
          {order.status === "preparing" && !allDone && (
            <span className="text-sm font-normal ml-2">（{totalItems - doneCount}品未完了）</span>
          )}
        </button>
      )}
    </div>
  );
}
