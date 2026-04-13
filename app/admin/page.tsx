"use client";

import { useEffect, useState } from "react";
import { Table } from "@/lib/types";
import { QRCodeGenerator } from "@/components/admin/QRCodeGenerator";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [newTableNum, setNewTableNum] = useState("");
  const [adding, setAdding] = useState(false);

  const appUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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
        <p className="text-gray-400">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">管理画面</h1>
            <p className="text-sm text-gray-500">QRコード発行・テーブル管理</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/menu"
              className="px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-medium hover:bg-orange-600"
            >
              メニュー管理
            </Link>
            <Link
              href="/kitchen"
              className="px-4 py-2 bg-gray-800 text-white rounded-xl text-sm font-medium hover:bg-gray-900"
            >
              厨房画面
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* デモデータ投入 */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
          <h2 className="font-bold text-blue-800 mb-1">🚀 初回セットアップ</h2>
          <p className="text-sm text-blue-600 mb-3">
            Firebaseの設定後、デモデータを投入してシステムを試すことができます
          </p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-5 py-2 bg-blue-600 disabled:bg-blue-300 text-white rounded-xl text-sm font-semibold"
          >
            {seeding ? "投入中..." : "デモデータを投入する"}
          </button>
        </div>

        {/* テーブル追加 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-bold text-gray-800 mb-4">テーブルを追加</h2>
          <form onSubmit={handleAddTable} className="flex gap-3">
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
              className="px-6 py-3 bg-orange-500 disabled:bg-orange-300 text-white rounded-xl font-semibold"
            >
              追加
            </button>
          </form>
        </div>

        {/* QRコード一覧 */}
        <h2 className="font-bold text-gray-800 text-lg mb-4">
          テーブルQRコード一覧（{tables.length}席）
        </h2>

        {tables.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🪑</p>
            <p>テーブルがありません</p>
            <p className="text-sm mt-1">上のフォームからテーブルを追加するか、デモデータを投入してください</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            {tables.map((table) => (
              <QRCodeGenerator key={table.id} table={table} appUrl={appUrl} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
