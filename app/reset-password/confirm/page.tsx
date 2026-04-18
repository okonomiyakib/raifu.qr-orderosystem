"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

type PageState = "loading" | "form" | "success" | "error";

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowser();

    // PKCE フロー: /auth/callback でコード交換済みのセッションが存在する場合、
    // PASSWORD_RECOVERY イベントが既に発火していることがある。
    // getSession() で recovery セッションを検出してフォームを開く。
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setPageState("form");
      }
    });

    // onAuthStateChange でも検出（PKCE コールバック後に発火するケース）
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setPageState("form");
      }
    });

    // 低速回線を考慮して 10 秒に延長
    const timer = setTimeout(() => {
      setPageState((prev) => (prev === "loading" ? "error" : prev));
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください");
      return;
    }
    if (password !== confirmPassword) {
      setError("パスワードが一致しません");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      // エラーコードに応じたメッセージ
      if (error.message.includes("same password")) {
        setError("現在と同じパスワードは使用できません");
      } else if (error.message.includes("weak")) {
        setError("パスワードが簡単すぎます。英数字を組み合わせてください");
      } else {
        setError("パスワードの更新に失敗しました。再度お試しください");
      }
      setLoading(false);
      return;
    }

    setPageState("success");
    setLoading(false);
    setTimeout(() => router.push("/login"), 3000);
  };

  // ロード中
  if (pageState === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8 text-center">
          <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">認証情報を確認中...</p>
          <p className="text-xs text-gray-400 mt-2">しばらくお待ちください</p>
        </div>
      </div>
    );
  }

  // リンク切れ・タイムアウト
  if (pageState === "error") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">リンクが無効です</h1>
          <p className="text-sm text-gray-500 mb-6">
            再設定リンクの有効期限が切れているか、すでに使用済みです。
          </p>
          <a
            href="/reset-password"
            className="block w-full py-4 bg-orange-500 text-white rounded-xl text-base font-bold text-center active:scale-95 transition-transform"
          >
            再設定メールを再送する
          </a>
          <a
            href="/login"
            className="block w-full mt-3 py-3 border-2 border-gray-200 text-gray-500 rounded-xl text-sm font-semibold text-center"
          >
            ログインに戻る
          </a>
        </div>
      </div>
    );
  }

  // 更新成功
  if (pageState === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">パスワードを更新しました</h1>
          <p className="text-sm text-gray-500 mb-1">ログインページへ移動します...</p>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-orange-400 h-1.5 rounded-full animate-[shrink_3s_linear_forwards]" />
          </div>
        </div>
      </div>
    );
  }

  // パスワード入力フォーム
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800">新しいパスワード</h1>
          <p className="text-sm text-gray-500 mt-1">6文字以上で設定してください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 新しいパスワード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              新しいパスワード
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl w-8 h-8 flex items-center justify-center"
                aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {/* 強度インジケーター */}
            {password.length > 0 && (
              <div className="mt-1.5 flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      password.length >= (i + 1) * 3
                        ? password.length >= 12 ? "bg-green-400"
                          : password.length >= 8 ? "bg-yellow-400"
                          : "bg-red-400"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-1 whitespace-nowrap">
                  {password.length < 6 ? "短すぎます" : password.length < 8 ? "普通" : password.length < 12 ? "良好" : "強力"}
                </span>
              </div>
            )}
          </div>

          {/* 確認 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード（確認）
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className={`w-full border rounded-xl px-4 py-3 pr-12 text-base focus:outline-none focus:ring-2 ${
                  passwordsMismatch
                    ? "border-red-300 focus:ring-red-300"
                    : passwordsMatch
                    ? "border-green-300 focus:ring-green-300"
                    : "border-gray-300 focus:ring-orange-400"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl w-8 h-8 flex items-center justify-center"
                aria-label={showConfirm ? "パスワードを隠す" : "パスワードを表示"}
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            {confirmPassword && (
              <p className={`text-xs font-medium mt-1 ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                {passwordsMatch ? "✓ パスワードが一致しています" : "✗ パスワードが一致しません"}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || passwordsMismatch || password.length < 6}
            className="w-full bg-orange-500 disabled:bg-orange-300 text-white py-4 rounded-xl text-base font-bold active:scale-95 transition-transform"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                更新中...
              </span>
            ) : "パスワードを更新する"}
          </button>
        </form>
      </div>
    </div>
  );
}
