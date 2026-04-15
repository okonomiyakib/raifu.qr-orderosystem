"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Order, OrderStatus } from "@/lib/types";
import { OrderCard } from "@/components/kitchen/OrderCard";
import toast from "react-hot-toast";

type TabType = "active" | "served";

function toOrder(row: Record<string, unknown>): Order & { id: string } {
  return {
    id: row.id as string,
    tableId: row.table_id as string,
    tableNumber: row.table_number as number,
    items: row.items as Order["items"],
    totalAmount: row.total_amount as number,
    status: row.status as OrderStatus,
    notes: row.notes as string,
    itemsDone: (row.items_done ?? {}) as Record<string, number>,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<(Order & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchOrders = useCallback(async () => {
    const { data: activeData } = await supabase
      .from("orders")
      .select("*")
      .in("status", ["pending", "preparing"])
      .order("created_at", { ascending: true });

    const { data: servedData } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "served")
      .order("updated_at", { ascending: false })
      .limit(20);

    const active = (activeData ?? []).map(toOrder);
    const served = (servedData ?? []).map(toOrder);

    setOrders([...active, ...served]);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();

    // Realtime でオーダー変更を監視
    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => { fetchOrders(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  const handleStatusChange = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) throw new Error();

        const statusLabel: Record<OrderStatus, string> = {
          pending: "未対応",
          preparing: "調理中",
          served: "提供済",
        };
        toast.success(`ステータスを「${statusLabel[newStatus]}」に更新しました`);
      } catch {
        toast.error("ステータスの更新に失敗しました");
      }
    },
    []
  );

  const handleItemDoneChange = useCallback(
    async (orderId: string, itemsDone: Record<string, number>) => {
      try {
        await fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemsDone }),
        });
      } catch {
        toast.error("更新に失敗しました");
      }
    },
    []
  );

  const activeOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "preparing"
  );
  const servedOrders = orders.filter((o) => o.status === "served");
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const preparingCount = orders.filter((o) => o.status === "preparing").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-5xl mb-4 animate-spin">👨‍🍳</div>
          <p className="text-gray-400">注文情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ヘッダー */}
      <header className="bg-gray-800 px-4 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👨‍🍳</span>
            <div>
              <h1 className="text-xl font-bold">厨房ダッシュボード</h1>
              <p className="text-xs text-gray-400">
                最終更新: {lastUpdated.toLocaleTimeString("ja-JP")}
              </p>
            </div>
          </div>

          {/* サマリーバッジ */}
          <div className="flex gap-3">
            <div className="text-center bg-red-900/50 border border-red-600 rounded-xl px-4 py-2">
              <p className="text-2xl font-black text-red-400">{pendingCount}</p>
              <p className="text-xs text-red-300">未対応</p>
            </div>
            <div className="text-center bg-yellow-900/50 border border-yellow-600 rounded-xl px-4 py-2">
              <p className="text-2xl font-black text-yellow-400">{preparingCount}</p>
              <p className="text-xs text-yellow-300">調理中</p>
            </div>
          </div>
        </div>
      </header>

      {/* タブ */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors ${
              activeTab === "active"
                ? "bg-orange-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            対応中 ({activeOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("served")}
            className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors ${
              activeTab === "served"
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            提供済 ({servedOrders.length})
          </button>
        </div>

        {/* 注文カード一覧 */}
        {activeTab === "active" ? (
          activeOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-5xl mb-4">🎉</p>
              <p className="text-lg">対応中の注文はありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
              {activeOrders
                .sort((a, b) => {
                  if (a.status === "pending" && b.status !== "pending") return -1;
                  if (a.status !== "pending" && b.status === "pending") return 1;
                  return 0;
                })
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusChange={handleStatusChange}
                    onItemDoneChange={handleItemDoneChange}
                  />
                ))}
            </div>
          )
        ) : (
          servedOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-5xl mb-4">📋</p>
              <p className="text-lg">提供済の注文はありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
              {servedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                  onItemDoneChange={handleItemDoneChange}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
