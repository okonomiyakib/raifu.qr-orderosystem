"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MenuItem } from "@/lib/types";
import { MenuItemModal } from "@/components/admin/MenuItemModal";
import toast from "react-hot-toast";

type FormData = Omit<MenuItem, "id" | "isAvailable">;

export default function MenuAdminPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<MenuItem | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState("すべて");

  const loadItems = async () => {
    const res = await fetch("/api/menu");
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { loadItems(); }, []);

  const categories = ["すべて", ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = filterCategory === "すべて"
    ? items
    : items.filter((i) => i.category === filterCategory);

  const handleSave = async (formData: FormData) => {
    setIsSaving(true);
    try {
      if (editTarget) {
        // 更新
        const res = await fetch(`/api/menu/${editTarget.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error();
        toast.success("メニューを更新しました");
      } else {
        // 新規追加
        const res = await fetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, isAvailable: true }),
        });
        if (!res.ok) throw new Error();
        toast.success("メニューを追加しました");
      }
      setShowModal(false);
      setEditTarget(undefined);
      await loadItems();
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      if (!res.ok) throw new Error();
      toast.success(item.isAvailable ? "売り切れにしました" : "販売中に戻しました");
      await loadItems();
    } catch {
      toast.error("更新に失敗しました");
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`「${item.name}」を削除しますか？`)) return;
    try {
      const res = await fetch(`/api/menu/${item.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("削除しました");
      await loadItems();
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditTarget(item);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditTarget(undefined);
    setShowModal(true);
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
      <header className="bg-white shadow-sm px-4 py-4 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 text-2xl leading-none">←</Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">メニュー管理</h1>
              <p className="text-sm text-gray-400">{items.length}件</p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded-xl font-semibold text-sm"
          >
            ＋ 追加
          </button>
        </div>

        {/* カテゴリフィルター */}
        <div className="max-w-4xl mx-auto flex gap-2 mt-3 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterCategory === cat
                  ? "bg-orange-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* メニュー一覧 */}
      <main className="max-w-4xl mx-auto px-4 py-4 pb-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🍽️</p>
            <p>メニューがありません</p>
            <button
              onClick={handleAdd}
              className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold"
            >
              最初のメニューを追加
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl shadow-sm border flex gap-4 p-4 ${
                  !item.isAvailable ? "opacity-60 border-gray-200" : "border-gray-100"
                }`}
              >
                {/* 画像 */}
                <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                  )}
                </div>

                {/* 情報 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.category}</p>
                      <p className="text-orange-600 font-bold">¥{item.price.toLocaleString()}</p>
                    </div>
                    {!item.isAvailable && (
                      <span className="flex-shrink-0 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                        売り切れ
                      </span>
                    )}
                  </div>

                  {/* 操作ボタン */}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleToggleAvailable(item)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        item.isAvailable
                          ? "border-gray-300 text-gray-600 hover:bg-gray-50"
                          : "border-green-400 text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {item.isAvailable ? "売り切れにする" : "販売中に戻す"}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-400 hover:bg-red-50"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 追加・編集モーダル */}
      {showModal && (
        <MenuItemModal
          item={editTarget}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTarget(undefined); }}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
