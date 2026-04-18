import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getAuthenticatedStoreId, getStoreIdByTable } from "@/lib/get-store";

function toOrder(row: Record<string, unknown>) {
  return {
    id: row.id,
    tableId: row.table_id,
    tableNumber: row.table_number,
    items: row.items,
    totalAmount: row.total_amount,
    status: row.status,
    notes: row.notes,
    itemsDone: row.items_done,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET /api/orders - 注文一覧取得（厨房・管理者用）
export async function GET(req: Request) {
  const storeId = await getAuthenticatedStoreId();
  if (!storeId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const tableId = searchParams.get("tableId");

  const supabase = await createSupabaseServer();
  let query = supabase
    .from("orders")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (tableId) query = query.eq("table_id", tableId);

  const { data, error } = await query;

  if (error) {
    console.error("注文取得エラー:", error);
    return NextResponse.json({ error: "注文の取得に失敗しました" }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(toOrder));
}

// POST /api/orders - 新規注文作成（顧客用・認証不要）
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tableId, tableNumber, items, notes } = body;

    if (!tableId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "テーブルIDと注文内容は必須です" },
        { status: 400 }
      );
    }

    // テーブルからstoreIdを取得
    const storeId = await getStoreIdByTable(tableId);

    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("orders")
      .insert({
        table_id: tableId,
        table_number: tableNumber,
        items,
        total_amount: totalAmount,
        status: "pending",
        notes: notes || "",
        items_done: {},
        store_id: storeId,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(toOrder(data));
  } catch (error) {
    console.error("注文作成エラー:", error);
    return NextResponse.json({ error: "注文の作成に失敗しました" }, { status: 500 });
  }
}
