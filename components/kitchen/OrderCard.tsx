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
    nextLabel: "提供完了",
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
}

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const config = STATUS_CONFIG[order.status];
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

      {/* 注文内容 */}
      <div className="space-y-1 mb-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-base">
            <span className="text-gray-700 font-medium">{item.name}</span>
            <span className="font-bold text-gray-800">× {item.quantity}</span>
          </div>
        ))}
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
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {config.nextLabel}
        </button>
      )}
    </div>
  );
}
