"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store";
import { TaxSettings } from "@/lib/types";
import { calcTaxBreakdown } from "@/lib/tax";

interface OrderConfirmModalProps {
  taxSettings: TaxSettings;
  onConfirm: (notes: string) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isSuccess: boolean;
}

/** Web Audio API で心地よいチャイム音を鳴らす */
function playSuccessSound() {
  try {
    const ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.13;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  } catch {
    // 音声非対応の場合は無視
  }
}

export function OrderConfirmModal({
  taxSettings,
  onConfirm,
  onCancel,
  isSubmitting,
  isSuccess,
}: OrderConfirmModalProps) {
  const { items, tableNumber } = useCartStore();
  const { standardBase, reducedBase, standardTax, reducedTax, total } =
    calcTaxBreakdown(items, taxSettings);

  // アニメーション用: isSuccess になった直後に遅延でクラスを付与
  const [showCheck, setShowCheck] = useState(false);
  const [showText, setShowText] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (!isSuccess) return;
    if (soundEnabled) playSuccessSound();
    // チェックマーク: 50ms後にスケールイン
    const t1 = setTimeout(() => setShowCheck(true), 50);
    // テキスト: 300ms後にフェードイン
    const t2 = setTimeout(() => setShowText(true), 300);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [isSuccess, soundEnabled]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const notes = (e.currentTarget.elements.namedItem("notes") as HTMLTextAreaElement).value;
    onConfirm(notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-3">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">

        {/* ===== 注文完了オーバーレイ ===== */}
        {isSuccess && (
          <div className="absolute inset-0 bg-green-500 flex flex-col items-center justify-center z-10 rounded-2xl">

            {/* 効果音トグル */}
            <button
              onClick={() => setSoundEnabled((v) => !v)}
              className="absolute top-4 right-4 text-green-200 text-xs px-3 py-1 rounded-full border border-green-300"
            >
              {soundEnabled ? "🔔 音あり" : "🔕 音なし"}
            </button>

            {/* チェックマーク（スケールイン） */}
            <div
              className={`w-28 h-28 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg
                transition-transform duration-500 ease-out
                ${showCheck ? "scale-100" : "scale-0"}`}
            >
              <span className="text-6xl leading-none text-green-500">✓</span>
            </div>

            {/* メッセージ（フェードイン） */}
            <div
              className={`text-center transition-opacity duration-400
                ${showText ? "opacity-100" : "opacity-0"}`}
            >
              <p className="text-white text-3xl font-black mb-2">注文完了！</p>
              <p className="text-green-100 text-lg font-medium">
                テーブル {tableNumber}
              </p>
              <p className="text-green-100 text-base mt-1">
                まもなくお届けします 🍽️
              </p>
            </div>

          </div>
        )}

        {/* ===== 通常の確認UI ===== */}
        <div className="p-5">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">注文確認</h2>
          <p className="text-base text-gray-500 mb-4">テーブル {tableNumber} の注文内容</p>

          {/* 注文内容リスト */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3 max-h-48 overflow-y-auto">
            {items.map((item) => (
              <div key={item.itemId} className="flex justify-between text-base">
                <span className="text-gray-700 font-medium">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-bold text-gray-800">
                  ¥{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* 税額内訳 */}
          <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2">
            {standardBase > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>標準税率（{taxSettings.standardRate}%）</span>
                <span>¥{standardBase.toLocaleString()} + 税¥{standardTax.toLocaleString()}</span>
              </div>
            )}
            {reducedBase > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>軽減税率（{taxSettings.reducedRate}%）</span>
                <span>¥{reducedBase.toLocaleString()} + 税¥{reducedTax.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg">
              <span>合計（税込）</span>
              <span className="text-orange-600 text-xl">¥{total.toLocaleString()}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block text-base font-semibold text-gray-700 mb-2">
              備考・アレルギー（任意）
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
                disabled={isSubmitting}
                className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl text-lg font-bold active:scale-95 transition-transform min-h-[56px] disabled:opacity-40"
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] py-4 bg-orange-500 disabled:bg-orange-300 text-white rounded-xl text-lg font-bold active:scale-95 transition-transform shadow-md min-h-[56px]"
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
