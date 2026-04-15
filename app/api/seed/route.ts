import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/seed - デモデータを投入（開発用）
export async function POST() {
  try {
    // 既存データ削除
    await supabase.from("menu_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("tables").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // テーブルデータ
    const tables = [
      { table_number: 1, name: "テーブル1", is_active: true, capacity: 4 },
      { table_number: 2, name: "テーブル2", is_active: true, capacity: 2 },
      { table_number: 3, name: "テーブル3", is_active: true, capacity: 6 },
      { table_number: 4, name: "テーブル4", is_active: true, capacity: 4 },
      { table_number: 5, name: "テーブル5", is_active: true, capacity: 4 },
    ];
    const { error: tableError } = await supabase.from("tables").insert(tables);
    if (tableError) throw tableError;

    // メニューデータ
    const menuItems = [
      // 前菜
      { name: "枝豆", description: "塩茹でした新鮮な枝豆", price: 380, tax_type: "reduced", category: "前菜", image_url: "https://images.unsplash.com/photo-1628890920690-9e29d0019b9b?w=400", is_available: true, sort_order: 1 },
      { name: "唐揚げ（5個）", description: "ジューシーな鶏の唐揚げ。レモン添え", price: 680, tax_type: "reduced", category: "前菜", image_url: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400", is_available: true, sort_order: 2 },
      { name: "シーザーサラダ", description: "新鮮野菜とパルメザンチーズ", price: 580, tax_type: "reduced", category: "前菜", image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400", is_available: true, sort_order: 3 },
      // メイン
      { name: "ハンバーグ定食", description: "和風おろしソース。ご飯・みそ汁付き", price: 1280, tax_type: "reduced", category: "メイン", image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400", is_available: true, sort_order: 10 },
      { name: "鶏の照り焼き定食", description: "甘辛タレが絡んだ照り焼きチキン", price: 1080, tax_type: "reduced", category: "メイン", image_url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=400", is_available: true, sort_order: 11 },
      { name: "海鮮丼", description: "本日の鮮魚を使った贅沢な海鮮丼", price: 1680, tax_type: "reduced", category: "メイン", image_url: "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400", is_available: true, sort_order: 12 },
      // ドリンク
      { name: "生ビール", description: "キンキンに冷えた中ジョッキ", price: 580, tax_type: "standard", category: "ドリンク", image_url: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400", is_available: true, sort_order: 20 },
      { name: "ウーロン茶", description: "さっぱりとした中国茶", price: 380, tax_type: "reduced", category: "ドリンク", image_url: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400", is_available: true, sort_order: 21 },
      { name: "コーラ", description: "コカ・コーラ（Mサイズ）", price: 380, tax_type: "reduced", category: "ドリンク", image_url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400", is_available: true, sort_order: 22 },
      // デザート
      { name: "バニラアイスクリーム", description: "濃厚なバニラアイス", price: 380, tax_type: "reduced", category: "デザート", image_url: "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=400", is_available: true, sort_order: 30 },
      { name: "プリン", description: "なめらかカラメルプリン", price: 420, tax_type: "reduced", category: "デザート", image_url: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400", is_available: true, sort_order: 31 },
    ];

    const { error: menuError } = await supabase.from("menu_items").insert(menuItems);
    if (menuError) throw menuError;

    return NextResponse.json({ message: "デモデータを投入しました" });
  } catch (error) {
    console.error("シードエラー:", error);
    return NextResponse.json({ error: "データ投入に失敗しました" }, { status: 500 });
  }
}
