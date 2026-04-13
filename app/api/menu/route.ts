import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";
import { MenuItem } from "@/lib/types";

// GET /api/menu - メニュー一覧取得
export async function GET() {
  try {
    const q = query(collection(db, "menuItems"), orderBy("sortOrder", "asc"));
    const snapshot = await getDocs(q);
    const items: MenuItem[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[];
    return NextResponse.json(items);
  } catch (error) {
    console.error("メニュー取得エラー:", error);
    return NextResponse.json({ error: "メニューの取得に失敗しました" }, { status: 500 });
  }
}

// POST /api/menu - メニュー追加（管理者用）
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const docRef = await addDoc(collection(db, "menuItems"), {
      ...body,
      isAvailable: true,
    });
    return NextResponse.json({ id: docRef.id, ...body });
  } catch (error) {
    console.error("メニュー追加エラー:", error);
    return NextResponse.json({ error: "メニューの追加に失敗しました" }, { status: 500 });
  }
}
