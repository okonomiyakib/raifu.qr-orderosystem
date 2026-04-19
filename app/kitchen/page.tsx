"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { Order, OrderStatus } from "@/lib/types";
import { OrderCard } from "@/components/kitchen/OrderCard";
import toast from "react-hot-toast";

type TabType = "active" | "served";

interface Call {
  id: string;
  tableId: string;
  tableNumber: number;
  status: string;
  createdAt: string;
}

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
  const router = useRouter();
  const [orders, setOrders] = useState<(Order & { id: string })[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const dismissedCallIds = useRef<Set<string>>(new Set());

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

    setOrders([...(activeData ?? []).map(toOrder), ...(servedData ?? []).map(toOrder)]);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  const fetchCalls = useCallback(async () => {
    const { data } = await supabase
      .from("calls")
      .select("*")
      .eq("status", "waiting")
      .order("created_at", { ascending: true });

    // 対応済みとしてローカルで管理しているIDは除外（DB反映前の競合を防ぐ）
    const newCalls: Call[] = (data ?? [])
      .filter((row) => !dismissedCallIds.current.has(row.id))
      .map((row) => ({
        id: row.id,
        tableId: row.table_id,
        tableNumber: row.table_number,
        status: row.status,
        createdAt: row.created_at,
      }));

    setCalls((prev) => {
      const prevIds = new Set(prev.map((c) => c.id));
      newCalls.forEach((c) => {
        if (!prevIds.has(c.id)) {
          toast(`🔔 テーブル ${c.tableNumber} から呼び出し`, {
            duration: 6000,
            style: { background: "#fee2e2", color: "#991b1b", fontWeight: "bold" },
          });
        }
      });
      return newCalls;
    });
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchCalls();

    // 他端末との同期用（自端末はOptimistic Updateで即時反映）
    const channel = supabase
      .channel("kitchen-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrders)
      .on("postgres_changes", { event: "*", schema: "public", table: "calls" }, fetchCalls)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders, fetchCalls]);

  // 呼び出し対応：即時削除してからAPI
  const handleRespondCall = async (callId: string, tableNumber: number) => {
    // dismissedCallIds に登録することで、fetchCalls が再実行されても復活しない
    dismissedCallIds.current.add(callId);
    setCalls((prev) => prev.filter((c) => c.id !== callId));
    try {
      await fetch(`/api/calls/${callId}`, { method: "PATCH" });
      toast.success(`テーブル ${tableNumber} の呼び出しに対応しました`);
    } catch {
      // 失敗時は登録を取り消して元に戻す
      dismissedCallIds.current.delete(callId);
      await fetchCalls();
      toast.error("更新に失敗しました");
    }
  };

  // ステータス更新：即時反映してからAPI
  const handleStatusChange = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
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
        await fetchOrders();
        toast.error("ステータスの更新に失敗しました");
      }
    },
    [fetchOrders]
  );

  // 品目完了：即時反映してからAPI
  const handleItemDoneChange = useCallback(
    async (orderId: string, itemsDone: Record<string, number>) => {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, itemsDone } : o))
      );
      try {
        await fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemsDone }),
        });
      } catch {
        await fetchOrders();
        toast.error("更新に失敗しました");
      }
    },
    [fetchOrders]
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
      {/* ===== ヘッダー ===== */}
      <header className="bg-gray-900 border-b border-gray-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">

          {/* タイトル + 最終更新 */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white leading-none">厨房ダッシュボード</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              更新: {lastUpdated.toLocaleTimeString("ja-JP")}
            </p>
          </div>

          {/* ログアウト（モバイルでは右上） */}
          <button
            onClick={async () => {
              const supabase = createSupabaseBrowser();
              await supabase.auth.signOut();
              router.push("/login");
              router.refresh();
            }}
            className="text-sm text-gray-400 hover:text-white border border-gray-600 px-4 py-2 rounded-lg flex-shrink-0 sm:order-last"
          >
            ログアウト
          </button>

          {/* カウンター（モバイルで全幅2列） */}
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto sm:flex-1 sm:justify-center">
            <div className={`flex-1 sm:flex-none flex items-center gap-2 sm:gap-3 rounded-xl px-3 sm:px-5 py-2 sm:py-3 border-2 ${
              pendingCount > 0
                ? "bg-red-600 border-red-400 animate-pulse"
                : "bg-red-900/30 border-red-900"
            }`}>
              <span className="text-3xl sm:text-4xl font-black text-white tabular-nums">{pendingCount}</span>
              <span className="text-sm sm:text-base font-bold text-red-200">未対応</span>
            </div>
            <div className={`flex-1 sm:flex-none flex items-center gap-2 sm:gap-3 rounded-xl px-3 sm:px-5 py-2 sm:py-3 border-2 ${
              preparingCount > 0
                ? "bg-yellow-500 border-yellow-300"
                : "bg-yellow-900/30 border-yellow-900"
            }`}>
              <span className="text-3xl sm:text-4xl font-black text-white tabular-nums">{preparingCount}</span>
              <span className="text-sm sm:text-base font-bold text-yellow-100">調理中</span>
            </div>
          </div>
        </div>
      </header>

      {/* ===== 呼び出し通知（大きく・目立つ） ===== */}
      {calls.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="bg-red-600 border-2 border-red-400 rounded-xl p-4">
            <p className="text-white text-lg font-black mb-3">
              🔔 スタッフ呼び出し（{calls.length}件）
            </p>
            <div className="flex flex-wrap gap-3">
              {calls.map((call) => (
                <div
                  key={call.id}
                  className="flex items-center gap-3 bg-red-700 border border-red-400 rounded-xl px-4 py-3"
                >
                  <span className="text-white text-xl font-black">テーブル {call.tableNumber}</span>
                  <span className="text-red-200 text-base">
                    {new Date(call.createdAt).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    onClick={() => handleRespondCall(call.id, call.tableNumber)}
                    className="bg-white text-red-600 text-base font-black px-4 py-2 rounded-lg active:scale-95 transition-transform min-h-[44px]"
                  >
                    対応済み
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== タブ ===== */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        <div className="flex gap-3 mb-5">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-6 py-3 rounded-xl font-black text-lg transition-colors min-h-[52px] ${
              activeTab === "active"
                ? "bg-orange-500 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            対応中 {activeOrders.length > 0 && `(${activeOrders.length})`}
          </button>
          <button
            onClick={() => setActiveTab("served")}
            className={`px-6 py-3 rounded-xl font-black text-lg transition-colors min-h-[52px] ${
              activeTab === "served"
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            提供済 ({servedOrders.length})
          </button>
        </div>

        {activeTab === "active" ? (
          activeOrders.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-5xl mb-4">🎉</p>
              <p className="text-xl font-bold">対応中の注文はありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-8">
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
