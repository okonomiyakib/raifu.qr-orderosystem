-- =============================================
-- QR Order System - Supabase Schema
-- Supabase の SQL Editor で実行してください
-- =============================================

-- テーブル管理
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  capacity INTEGER NOT NULL DEFAULT 4,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- メニュー
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  tax_type TEXT NOT NULL CHECK (tax_type IN ('standard', 'reduced')) DEFAULT 'standard',
  category TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT '',
  is_available BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 99,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 注文
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES tables(id),
  table_number INTEGER NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'preparing', 'served')) DEFAULT 'pending',
  notes TEXT NOT NULL DEFAULT '',
  items_done JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- アプリ設定（シングルトン）
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax JSONB NOT NULL DEFAULT '{"displayMode": "included", "standardRate": 10, "reducedRate": 8}',
  categories TEXT[] NOT NULL DEFAULT ARRAY['前菜', 'メイン', 'ドリンク', 'デザート', 'サイド', 'その他'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 初期設定レコード（1行だけ）
INSERT INTO app_settings (tax, categories) VALUES (
  '{"displayMode": "included", "standardRate": 10, "reducedRate": 8}',
  ARRAY['前菜', 'メイン', 'ドリンク', 'デザート', 'サイド', 'その他']
);

-- updated_at を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- RLS (Row Level Security) - 開発用：全許可
-- 本番環境では適切な認証ポリシーに変更してください
-- =============================================
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_tables" ON tables FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_app_settings" ON app_settings FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- Realtime（厨房のリアルタイム更新用）
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
