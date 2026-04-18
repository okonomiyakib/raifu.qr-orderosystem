import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getAuthenticatedStoreId } from "@/lib/get-store";
import { OrderStatus } from "@/lib/types";

// GET /api/orders/[orderId] - 注文詳細取得（厨房・管理者用）
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const storeId = await getAuthenticatedStoreId();
  if (!storeId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const { orderId } = await params;
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("store_id", storeId) // 自店舗の注文のみ取得可
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "注文が見つかりません" }, { status: 404 });
    }

    return NextResponse.json({
      id: data.id,
      tableId: data.table_id,
      tableNumber: data.table_number,
      items: data.items,
      totalAmount: data.total_amount,
      status: data.status,
      notes: data.notes,
      itemsDone: data.items_done,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch (error) {
    console.error("注文詳細取得エラー:", error);
    return NextResponse.json({ error: "注文の取得に失敗しました" }, { status: 500 });
  }
}

// PATCH /api/orders/[orderId] - 注文ステータス・品目完了状態の更新（厨房用）
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const storeId = await getAuthenticatedStoreId();
  if (!storeId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const { orderId } = await params;
    const body = await req.json();
    const { status, itemsDone } = body as { status?: OrderStatus; itemsDone?: Record<string, number> };

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      const validStatuses: OrderStatus[] = ["pending", "preparing", "served"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "無効なステータスです" }, { status: 400 });
      }
      updateData.status = status;
    }

    if (itemsDone !== undefined) {
      updateData.items_done = itemsDone;
    }

    const supabase = await createSupabaseServer();
    // store_id を条件に追加することで他店舗の注文を変更不可にする
    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .eq("store_id", storeId);

    if (error) throw error;
    return NextResponse.json({ id: orderId, ...body });
  } catch (error) {
    console.error("注文ステータス更新エラー:", error);
    return NextResponse.json({ error: "ステータスの更新に失敗しました" }, { status: 500 });
  }
}
