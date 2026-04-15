import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/calls - 未対応の呼び出し一覧
export async function GET() {
  const { data, error } = await supabase
    .from("calls")
    .select("*")
    .eq("status", "waiting")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "呼び出し取得に失敗しました" }, { status: 500 });
  }

  return NextResponse.json(
    (data ?? []).map((row) => ({
      id: row.id,
      tableId: row.table_id,
      tableNumber: row.table_number,
      status: row.status,
      createdAt: row.created_at,
    }))
  );
}

// POST /api/calls - 呼び出し作成
export async function POST(req: Request) {
  try {
    const { tableId, tableNumber } = await req.json();
    if (!tableId) {
      return NextResponse.json({ error: "tableIdは必須です" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("calls")
      .insert({ table_id: tableId, table_number: tableNumber, status: "waiting" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      id: data.id,
      tableId: data.table_id,
      tableNumber: data.table_number,
      status: data.status,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error("呼び出し作成エラー:", error);
    return NextResponse.json({ error: "呼び出しに失敗しました" }, { status: 500 });
  }
}
