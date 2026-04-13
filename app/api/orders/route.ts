import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";

// GET /api/orders - 注文一覧取得（厨房用）
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const tableId = searchParams.get("tableId");

    let q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    if (status) {
      q = query(
        collection(db, "orders"),
        where("status", "==", status),
        orderBy("createdAt", "desc")
      );
    }

    if (tableId) {
      q = query(
        collection(db, "orders"),
        where("tableId", "==", tableId),
        orderBy("createdAt", "desc")
      );
    }

    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() ?? null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() ?? null,
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error("注文取得エラー:", error);
    return NextResponse.json({ error: "注文の取得に失敗しました" }, { status: 500 });
  }
}

// POST /api/orders - 新規注文作成
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

    const totalAmount = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, "orders"), {
      tableId,
      tableNumber,
      items,
      totalAmount,
      status: "pending",
      notes: notes || "",
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      id: docRef.id,
      tableId,
      tableNumber,
      items,
      totalAmount,
      status: "pending",
      notes: notes || "",
    });
  } catch (error) {
    console.error("注文作成エラー:", error);
    return NextResponse.json({ error: "注文の作成に失敗しました" }, { status: 500 });
  }
}
