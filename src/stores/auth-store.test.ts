import { clearCookies } from '@/test-utils/cookies'
import { beforeEach, describe, expect, it, vi } from 'vitest'

async function importAuthStore() {
  const { useAuthStore } = await import('./auth-store')
  return useAuthStore
}

const sampleUser = {
  id: 1,
  nama: 'Pengguna SmartWaste',
  username: 'pengguna',
  role: 'masyarakat' as const,
}

describe('useAuthStore', () => {
  beforeEach(() => {
    clearCookies()
    vi.resetModules()
  })

  it('memulai dengan user kosong', async () => {
    const useAuthStore = await importAuthStore()

    expect(useAuthStore.getState().auth.user).toBeNull()
  })

  it('menyimpan data pengguna melalui setUser', async () => {
    const useAuthStore = await importAuthStore()

    useAuthStore.getState().auth.setUser({ ...sampleUser })

    expect(useAuthStore.getState().auth.user).toEqual(sampleUser)
  })

  it('mengubah data pengguna ketika setUser dipanggil kembali', async () => {
    const useAuthStore = await importAuthStore()

    useAuthStore.getState().auth.setUser({ ...sampleUser })

    const updatedUser = {
      id: 2,
      nama: 'Pengguna Baru',
      username: 'pengguna_baru',
      role: 'masyarakat' as const,
    }

    useAuthStore.getState().auth.setUser(updatedUser)

    expect(useAuthStore.getState().auth.user).toEqual(updatedUser)
  })

  it('menghapus data pengguna ketika reset dipanggil', async () => {
    const useAuthStore = await importAuthStore()

    useAuthStore.getState().auth.setUser({ ...sampleUser })
    useAuthStore.getState().auth.reset()

    expect(useAuthStore.getState().auth.user).toBeNull()
  })
})
