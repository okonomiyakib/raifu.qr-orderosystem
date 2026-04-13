"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store";

export default function OrderCompletePage() {
  const { tableId, tableNumber } = useCartStore();

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full text-center">
        <div className="text-7xl mb-6 animate-bounce">✅</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          ご注文ありがとうございます！
        </h1>
        <p className="text-gray-500 mb-2">
          テーブル <span className="font-bold text-orange-600">{tableNumber}</span> に
        </p>
        <p className="text-gray-500 mb-8">
          ご注文を受け付けました。<br />
          しばらくお待ちください。
        </p>

        <div className="bg-white rounded-2xl p-5 mb-8 shadow-sm">
          <p className="text-sm text-gray-500">💡 追加注文はQRコードを再度読み込むか、下のボタンからどうぞ</p>
        </div>

        {tableId && (
          <Link
            href={`/menu/${tableId}`}
            className="block w-full py-4 bg-orange-500 text-white text-lg font-bold rounded-xl shadow-md mb-3"
          >
            追加注文する
          </Link>
        )}
      </div>
    </div>
  );
}
