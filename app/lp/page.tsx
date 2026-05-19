import Link from "next/link";

export const metadata = {
  title: "少人数でも回るお店へ｜QRオーダーシステム",
  description:
    "QR注文、厨房連携、配膳管理まで。個人店・小規模飲食店向けのシンプルな注文システム。初期費用30,000円・月額10,000円で導入できます。",
};

/* ─── 小コンポーネント ─── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[#B22222] font-bold text-sm tracking-widest uppercase mb-3">
      {children}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-snug mb-4">
      {children}
    </h2>
  );
}

/* ─── メインページ ─── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">

      {/* ━━━━━━━━━━ HEADER ━━━━━━━━━━ */}
      <header className="sticky top-0 z-50 bg-[#1A1A3E]/95 backdrop-blur-sm border-b border-[#2A2A5A]">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="text-lg font-black text-[#C8973D]">🥷 QRオーダー</span>
          <a
            href="#contact"
            className="px-4 py-2 bg-[#B22222] text-white text-sm font-bold rounded-lg active:scale-95 transition-transform shadow-sm"
          >
            無料で相談する
          </a>
        </div>
      </header>

      {/* ━━━━━━━━━━ HERO ━━━━━━━━━━ */}
      <section className="relative bg-[#1A1A3E] pt-16 pb-20 px-5 overflow-hidden">
        {/* 和風ドット背景（薄く） */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle, #C8973D 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#C8973D]/20 text-[#C8973D] text-xs font-bold px-4 py-1.5 rounded-full mb-6 tracking-wide border border-[#C8973D]/30">
            <span>🥷</span> 個人店・小規模飲食店向け
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-6">
            注文対応の負担を減らし、<br />
            <span className="text-[#C8973D]">少人数でも回るお店</span>へ
          </h1>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed mb-10 max-w-xl mx-auto">
            QR注文、厨房連携、配膳管理まで。<br />
            個人店向けのシンプルな注文システムです。
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#contact"
              className="px-8 py-4 bg-[#B22222] text-white text-lg font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              無料で相談する →
            </a>
            <a
              href="#flow"
              className="px-8 py-4 bg-white/10 text-white text-lg font-bold rounded-xl border border-white/20 active:scale-95 transition-transform backdrop-blur-sm"
            >
              導入の流れを見る
            </a>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            初期設定サポート込み・契約縛りなし
          </p>
        </div>
      </section>

      {/* ━━━━━━━━━━ SOCIAL PROOF ━━━━━━━━━━ */}
      <section className="bg-gray-50 py-8 px-5">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-sm text-gray-500 mb-6 font-medium">こんなお店が使っています</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["居酒屋・焼き鳥", "ラーメン・麺類", "カフェ・喫茶", "定食・食堂"].map((label) => (
              <div key={label} className="bg-white rounded-xl px-3 py-3 text-center text-sm font-semibold text-gray-600 border border-gray-100 shadow-sm">
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ PROBLEMS ━━━━━━━━━━ */}
      <section className="py-20 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>こんな悩みはありませんか？</SectionLabel>
            <SectionTitle>
              人手が足りなくて、<br />
              お店が回らなくなっている
            </SectionTitle>
            <p className="text-gray-500 text-sm sm:text-base">
              飲食店の現場でよく聞かれる声です。
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: "😓",
                title: "ホールスタッフが足りない",
                body: "注文を取りに行く余裕がなく、お客さんを待たせてしまう。呼ばれても気づけないことも。",
              },
              {
                icon: "📝",
                title: "注文ミスが起きてしまう",
                body: "口頭や手書きメモのせいで聞き間違い・書き間違いが発生。やり直しが手間とコストになる。",
              },
              {
                icon: "🔥",
                title: "ピーク時間が回らない",
                body: "週末や夜の混み合う時間帯、注文・運搬・会計が同時に押し寄せてパンクしてしまう。",
              },
              {
                icon: "📋",
                title: "メニュー変更が面倒",
                body: "紙のメニューを都度印刷し直すのが手間。値段変更も季節限定も、すぐ対応できない。",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-red-50 border border-red-100 rounded-2xl p-5 flex gap-4"
              >
                <span className="text-3xl leading-none flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="font-bold text-gray-800 mb-1">{item.title}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ SOLUTION ━━━━━━━━━━ */}
      <section className="bg-gray-900 py-20 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>解決策</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-snug mb-4">
              QRコード1枚で、<br />
              <span className="text-orange-400">注文の流れをまるごと自動化</span>
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              スタッフが注文を取りに行かなくても、厨房にすぐ届く仕組みです。
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              {
                icon: "📱",
                step: "01",
                title: "お客さんがQRで注文",
                body: "テーブルのQRコードをスキャン。スマホからそのままメニューを見て注文できます。アプリ不要。",
              },
              {
                icon: "🍳",
                step: "02",
                title: "厨房のiPadに即反映",
                body: "注文が入った瞬間、厨房の画面に表示されます。口頭でのやり取りがゼロになります。",
              },
              {
                icon: "✅",
                step: "03",
                title: "提供済みを管理",
                body: "料理を出したらチェックするだけ。どのテーブルに何が未提供かが一目でわかります。",
              },
              {
                icon: "✏️",
                step: "04",
                title: "スマホでメニュー編集",
                body: "管理画面から価格変更・品切れ対応・新メニュー追加がスマホ1台でできます。",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-gray-800 rounded-2xl p-5 border border-gray-700"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl leading-none">{item.icon}</span>
                  <span className="text-orange-400 text-xs font-black tracking-widest">STEP {item.step}</span>
                </div>
                <p className="font-bold text-white mb-2">{item.title}</p>
                <p className="text-sm text-gray-400 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ BENEFITS ━━━━━━━━━━ */}
      <section className="py-20 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>導入メリット</SectionLabel>
            <SectionTitle>
              「入れてよかった」と<br />感じる4つの変化
            </SectionTitle>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                icon: "🙌",
                color: "bg-red-50 border-red-100",
                accent: "text-[#B22222]",
                title: "注文取りの負担が減る",
                body: "スタッフがテーブルを回る回数が激減。その時間を料理・接客の質向上に使えます。",
              },
              {
                icon: "🎯",
                color: "bg-blue-50 border-blue-100",
                accent: "text-blue-500",
                title: "注文ミスがなくなる",
                body: "お客さんが直接入力するので聞き間違いがゼロに。クレームやロスが大幅に減ります。",
              },
              {
                icon: "⚡",
                color: "bg-green-50 border-green-100",
                accent: "text-green-600",
                title: "回転率が上がる",
                body: "注文がスムーズになると1組あたりの滞在時間が短縮。ピーク時間の売上が伸びます。",
              },
              {
                icon: "💰",
                color: "bg-purple-50 border-purple-100",
                accent: "text-purple-500",
                title: "人件費を圧縮できる",
                body: "ホール1人でも回せる体制を作れます。アルバイト採用コストを抑えながら営業できます。",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-2xl p-6 border ${item.color}`}
              >
                <span className="text-3xl leading-none block mb-3">{item.icon}</span>
                <p className={`font-black text-lg mb-2 ${item.accent}`}>{item.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ PRICING ━━━━━━━━━━ */}
      <section className="bg-[#FAFAF6] py-20 px-5">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <SectionLabel>料金</SectionLabel>
            <SectionTitle>
              シンプルな料金体系。<br />隠れた費用はありません。
            </SectionTitle>
          </div>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-[#E8E0D5]">
            {/* プラン名 */}
            <div className="bg-[#1A1A3E] px-8 py-5 text-center">
              <p className="text-[#C8973D] text-sm font-bold tracking-wider">スタンダードプラン</p>
              <p className="text-gray-300 text-xs mt-1">個人店・小規模飲食店向け</p>
            </div>
            {/* 料金 */}
            <div className="px-8 py-8">
              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <div className="text-center p-5 bg-gray-50 rounded-2xl border border-[#E8E0D5]">
                  <p className="text-xs text-gray-500 font-semibold mb-1">初期費用</p>
                  <p className="text-4xl font-black text-gray-900">¥30,000</p>
                  <p className="text-xs text-gray-400 mt-1">初期設定サポート込み</p>
                </div>
                <div className="text-center p-5 bg-red-50 rounded-2xl border-2 border-[#B22222]/30">
                  <p className="text-xs text-[#B22222] font-semibold mb-1">月額費用</p>
                  <p className="text-4xl font-black text-[#B22222]">¥10,000</p>
                  <p className="text-xs text-gray-400 mt-1">税込・いつでも解約可</p>
                </div>
              </div>
              {/* 含まれるもの */}
              <p className="text-sm font-bold text-gray-700 mb-3">料金に含まれるもの</p>
              <ul className="space-y-2 mb-8">
                {[
                  "QR注文機能（テーブル数無制限）",
                  "厨房ダッシュボード",
                  "メニュー管理（画像・価格・カテゴリ）",
                  "トッピング・オプション設定",
                  "スタッフ呼び出し機能",
                  "初期設定・メニュー登録サポート",
                  "操作マニュアル",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-[#B22222] font-black mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className="block w-full py-4 bg-[#B22222] text-white text-center font-bold text-lg rounded-2xl active:scale-95 transition-transform shadow-md"
              >
                無料で相談する →
              </a>
              <p className="text-center text-xs text-gray-400 mt-3">
                相談・見積もりは無料です。押し売りは一切しません。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ FLOW ━━━━━━━━━━ */}
      <section id="flow" className="py-20 px-5">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <SectionLabel>導入の流れ</SectionLabel>
            <SectionTitle>
              最短1週間で<br />使い始められます
            </SectionTitle>
          </div>
          <div className="space-y-4">
            {[
              {
                step: "01",
                icon: "💬",
                title: "ヒアリング",
                body: "お店の規模・テーブル数・課題をお聞きします。LINEまたはメールでOK。費用は無料です。",
                duration: "1〜2日",
              },
              {
                step: "02",
                icon: "📋",
                title: "メニュー登録",
                body: "既存メニューを共有いただければ、初期登録はこちらで対応します。写真があればなお良し。",
                duration: "2〜3日",
              },
              {
                step: "03",
                icon: "📲",
                title: "QR設置",
                body: "印刷用QRコードをお渡しします。テーブルに置くだけ。工事・機器の購入は不要です。",
                duration: "当日",
              },
              {
                step: "04",
                icon: "🚀",
                title: "運用開始",
                body: "実際に使いながら不明点はすぐサポート。慣れてきたらメニューの編集も自分でできます。",
                duration: "翌日から",
              },
            ].map((item, i) => (
              <div key={item.step} className="flex gap-4">
                {/* ステップライン */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-[#1A1A3E] text-[#C8973D] flex items-center justify-center font-black text-sm flex-shrink-0 border border-[#C8973D]/40">
                    {item.step}
                  </div>
                  {i < 3 && <div className="w-0.5 flex-1 bg-[#E8E0D5] my-1" />}
                </div>
                {/* 内容 */}
                <div className="pb-6 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl leading-none">{item.icon}</span>
                    <p className="font-black text-gray-900 text-base">{item.title}</p>
                    <span className="ml-auto text-xs bg-[#B22222]/10 text-[#B22222] font-bold px-2 py-0.5 rounded-full">
                      {item.duration}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ FAQ ━━━━━━━━━━ */}
      <section className="bg-[#FAFAF6] py-20 px-5">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <SectionLabel>よくある質問</SectionLabel>
            <SectionTitle>導入前に気になること</SectionTitle>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "お客さんがスマホを持っていない場合はどうなりますか？",
                a: "スタッフが代わりに入力することができます。管理画面から手動で注文を追加する機能があります。",
              },
              {
                q: "Wi-Fiやタブレットは自分で用意しますか？",
                a: "はい。お店のWi-Fiと、厨房用にタブレット（iPadなど）をご準備いただければ動作します。初期費用に機器代は含まれていません。",
              },
              {
                q: "途中でメニューを変えることはできますか？",
                a: "はい。スマホから価格変更・品切れ設定・新メニュー追加がリアルタイムでできます。",
              },
              {
                q: "解約はいつでもできますか？",
                a: "はい。月単位のご契約です。解約したい月の前月末までにご連絡いただければ、翌月から停止できます。",
              },
              {
                q: "ITに詳しくないのですが使えますか？",
                a: "はい。導入時の初期設定はすべてこちらで対応します。操作はスマホでのみで完結する設計です。",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group"
              >
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-gray-800 text-sm list-none">
                  <span>Q. {item.q}</span>
                  <span className="text-[#B22222] font-black text-lg ml-3 flex-shrink-0 group-open:rotate-45 transition-transform">＋</span>
                </summary>
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ CONTACT CTA ━━━━━━━━━━ */}
      <section id="contact" className="bg-[#1A1A3E] py-20 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <span className="text-4xl block mb-4">📩</span>
          <SectionLabel>お問い合わせ</SectionLabel>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 leading-snug">
            まずは気軽にご相談ください。<br />
            <span className="text-[#C8973D]">費用は一切かかりません。</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-10 leading-relaxed">
            「うちの店に合うかわからない」「もう少し詳しく聞きたい」<br className="hidden sm:block" />
            そんな段階でも大歓迎です。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://line.me/ti/p/~YOUR_LINE_ID"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-[#06C755] text-white text-lg font-bold rounded-2xl active:scale-95 transition-transform shadow-lg"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.02 2 11c0 2.87 1.38 5.44 3.56 7.15-.15.56-.58 2.04-.67 2.36-.11.39.14.39.29.28.12-.08 1.56-1.03 2.19-1.45.79.13 1.61.2 2.63.2 5.52 0 10-4.02 10-9s-4.48-9-10-9z"/>
              </svg>
              LINEで相談する
            </a>
            <a
              href="mailto:contact@example.com"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-800 text-lg font-bold rounded-2xl active:scale-95 transition-transform"
            >
              ✉️ メールで問い合わせ
            </a>
          </div>
          <div className="mt-10 grid sm:grid-cols-3 gap-4 text-sm text-gray-400">
            <div className="bg-[#2A2A5A] rounded-xl p-4 border border-[#3A3A6A]">
              <p className="text-[#C8973D] font-bold mb-1">📞 返信速度</p>
              <p>原則24時間以内にご返信します</p>
            </div>
            <div className="bg-[#2A2A5A] rounded-xl p-4 border border-[#3A3A6A]">
              <p className="text-[#C8973D] font-bold mb-1">🔒 安心保証</p>
              <p>個人情報は問い合わせ対応のみに使用</p>
            </div>
            <div className="bg-[#2A2A5A] rounded-xl p-4 border border-[#3A3A6A]">
              <p className="text-[#C8973D] font-bold mb-1">🚫 押し売りなし</p>
              <p>しつこい営業は一切しません</p>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━ FOOTER ━━━━━━━━━━ */}
      <footer className="bg-gray-950 py-8 px-5 text-center">
        <p className="text-gray-500 text-sm">
          © 2026 QRオーダーシステム. All rights reserved.
        </p>
        <div className="mt-3 flex justify-center gap-6 text-xs text-gray-600">
          <Link href="/login" className="hover:text-gray-400 transition-colors">
            管理画面ログイン
          </Link>
        </div>
      </footer>

    </div>
  );
}
