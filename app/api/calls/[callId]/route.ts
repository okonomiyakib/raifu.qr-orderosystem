import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// PATCH /api/calls/[callId] - 対応済みに更新
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ callId: string }> }
) {
  try {
    const { callId } = await params;
    const { error } = await supabase
      .from("calls")
      .update({ status: "responded" })
      .eq("id", callId);

    if (error) throw error;
    return NextResponse.json({ id: callId, status: "responded" });
  } catch (error) {
    console.error("呼び出し更新エラー:", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}
