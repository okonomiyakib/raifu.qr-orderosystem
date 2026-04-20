"use client";

import { Option } from "@/lib/types";

interface OptionSelectorProps {
  options: Option[];
  selectedOptions: Option[];
  onToggle: (option: Option) => void;
  basePrice: number;
}

/**
 * トッピング・オプション選択コンポーネント
 * チェックボックス形式で複数選択可能
 * 価格変動をリアルタイム表示
 */
export function OptionSelector({
  options,
  selectedOptions,
  onToggle,
  basePrice,
}: OptionSelectorProps) {
  const optionTotal = selectedOptions.reduce((sum, o) => sum + o.price, 0);
  const isSelected = (opt: Option) => selectedOptions.some((s) => s.id === opt.id);

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-sm font-semibold text-gray-600 mb-2">トッピング</p>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label
            key={opt.id}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={isSelected(opt)}
              onChange={() => onToggle(opt)}
              className="w-4 h-4 accent-orange-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 flex-1 group-hover:text-gray-900">
              {opt.name}
            </span>
            <span className="text-sm text-orange-500 font-medium">
              +¥{opt.price.toLocaleString()}
            </span>
          </label>
        ))}
      </div>
      {optionTotal > 0 && (
        <p className="text-xs text-gray-500 mt-2 text-right font-medium">
          合計 ¥{(basePrice + optionTotal).toLocaleString()}
          <span className="text-gray-400 font-normal ml-1">（税込）</span>
        </p>
      )}
    </div>
  );
}
