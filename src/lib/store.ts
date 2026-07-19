import { create } from "zustand";

interface CartItem {
  gameId: string;
  title: string;
  price: number;
  imageUrl: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (gameId: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const exists = state.items.find((i) => i.gameId === item.gameId);
      if (exists) return state;
      return { items: [...state.items, item] };
    }),

  removeItem: (gameId) =>
    set((state) => ({
      items: state.items.filter((i) => i.gameId !== gameId),
    })),

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.price, 0);
  },
}));
