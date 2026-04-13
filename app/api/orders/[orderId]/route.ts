import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { OrderStatus } from "@/lib/types";

// GET /api/orders/[orderId] - 注文詳細取得
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const docRef = doc(db, "orders", orderId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "注文が見つかりません" }, { status: 404 });
    }

    const data = snapshot.data();
    return NextResponse.json({
      id: snapshot.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("注文詳細取得エラー:", error);
    return NextResponse.json({ error: "注文の取得に失敗しました" }, { status: 500 });
  }
}

// PATCH /api/orders/[orderId] - 注文ステータス更新（厨房用）
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { status } = body as { status: OrderStatus };

    const validStatuses: OrderStatus[] = ["pending", "preparing", "served"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "無効なステータスです" },
        { status: 400 }
      );
    }

    const docRef = doc(db, "orders", orderId);
    await updateDoc(docRef, {
      status,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ id: orderId, status });
  } catch (error) {
    console.error("注文ステータス更新エラー:", error);
    return NextResponse.json({ error: "ステータスの更新に失敗しました" }, { status: 500 });
  }
}
