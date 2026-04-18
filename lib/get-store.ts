/**
 * APIルートから現在ログイン中のユーザーの storeId を取得するヘルパー
 */
import { createSupabaseServer } from "./supabase-server";

export async function getAuthenticatedStoreId(): Promise<string | null> {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  console.log("[getAuthenticatedStoreId] user:", user?.id ?? null, "error:", userError?.message ?? null);
  if (!user) return null;

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", user.id)
    .single();
  console.log("[getAuthenticatedStoreId] store:", store?.id ?? null, "error:", storeError?.message ?? null);

  return store?.id ?? null;
}

/**
 * tableId からその店舗の storeId を取得（顧客向けルートで使用）
 * 認証なしで呼び出せる
 */
export async function getStoreIdByTable(tableId: string): Promise<string | null> {
  const supabase = await createSupabaseServer();
  const { data } = await supabase
    .from("tables")
    .select("store_id")
    .eq("id", tableId)
    .single();

  return (data?.store_id as string | null) ?? null;
}
