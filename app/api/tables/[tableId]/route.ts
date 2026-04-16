import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/tables/[tableId] - テーブル詳細取得
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tableId: string }> }
) {
  try {
    const { tableId } = await params;
    const { data, error } = await supabase
      .from("tables")
      .select("*")
      .eq("id", tableId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "テーブルが見つかりません" }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      tableNumber: data.table_number,
      name: data.name,
      isActive: data.is_active,
      capacity: data.capacity,
      storeId: data.store_id,
    });
  } catch (error) {
    console.error("テーブル取得エラー:", error);
    return NextResponse.json({ error: "テーブルの取得に失敗しました" }, { status: 500 });
  }
}
