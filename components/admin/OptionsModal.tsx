"use client";

import { useState } from "react";
import { Option, MenuItem } from "@/lib/types";
import toast from "react-hot-toast";

interface OptionsModalProps {
  item: MenuItem;
  onClose: () => void;
  onSaved: () => void;
}

export function OptionsModal({ item, onClose, onSaved }: OptionsModalProps) {
  const [options, setOptions] = useState<Option[]>(item.options ?? []);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) {
      toast.error("オプション名を入力してください");
      return;
    }
    const newOption: Option = {
      id: Date.now().toString(),
      name,
      price: newPrice,
    };
    setOptions((prev) => [...prev, newOption]);
    setNewName("");
    setNewPrice(0);
  };

  const handleDelete = (id: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ options }),
      });
      if (!res.ok) throw new Error();
      toast.success("オプションを保存しました");
      onSaved();
      onClose();
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="p-5">

          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-gray-800">オプション管理</h2>
            <button
              onClick={onClose}
              className="text-gray-400 text-3xl leading-none w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-400 mb-5">{item.name}</p>

          {/* 登録済みオプション一覧 */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-2">登録済みオプション</p>
            {options.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center bg-gray-50 rounded-xl">
                オプションなし
              </p>
            ) : (
              <div className="space-y-2">
                {options.map((opt) => (
                  <div
                    key={opt.id}
                    className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                  >
                    <span className="text-sm font-medium text-gray-800">{opt.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-orange-600 font-bold">
                        {opt.price === 0 ? "無料" : `+¥${opt.price.toLocaleString()}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(opt.id)}
                        className="text-red-400 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 新規追加フォーム */}
          <div className="border-t border-gray-100 pt-4 mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">トッピングを追加</p>
            <div className="flex gap-2 mb-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
                }}
                placeholder="例：大盛り、辛さ増し"
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                <input
                  type="number"
                  min="0"
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                  className="w-24 border border-gray-300 rounded-xl pl-7 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className="w-full py-3 border-2 border-dashed border-orange-300 text-orange-500 rounded-xl text-sm font-semibold hover:bg-orange-50 transition-colors"
            >
              ＋ 追加
            </button>
          </div>

          {/* 保存・キャンセル */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border-2 border-gray-300 text-gray-600 rounded-xl text-base font-semibold"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-4 bg-orange-500 disabled:bg-orange-300 text-white rounded-xl text-base font-bold"
            >
              {isSaving ? "保存中..." : "保存する"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
