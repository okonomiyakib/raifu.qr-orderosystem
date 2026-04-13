"use client";

import Image from "next/image";
import { MenuItem } from "@/lib/types";
import { useCartStore } from "@/lib/store";
import toast from "react-hot-toast";

interface MenuCardProps {
  item: MenuItem;
}

export function MenuCard({ item }: MenuCardProps) {
  const { addItem, items } = useCartStore();
  const cartItem = items.find((i) => i.itemId === item.id);

  const handleAdd = () => {
    addItem({
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
    });
    toast.success(`${item.name}をカートに追加しました`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="relative h-44 w-full bg-gray-100">
        <Image
          src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400"}
          alt={item.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">売り切れ</span>
          </div>
        )}
        {cartItem && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold shadow">
            {cartItem.quantity}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-1">{item.name}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-orange-600">
            ¥{item.price.toLocaleString()}
          </span>
          <button
            onClick={handleAdd}
            disabled={!item.isAvailable}
            className="flex items-center gap-1 bg-orange-500 disabled:bg-gray-300 text-white px-5 py-3 rounded-xl text-base font-semibold active:scale-95 transition-transform"
          >
            <span className="text-xl">+</span>
            注文
          </button>
        </div>
      </div>
    </div>
  );
}
