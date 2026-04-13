"use client";

import { useState } from "react";
import Image from "next/image";
import { MenuItem } from "@/lib/types";

type FormData = Omit<MenuItem, "id" | "isAvailable">;

interface MenuItemModalProps {
  item?: MenuItem;
  onSave: (data: FormData) => void;
  onClose: () => void;
  isSaving: boolean;
}

const CATEGORIES = ["前菜", "メイン", "ドリンク", "デザート", "サイド", "その他"];

export function MenuItemModal({ item, onSave, onClose, isSaving }: MenuItemModalProps) {
  const [form, setForm] = useState<FormData>({
    name: item?.name ?? "",
    description: item?.description ?? "",
    price: item?.price ?? 0,
    category: item?.category ?? "メイン",
    imageUrl: item?.imageUrl ?? "",
    sortOrder: item?.sortOrder ?? 99,
  });

  const isEdit = !!item;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const set = (key: keyof FormData, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-800">
              {isEdit ? "メニューを編集" : "メニューを追加"}
            </h2>
            <button onClick={onClose} className="text-gray-400 text-2xl leading-none">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 画像プレビュー */}
            {form.imageUrl && (
              <div className="relative h-40 w-full rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={form.imageUrl}
                  alt="プレビュー"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                商品名 <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="例：唐揚げ（5個）"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  価格（円） <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => set("price", parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                説明文
              </label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                placeholder="例：ジューシーな鶏の唐揚げ。レモン添え"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                画像URL
              </label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <p className="text-xs text-gray-400 mt-1">
                Unsplash等の画像URLを貼り付けてください
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                表示順（小さいほど上に表示）
              </label>
              <input
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 border-2 border-gray-300 text-gray-600 rounded-xl text-base font-semibold"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-4 bg-orange-500 disabled:bg-orange-300 text-white rounded-xl text-base font-bold"
              >
                {isSaving ? "保存中..." : isEdit ? "更新する" : "追加する"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
