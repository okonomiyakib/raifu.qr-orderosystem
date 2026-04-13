import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "./types";

interface CartState {
  tableId: string | null;
  tableNumber: number | null;
  items: CartItem[];
  setTable: (tableId: string, tableNumber: number) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      tableId: null,
      tableNumber: null,
      items: [],

      setTable: (tableId, tableNumber) => set({ tableId, tableNumber }),

      addItem: (newItem) => {
        const items = get().items;
        const existing = items.find((i) => i.itemId === newItem.itemId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.itemId === newItem.itemId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...newItem, quantity: 1 }] });
        }
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((i) => i.itemId !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.itemId === itemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      totalAmount: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "qr-order-cart",
    }
  )
);
