import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getAuthenticatedStoreId } from "@/lib/get-store";
import { MenuItem } from "@/lib/types";

function toMenuItem(row: Record<string, unknown>): MenuItem {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    price: row.price as number,
    taxType: row.tax_type as MenuItem["taxType"],
    category: row.category as string,
    imageUrl: row.image_url as string,
    isAvailable: row.is_available as boolean,
    sortOrder: row.sort_order as number,
    options: (row.options as MenuItem["options"]) ?? [],
  };
}

// GET /api/menu - メニュー一覧取得
// 管理者: 認証してstoreIdで絞り込み
// 顧客: ?storeId=xxx で絞り込み
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const queryStoreId = searchParams.get("storeId");

  // 認証ユーザーのstoreIdを優先
  const authStoreId = await getAuthenticatedStoreId();
  const storeId = authStoreId ?? queryStoreId;

  const supabase = await createSupabaseServer();
  let query = supabase.from("menu_items").select("*").order("sort_order", { ascending: true });
  if (storeId) query = query.eq("store_id", storeId);

  const { data, error } = await query;

  if (error) {
    console.error("メニュー取得エラー:", error);
    return NextResponse.json({ error: "メニューの取得に失敗しました" }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(toMenuItem));
}

// POST /api/menu - メニュー追加（管理者用）
export async function POST(req: Request) {
  const storeId = await getAuthenticatedStoreId();
  if (!storeId) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const supabase = await createSupabaseServer();
  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        name: body.name,
        description: body.description ?? "",
        price: body.price,
        tax_type: body.taxType ?? "standard",
        category: body.category,
        image_url: body.imageUrl ?? "",
        is_available: true,
        sort_order: body.sortOrder ?? 99,
        store_id: storeId,
        options: body.options ?? [],
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(toMenuItem(data));
  } catch (error) {
    console.error("メニュー追加エラー:", error);
    return NextResponse.json({ error: "メニューの追加に失敗しました" }, { status: 500 });
  }
}
