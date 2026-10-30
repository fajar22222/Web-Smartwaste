import { useEffect, useState } from 'react'
import {
  ClipboardList,
  Clock,
  LoaderCircle,
  CheckCircle,
  Leaf,
  MapPin,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

type Statistik = {
  total: number
  menunggu: number
  diproses: number
  selesai: number
}

type Laporan = {
  id: number | string
  judul: string
  lokasi: string
  status: string
  created_at?: string
}

const statistikAwal: Statistik = {
  total: 0,
  menunggu: 0,
  diproses: 0,
  selesai: 0,
}

const labelStatus: Record<string, string> = {
  menunggu: 'Menunggu',
  diproses: 'Diproses',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
}

function kelasStatus(status: string) {
  switch (status.toLowerCase()) {
    case 'selesai':
      return 'bg-primary/10 text-primary'

    case 'diproses':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'

    case 'dibatalkan':
      return 'bg-muted text-muted-foreground'

    default:
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
  }
}

export function Dashboard() {
  const [statistik, setStatistik] = useState<Statistik>(statistikAwal)
  const [laporan, setLaporan] = useState<Laporan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function ambilDataDashboard() {
      try {
        const [responseStatistik, responseLaporan] = await Promise.all([
          fetch('/api/statistik_laporan.php'),
          fetch('/api/daftar_laporan.php'),
        ])

        const hasilStatistik = await responseStatistik.json()
        const hasilLaporan = await responseLaporan.json()

        if (!responseStatistik.ok || !hasilStatistik.success) {
          throw new Error('Gagal mengambil statistik laporan')
        }

        if (!responseLaporan.ok || !hasilLaporan.success) {
          throw new Error('Gagal mengambil daftar laporan')
        }

        setStatistik(hasilStatistik.data)

        const dataLaporan: Laporan[] = hasilLaporan.data

        setLaporan(
          [...dataLaporan]
            .sort((a, b) => Number(b.id) - Number(a.id))
            .slice(0, 5)
        )

        setError('')
      } catch (err) {
        console.error('Gagal memuat Dashboard:', err)

        setError(
          err instanceof Error ? err.message : 'Gagal memuat data Dashboard'
        )
      } finally {
        setLoading(false)
      }
    }

    void ambilDataDashboard()
  }, [])

  const kartuStatistik = [
    {
      judul: 'Total Laporan',
      nilai: statistik.total,
      keterangan: 'Semua laporan yang masuk',
      Icon: ClipboardList,
      warnaIkon: 'bg-primary/10 text-primary',
    },
    {
      judul: 'Menunggu',
      nilai: statistik.menunggu,
      keterangan: 'Belum ditangani',
      Icon: Clock,
      warnaIkon: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    },
    {
      judul: 'Diproses',
      nilai: statistik.diproses,
      keterangan: 'Sedang ditangani',
      Icon: RefreshCw,
      warnaIkon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    {
      judul: 'Selesai',
      nilai: statistik.selesai,
      keterangan: 'Berhasil diselesaikan',
      Icon: CheckCircle,
      warnaIkon: 'bg-primary/10 text-primary',
    },
  ]

  return (
    <>
      <Header>
        <TopNav links={topNav} className='me-auto' />
        <Search />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main>
        <div className='space-y-6'>
          {/* Judul halaman */}
          <section className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-1'>
              <div className='mb-2 flex items-center gap-2 text-sm font-medium text-primary'>
                <Leaf className='size-4' />
                <span>SmartWaste</span>
              </div>

              <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
                Dashboard
              </h1>

              <p className='max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base'>
                Pantau laporan sampah dan dukung lingkungan kota yang lebih
                bersih dan berkelanjutan.
              </p>
            </div>
          </section>

          {/* Banner informasi */}
          {/* <section className='relative overflow-hidden rounded-2xl border border-primary/15 bg-primary/5 p-5 sm:p-7'>
            <div className='relative z-10 flex items-center gap-4'>
              <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm'>
                <Leaf className='size-6' />
              </div>

              {/* <div className='min-w-0'>
                <h2 className='font-semibold tracking-tight'>
                  Bersama wujudkan kota yang lebih bersih
                </h2>
                <p className='mt-1 text-sm leading-6 text-muted-foreground'>
                  Setiap laporan menjadi langkah kecil menuju lingkungan yang
                  lebih baik.
                </p>
              </div> */}
          {/* </div> */}

          {/* <Leaf className='pointer-events-none absolute -top-5 -right-4 size-32 rotate-[-25deg] text-primary/5 sm:size-40' />
          </section> */}

          {/* Pesan error */}
          {error && (
            <div
              role='alert'
              className='flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive'
            >
              <RefreshCw className='mt-0.5 size-4 shrink-0' />
              <div>
                <p className='font-medium'>Data Dashboard gagal dimuat</p>
                <p className='mt-1'>{error}</p>
              </div>
            </div>
          )}

          {/* Statistik */}
          <section className='space-y-3'>
            <div>
              {/* <h2 className='text-lg font-semibold tracking-tight'>
                Ringkasan Laporan
              </h2> */}
              {/* <p className='text-sm text-muted-foreground'>
                Ikhtisar kondisi laporan sampah saat ini.
              </p> */}
              <hr></hr>
            </div>

            <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
              {kartuStatistik.map((kartu) => (
                <Card
                  key={kartu.judul}
                  className='group relative overflow-hidden rounded-2xl border-border/70 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md'
                >
                  <CardHeader className='flex flex-row items-center justify-between gap-3 pb-2'>
                    <CardTitle className='text-sm font-medium text-muted-foreground'>
                      {kartu.judul}
                    </CardTitle>

                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${kartu.warnaIkon}`}
                    >
                      <kartu.Icon className='size-5' />
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className='text-3xl font-bold tracking-tight tabular-nums'>
                      {loading ? (
                        <span className='inline-block h-9 w-14 animate-pulse rounded-md bg-muted' />
                      ) : (
                        kartu.nilai.toLocaleString('id-ID')
                      )}
                    </div>

                    <p className='mt-2 text-xs leading-5 text-muted-foreground'>
                      {kartu.keterangan}
                    </p>
                  </CardContent>

                  <div className='absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary/60 transition-transform duration-200 group-hover:scale-x-100' />
                </Card>
              ))}
            </div>
          </section>

          {/* Laporan terbaru */}
          <Card className='overflow-hidden rounded-2xl border-border/70 shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between gap-3 border-b border-border/60 px-5 py-4 sm:px-6'>
              <div className='space-y-1'>
                <CardTitle className='text-base font-semibold sm:text-lg'>
                  Laporan Sampah Terbaru
                </CardTitle>
              </div>

              <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <ClipboardList className='size-5' />
              </div>
            </CardHeader>

            <CardContent className='p-0'>
              {loading ? (
                <div className='flex items-center gap-3 p-6 text-sm text-muted-foreground'>
                  <LoaderCircle className='size-4 animate-spin' />
                  Memuat laporan...
                </div>
              ) : laporan.length === 0 ? (
                <div className='flex flex-col items-center justify-center px-5 py-12 text-center'>
                  <div className='mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <ClipboardList className='size-6' />
                  </div>

                  <p className='font-medium'>Belum ada laporan sampah</p>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    Laporan yang masuk akan ditampilkan di sini.
                  </p>
                </div>
              ) : (
                <div>
                  {laporan.map((item, index) => {
                    const status = item.status.toLowerCase()

                    return (
                      <div
                        key={item.id}
                        className={`flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${
                          index !== laporan.length - 1
                            ? 'border-b border-border/60'
                            : ''
                        }`}
                      >
                        <div className='flex min-w-0 items-start gap-3'>
                          <div className='mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground'>
                            <ClipboardList className='size-4' />
                          </div>

                          <div className='min-w-0'>
                            <p className='truncate font-medium'>{item.judul}</p>

                            <p className='mt-1 flex items-center gap-1.5 text-sm text-muted-foreground'>
                              <MapPin className='size-3.5 shrink-0 text-primary' />
                              <span className='truncate'>
                                {item.lokasi || 'Lokasi tidak tersedia'}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className='flex shrink-0 items-center pl-12 sm:pl-0'>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${kelasStatus(status)}`}
                          >
                            <span className='size-1.5 rounded-full bg-current' />
                            {labelStatus[status] ?? item.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Main>
    </>
  )
}

const topNav = [
  {
    title: 'Dashboard',
    href: '/',
    isActive: true,
    disabled: false,
  },
]
