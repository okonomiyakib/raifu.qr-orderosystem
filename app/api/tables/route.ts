import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getAuthenticatedStoreId } from "@/lib/get-store";
import { Table } from "@/lib/types";

function toTable(row: Record<string, unknown>): Table {
  return {
    id: row.id as string,
    tableNumber: row.table_number as number,
    name: row.name as string,
    isActive: row.is_active as boolean,
    capacity: row.capacity as number,
  };
}

// GET /api/tables - テーブル一覧取得（管理者用）
export async function GET() {
  const storeId = await getAuthenticatedStoreId();
  if (!storeId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("tables")
    .select("*")
    .eq("store_id", storeId)
    .order("table_number", { ascending: true });

  if (error) {
    console.error("テーブル取得エラー:", error);
    return NextResponse.json({ error: "テーブルの取得に失敗しました" }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(toTable));
}

// POST /api/tables - テーブル追加（管理者用）
export async function POST(req: Request) {
  const storeId = await getAuthenticatedStoreId();
  if (!storeId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from("tables")
      .insert({
        table_number: body.tableNumber,
        name: body.name || `テーブル${body.tableNumber}`,
        is_active: true,
        capacity: body.capacity || 4,
        store_id: storeId,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(toTable(data));
  } catch (error) {
    console.error("テーブル追加エラー:", error);
    return NextResponse.json({ error: "テーブルの追加に失敗しました" }, { status: 500 });
  }
}
