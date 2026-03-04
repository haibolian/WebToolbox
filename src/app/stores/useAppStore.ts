import { create } from 'zustand'

type AppState = {
  sidebarCollapsed: boolean
  toolSearch: string
  recentToolIds: string[]
  toggleSidebar: () => void
  setToolSearch: (value: string) => void
  markToolVisited: (toolId: string) => void
}

const MAX_RECENT_TOOLS = 5

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  toolSearch: '',
  recentToolIds: [],
  toggleSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
  },
  setToolSearch: (value) => {
    set({ toolSearch: value })
  },
  markToolVisited: (toolId) => {
    set((state) => {
      const nextRecentTools = [toolId, ...state.recentToolIds.filter((id) => id !== toolId)].slice(0, MAX_RECENT_TOOLS)
      return { recentToolIds: nextRecentTools }
    })
  },
}))
