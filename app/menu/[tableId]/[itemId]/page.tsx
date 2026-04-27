"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { MenuItem, TaxSettings, Option } from "@/lib/types";
import { DEFAULT_TAX_SETTINGS, displayPrice } from "@/lib/tax";
import { useCartStore } from "@/lib/store";
import toast from "react-hot-toast";

export default function ItemDetailPage() {
  const { tableId, itemId } = useParams<{ tableId: string; itemId: string }>();
  const router = useRouter();
  const { addItem, setTable } = useCartStore();

  const [item, setItem] = useState<MenuItem | null>(null);
  const [taxSettings, setTaxSettings] = useState<TaxSettings>(DEFAULT_TAX_SETTINGS);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const tableRes = await fetch(`/api/tables/${tableId}`);
      if (!tableRes.ok) { router.back(); return; }
      const tableData = await tableRes.json();
      setTable(tableId, tableData.tableNumber);

      const storeParam = tableData.storeId ? `?storeId=${tableData.storeId}` : "";
      const [menuRes, settingsRes] = await Promise.all([
        fetch(`/api/menu${storeParam}`),
        fetch(`/api/settings${storeParam}`),
      ]);
      const menuData: MenuItem[] = await menuRes.json();
      const settingsData = await settingsRes.json();

      const found = menuData.find((m) => m.id === itemId);
      if (!found) { router.back(); return; }
      setItem(found);
      setTaxSettings(settingsData.tax ?? DEFAULT_TAX_SETTINGS);
    } catch {
      toast.error("データの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [tableId, itemId, router, setTable]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="animate-spin text-5xl">🍽️</div>
      </div>
    );
  }

  const optionTotal = selectedOptions.reduce((sum, o) => sum + o.price, 0);
  const { amount, label } = displayPrice(
    item.price + optionTotal,
    item.taxType ?? "standard",
    taxSettings
  );
  const hasOptions = (item.options ?? []).length > 0;
  const isSelected = (opt: Option) => selectedOptions.some((s) => s.id === opt.id);

  const handleToggle = (opt: Option) => {
    setSelectedOptions((prev) =>
      prev.some((o) => o.id === opt.id)
        ? prev.filter((o) => o.id !== opt.id)
        : [...prev, opt]
    );
  };

  const handleAddToCart = () => {
    const cartItemId =
      selectedOptions.length > 0
        ? `${item.id}::${selectedOptions.map((o) => o.id).sort().join(",")}`
        : item.id;

    for (let i = 0; i < quantity; i++) {
      addItem({
        itemId: cartItemId,
        name: item.name,
        price: item.price + optionTotal,
        taxType: item.taxType ?? "standard",
        quantity: 1,
        selectedOptions: selectedOptions.length > 0 ? selectedOptions : undefined,
      });
    }
    toast.success(`${item.name}をカートに追加しました`);
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 text-xl active:scale-90 transition-transform"
            aria-label="戻る"
          >
            ←
          </button>
          <h1 className="text-lg font-bold text-gray-800 truncate">{item.name}</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto pb-36">
        {/* 商品画像 */}
        <div className="relative h-60 w-full bg-gray-100">
          <Image
            src={
              item.imageUrl ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"
            }
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 512px"
            unoptimized
          />
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
              <span className="text-white font-bold text-2xl">売り切れ</span>
            </div>
          )}
          {item.taxType === "reduced" && (
            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
              軽減税率
            </div>
          )}
        </div>

        <div className="px-5 py-5 space-y-6">
          {/* 商品情報 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{item.name}</h2>
            {item.description && (
              <p className="text-base text-gray-500 leading-relaxed">{item.description}</p>
            )}
          </div>

          {/* トッピング */}
          {hasOptions && (
            <div>
              <p className="text-base font-bold text-gray-700 mb-3">トッピング</p>
              <div className="space-y-2">
                {item.options!.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 cursor-pointer active:bg-orange-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected(opt)}
                      onChange={() => handleToggle(opt)}
                      className="w-5 h-5 accent-orange-500 cursor-pointer flex-shrink-0"
                    />
                    <span className="flex-1 text-base text-gray-700">{opt.name}</span>
                    <span className="text-sm text-orange-500 font-medium">
                      +¥{opt.price.toLocaleString()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 数量 */}
          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100">
            <p className="text-base font-bold text-gray-700">数量</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-11 h-11 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-2xl font-bold active:scale-90 transition-transform"
                aria-label="減らす"
              >
                −
              </button>
              <span className="text-xl font-bold text-gray-800 w-6 text-center tabular-nums">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-11 h-11 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold active:scale-90 transition-transform"
                aria-label="増やす"
              >
                ＋
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 固定フッター */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 px-5 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">合計（{label}）</span>
            <span className="text-2xl font-bold text-orange-600">
              ¥{(amount * quantity).toLocaleString()}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!item.isAvailable}
            className="w-full py-4 bg-orange-500 disabled:bg-gray-300 text-white rounded-xl text-lg font-bold active:scale-95 transition-transform shadow-md"
          >
            カートに追加
          </button>
        </div>
      </div>
    </div>
  );
}
