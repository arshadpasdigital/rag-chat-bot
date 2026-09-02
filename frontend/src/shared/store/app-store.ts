import { create } from "zustand"

type Workspace = { id: string; name: string }
type AppStore = {
  workspace: Workspace
  sidebarOpen: boolean
  setWorkspace: (workspace: Workspace) => void
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppStore>((set) => ({
  workspace: { id: "northstar-labs", name: "Northstar Labs" },
  sidebarOpen: false,
  setWorkspace: (workspace) => set({ workspace }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}))
