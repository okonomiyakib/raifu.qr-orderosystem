# QRオーダーシステム セットアップガイド

## 1. Firebaseプロジェクトの作成

1. https://console.firebase.google.com にアクセス
2. 「プロジェクトを作成」→ プロジェクト名を入力
3. 「ウェブアプリを追加」→ アプリのニックネームを入力
4. 表示された設定値を `.env.local` にコピー

## 2. Firestoreデータベースの有効化

1. Firebase Console → 「Firestore Database」
2. 「データベースを作成」→ 「テストモードで開始」を選択
3. リージョン: `asia-northeast1`（東京）を選択

## 3. Firestoreセキュリティルール（本番時）

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // メニューは全員が読み取り可
    match /menuItems/{itemId} {
      allow read: if true;
      allow write: if false; // 管理者のみ（Auth導入後に設定）
    }
    // テーブルは全員が読み取り可
    match /tables/{tableId} {
      allow read: if true;
      allow write: if false;
    }
    // 注文はテーブルIDがある場合に作成可
    match /orders/{orderId} {
      allow read, create: if true;
      allow update: if true; // 厨房からのステータス更新
    }
  }
}
```

## 4. .env.local の設定

```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxxxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxxxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 5. 開発サーバー起動

```bash
npm run dev
```

## 6. デモデータ投入

ブラウザで管理画面 (http://localhost:3000/admin) を開き、
「デモデータを投入する」ボタンをクリック

---

## 画面一覧

| URL | 説明 |
|-----|------|
| `/` | トップページ（管理・厨房へのリンク） |
| `/admin` | 管理画面（QRコード発行） |
| `/kitchen` | 厨房ダッシュボード（リアルタイム） |
| `/menu/[tableId]` | お客様用注文画面（QRコードからアクセス） |
| `/order-complete` | 注文完了画面 |

## DBスキーマ

### tables コレクション
```
{
  tableNumber: number,   // 1, 2, 3...
  name: string,          // "テーブル1"
  isActive: boolean,
  capacity: number       // 席数
}
```

### menuItems コレクション
```
{
  name: string,          // "唐揚げ"
  description: string,   // 説明文
  price: number,         // 680
  category: string,      // "前菜" | "メイン" | "ドリンク" | "デザート"
  imageUrl: string,
  isAvailable: boolean,
  sortOrder: number
}
```

### orders コレクション
```
{
  tableId: string,       // Firestoreドキュメントid
  tableNumber: number,   // 表示用テーブル番号
  items: [
    { itemId, name, price, quantity }
  ],
  totalAmount: number,
  status: "pending" | "preparing" | "served",
  notes: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```
