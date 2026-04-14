import { Timestamp } from "firebase/firestore";

export type OrderStatus = "pending" | "preparing" | "served";
export type TaxType = "standard" | "reduced"; // 標準10% / 軽減8%
export type DisplayMode = "included" | "excluded";  // 税込 / 税抜

export interface Table {
  id: string;
  tableNumber: number;
  name: string;
  isActive: boolean;
  capacity: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;       // 税込価格（お客様が支払う金額）
  taxType: TaxType;    // 税区分
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  sortOrder: number;
}

export interface TaxSettings {
  displayMode: DisplayMode;  // 表示方法
  standardRate: number;      // 標準税率（デフォルト10）
  reducedRate: number;       // 軽減税率（デフォルト8）
}

export interface AppSettings {
  tax: TaxSettings;
  categories: string[];
}

export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  taxType: TaxType;
  quantity: number;
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  notes: string;
  itemsDone: number[]; // 完了した品目のインデックス一覧
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface OrderWithId extends Order {
  id: string;
}
