"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MenuItem, AppSettings } from "@/lib/types";
import { MenuItemModal, MenuFormData } from "@/components/admin/MenuItemModal";
import { DEFAULT_TAX_SETTINGS } from "@/lib/tax";
import toast from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ── 並び替え可能な1行コンポーネント ──────────────────────────
function SortableMenuItem({
  item,
  onEdit,
  onToggle,
  onDelete,
  onPriceChange,
}: {
  item: MenuItem;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onPriceChange: (newPrice: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id! });
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(String(item.price));
  const priceInputRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.6 : 1,
  };

  const commitPrice = () => {
    const n = parseInt(priceInput);
    if (!isNaN(n) && n >= 0 && n !== item.price) {
      onPriceChange(n);
    }
    setEditingPrice(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
        !item.isAvailable ? "opacity-60 border-gray-200" : "border-gray-100"
      }`}
    >
      <div className="flex gap-3 p-4">
        {/* ドラッグハンドル */}
        <div
          {...attributes}
          {...listeners}
          className="flex flex-col items-center justify-center text-gray-300 cursor-grab active:cursor-grabbing touch-none select-none px-1 gap-0.5 self-stretch"
        >
          <span className="text-lg leading-none">⠿</span>
          <span className="text-lg leading-none">⠿</span>
        </div>

        {/* サムネイル */}
        <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
          )}
        </div>

        {/* テキスト */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1">
            <p className="font-bold text-gray-800 truncate text-base">{item.name}</p>
            {!item.isAvailable && (
              <span className="flex-shrink-0 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                売り切れ
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-gray-400">{item.category}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              item.taxType === "reduced" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              {item.taxType === "reduced" ? "軽減8%" : "標準10%"}
            </span>
          </div>
          {/* 価格：タップでインライン編集 */}
          {editingPrice ? (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-orange-600 font-bold">¥</span>
              <input
                ref={priceInputRef}
                type="number"
                min="0"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") commitPrice(); if (e.key === "Escape") setEditingPrice(false); }}
                onBlur={commitPrice}
                autoFocus
                className="w-24 border-b-2 border-orange-400 text-orange-600 font-bold text-base bg-orange-50 px-1 focus:outline-none rounded"
              />
              <span className="text-xs text-gray-400">税込</span>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); commitPrice(); }}
                className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold"
              >
                保存
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setPriceInput(String(item.price)); setEditingPrice(true); }}
              className="mt-1 text-orange-600 font-bold text-left hover:bg-orange-50 active:bg-orange-100 rounded px-1 -ml-1 transition-colors group flex items-center gap-1"
              title="タップで価格を変更"
            >
              ¥{item.price.toLocaleString()} 税込
              <span className="text-xs text-orange-300 opacity-0 group-hover:opacity-100 transition-opacity">✏️</span>
            </button>
          )}
        </div>
      </div>

      {/* アクションボタン：タッチしやすいサイズ */}
      <div className="flex border-t border-gray-100">
        <button
          onClick={onToggle}
          className={`flex-1 py-3.5 text-sm font-bold border-r border-gray-100 transition-colors ${
            item.isAvailable
              ? "text-gray-500 bg-gray-50"
              : "text-green-600 bg-green-50"
          }`}
        >
          {item.isAvailable ? "売り切れにする" : "販売中に戻す"}
        </button>
        <button
          onClick={onEdit}
          className="flex-1 py-3.5 text-sm font-bold text-blue-600 bg-blue-50 border-r border-gray-100"
        >
          ✏️ 編集
        </button>
        <button
          onClick={onDelete}
          className="px-5 py-3.5 text-sm font-bold text-red-400 bg-white"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

// ── メインページ ──────────────────────────────────────────────
export default function MenuAdminPage() {
  const searchParams = useSearchParams();
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

  // ?add=1 でアクセスされたら商品追加モーダルを自動オープン
  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setEditTarget(undefined);
      setShowModal(true);
    }
  }, [searchParams]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      try {
        await Promise.all(
          newItems.map((item, index) =>
            fetch(`/api/menu/${item.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sortOrder: index }),
            })
          )
        );
        toast.success("並び順を保存しました");
      } catch {
        toast.error("並び順の保存に失敗しました");
        await loadAll();
      }
    },
    [items]
  );

  const displayCategories = ["すべて", ...settings.categories];
  const isFiltered = filterCategory !== "すべて";
  const filtered = isFiltered
    ? items.filter((i) => i.category === filterCategory)
    : items;

  const handleSave = async (formData: MenuFormData) => {
    setIsSaving(true);
    try {
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

  // 価格インライン編集ハンドラ
  const handleQuickPriceChange = async (item: MenuItem, newPrice: number) => {
    try {
      await fetch(`/api/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: newPrice }),
      });
      toast.success(`価格を ¥${newPrice.toLocaleString()} に変更しました`);
      await loadAll();
    } catch {
      toast.error("価格の変更に失敗しました");
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
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🍽️</div>
          <p className="text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">

      {/* ===== ヘッダー ===== */}
      <header className="bg-white shadow-sm px-4 py-4 sticky top-0 z-30">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-xl"
              aria-label="戻る"
            >
              ←
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800 leading-none">メニュー管理</h1>
              <p className="text-xs text-gray-400 mt-0.5">{items.length}件登録</p>
            </div>
          </div>
          <Link
            href="/admin/settings"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500"
            aria-label="設定"
          >
            ⚙️
          </Link>
        </div>

        {/* カテゴリフィルター */}
        <div className="max-w-lg mx-auto flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
          {displayCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors min-h-[40px] ${
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

      {/* ===== リスト ===== */}
      <main className="max-w-lg mx-auto px-4 py-4">
        {isFiltered && filtered.length > 0 && (
          <p className="text-xs text-gray-400 text-center mb-3">
            並び替えは「すべて」表示のときのみ有効です
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-lg font-bold text-gray-500 mb-1">メニューがありません</p>
            <p className="text-sm mb-6">下のボタンから商品を追加してください</p>
          </div>
        ) : isFiltered ? (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
                  !item.isAvailable ? "opacity-60 border-gray-200" : "border-gray-100"
                }`}
              >
                <div className="flex gap-3 p-4">
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-bold text-gray-800 truncate text-base">{item.name}</p>
                      {!item.isAvailable && (
                        <span className="flex-shrink-0 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">売り切れ</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs text-gray-400">{item.category}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${item.taxType === "reduced" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {item.taxType === "reduced" ? "軽減8%" : "標準10%"}
                      </span>
                    </div>
                    <p className="text-orange-600 font-bold mt-0.5">¥{item.price.toLocaleString()} 税込</p>
                  </div>
                </div>
                <div className="flex border-t border-gray-100">
                  <button
                    onClick={() => handleToggleAvailable(item)}
                    className={`flex-1 py-3.5 text-sm font-bold border-r border-gray-100 ${item.isAvailable ? "text-gray-500 bg-gray-50" : "text-green-600 bg-green-50"}`}
                  >
                    {item.isAvailable ? "売り切れにする" : "販売中に戻す"}
                  </button>
                  <button
                    onClick={() => { setEditTarget(item); setShowModal(true); }}
                    className="flex-1 py-3.5 text-sm font-bold text-blue-600 bg-blue-50 border-r border-gray-100"
                  >
                    ✏️ 編集
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="px-5 py-3.5 text-sm font-bold text-red-400 bg-white"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id!)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {items.map((item) => (
                  <SortableMenuItem
                    key={item.id}
                    item={item}
                    onEdit={() => { setEditTarget(item); setShowModal(true); }}
                    onToggle={() => handleToggleAvailable(item)}
                    onDelete={() => handleDelete(item)}
                    onPriceChange={(newPrice) => handleQuickPriceChange(item, newPrice)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>

      {/* ===== 固定フッター：商品追加ボタン ===== */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent z-30">
        <div className="max-w-lg mx-auto">
          <button
            onClick={() => { setEditTarget(undefined); setShowModal(true); }}
            className="w-full py-4 bg-orange-500 text-white rounded-2xl text-lg font-black shadow-lg shadow-orange-200 active:scale-95 transition-transform"
          >
            ＋ 商品を追加する
          </button>
        </div>
      </div>

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
