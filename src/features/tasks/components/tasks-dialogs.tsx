import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { TasksImportDialog } from './tasks-import-dialog'
import { TasksMutateDrawer } from './tasks-mutate-drawer'
import { useTasks } from './tasks-provider'

export function TasksDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, setTasks } = useTasks()

  const closeDialog = () => {
    setOpen(null)

    setTimeout(() => {
      setCurrentRow(null)
    }, 300)
  }

  const handleDelete = async () => {
    if (!currentRow) return

    try {
      // Mengubah ID tampilan SW-001 menjadi ID database 1
      const idDatabase = Number(String(currentRow.id).replace('SW-', ''))

      if (!Number.isInteger(idDatabase) || idDatabase <= 0) {
        throw new Error('ID laporan tidak valid')
      }

      // Mengirim permintaan hapus ke PHP
      const response = await fetch('/api/hapus_laporan.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: idDatabase,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal menghapus laporan')
      }

      // Menghapus laporan dari tampilan setelah database berhasil diubah
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== currentRow.id)
      )

      closeDialog()
    } catch (error) {
      console.error('Gagal menghapus laporan:', error)

      alert(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menghapus laporan'
      )
    }
  }

  return (
    <>
      {/* Tambah Laporan / Edit Laporan */}
      <TasksMutateDrawer
        key='task-create'
        open={open === 'create'}
        onOpenChange={(value) => {
          if (!value) {
            setOpen(null)
          } else {
            setOpen('create')
          }
        }}
      />

      {currentRow && (
        <TasksMutateDrawer
          key={`task-update-${currentRow.id}`}
          open={open === 'update'}
          onOpenChange={(value) => {
            if (!value) {
              closeDialog()
            } else {
              setOpen('update')
            }
          }}
          currentRow={currentRow}
        />
      )}

      {/* Import */}
      <TasksImportDialog
        key='tasks-import'
        open={open === 'import'}
        onOpenChange={(value) => {
          if (!value) {
            setOpen(null)
          } else {
            setOpen('import')
          }
        }}
      />

      {/* Detail */}
      {currentRow && (
        <Sheet
          open={open === 'detail'}
          onOpenChange={(value) => {
            if (!value) {
              closeDialog()
            }
          }}
        >
          <SheetContent className='overflow-y-auto'>
            <SheetHeader className='text-start'>
              <SheetTitle>Detail Laporan Sampah</SheetTitle>

              <SheetDescription>
                Informasi lengkap laporan sampah.
              </SheetDescription>
            </SheetHeader>

            <div className='space-y-5 px-4 py-6'>
              <div>
                <p className='text-sm text-muted-foreground'>ID Laporan</p>
                <p className='font-medium'>{currentRow.id}</p>
              </div>

              <div>
                <p className='text-sm text-muted-foreground'>Judul Laporan</p>
                <p className='font-medium'>{currentRow.title}</p>
              </div>

              <div>
                <p className='text-sm text-muted-foreground'>Kategori Sampah</p>
                <Badge variant='outline'>
                  {currentRow.category || 'Kategori tidak tersedia'}
                </Badge>
              </div>

              <div>
                <p className='text-sm text-muted-foreground'>Lokasi</p>
                <p className='font-medium'>{currentRow.location}</p>
              </div>

              <div>
                <p className='text-sm text-muted-foreground'>Deskripsi</p>
                <p className='leading-relaxed'>{currentRow.description}</p>
              </div>

              <div>
                <p className='text-sm text-muted-foreground'>Foto</p>

                {currentRow.photo ? (
                  <img
                    src={
                      /^https?:\/\//i.test(currentRow.photo)
                        ? currentRow.photo
                            .replace(
                              /^https?:\/\/localhost(?::\d+)?/,
                              `${window.location.protocol}//${window.location.hostname}`
                            )
                            .replace(/\/smartwaste_API\/uploads\//, '/uploads/')
                        : `/uploads/${currentRow.photo.replace(/^\/+/, '').replace(/^uploads\//, '')}`
                    }
                    alt='Foto laporan sampah'
                    className='mt-2 h-auto max-h-64 w-full rounded-md border object-contain'
                    onError={(event) => {
                      console.error(
                        'Foto gagal dimuat:',
                        event.currentTarget.src
                      )
                    }}
                  />
                ) : (
                  <p className='text-muted-foreground'>Tidak ada foto</p>
                )}
              </div>

              <div>
                <p className='text-sm text-muted-foreground'>Status</p>
                <p className='font-medium'>
                  {currentRow.status === 'menunggu' && 'Menunggu'}
                  {currentRow.status === 'diproses' && 'Diproses'}
                  {currentRow.status === 'selesai' && 'Selesai'}
                  {currentRow.status === 'dibatalkan' && 'Dibatalkan'}
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Hapus */}
      {currentRow && (
        <ConfirmDialog
          key='task-delete'
          destructive
          open={open === 'delete'}
          onOpenChange={(value) => {
            if (!value) {
              closeDialog()
            } else {
              setOpen('delete')
            }
          }}
          handleConfirm={handleDelete}
          className='max-w-md'
          title={`Hapus laporan ${currentRow.id}?`}
          desc={
            <>
              Kamu akan menghapus laporan dengan ID{' '}
              <strong>{currentRow.id}</strong>.
              <br />
              Data yang dihapus tidak dapat dikembalikan.
            </>
          }
          confirmText='Hapus'
        />
      )}
    </>
  )
}
