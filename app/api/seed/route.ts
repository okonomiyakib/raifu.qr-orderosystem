import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

// POST /api/seed - デモデータを投入（開発用）
export async function POST() {
  try {
    // 既存データ削除
    const menuSnap = await getDocs(collection(db, "menuItems"));
    await Promise.all(menuSnap.docs.map((d) => deleteDoc(d.ref)));

    const tableSnap = await getDocs(collection(db, "tables"));
    await Promise.all(tableSnap.docs.map((d) => deleteDoc(d.ref)));

    // テーブルデータ
    const tables = [
      { tableNumber: 1, name: "テーブル1", isActive: true, capacity: 4 },
      { tableNumber: 2, name: "テーブル2", isActive: true, capacity: 2 },
      { tableNumber: 3, name: "テーブル3", isActive: true, capacity: 6 },
      { tableNumber: 4, name: "テーブル4", isActive: true, capacity: 4 },
      { tableNumber: 5, name: "テーブル5", isActive: true, capacity: 4 },
    ];
    await Promise.all(tables.map((t) => addDoc(collection(db, "tables"), t)));

    // メニューデータ
    const menuItems = [
      // 前菜
      {
        name: "枝豆",
        description: "塩茹でした新鮮な枝豆",
        price: 380,
        category: "前菜",
        imageUrl: "https://images.unsplash.com/photo-1628890920690-9e29d0019b9b?w=400",
        isAvailable: true,
        sortOrder: 1,
      },
      {
        name: "唐揚げ（5個）",
        description: "ジューシーな鶏の唐揚げ。レモン添え",
        price: 680,
        category: "前菜",
        imageUrl: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400",
        isAvailable: true,
        sortOrder: 2,
      },
      {
        name: "シーザーサラダ",
        description: "新鮮野菜とパルメザンチーズ",
        price: 580,
        category: "前菜",
        imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        isAvailable: true,
        sortOrder: 3,
      },
      // メイン
      {
        name: "ハンバーグ定食",
        description: "和風おろしソース。ご飯・みそ汁付き",
        price: 1280,
        category: "メイン",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        isAvailable: true,
        sortOrder: 10,
      },
      {
        name: "鶏の照り焼き定食",
        description: "甘辛タレが絡んだ照り焼きチキン",
        price: 1080,
        category: "メイン",
        imageUrl: "https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=400",
        isAvailable: true,
        sortOrder: 11,
      },
      {
        name: "海鮮丼",
        description: "本日の鮮魚を使った贅沢な海鮮丼",
        price: 1680,
        category: "メイン",
        imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400",
        isAvailable: true,
        sortOrder: 12,
      },
      // ドリンク
      {
        name: "生ビール",
        description: "キンキンに冷えた中ジョッキ",
        price: 580,
        category: "ドリンク",
        imageUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400",
        isAvailable: true,
        sortOrder: 20,
      },
      {
        name: "ウーロン茶",
        description: "さっぱりとした中国茶",
        price: 380,
        category: "ドリンク",
        imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
        isAvailable: true,
        sortOrder: 21,
      },
      {
        name: "コーラ",
        description: "コカ・コーラ（Mサイズ）",
        price: 380,
        category: "ドリンク",
        imageUrl: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400",
        isAvailable: true,
        sortOrder: 22,
      },
      // デザート
      {
        name: "バニラアイスクリーム",
        description: "濃厚なバニラアイス",
        price: 380,
        category: "デザート",
        imageUrl: "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=400",
        isAvailable: true,
        sortOrder: 30,
      },
      {
        name: "プリン",
        description: "なめらかカラメルプリン",
        price: 420,
        category: "デザート",
        imageUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400",
        isAvailable: true,
        sortOrder: 31,
      },
    ];

    await Promise.all(menuItems.map((item) => addDoc(collection(db, "menuItems"), item)));

    return NextResponse.json({ message: "デモデータを投入しました" });
  } catch (error) {
    console.error("シードエラー:", error);
    return NextResponse.json({ error: "データ投入に失敗しました" }, { status: 500 });
  }
}
