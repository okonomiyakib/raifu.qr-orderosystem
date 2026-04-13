"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MenuItem, AppSettings } from "@/lib/types";
import { MenuItemModal, MenuFormData } from "@/components/admin/MenuItemModal";
import { DEFAULT_TAX_SETTINGS } from "@/lib/tax";
import toast from "react-hot-toast";

export default function MenuAdminPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    tax: DEFAULT_TAX_SETTINGS,
    categories: ["前菜", "メイン", "ドリンク", "デザート", "サイド", "その他"],
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<MenuItem | undefined>();
  const [isSaving, setIsSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState("すべて");

  const loadAll = async () => {
    const [menuRes, settingsRes] = await Promise.all([
      fetch("/api/menu"),
      fetch("/api/settings"),
    ]);
    setItems(await menuRes.json());
    setSettings(await settingsRes.json());
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const displayCategories = ["すべて", ...settings.categories];
  const filtered = filterCategory === "すべて"
    ? items
    : items.filter((i) => i.category === filterCategory);

  const handleSave = async (formData: MenuFormData) => {
    setIsSaving(true);
    try {
      // カテゴリが新規の場合はsettingsにも追加
      if (!settings.categories.includes(formData.category)) {
        const newCats = [...settings.categories, formData.category];
        await fetch("/api/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categories: newCats }),
        });
      }

      if (editTarget) {
        const res = await fetch(`/api/menu/${editTarget.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error();
        toast.success("メニューを更新しました");
      } else {
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
      await loadAll();
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAvailable = async (item: MenuItem) => {
    try {
      await fetch(`/api/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      toast.success(item.isAvailable ? "売り切れにしました" : "販売中に戻しました");
      await loadAll();
    } catch {
      toast.error("更新に失敗しました");
    }
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`「${item.name}」を削除しますか？`)) return;
    try {
      await fetch(`/api/menu/${item.id}`, { method: "DELETE" });
      toast.success("削除しました");
      await loadAll();
    } catch {
      toast.error("削除に失敗しました");
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
      <header className="bg-white shadow-sm px-4 py-4 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 text-2xl leading-none">←</Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800">メニュー管理</h1>
              <p className="text-sm text-gray-400">{items.length}件</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/settings"
              className="px-3 py-2 border border-gray-300 text-gray-600 rounded-xl text-sm font-medium"
            >
              ⚙️ 設定
            </Link>
            <button
              onClick={() => { setEditTarget(undefined); setShowModal(true); }}
              className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded-xl font-semibold text-sm"
            >
              ＋ 追加
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto flex gap-2 mt-3 overflow-x-auto pb-1">
          {displayCategories.map((cat) => (
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

      <main className="max-w-4xl mx-auto px-4 py-4 pb-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">🍽️</p>
            <p>メニューがありません</p>
            <button
              onClick={() => { setEditTarget(undefined); setShowModal(true); }}
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
                <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 truncate">{item.name}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-gray-400">{item.category}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          item.taxType === "reduced"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {item.taxType === "reduced" ? "軽減8%" : "標準10%"}
                        </span>
                      </div>
                      <p className="text-orange-600 font-bold">¥{item.price.toLocaleString()} 税込</p>
                    </div>
                    {!item.isAvailable && (
                      <span className="flex-shrink-0 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                        売り切れ
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleToggleAvailable(item)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        item.isAvailable
                          ? "border-gray-300 text-gray-600"
                          : "border-green-400 text-green-600"
                      }`}
                    >
                      {item.isAvailable ? "売り切れにする" : "販売中に戻す"}
                    </button>
                    <button
                      onClick={() => { setEditTarget(item); setShowModal(true); }}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-blue-300 text-blue-600"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 text-red-400"
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

      {showModal && (
        <MenuItemModal
          item={editTarget}
          categories={settings.categories}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTarget(undefined); }}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
