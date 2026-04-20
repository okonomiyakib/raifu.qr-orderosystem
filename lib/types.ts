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

export interface Option {
  id: string;
  name: string;
  price: number;
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
  options?: Option[];  // トッピング・オプション（任意）
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
  selectedOptions?: Option[];  // 選択済みオプション（任意）
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  notes: string;
  itemsDone: Record<string, number>; // 各品目の提供済み数 { "0": 2, "1": 1 }
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface OrderWithId extends Order {
  id: string;
}
