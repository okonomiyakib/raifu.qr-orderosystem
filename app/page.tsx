import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">🍽️</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          QRオーダーシステム
        </h1>
        <p className="text-gray-500 mb-10">
          飲食店向けセルフオーダーシステム
        </p>

        <div className="flex flex-col gap-4">
          <Link
            href="/admin"
            className="block w-full py-4 px-6 bg-orange-500 text-white text-lg font-semibold rounded-xl shadow-md hover:bg-orange-600 transition-colors"
          >
            管理画面（QRコード発行）
          </Link>
          <Link
            href="/kitchen"
            className="block w-full py-4 px-6 bg-gray-800 text-white text-lg font-semibold rounded-xl shadow-md hover:bg-gray-900 transition-colors"
          >
            厨房ダッシュボード
          </Link>
        </div>

        <p className="mt-10 text-sm text-gray-400">
          お客様はテーブルのQRコードを読み込んでご注文ください
        </p>
      </div>
    </div>
  );
}
