import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import { TasksProvider, useTasks } from './components/tasks-provider'
import { TasksTable } from './components/tasks-table'

function TasksContent() {
  const { tasks, setTasks } = useTasks()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchLaporan = useCallback(async () => {
    try {
      setError('')

      const response = await fetch('/api/daftar_laporan.php')
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error('Gagal mengambil data laporan')
      }

      const dataTasks = result.data.map((laporan: any) => ({
        id: `SW-${String(laporan.id).padStart(3, '0')}`,
        title: laporan.judul,
        category: laporan.kategori,
        location: laporan.lokasi,
        description: laporan.deskripsi,
        photo: laporan.foto ?? '',
        status: laporan.status,
        priority: laporan.prioritas,
      }))

      setTasks(dataTasks)
    } catch (err) {
      console.error('Gagal mengambil laporan:', err)
      setError('Data laporan gagal dimuat. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }, [setTasks])

  useEffect(() => {
    void fetchLaporan()
  }, [fetchLaporan])

  const handleUbahStatus = useCallback(
    async (taskId: string, statusBaru: string) => {
      const idDatabase = Number(taskId.replace('SW-', ''))

      if (!Number.isInteger(idDatabase) || idDatabase <= 0) {
        throw new Error('ID laporan tidak valid')
      }

      const response = await fetch('/api/ubah_status_laporan.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: idDatabase,
          status: statusBaru,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal mengubah status laporan')
      }

      setTasks((previousTasks) =>
        previousTasks.map((task) =>
          task.id === taskId ? { ...task, status: statusBaru } : task
        )
      )

      toast.success('Status laporan berhasil diperbarui')
    },
    [setTasks]
  )

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
              Laporan Sampah
            </h2>
            <p className='text-muted-foreground'>
              Daftar laporan sampah yang masuk ke sistem SmartWaste.
            </p>
          </div>

          <TasksPrimaryButtons />
        </div>

        {loading ? (
          <p>Memuat data laporan...</p>
        ) : error ? (
          <div className='space-y-2'>
            <p className='text-destructive'>{error}</p>
            <button
              type='button'
              className='text-sm underline'
              onClick={() => {
                setLoading(true)
                void fetchLaporan()
              }}
            >
              Coba lagi
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <p>Belum ada laporan sampah.</p>
        ) : (
          <TasksTable data={tasks} onStatusChange={handleUbahStatus} />
        )}
      </Main>

      <TasksDialogs />
    </>
  )
}

export function Tasks() {
  return (
    <TasksProvider>
      <TasksContent />
    </TasksProvider>
  )
}
