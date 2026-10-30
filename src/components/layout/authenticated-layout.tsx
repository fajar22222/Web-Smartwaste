import { Outlet, useLocation } from '@tanstack/react-router'
import { Users, Building2 } from 'lucide-react'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

function AppFooter() {
  const members = [
    { nama: 'Muhammad Fajar M', nim: 'F1G125040' },
    { nama: 'Kallyn Renanda Putri', nim: 'F1G125035' },
    { nama: 'Sindi Aulia', nim: 'F1G125077' },
  ]

  return (
    <footer className='mt-auto px-4 pt-8 pb-5 sm:px-6 sm:pt-10 lg:px-8'>
      <div className='mx-auto w-full max-w-7xl overflow-hidden rounded-2xl border bg-card shadow-sm'>
        <div className='h-1 bg-gradient-to-r from-green-700 via-emerald-500 to-lime-400' />

        <div className='grid gap-8 p-5 sm:p-7 md:grid-cols-2 md:gap-10 lg:p-8'>
          {/* Identitas SmartWaste */}
          <section className='min-w-0'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-transparent p-1'>
                <img
                  src='/logo22.png'
                  alt='Logo SmartWaste'
                  className='h-10 w-10 object-contain'
                />
              </div>

              <div>
                <h3 className='text-lg font-bold tracking-tight'>SmartWaste</h3>
              </div>
            </div>

            <p className='max-w-md text-sm leading-6 text-muted-foreground'>
              Sistem informasi pelaporan sampah untuk mendukung lingkungan yang
              bersih dan kota berkelanjutan.
            </p>

            <div className='mt-5 inline-flex items-center gap-2 rounded-lg border border-green-600/20 bg-green-600/5 px-3 py-2 text-xs font-medium text-green-700 dark:text-green-400'>
              <Building2 className='size-4' />
              <span>SDG 11 · Kota Berkelanjutan</span>
            </div>
          </section>

          {/* Tim pengembang */}

          {/* Tim pengembang */}
          <section className='min-w-0'>
            <div className='mb-4 flex items-center gap-2'>
              <div className='flex size-9 items-center justify-center rounded-lg bg-muted'>
                <Users className='size-4' />
              </div>

              <div>
                <h4 className='text-sm font-semibold'>Tim Pengembang</h4>
                <p className='text-xs text-muted-foreground'>Kelompok 11</p>
              </div>
            </div>

            <div className='space-y-2'>
              {members.map((anggota) => (
                <div
                  key={anggota.nim}
                  className='rounded-lg px-3 py-2 transition-colors hover:bg-muted/50'
                >
                  <p className='text-sm font-medium'>{anggota.nama}</p>
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    NIM: {anggota.nim}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Copyright */}
        <div className='border-t bg-muted/30 px-5 py-4 sm:px-7 lg:px-8'>
          <div className='text-center'>
            <p className='text-xs leading-relaxed text-muted-foreground'>
              © SmartWaste
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const location = useLocation()
  const isDashboard = location.pathname === '/'

  return (
    <SearchProvider>
      <LayoutProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />

          <SidebarInset
            className={cn(
              '@container/content',
              'has-data-[layout=fixed]:h-svh',
              'peer-data-[variant=inset]:has-data-[layout=fixed]:h-[calc(100svh-(var(--spacing)*4))]',
              'flex flex-col'
            )}
          >
            <div className='flex min-h-full flex-1 flex-col'>
              <main className='min-w-0 flex-1'>{children ?? <Outlet />}</main>
              {isDashboard && <AppFooter />}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </LayoutProvider>
    </SearchProvider>
  )
}
