-- =============================================
-- 認証・マルチテナント対応マイグレーション
-- Supabase SQL Editor で実行してください
-- =============================================

-- 1. stores テーブル（店舗オーナー情報）
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. calls テーブル（既存の場合はスキップ）
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. 既存テーブルに store_id カラムを追加
ALTER TABLE tables ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);
ALTER TABLE calls ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id);
ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES stores(id) ON DELETE CASCADE UNIQUE;

-- 4. calls テーブルの Realtime 有効化
ALTER PUBLICATION supabase_realtime ADD TABLE calls;

-- =============================================
-- RLS ポリシー
-- =============================================

-- stores テーブル
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stores: オーナーのみアクセス" ON stores
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- tables テーブル（既存ポリシーを置き換え）
DROP POLICY IF EXISTS "allow_all_tables" ON tables;

-- 管理者（認証済み）: 自分の店舗のテーブルのみ CRUD
CREATE POLICY "tables: 管理者は自店舗のみ" ON tables
  FOR ALL
  TO authenticated
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

-- 顧客（未認証）: 全テーブルの参照のみ（QRコードでアクセス）
CREATE POLICY "tables: 顧客は参照のみ" ON tables
  FOR SELECT
  TO anon
  USING (true);

-- menu_items テーブル（既存ポリシーを置き換え）
DROP POLICY IF EXISTS "allow_all_menu_items" ON menu_items;

CREATE POLICY "menu_items: 管理者は自店舗のみ" ON menu_items
  FOR ALL
  TO authenticated
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "menu_items: 顧客は参照のみ" ON menu_items
  FOR SELECT
  TO anon
  USING (true);

-- orders テーブル（既存ポリシーを置き換え）
DROP POLICY IF EXISTS "allow_all_orders" ON orders;

CREATE POLICY "orders: 管理者は自店舗のみ" ON orders
  FOR ALL
  TO authenticated
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

-- 顧客: 注文作成・更新のみ（store_id は server 側で付与）
CREATE POLICY "orders: 顧客は作成のみ" ON orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- calls テーブル
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "calls: 管理者は自店舗のみ" ON calls
  FOR ALL
  TO authenticated
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "calls: 顧客は作成のみ" ON calls
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- app_settings テーブル（既存ポリシーを置き換え）
DROP POLICY IF EXISTS "allow_all_app_settings" ON app_settings;

CREATE POLICY "app_settings: 管理者は自店舗のみ" ON app_settings
  FOR ALL
  TO authenticated
  USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY "app_settings: 顧客は参照のみ" ON app_settings
  FOR SELECT
  TO anon
  USING (true);
