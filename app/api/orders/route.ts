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
    const { tableId, tableNumber, storeId: bodyStoreId, items, notes } = body;

    console.log("[ORDER] step1 body received:", { tableId, tableNumber, bodyStoreId, itemsCount: items?.length });

    if (!tableId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "テーブルIDと注文内容は必須です" },
        { status: 400 }
      );
    }

    // クライアントから渡されたstoreIdを優先し、なければDBから取得
    const storeId = bodyStoreId ?? await getStoreIdByTable(tableId);
    console.log("[ORDER] step2 storeId:", storeId);

    if (!storeId) {
      console.error("[ORDER] storeId が null → tables.store_id が未設定の可能性");
      return NextResponse.json(
        { error: "テーブル情報の取得に失敗しました" },
        { status: 400 }
      );
    }

    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    if (totalAmount < 0) {
      console.error("[ORDER] totalAmount が不正:", totalAmount);
      return NextResponse.json({ error: "注文金額が不正です" }, { status: 400 });
    }

    const supabase = await createSupabaseServer();
    const { error } = await supabase
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
      });

    console.log("[ORDER] step3 insert result:", error ? `ERROR: ${error.message} (${error.code})` : "success");

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[ORDER] caught error:", error);
    return NextResponse.json({ error: "注文の作成に失敗しました" }, { status: 500 });
  }
}
