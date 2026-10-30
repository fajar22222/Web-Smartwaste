import { create } from 'zustand'

interface AuthUser {
  id: number
  nama: string
  username: string
  role: 'admin' | 'masyarakat'
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    user: null,

    setUser: (user) =>
      set((state) => ({
        auth: {
          ...state.auth,
          user,
        },
      })),

    reset: () =>
      set((state) => ({
        auth: {
          ...state.auth,
          user: null,
        },
      })),
  },
}))
