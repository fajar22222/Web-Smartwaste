import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { type Task } from '../data/schema'
import { TasksMutateDrawer } from './tasks-mutate-drawer'

const { mockSetTasks } = vi.hoisted(() => ({
  mockSetTasks: vi.fn(),
}))

vi.mock('./tasks-provider', () => ({
  useTasks: () => ({
    setTasks: mockSetTasks,
  }),
}))

const MOCK_TASK = {
  id: 'SW-001',
  title: 'Sampah menumpuk',
  category: 'organik',
  location: 'Jl. Ahmad Yani',
  description: 'Sampah menumpuk di pinggir jalan',
  status: 'menunggu',
  photo: '',
} satisfies Task

describe('TasksMutateDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          id: 2,
          foto: '',
        }),
      })
    )
  })

  it('menampilkan form tambah laporan', async () => {
    const { getByRole, getByText } = await render(
      <TasksMutateDrawer open onOpenChange={vi.fn()} />
    )

    await expect
      .element(getByRole('heading', { name: /Tambah Laporan Sampah/i }))
      .toBeInTheDocument()

    await expect
      .element(getByText(/Masukkan informasi sampah/i))
      .toBeInTheDocument()

    await expect
      .element(getByRole('textbox', { name: /Judul Laporan/i }))
      .toHaveValue('')
  })

  it('menampilkan data laporan ketika mode edit', async () => {
    const { getByRole, getByText } = await render(
      <TasksMutateDrawer open onOpenChange={vi.fn()} currentRow={MOCK_TASK} />
    )

    await expect
      .element(getByRole('heading', { name: /Edit Laporan Sampah/i }))
      .toBeInTheDocument()

    await expect
      .element(getByRole('textbox', { name: /Judul Laporan/i }))
      .toHaveValue(MOCK_TASK.title)

    await expect
      .element(getByRole('textbox', { name: /Lokasi/i }))
      .toHaveValue(MOCK_TASK.location)

    await expect
      .element(getByRole('textbox', { name: /Deskripsi/i }))
      .toHaveValue(MOCK_TASK.description)

    await expect.element(getByText(/Simpan Perubahan/i)).toBeInTheDocument()
  })

  it('menampilkan validasi ketika form kosong disimpan', async () => {
    const { getByRole, getByText } = await render(
      <TasksMutateDrawer open onOpenChange={vi.fn()} />
    )

    await userEvent.click(getByRole('button', { name: /Simpan Laporan/i }))

    await expect
      .element(getByText(/Judul laporan wajib diisi/i))
      .toBeInTheDocument()

    await expect.element(getByText(/Lokasi wajib diisi/i)).toBeInTheDocument()

    await expect
      .element(getByText(/Deskripsi wajib diisi/i))
      .toBeInTheDocument()
  })

  it('menutup form ketika tombol Batal diklik', async () => {
    const onOpenChange = vi.fn()

    const { getByRole } = await render(
      <TasksMutateDrawer open onOpenChange={onOpenChange} />
    )

    await userEvent.click(getByRole('button', { name: /Batal/i }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('mengirim laporan baru ke API', async () => {
    const onOpenChange = vi.fn()

    const { getByRole } = await render(
      <TasksMutateDrawer open onOpenChange={onOpenChange} />
    )

    await userEvent.fill(
      getByRole('textbox', { name: /Judul Laporan/i }),
      'Sampah menumpuk'
    )

    await userEvent.click(getByRole('combobox').nth(0))
    await userEvent.click(getByRole('option', { name: 'Organik' }))

    await userEvent.fill(
      getByRole('textbox', { name: /Lokasi/i }),
      'Jl. Ahmad Yani'
    )

    await userEvent.fill(
      getByRole('textbox', { name: /Deskripsi/i }),
      'Sampah perlu segera dibersihkan'
    )

    await userEvent.click(getByRole('radio', { name: /Sedang/i }))

    await userEvent.click(getByRole('button', { name: /Simpan Laporan/i }))

    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalledOnce()
    })

    expect(fetch).toHaveBeenCalledWith(
      '/api/tambah_laporan.php',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    )

    await vi.waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('mereset form setelah ditutup dan dibuka kembali', async () => {
    function Harness() {
      const [open, setOpen] = useState(true)

      return (
        <>
          <button type='button' onClick={() => setOpen(true)}>
            Buka Kembali
          </button>

          <TasksMutateDrawer open={open} onOpenChange={setOpen} />
        </>
      )
    }

    const { getByRole } = await render(<Harness />)

    const titleInput = getByRole('textbox', { name: /Judul Laporan/i })

    await userEvent.fill(titleInput, 'Laporan sementara')

    await expect.element(titleInput).toHaveValue('Laporan sementara')

    await userEvent.click(getByRole('button', { name: /Batal/i }))
    await userEvent.click(getByRole('button', { name: /Buka Kembali/i }))

    await expect.element(titleInput).toHaveValue('')
  })
})
