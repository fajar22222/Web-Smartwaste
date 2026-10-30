import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

interface Account {
  id: number
  nama: string
  username: string
  role: string
  created_at: string
}

interface AccountDraft {
  username: string
  password: string
}

interface ApiResponse {
  success: boolean
  message?: string
  data?: Account[]
}

export function Users() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [drafts, setDrafts] = useState<Record<number, AccountDraft>>({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [searchText, setSearchText] = useState('')

  async function loadAccounts() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/daftar_akun.php', {
        credentials: 'include',
      })

      const result: ApiResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal mengambil daftar akun.')
      }

      const data = result.data ?? []
      setAccounts(data)

      setDrafts((previous) => {
        const next: Record<number, AccountDraft> = {}

        data.forEach((account) => {
          next[account.id] = previous[account.id] ?? {
            username: account.username,
            password: '',
          }
        })

        return next
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Tidak dapat terhubung ke server.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAccounts()
  }, [])

  async function saveAccount(id: number) {
    const draft = drafts[id]

    if (!draft || !draft.username.trim()) {
      setError('Username wajib diisi.')
      return
    }

    setSavingId(id)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/ubah_akun.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          id,
          username: draft.username.trim(),
          password: draft.password,
        }),
      })

      const result: ApiResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal memperbarui akun.')
      }

      setMessage(result.message || 'Akun berhasil diperbarui.')

      setDrafts((previous) => ({
        ...previous,
        [id]: {
          ...previous[id],
          password: '',
        },
      }))

      await loadAccounts()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Tidak dapat terhubung ke server.'
      )
    } finally {
      setSavingId(null)
    }
  }

  async function deleteAccount(id: number) {
    if (deletingId !== null || savingId !== null) return

    setDeletingId(id)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/hapus_akun.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ id }),
      })

      const result: ApiResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal menghapus akun.')
      }

      setAccounts((previous) => previous.filter((account) => account.id !== id))

      setDrafts((previous) => {
        const next = { ...previous }
        delete next[id]
        return next
      })

      setAccountToDelete(null)
      setMessage(result.message || 'Akun berhasil dihapus.')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Tidak dapat terhubung ke server.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  const filteredAccounts = accounts.filter((account) => {
    const keyword = searchText.toLowerCase()

    return (
      account.nama.toLowerCase().includes(keyword) ||
      account.username.toLowerCase().includes(keyword)
    )
  })

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Kelola Akun</h2>
          <p className='text-muted-foreground'>
            Ubah username, password, atau hapus akun SmartWaste.
          </p>
        </div>

        <Input
          placeholder='Cari nama atau username...'
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          className='w-full max-w-sm'
        />

        {message && <p className='text-sm text-green-600'>{message}</p>}

        {error && (
          <div className='space-y-2'>
            <p className='text-sm text-destructive'>{error}</p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => void loadAccounts()}
              disabled={loading}
            >
              Coba Lagi
            </Button>
          </div>
        )}

        {loading ? (
          <p className='text-sm text-muted-foreground'>Memuat daftar akun...</p>
        ) : filteredAccounts.length === 0 ? (
          <p className='text-sm text-muted-foreground'>
            Tidak ada akun yang ditemukan.
          </p>
        ) : (
          <div className='space-y-4'>
            {filteredAccounts.map((account) => {
              const draft = drafts[account.id]

              if (!draft) return null

              return (
                <div
                  key={account.id}
                  className='space-y-3 rounded-lg border p-4'
                >
                  <div>
                    <p className='font-semibold'>{account.nama}</p>
                    <p className='text-sm text-muted-foreground'>
                      ID: {account.id} · Role: {account.role}
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <label
                      htmlFor={`username-${account.id}`}
                      className='text-sm font-medium'
                    >
                      Username
                    </label>
                    <Input
                      id={`username-${account.id}`}
                      value={draft.username}
                      disabled={savingId !== null || deletingId !== null}
                      onChange={(event) =>
                        setDrafts((previous) => ({
                          ...previous,
                          [account.id]: {
                            ...previous[account.id],
                            username: event.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className='space-y-2'>
                    <label
                      htmlFor={`password-${account.id}`}
                      className='text-sm font-medium'
                    >
                      Password baru
                    </label>
                    <Input
                      id={`password-${account.id}`}
                      type='password'
                      autoComplete='new-password'
                      placeholder='Kosongkan jika tidak ingin mengubah'
                      value={draft.password}
                      disabled={savingId !== null || deletingId !== null}
                      onChange={(event) =>
                        setDrafts((previous) => ({
                          ...previous,
                          [account.id]: {
                            ...previous[account.id],
                            password: event.target.value,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    <Button
                      disabled={savingId !== null || deletingId !== null}
                      onClick={() => void saveAccount(account.id)}
                    >
                      {savingId === account.id
                        ? 'Menyimpan...'
                        : 'Simpan Perubahan'}
                    </Button>

                    <Button
                      variant='destructive'
                      disabled={savingId !== null || deletingId !== null}
                      onClick={() => setAccountToDelete(account)}
                    >
                      <Trash2 className='mr-2 size-4' />
                      Hapus
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Main>

      <ConfirmDialog
        key='account-delete'
        destructive
        open={accountToDelete !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen && deletingId === null) {
            setAccountToDelete(null)
          }
        }}
        handleConfirm={() => {
          if (accountToDelete) {
            void deleteAccount(accountToDelete.id)
          }
        }}
        className='max-w-md'
        title={`Hapus akun ${accountToDelete?.nama ?? ''}?`}
        desc={
          <>
            Kamu akan menghapus akun{' '}
            <strong>{accountToDelete?.username}</strong>.
            <br />
            Akun yang dihapus tidak dapat digunakan untuk login lagi.
          </>
        }
        confirmText={deletingId !== null ? 'Menghapus...' : 'Hapus'}
      />
    </>
  )
}
