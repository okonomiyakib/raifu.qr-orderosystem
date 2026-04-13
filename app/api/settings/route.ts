import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { AppSettings } from "@/lib/types";
import { DEFAULT_TAX_SETTINGS } from "@/lib/tax";

const DEFAULT_SETTINGS: AppSettings = {
  tax: DEFAULT_TAX_SETTINGS,
  categories: ["前菜", "メイン", "ドリンク", "デザート", "サイド", "その他"],
};

// GET /api/settings
export async function GET() {
  try {
    const snap = await getDoc(doc(db, "settings", "app"));
    if (!snap.exists()) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }
    // デフォルト値とマージ（新フィールド追加時の後方互換）
    const data = snap.data() as Partial<AppSettings>;
    return NextResponse.json({
      tax: { ...DEFAULT_TAX_SETTINGS, ...data.tax },
      categories: data.categories ?? DEFAULT_SETTINGS.categories,
    });
  } catch (error) {
    console.error("設定取得エラー:", error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

// PATCH /api/settings
export async function PATCH(req: Request) {
  try {
    const body = await req.json() as Partial<AppSettings>;
    const snap = await getDoc(doc(db, "settings", "app"));
    const current = snap.exists()
      ? (snap.data() as Partial<AppSettings>)
      : DEFAULT_SETTINGS;

    const updated: AppSettings = {
      tax: { ...DEFAULT_TAX_SETTINGS, ...current.tax, ...body.tax },
      categories: body.categories ?? current.categories ?? DEFAULT_SETTINGS.categories,
    };

    await setDoc(doc(db, "settings", "app"), updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("設定更新エラー:", error);
    return NextResponse.json({ error: "設定の更新に失敗しました" }, { status: 500 });
  }
}
