import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductWithCategory } from '@shared/schema';

interface CartItem extends ProductWithCategory {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  totalItems: number;
  totalAmount: string;
  addToCart: (product: ProductWithCategory) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalAmount: "0",
      
      addToCart: (product: ProductWithCategory) => {
        set((state) => {
          const existingItem = state.items.find(item => item.id === product.id);
          let newItems: CartItem[];
          
          if (existingItem) {
            if (existingItem.quantity >= product.stock) {
              return state; // Don't add if already at max stock
            }
            newItems = state.items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            newItems = [...state.items, { ...product, quantity: 1 }];
          }
          
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalAmount = newItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
          
          return {
            items: newItems,
            totalItems,
            totalAmount
          };
        });
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            const newItems = state.items.filter(item => item.id !== productId);
            const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = newItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
            
            return {
              items: newItems,
              totalItems,
              totalAmount
            };
          }
          
          const newItems = state.items.map(item => {
            if (item.id === productId) {
              const maxQuantity = Math.min(quantity, item.stock);
              return { ...item, quantity: maxQuantity };
            }
            return item;
          });
          
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalAmount = newItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
          
          return {
            items: newItems,
            totalItems,
            totalAmount
          };
        });
      },
      
      removeItem: (productId: string) => {
        set((state) => {
          const newItems = state.items.filter(item => item.id !== productId);
          const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
          const totalAmount = newItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0).toFixed(2);
          
          return {
            items: newItems,
            totalItems,
            totalAmount
          };
        });
      },
      
      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalAmount: "0"
        });
      }
    }),
    {
      name: 'kiit-snack-cart',
    }
  )
);

export const useCart = useCartStore;
