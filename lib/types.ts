import { Timestamp } from "firebase/firestore";

export type OrderStatus = "pending" | "preparing" | "served";

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
  price: number;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  sortOrder: number;
}

export interface CartItem {
  itemId: string;
  name: string;
  price: number;
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
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface OrderWithId extends Order {
  id: string;
}
