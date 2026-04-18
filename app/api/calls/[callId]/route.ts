import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getAuthenticatedStoreId } from "@/lib/get-store";

// PATCH /api/calls/[callId] - 対応済みに更新（厨房・管理者用）
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ callId: string }> }
) {
  const storeId = await getAuthenticatedStoreId();
  if (!storeId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const { callId } = await params;

    const supabase = await createSupabaseServer();
    // store_id を条件に追加することで他店舗の呼び出しを変更不可にする
    const { error } = await supabase
      .from("calls")
      .update({ status: "responded" })
      .eq("id", callId)
      .eq("store_id", storeId);

    if (error) throw error;
    return NextResponse.json({ id: callId, status: "responded" });
  } catch (error) {
    console.error("呼び出し更新エラー:", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
