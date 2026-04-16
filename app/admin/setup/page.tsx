"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function StoreSetupPage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowser();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("stores").insert({
      owner_id: user.id,
      name: storeName.trim(),
    });

    if (error) {
      setError("店舗の作成に失敗しました。もう一度お試しください");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏪</div>
          <h1 className="text-2xl font-bold text-gray-800">店舗を設定</h1>
          <p className="text-sm text-gray-500 mt-1">初回ログイン — 店舗名を入力してください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              店舗名
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
              placeholder="例: 居酒屋 さくら"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !storeName.trim()}
            className="w-full bg-orange-500 disabled:bg-orange-300 text-white py-3 rounded-xl text-base font-semibold active:scale-95 transition-transform"
          >
            {loading ? "作成中..." : "店舗を作成してはじめる"}
          </button>
        </form>
      </div>
    </div>
  );
}
