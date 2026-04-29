import { create } from 'zustand'
import type { MenuItem, CartItem } from '../types'

type View = 'c' | 'k' | 'w' | 'a'

interface Store {
  activeView: View
  setActiveView: (v: View) => void

  customerTab: number
  setCustomerTab: (n: number) => void

  menuCategory: string
  setMenuCategory: (cat: string) => void

  cart: Record<number, CartItem>
  setCartQty: (item: MenuItem, delta: number) => void
  clearCart: () => void
}

export const useStore = create<Store>((set) => ({
  activeView: 'c',
  setActiveView: (v) => set({ activeView: v }),

  customerTab: 0,
  setCustomerTab: (n) => set({ customerTab: n }),

  menuCategory: 'all',
  setMenuCategory: (cat) => set({ menuCategory: cat }),

  cart: {},
  setCartQty: (item, delta) =>
    set((state) => {
      const cart = { ...state.cart }
      const qty = (cart[item.id]?.qty ?? 0) + delta
      if (qty <= 0) delete cart[item.id]
      else cart[item.id] = { item, qty }
      return { cart }
    }),
  clearCart: () => set({ cart: {} }),
}))
