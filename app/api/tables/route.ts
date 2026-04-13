import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";
import { Table } from "@/lib/types";

// GET /api/tables - テーブル一覧取得
export async function GET() {
  try {
    const q = query(collection(db, "tables"), orderBy("tableNumber", "asc"));
    const snapshot = await getDocs(q);
    const tables: Table[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Table[];
    return NextResponse.json(tables);
  } catch (error) {
    console.error("テーブル取得エラー:", error);
    return NextResponse.json({ error: "テーブルの取得に失敗しました" }, { status: 500 });
  }
}

// POST /api/tables - テーブル追加（管理者用）
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const docRef = await addDoc(collection(db, "tables"), {
      tableNumber: body.tableNumber,
      name: body.name || `テーブル${body.tableNumber}`,
      isActive: true,
      capacity: body.capacity || 4,
    });
    return NextResponse.json({ id: docRef.id, ...body });
  } catch (error) {
    console.error("テーブル追加エラー:", error);
    return NextResponse.json({ error: "テーブルの追加に失敗しました" }, { status: 500 });
  }
}
