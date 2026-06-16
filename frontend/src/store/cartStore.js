import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  // État
  items: [],
  total: 0,

  // Actions
  addItem: (part) => {
    const items = get().items
    const existing = items.find(i => i.id === part.id)
    if (existing) {
      set({
        items: items.map(i =>
          i.id === part.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      })
    } else {
      set({ items: [...items, { ...part, quantity: 1 }] })
    }
    set({ total: get().items.reduce((sum, i) => sum + i.price * i.quantity, 0) })
  },

  removeItem: (partId) => {
    set({ items: get().items.filter(i => i.id !== partId) })
    set({ total: get().items.reduce((sum, i) => sum + i.price * i.quantity, 0) })
  },

  clearCart: () => set({ items: [], total: 0 })
}))

export default useCartStore