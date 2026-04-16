"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { MenuItem, TaxSettings } from "@/lib/types";
import { DEFAULT_TAX_SETTINGS } from "@/lib/tax";
import { useCartStore } from "@/lib/store";
import { MenuCard } from "@/components/customer/MenuCard";
import { Cart } from "@/components/customer/Cart";
import { OrderConfirmModal } from "@/components/customer/OrderConfirmModal";
import toast from "react-hot-toast";

const CALL_COOLDOWN_MS = 30000; // 30秒クールダウン

export default function MenuPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const router = useRouter();
  const [tableNumber, setTableNumberState] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("すべて");
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(DEFAULT_TAX_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [callCooldown, setCallCooldown] = useState(false);
  const { setTable, items, clearCart } = useCartStore();

  const loadData = useCallback(async () => {
    try {
      const tableRes = await fetch(`/api/tables/${tableId}`);
      if (!tableRes.ok) {
        toast.error("テーブルが見つかりません");
        setLoading(false);
        return;
      }
      const tableData = await tableRes.json();
      setTable(tableId, tableData.tableNumber);
      setTableNumberState(tableData.tableNumber);

      // storeId をクエリパラメータで渡して店舗データのみ取得
      const storeParam = tableData.storeId ? `?storeId=${tableData.storeId}` : "";
      const [menuRes, settingsRes] = await Promise.all([
        fetch(`/api/menu${storeParam}`),
        fetch(`/api/settings${storeParam}`),
      ]);
      const menuData: MenuItem[] = await menuRes.json();
      const settingsData = await settingsRes.json();

      setMenuItems(menuData);
      setTaxSettings(settingsData.tax ?? DEFAULT_TAX_SETTINGS);

      const cats = [
        "すべて",
        ...(settingsData.categories as string[] ?? Array.from(new Set(menuData.map((i) => i.category)))),
      ];
      setCategories(cats);
    } catch {
      toast.error("データの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [tableId, setTable]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredItems = activeCategory === "すべて"
    ? menuItems
    : menuItems.filter((i) => i.category === activeCategory);

  const handleConfirmOrder = async (notes: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, tableNumber, items, notes }),
      });
      if (!res.ok) throw new Error();
      clearCart();
      router.push("/order-complete");
    } catch {
      toast.error("注文に失敗しました。もう一度お試しください");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCallStaff = async () => {
    if (callCooldown || isCalling) return;
    setIsCalling(true);
    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, tableNumber }),
      });
      if (!res.ok) throw new Error();
      toast.success("スタッフが参ります。少々お待ちください。", { duration: 4000 });
      setCallCooldown(true);
      setTimeout(() => setCallCooldown(false), CALL_COOLDOWN_MS);
    } catch {
      toast.error("呼び出しに失敗しました。もう一度お試しください");
    } finally {
      setIsCalling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-4">🍽️</div>
          <p className="text-gray-500">メニューを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800">メニュー</h1>
            {tableNumber && (
              <p className="text-base text-orange-500 font-semibold">テーブル {tableNumber}</p>
            )}
          </div>
          {/* 呼び出しボタン: 誰でも押せる大きさ */}
          <button
            onClick={handleCallStaff}
            disabled={callCooldown || isCalling}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-base font-bold transition-all shadow min-h-[52px] flex-shrink-0 ${
              callCooldown
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-orange-500 text-white active:scale-95"
            }`}
          >
            <span className="text-xl">🔔</span>
            {callCooldown ? "呼び出し済み" : "スタッフを呼ぶ"}
          </button>
        </div>

        {/* カテゴリタブ: 押しやすい高さ */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-5 py-3 rounded-full text-base font-semibold transition-colors min-h-[48px] ${
                activeCategory === cat ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        <p className="text-xs text-gray-400 mb-3 text-right">
          価格はすべて{taxSettings.displayMode === "included" ? "税込" : "税抜"}表示
        </p>

        {filteredItems.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">😔</p>
            <p>このカテゴリの商品はありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} taxSettings={taxSettings} />
            ))}
          </div>
        )}
      </main>

      <Cart onCheckout={() => setShowConfirm(true)} />

      {showConfirm && (
        <OrderConfirmModal
          taxSettings={taxSettings}
          onConfirm={handleConfirmOrder}
          onCancel={() => setShowConfirm(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
