"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { MenuItem, TaxType } from "@/lib/types";
import toast from "react-hot-toast";

export type MenuFormData = Omit<MenuItem, "id" | "isAvailable">;

interface MenuItemModalProps {
  item?: MenuItem;
  categories: string[];
  onSave: (data: MenuFormData) => void;
  onClose: () => void;
  isSaving: boolean;
}

export function MenuItemModal({
  item,
  categories,
  onSave,
  onClose,
  isSaving,
}: MenuItemModalProps) {
  const isEdit = !!item;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<MenuFormData>({
    name: item?.name ?? "",
    description: item?.description ?? "",
    price: item?.price ?? 0,
    taxType: item?.taxType ?? "standard",
    category: item?.category ?? (categories[0] ?? "メイン"),
    imageUrl: item?.imageUrl ?? "",
    sortOrder: item?.sortOrder ?? 99,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);

  const set = <K extends keyof MenuFormData>(key: K, value: MenuFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // 画像をCloudinaryにアップロード
  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("画像ファイルを選択してください");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Cloudinaryにアップロード中...");

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "dadqxvtpy";
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "ml_default";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data?.error?.message ?? "アップロード失敗";
        throw new Error(errMsg);
      }

      set("imageUrl", data.secure_url);
      toast.success("画像をアップロードしました！", { id: toastId });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "アップロードに失敗しました";
      toast.error(msg, { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  // 端末の写真から選択
  const openLibrary = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
    e.target.value = "";
  };

  const handleAddCategory = () => {
    const cat = newCategory.trim();
    if (!cat) return;
    set("category", cat);
    setNewCategory("");
    setShowNewCategory(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-800">
              {isEdit ? "メニューを編集" : "メニューを追加"}
            </h2>
            <button onClick={onClose} className="text-gray-400 text-3xl leading-none w-8 h-8 flex items-center justify-center">×</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ===== 画像 ===== */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">商品画像</label>

              {/* プレビュー */}
              <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-gray-100 mb-3">
                {isUploading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 gap-2">
                    <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">アップロード中...</p>
                  </div>
                ) : form.imageUrl ? (
                  <>
                    <Image src={form.imageUrl} alt="プレビュー" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => set("imageUrl", "")}
                      className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    <div className="text-center">
                      <p className="text-5xl mb-2">📷</p>
                      <p className="text-sm text-gray-400">写真を追加してください</p>
                    </div>
                  </div>
                )}
              </div>

              {/* アップロードボタン */}
              <button
                type="button"
                onClick={openLibrary}
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-orange-50 border-2 border-orange-200 rounded-xl text-sm font-semibold text-orange-600 active:scale-95 transition-transform disabled:opacity-40"
              >
                🖼️ 端末の写真からアップロード
              </button>

              <p className="text-xs text-gray-400 mt-2 text-center">
                写真はCloudinaryに自動アップロードされます
              </p>

              {/* 隠しinput */}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            {/* ===== 商品名 ===== */}
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

            {/* ===== 価格・税区分 ===== */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  価格（税込） <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => set("price", parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-xl pl-7 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">税区分</label>
                <select
                  value={form.taxType}
                  onChange={(e) => set("taxType", e.target.value as TaxType)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                >
                  <option value="standard">標準（10%）</option>
                  <option value="reduced">軽減（8%）</option>
                </select>
              </div>
            </div>

            {/* ===== カテゴリ ===== */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                カテゴリ <span className="text-red-500">*</span>
              </label>
              {!showNewCategory ? (
                <div className="flex gap-2">
                  <select
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  >
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(true)}
                    className="px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-orange-500 hover:bg-orange-50 whitespace-nowrap"
                  >
                    ＋ 新規
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                    placeholder="新しいカテゴリ名"
                    className="flex-1 border border-orange-400 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <button type="button" onClick={handleAddCategory} className="px-4 py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold">追加</button>
                  <button type="button" onClick={() => setShowNewCategory(false)} className="px-3 py-3 border border-gray-300 text-gray-500 rounded-xl text-sm">✕</button>
                </div>
              )}
            </div>

            {/* ===== 説明文 ===== */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">説明文</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                placeholder="例：ジューシーな鶏の唐揚げ。レモン添え"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            {/* ===== 保存ボタン ===== */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-4 border-2 border-gray-300 text-gray-600 rounded-xl text-base font-semibold">
                キャンセル
              </button>
              <button type="submit" disabled={isSaving || isUploading} className="flex-1 py-4 bg-orange-500 disabled:bg-orange-300 text-white rounded-xl text-base font-bold">
                {isSaving ? "保存中..." : isEdit ? "更新する" : "追加する"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
