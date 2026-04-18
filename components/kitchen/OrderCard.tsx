"use client";

import { useState } from "react";
import { Order, OrderStatus } from "@/lib/types";
import { OrderCardView } from "./OrderCardView";

interface OrderCardProps {
  order: Order & { id: string };
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onItemDoneChange: (orderId: string, itemsDone: Record<string, number>) => void;
}

export function OrderCard({ order, onStatusChange, onItemDoneChange }: OrderCardProps) {
  const [loading, setLoading] = useState(false);

  const itemsDone: Record<string, number> = order.itemsDone ?? {};

  const createdAt =
    order.createdAt instanceof Date
      ? order.createdAt
      : typeof order.createdAt === "string"
      ? new Date(order.createdAt)
      : new Date();

  const timeStr = createdAt.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // 経過時間（分）
  const elapsedMin = Math.floor((Date.now() - createdAt.getTime()) / 60000);

  const totalAll = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const doneAll = order.items.reduce(
    (sum, _, idx) => sum + (itemsDone[String(idx)] ?? 0),
    0
  );
  const allServed = doneAll === totalAll;
  const progressPct = totalAll > 0 ? (doneAll / totalAll) * 100 : 0;

  // ステータス別カードスタイル
  const isPending = order.status === "pending";
  const isPreparing = order.status === "preparing";
  const isServed = order.status === "served";

  const cardClass = isPending
    ? "bg-red-50 border-red-500 border-4 shadow-xl shadow-red-200"
    : isPreparing
    ? "bg-yellow-50 border-yellow-500 border-4 shadow-md"
    : "bg-gray-100 border-gray-300 border-2 opacity-80";

  const headerBgClass = isPending
    ? "bg-red-500"
    : isPreparing
    ? "bg-yellow-500"
    : "bg-gray-400";

  const updateCount = async (idx: number, delta: number) => {
    if (isServed || loading) return;
    setLoading(true);

    const current = itemsDone[String(idx)] ?? 0;
    const max = order.items[idx].quantity;
    const newCount = Math.min(max, Math.max(0, current + delta));
    const newDone: Record<string, number> = { ...itemsDone, [String(idx)]: newCount };

    const newDoneAll = order.items.reduce(
      (sum, _, i) => sum + (newDone[String(i)] ?? 0),
      0
    );
    const willBeServed = order.items.every(
      (item, i) => (newDone[String(i)] ?? 0) >= item.quantity
    );

    await onItemDoneChange(order.id, newDone);

    if (willBeServed) {
      await onStatusChange(order.id, "served");
    } else if (order.status === "pending" && newDoneAll > 0) {
      await onStatusChange(order.id, "preparing");
    }

    setLoading(false);
  };

  const handleAllServed = async () => {
    if (loading) return;
    setLoading(true);
    const allDone: Record<string, number> = {};
    order.items.forEach((item, idx) => {
      allDone[String(idx)] = item.quantity;
    });
    await onItemDoneChange(order.id, allDone);
    await onStatusChange(order.id, "served");
    setLoading(false);
  };

  return (
    <OrderCardView
      order={order}
      loading={loading}
      itemsDone={itemsDone}
      totalAll={totalAll}
      doneAll={doneAll}
      allServed={allServed}
      progressPct={progressPct}
      timeStr={timeStr}
      elapsedMin={elapsedMin}
      isPending={isPending}
      isPreparing={isPreparing}
      isServed={isServed}
      cardClass={cardClass}
      headerBgClass={headerBgClass}
      onUpdateCount={updateCount}
      onAllServed={handleAllServed}
    />
  );
}
