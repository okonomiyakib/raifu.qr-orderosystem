"use client";

import { Option } from "@/lib/types";

interface OptionModalProps {
  options: Option[];
  selectedOptions: Option[];
  onToggle: (option: Option) => void;
  basePrice: number;
  onClose: () => void;
}

export function OptionModal({
  options,
  selectedOptions,
  onToggle,
  basePrice,
  onClose,
}: OptionModalProps) {
  const isSelected = (opt: Option) => selectedOptions.some((s) => s.id === opt.id);
  const optionTotal = selectedOptions.reduce((sum, o) => sum + o.price, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl w-full max-w-lg max-h-[70vh] flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="text-base font-bold text-gray-800">トッピングを選択</p>
          {optionTotal > 0 && (
            <span className="text-sm text-orange-500 font-medium">
              +¥{optionTotal.toLocaleString()}
            </span>
          )}
        </div>

        {/* オプション一覧（スクロール対応） */}
        <div className="overflow-y-auto flex-1 px-5 py-3 space-y-4">
          {options.map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isSelected(opt)}
                onChange={() => onToggle(opt)}
                className="w-5 h-5 accent-orange-500 cursor-pointer flex-shrink-0"
              />
              <span className="flex-1 text-base text-gray-700">{opt.name}</span>
              <span className="text-sm text-orange-500 font-medium">
                +¥{opt.price.toLocaleString()}
              </span>
            </label>
          ))}
        </div>

        {/* フッター */}
        <div className="px-5 py-4 border-t border-gray-100">
          {optionTotal > 0 && (
            <p className="text-sm text-gray-500 mb-3 text-right">
              合計 ¥{(basePrice + optionTotal).toLocaleString()}
              <span className="text-gray-400 font-normal ml-1">（税込）</span>
            </p>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-orange-500 text-white rounded-xl text-base font-bold active:scale-95 transition-transform"
          >
            決定
          </button>
        </div>
      </div>
    </div>
  );
}
