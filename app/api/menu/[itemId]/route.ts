import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getAuthenticatedStoreId } from "@/lib/get-store";

// PATCH /api/menu/[itemId] - メニュー更新（管理者用）
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const storeId = await getAuthenticatedStoreId();
  if (!storeId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const { itemId } = await params;
    const body = await req.json();

    // camelCase → snake_case マッピング
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.taxType !== undefined) updateData.tax_type = body.taxType;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;
    if (body.isAvailable !== undefined) updateData.is_available = body.isAvailable;
    if (body.sortOrder !== undefined) updateData.sort_order = body.sortOrder;
    if (body.options !== undefined) updateData.options = body.options;

    const supabase = await createSupabaseServer();
    // store_id を条件に追加することで他店舗のメニューを変更不可にする
    const { error } = await supabase
      .from("menu_items")
      .update(updateData)
      .eq("id", itemId)
      .eq("store_id", storeId);

    if (error) throw error;
    return NextResponse.json({ id: itemId, ...body });
  } catch (error) {
    console.error("メニュー更新エラー:", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}

// DELETE /api/menu/[itemId] - メニュー削除（管理者用）
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const storeId = await getAuthenticatedStoreId();
  if (!storeId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const { itemId } = await params;

    const supabase = await createSupabaseServer();
    // store_id を条件に追加することで他店舗のメニューを削除不可にする
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", itemId)
      .eq("store_id", storeId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("メニュー削除エラー:", error);
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
