import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { OrderStatus } from "@/lib/types";

// GET /api/orders/[orderId] - 注文詳細取得
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
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

    const { error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId);

    if (error) throw error;
    return NextResponse.json({ id: orderId, ...body });
  } catch (error) {
    console.error("注文ステータス更新エラー:", error);
    return NextResponse.json({ error: "ステータスの更新に失敗しました" }, { status: 500 });
  }
}
