import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

type Category = {
  id: number
  name: string
  description: string
}

type ApiCategory = {
  id: number | string
  nama_kategori: string
  deskripsi: string
}

type ApiResponse = {
  success: boolean
  message?: string
  data?: ApiCategory[]
}

export function Apps() {
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  )
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/daftar_kategori.php')

      if (!response.ok) {
        throw new Error('Gagal menghubungi server.')
      }

      const result: ApiResponse = await response.json()

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Gagal mengambil data kategori.')
      }

      const data: Category[] = result.data.map((item) => ({
        id: Number(item.id),
        name: item.nama_kategori,
        description: item.deskripsi ?? '',
      }))

      setCategories(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat mengambil data.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchCategories()
  }, [])

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = () => {
    setEditingCategory(null)
    setName('')
    setDescription('')
    setOpen(true)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setName(category.name)
    setDescription(category.description)
    setOpen(true)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.warning('Nama kategori wajib diisi')
      return
    }

    const isEditing = editingCategory !== null

    try {
      setSaving(true)

      const response = await fetch(
        isEditing ? '/api/edit_kategori.php' : '/api/tambah_kategori.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingCategory?.id,
            nama_kategori: name.trim(),
            deskripsi: description.trim(),
          }),
        }
      )

      const result: ApiResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal menyimpan kategori.')
      }

      setOpen(false)
      setName('')
      setDescription('')
      setEditingCategory(null)

      await fetchCategories()

      toast.success(
        isEditing
          ? 'Kategori berhasil diperbarui'
          : 'Kategori berhasil ditambahkan'
      )
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat menyimpan kategori.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    const category = categories.find((item) => item.id === id)

    if (!category || deletingId !== null) return

    try {
      setDeletingId(id)

      const response = await fetch('/api/hapus_kategori.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      const result: ApiResponse = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal menghapus kategori.')
      }

      await fetchCategories()

      toast.success('Kategori berhasil dihapus')
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat menghapus kategori.'
      )
    } finally {
      setDeletingId(null)
      setCategoryToDelete(null)
    }
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Kategori Sampah
            </h2>
            <p className='text-muted-foreground'>
              Kelola kategori sampah pada sistem SmartWaste.
            </p>
          </div>

          <Button onClick={handleAdd}>
            <Plus className='me-2 size-4' />
            Tambah Kategori
          </Button>
        </div>

        <div className='flex items-center gap-2'>
          <Input
            placeholder='Cari kategori...'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className='w-full max-w-sm'
          />
        </div>

        <div className='w-full min-w-0 overflow-x-auto rounded-md border'>
          <table className='w-full min-w-[600px] table-auto'>
            <thead>
              <tr className='border-b bg-muted/50'>
                <th className='w-16 px-4 py-3 text-left'>No</th>
                <th className='min-w-[150px] px-4 py-3 text-left'>Kategori</th>
                <th className='min-w-[180px] px-4 py-3 text-left'>Deskripsi</th>
                <th className='w-[180px] px-4 py-3 text-right'>Aksi</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className='h-24 text-center text-muted-foreground'
                  >
                    Memuat data kategori...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className='h-24 text-center'>
                    <p className='mb-2 text-sm text-destructive'>{error}</p>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => void fetchCategories()}
                    >
                      Coba Lagi
                    </Button>
                  </td>
                </tr>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((category, index) => (
                  <tr key={category.id} className='border-b last:border-0'>
                    <td className='px-4 py-3'>{index + 1}</td>

                    <td className='px-4 py-3 font-medium'>{category.name}</td>

                    <td className='px-4 py-3 text-muted-foreground'>
                      {category.description}
                    </td>

                    <td className='px-4 py-3 whitespace-nowrap'>
                      <div className='flex min-w-max justify-end gap-2'>
                        <Button
                          variant='outline'
                          size='sm'
                          disabled={saving || deletingId !== null}
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className='me-2 size-4' />
                          Edit
                        </Button>

                        <Button
                          variant='destructive'
                          size='sm'
                          disabled={saving || deletingId !== null}
                          onClick={() => setCategoryToDelete(category)}
                        >
                          <Trash2 className='me-2 size-4' />
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className='h-24 text-center text-muted-foreground'
                  >
                    Kategori tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Main>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader className='text-start'>
            <SheetTitle>
              {editingCategory
                ? 'Edit Kategori Sampah'
                : 'Tambah Kategori Sampah'}
            </SheetTitle>
          </SheetHeader>

          <div className='space-y-5 px-4 py-6'>
            <div className='space-y-2'>
              <Label htmlFor='category-name'>Nama Kategori</Label>
              <Input
                id='category-name'
                placeholder='Contoh: Organik'
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={saving}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='category-description'>Deskripsi</Label>
              <Input
                id='category-description'
                placeholder='Deskripsi kategori'
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          <SheetFooter className='gap-2'>
            <SheetClose asChild>
              <Button variant='outline' disabled={saving}>
                Batal
              </Button>
            </SheetClose>

            <Button onClick={() => void handleSave()} disabled={saving}>
              {saving
                ? 'Menyimpan...'
                : editingCategory
                  ? 'Simpan Perubahan'
                  : 'Simpan'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        key='category-delete'
        destructive
        open={categoryToDelete !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen && deletingId === null) {
            setCategoryToDelete(null)
          }
        }}
        handleConfirm={() => {
          if (categoryToDelete) {
            void handleDelete(categoryToDelete.id)
          }
        }}
        className='max-w-md'
        title={`Hapus kategori ${categoryToDelete?.name ?? ''}?`}
        desc={
          <>
            Kamu akan menghapus kategori{' '}
            <strong>{categoryToDelete?.name}</strong>.
            <br />
            Data yang dihapus tidak dapat dikembalikan.
          </>
        }
        confirmText='Hapus'
      />
    </>
  )
}
