"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/lib/types";
import { QRCodeGenerator } from "@/components/admin/QRCodeGenerator";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [newTableNum, setNewTableNum] = useState("");
  const [adding, setAdding] = useState(false);
  const [storeName, setStoreName] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data: store } = await supabase
        .from("stores")
        .select("name")
        .eq("owner_id", user.id)
        .single();
      if (!store) {
        router.push("/admin/setup");
      } else {
        setStoreName(store.name);
      }
    });
  }, [router]);

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  const loadTables = async () => {
    try {
      const res = await fetch("/api/tables");
      const data = await res.json();
      setTables(data);
    } catch {
      toast.error("テーブルの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleSeed = async () => {
    if (!confirm("デモデータを投入しますか？既存のメニューとテーブルはリセットされます。")) return;
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("デモデータを投入しました！");
      await loadTables();
    } catch {
      toast.error("デモデータの投入に失敗しました");
    } finally {
      setSeeding(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(newTableNum);
    if (isNaN(num) || num < 1) {
      toast.error("テーブル番号を正しく入力してください");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber: num }),
      });
      if (!res.ok) throw new Error();
      toast.success(`テーブル${num}を追加しました`);
      setNewTableNum("");
      await loadTables();
    } catch {
      toast.error("テーブルの追加に失敗しました");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🍽️</div>
          <p className="text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ===== ヘッダー：店名のみ ===== */}
      <header className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 leading-none mb-0.5">管理画面</p>
            <h1 className="text-xl font-bold text-gray-800 leading-none">
              {storeName ?? "お店の管理"}
            </h1>
          </div>
          <Link
            href="/admin/settings"
            className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xl"
            aria-label="設定"
          >
            ⚙️
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* ===== 2大アクション ===== */}
        <div className="flex gap-3">
          <Link
            href="/admin/menu"
            className="flex-1 flex items-center gap-3 bg-orange-500 text-white rounded-2xl px-5 py-5 shadow-md shadow-orange-200 active:scale-95 transition-transform"
          >
            <span className="text-3xl">📋</span>
            <div className="min-w-0">
              <p className="text-lg font-black leading-none">メニューを編集する</p>
              <p className="text-orange-100 text-xs mt-1">追加・値段変更など</p>
            </div>
          </Link>
          {/* クイック追加：?add=1 でモーダル直接オープン */}
          <Link
            href="/admin/menu?add=1"
            className="flex flex-col items-center justify-center gap-1 bg-orange-100 text-orange-600 rounded-2xl px-4 py-5 active:scale-95 transition-transform border-2 border-orange-200 flex-shrink-0"
          >
            <span className="text-2xl font-black leading-none">＋</span>
            <span className="text-xs font-bold whitespace-nowrap">今すぐ追加</span>
          </Link>
        </div>

        <Link
          href="/kitchen"
          className="flex items-center gap-4 bg-gray-800 text-white rounded-2xl px-6 py-5 shadow-md active:scale-95 transition-transform"
        >
          <span className="text-4xl">🍳</span>
          <div>
            <p className="text-xl font-black leading-none">注文を確認する</p>
            <p className="text-gray-400 text-sm mt-1">厨房ダッシュボードを開く</p>
          </div>
          <span className="ml-auto text-2xl opacity-60">›</span>
        </Link>

        {/* ===== テーブル・QRコード管理（アコーディオン） ===== */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          <button
            onClick={() => setShowQR((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 text-left active:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🪑</span>
              <div>
                <p className="font-bold text-gray-800">テーブル・QRコード</p>
                <p className="text-sm text-gray-400">{tables.length}席登録済み</p>
              </div>
            </div>
            <span className={`text-gray-400 text-xl transition-transform duration-200 ${showQR ? "rotate-90" : ""}`}>
              ›
            </span>
          </button>

          {showQR && (
            <div className="border-t border-gray-100 px-5 py-4 space-y-4">
              <form onSubmit={handleAddTable} className="flex gap-2">
                <input
                  type="number"
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  placeholder="テーブル番号（例: 6）"
                  min="1"
                  className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  type="submit"
                  disabled={adding}
                  className="px-5 py-3 bg-orange-500 disabled:bg-orange-300 text-white rounded-xl font-bold text-base min-w-[72px]"
                >
                  {adding ? "…" : "追加"}
                </button>
              </form>

              {tables.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">🪑</p>
                  <p className="text-sm">テーブルを追加するとQRコードが表示されます</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tables.map((table) => (
                    <QRCodeGenerator key={table.id} table={table} appUrl={appUrl} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== フッターアクション ===== */}
        <div className="flex gap-3 pt-2 pb-8">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex-1 py-3 border border-blue-200 text-blue-500 rounded-xl text-sm font-semibold disabled:opacity-40"
          >
            {seeding ? "投入中..." : "🚀 デモデータ投入"}
          </button>
          <button
            onClick={async () => {
              const supabase = createSupabaseBrowser();
              await supabase.auth.signOut();
              router.push("/login");
              router.refresh();
            }}
            className="flex-1 py-3 border border-red-200 text-red-400 rounded-xl text-sm font-semibold"
          >
            ログアウト
          </button>
        </div>

      </main>
    </div>
  );
}
