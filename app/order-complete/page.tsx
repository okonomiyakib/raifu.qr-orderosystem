"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store";

export default function OrderCompletePage() {
  const { tableId, tableNumber } = useCartStore();
  const [visible, setVisible] = useState(false);

  // マウント後にフェードイン
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div
        className={`max-w-sm w-full text-center transition-all duration-500 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        {/* チェックマーク */}
        <div className="flex justify-center mb-6">
          <div className="w-28 h-28 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-6xl leading-none text-white">✓</span>
          </div>
        </div>

        {/* メインメッセージ */}
        <h1 className="text-3xl font-black text-gray-800 mb-3">
          注文完了！
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          テーブル <span className="font-bold text-green-600">{tableNumber}</span>
        </p>
        <p className="text-lg text-gray-500 mb-8 leading-relaxed">
          ご注文を受け付けました。<br />
          まもなくお届けします。
        </p>

        {/* 待ち時間の案内 */}
        <div className="bg-white rounded-2xl p-5 mb-8 shadow-sm border border-green-100">
          <p className="text-base text-gray-600">
            追加のご注文はいつでもどうぞ
          </p>
        </div>

        {/* 追加注文ボタン */}
        {tableId && (
          <Link
            href={`/menu/${tableId}`}
            className="block w-full py-5 bg-orange-500 text-white text-xl font-bold rounded-2xl shadow-md active:scale-95 transition-transform min-h-[60px] flex items-center justify-center"
          >
            追加注文する
          </Link>
        )}
      </div>
    </div>
  );
}
