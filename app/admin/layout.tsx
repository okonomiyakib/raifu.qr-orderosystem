import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase-server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 店舗未設定の場合はセットアップへ（/admin/setup 自体は除外）
  return <>{children}</>;
}
