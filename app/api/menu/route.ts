import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
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
  };
}

// GET /api/menu - メニュー一覧取得
export async function GET() {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("メニュー取得エラー:", error);
    return NextResponse.json({ error: "メニューの取得に失敗しました" }, { status: 500 });
  }

  return NextResponse.json((data ?? []).map(toMenuItem));
}

// POST /api/menu - メニュー追加（管理者用）
export async function POST(req: Request) {
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
