"use client";

import { useCartStore } from "@/lib/store";
import { TaxSettings } from "@/lib/types";
import { calcTaxBreakdown } from "@/lib/tax";

interface OrderConfirmModalProps {
  taxSettings: TaxSettings;
  onConfirm: (notes: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function OrderConfirmModal({
  taxSettings,
  onConfirm,
  onCancel,
  isSubmitting,
}: OrderConfirmModalProps) {
  const { items, tableNumber } = useCartStore();
  const { standardBase, reducedBase, standardTax, reducedTax, total } =
    calcTaxBreakdown(items, taxSettings);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const notes = (e.currentTarget.elements.namedItem("notes") as HTMLTextAreaElement).value;
    onConfirm(notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-1">注文確認</h2>
          <p className="text-gray-500 text-sm mb-5">テーブル {tableNumber} の注文内容</p>

          {/* 注文内容 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={item.itemId} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium text-gray-800">
                  ¥{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* 税額内訳 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-1.5">
            {standardBase > 0 && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>標準税率対象（{taxSettings.standardRate}%）</span>
                <span>¥{standardBase.toLocaleString()} + 消費税¥{standardTax.toLocaleString()}</span>
              </div>
            )}
            {reducedBase > 0 && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>軽減税率対象（{taxSettings.reducedRate}%）</span>
                <span>¥{reducedBase.toLocaleString()} + 消費税¥{reducedTax.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base">
              <span>合計（税込）</span>
              <span className="text-orange-600">¥{total.toLocaleString()}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              備考・アレルギー情報（任意）
            </label>
            <textarea
              name="notes"
              rows={2}
              placeholder="アレルギー、辛さ調整など..."
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 mb-5"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-4 border-2 border-gray-300 text-gray-600 rounded-xl text-base font-semibold"
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 bg-orange-500 disabled:bg-orange-300 text-white rounded-xl text-base font-bold"
              >
                {isSubmitting ? "送信中..." : "注文を確定する"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
