"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppSettings, DisplayMode } from "@/lib/types";
import { DEFAULT_TAX_SETTINGS, displayModeLabel } from "@/lib/tax";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    tax: DEFAULT_TAX_SETTINGS,
    categories: ["前菜", "メイン", "ドリンク", "デザート", "サイド", "その他"],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => { setSettings(data); setLoading(false); });
  }, []);

  const save = async (updated: AppSettings) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSettings(data);
      toast.success("設定を保存しました");
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const setTax = (key: keyof typeof settings.tax, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      tax: { ...prev.tax, [key]: value },
    }));
  };

  const addCategory = () => {
    const cat = newCategory.trim();
    if (!cat || settings.categories.includes(cat)) return;
    setSettings((prev) => ({
      ...prev,
      categories: [...prev.categories, cat],
    }));
    setNewCategory("");
  };

  const removeCategory = (cat: string) => {
    if (settings.categories.length <= 1) {
      toast.error("カテゴリは1つ以上必要です");
      return;
    }
    setSettings((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== cat),
    }));
  };

  const moveCategory = (index: number, dir: -1 | 1) => {
    const cats = [...settings.categories];
    const target = index + dir;
    if (target < 0 || target >= cats.length) return;
    [cats[index], cats[target]] = [cats[target], cats[index]];
    setSettings((prev) => ({ ...prev, categories: cats }));
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
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 text-2xl leading-none">←</Link>
            <h1 className="text-xl font-bold text-gray-800">設定</h1>
          </div>
          <button
            onClick={() => save(settings)}
            disabled={saving}
            className="px-5 py-2 bg-orange-500 disabled:bg-orange-300 text-white rounded-xl text-sm font-bold"
          >
            {saving ? "保存中..." : "保存する"}
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-16">

        {/* ===== 税表示設定 ===== */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 text-lg mb-4">💴 税設定</h2>

          {/* 表示モード */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メニューの価格表示
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["included", "excluded"] as DisplayMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTax("displayMode", mode)}
                  className={`py-3 rounded-xl text-sm font-semibold border-2 transition-colors ${
                    settings.tax.displayMode === mode
                      ? "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 text-gray-600"
                  }`}
                >
                  {displayModeLabel(mode)}
                  <span className="block text-xs font-normal mt-0.5 text-gray-400">
                    {mode === "included" ? "¥1,100（税込）" : "¥1,000（税抜）"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 税率設定 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                標準税率（%）
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.tax.standardRate}
                onChange={(e) => setTax("standardRate", parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <p className="text-xs text-gray-400 mt-1">通常の飲食（店内）</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                軽減税率（%）
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.tax.reducedRate}
                onChange={(e) => setTax("reducedRate", parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <p className="text-xs text-gray-400 mt-1">テイクアウト・食品</p>
            </div>
          </div>

          <div className="mt-4 bg-yellow-50 rounded-xl px-4 py-3 text-xs text-yellow-700">
            ⚠️ 税率変更後は「保存する」をクリックしてください。変更はメニュー画面に即時反映されます。
          </div>
        </section>

        {/* ===== カテゴリ管理 ===== */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 text-lg mb-4">📋 カテゴリ管理</h2>

          <div className="space-y-2 mb-4">
            {settings.categories.map((cat, i) => (
              <div
                key={cat}
                className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3"
              >
                {/* 並び替えボタン */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveCategory(i, -1)}
                    disabled={i === 0}
                    className="text-gray-400 disabled:opacity-20 text-xs leading-none hover:text-gray-600"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCategory(i, 1)}
                    disabled={i === settings.categories.length - 1}
                    className="text-gray-400 disabled:opacity-20 text-xs leading-none hover:text-gray-600"
                  >
                    ▼
                  </button>
                </div>
                <span className="flex-1 text-gray-800 font-medium">{cat}</span>
                <button
                  type="button"
                  onClick={() => removeCategory(cat)}
                  className="text-red-400 hover:text-red-600 text-sm px-2 py-1"
                >
                  削除
                </button>
              </div>
            ))}
          </div>

          {/* カテゴリ追加 */}
          <div className="flex gap-2">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
              placeholder="新しいカテゴリ名（例：お酒）"
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              type="button"
              onClick={addCategory}
              className="px-5 py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm"
            >
              追加
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
