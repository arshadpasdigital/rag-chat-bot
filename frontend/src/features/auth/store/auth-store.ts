import { create } from "zustand"

type AuthUser = { id: string; name: string; email: string }
type AuthStore = {
  user: AuthUser | null
  isAuthenticated: boolean
  setSession: (user: AuthUser) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: {
    id: "usr_jordan",
    name: "Jordan Davis",
    email: "jordan@northstar.example",
  },
  isAuthenticated: true,
  setSession: (user) => set({ user, isAuthenticated: true }),
  clearSession: () => set({ user: null, isAuthenticated: false }),
}))
