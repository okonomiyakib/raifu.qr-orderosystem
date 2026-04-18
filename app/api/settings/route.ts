import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getAuthenticatedStoreId } from "@/lib/get-store";
import { AppSettings } from "@/lib/types";
import { DEFAULT_TAX_SETTINGS } from "@/lib/tax";

const DEFAULT_SETTINGS: AppSettings = {
  tax: DEFAULT_TAX_SETTINGS,
  categories: ["前菜", "メイン", "ドリンク", "デザート", "サイド", "その他"],
};

// GET /api/settings
// 管理者: 認証してstoreIdで取得
// 顧客: ?storeId=xxx で取得
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const queryStoreId = searchParams.get("storeId");

  const authStoreId = await getAuthenticatedStoreId();
  const storeId = authStoreId ?? queryStoreId;

  const supabase = await createSupabaseServer();
  try {
    let query = supabase.from("app_settings").select("*").limit(1);
    if (storeId) query = query.eq("store_id", storeId);
    const { data } = await query.single();

    if (!data) return NextResponse.json(DEFAULT_SETTINGS);

    return NextResponse.json({
      tax: { ...DEFAULT_TAX_SETTINGS, ...data.tax },
      categories: data.categories ?? DEFAULT_SETTINGS.categories,
    });
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

// PATCH /api/settings
export async function PATCH(req: Request) {
  const storeId = await getAuthenticatedStoreId();
  if (!storeId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const supabase = await createSupabaseServer();
  try {
    const body = await req.json() as Partial<AppSettings>;

    const { data: current } = await supabase
      .from("app_settings")
      .select("*")
      .eq("store_id", storeId)
      .limit(1)
      .single();

    const currentSettings = current
      ? { tax: current.tax, categories: current.categories }
      : DEFAULT_SETTINGS;

    const updated: AppSettings = {
      tax: { ...DEFAULT_TAX_SETTINGS, ...currentSettings.tax, ...body.tax },
      categories: body.categories ?? currentSettings.categories ?? DEFAULT_SETTINGS.categories,
    };

    if (current) {
      await supabase.from("app_settings").update(updated).eq("id", current.id);
    } else {
      await supabase.from("app_settings").insert({ ...updated, store_id: storeId });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("設定更新エラー:", error);
    return NextResponse.json({ error: "設定の更新に失敗しました" }, { status: 500 });
  }
}
