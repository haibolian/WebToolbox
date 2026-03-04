import { create } from 'zustand'

type AppState = {
  compactNav: boolean
  toggleCompactNav: () => void
}

export const useAppStore = create<AppState>((set) => ({
  compactNav: false,
  toggleCompactNav: () => {
    set((state) => ({ compactNav: !state.compactNav }))
  },
}))
