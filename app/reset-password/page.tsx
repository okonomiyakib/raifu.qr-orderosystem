"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const RESEND_COOLDOWN = 60; // 再送クールダウン（秒）

function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(() =>
    searchParams.get("error") === "invalid_link"
      ? "再設定リンクが無効または期限切れです。もう一度メールを送信してください。"
      : null
  );
  const [cooldown, setCooldown] = useState(0);

  // 再送クールダウンカウントダウン
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((v) => v - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowser();

    // Supabase は存在しないメールでも成功を返す（情報漏洩防止）
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password/confirm`,
    });

    if (error) {
      // ネットワークエラー・設定エラーのみここに来る
      if (error.message.includes("rate") || error.status === 429) {
        setError("送信が多すぎます。しばらくしてから再試行してください");
      } else {
        setError("送信できませんでした。時間をおいて再試行してください");
      }
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
    setCooldown(RESEND_COOLDOWN);
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setSent(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔑</div>
          <h1 className="text-2xl font-bold text-gray-800">パスワード再設定</h1>
          <p className="text-sm text-gray-500 mt-1">
            登録済みのメールアドレスに再設定リンクを送信します
          </p>
        </div>

        {sent ? (
          /* 送信完了状態 */
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-5">
              <div className="text-3xl mb-2">📬</div>
              <p className="text-green-700 font-bold text-base mb-1">メールを送信しました</p>
              <p className="text-green-600 text-sm leading-relaxed">
                <span className="font-medium break-all">{email}</span>
                <br />に再設定リンクを送りました。
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl px-4 py-3 text-left space-y-1.5 text-sm text-gray-500">
              <p>📩 受信トレイを確認してください</p>
              <p>📁 届かない場合は迷惑メールフォルダも確認</p>
              <p>⏱ リンクの有効期限は1時間です</p>
            </div>

            {/* 再送ボタン（クールダウン付き） */}
            <button
              onClick={handleResend}
              disabled={cooldown > 0}
              className="w-full py-3 border-2 border-gray-200 text-gray-500 disabled:text-gray-300 rounded-xl text-sm font-semibold transition-colors"
            >
              {cooldown > 0
                ? `再送できるまで ${cooldown}秒`
                : "メールが届かない場合は再送する"}
            </button>

            <Link
              href="/login"
              className="block w-full text-center py-3 bg-orange-500 text-white rounded-xl text-base font-bold active:scale-95 transition-transform"
            >
              ログインに戻る
            </Link>
          </div>
        ) : (
          /* メールアドレス入力フォーム */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                placeholder="owner@example.com"
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
              disabled={loading || !email.trim()}
              className="w-full bg-orange-500 disabled:bg-orange-300 text-white py-4 rounded-xl text-base font-bold active:scale-95 transition-transform"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  送信中...
                </span>
              ) : "再設定メールを送信"}
            </button>

            <Link
              href="/login"
              className="block w-full text-center py-3 border-2 border-gray-200 text-gray-600 rounded-xl text-base font-semibold"
            >
              ログインに戻る
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPageWrapper() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}
