import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";

// PATCH /api/menu/[itemId] - メニュー更新
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await req.json();
    const docRef = doc(db, "menuItems", itemId);
    await updateDoc(docRef, body);
    return NextResponse.json({ id: itemId, ...body });
  } catch (error) {
    console.error("メニュー更新エラー:", error);
    return NextResponse.json({ error: "更新に失敗しました" }, { status: 500 });
  }
}

// DELETE /api/menu/[itemId] - メニュー削除
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    await deleteDoc(doc(db, "menuItems", itemId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("メニュー削除エラー:", error);
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
