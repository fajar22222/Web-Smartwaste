import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { SelectDropdown } from '@/components/select-dropdown'
import { type Task } from '../data/schema'
import { useTasks } from './tasks-provider'

type TaskMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: Task
}

type CategoryOption = {
  label: string
  value: string
}

type ApiCategory = {
  id: number | string
  nama_kategori: string
  deskripsi?: string
}

type CategoryApiResponse = {
  success: boolean
  message?: string
  data?: ApiCategory[]
}

const formSchema = z.object({
  title: z.string().min(1, 'Judul laporan wajib diisi.'),
  category: z.string().min(1, 'Silakan pilih kategori sampah.'),
  location: z.string().min(1, 'Lokasi wajib diisi.'),
  description: z.string().min(1, 'Deskripsi wajib diisi.'),
  photo: z.any().optional(),
  status: z.string().min(1, 'Status laporan wajib diisi.'),
})

type TaskForm = z.infer<typeof formSchema>

const MAX_PHOTO_SIZE = 5 * 1024 * 1024
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Kompres foto besar menjadi JPEG maksimal 5 MB.
const compressPhoto = async (file: File): Promise<File> => {
  if (file.size <= MAX_PHOTO_SIZE) return file

  if (file.type === 'image/gif') {
    throw new Error(
      'Foto GIF lebih dari 5 MB. Silakan pilih foto JPG, PNG, atau WEBP.'
    )
  }

  const imageUrl = URL.createObjectURL(file)

  try {
    const image = new Image()
    image.src = imageUrl

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve()
      image.onerror = () => reject(new Error('Foto gagal dibaca.'))
    })

    const canvas = document.createElement('canvas')
    const maxDimension = 1600
    const scale = Math.min(
      1,
      maxDimension / Math.max(image.naturalWidth, image.naturalHeight)
    )

    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))

    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Gagal memproses foto.')
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    let quality = 0.82
    let blob: Blob | null = null

    for (let attempt = 0; attempt < 6; attempt++) {
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', quality)
      })

      if (blob && blob.size <= MAX_PHOTO_SIZE) break

      quality -= 0.12
    }

    if (!blob || blob.size > MAX_PHOTO_SIZE) {
      throw new Error(
        'Foto masih terlalu besar setelah dikompres. Silakan pilih foto lain.'
      )
    }

    const filename = file.name.replace(/\.[^.]+$/, '') || 'foto-sampah'

    return new File([blob], `${filename}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })
  } finally {
    URL.revokeObjectURL(imageUrl)
  }
}

export function TasksMutateDrawer({
  open,
  onOpenChange,
  currentRow,
}: TaskMutateDrawerProps) {
  const isUpdate = !!currentRow
  const { setTasks } = useTasks()

  const [photoPreview, setPhotoPreview] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categoriesError, setCategoriesError] = useState('')

  const form = useForm<TaskForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: currentRow?.title ?? '',
      category: currentRow?.category ?? '',
      location: currentRow?.location ?? '',
      description: currentRow?.description ?? '',
      photo: undefined,
      status: currentRow?.status ?? 'menunggu',
    },
  })

  const selectedPhoto = form.watch('photo')

  // Mengambil kategori terbaru dari database melalui API.
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true)
      setCategoriesError('')

      const response = await fetch('/api/daftar_kategori.php')
      const result: CategoryApiResponse = await response.json()

      if (!response.ok || !result.success || !Array.isArray(result.data)) {
        throw new Error(result.message || 'Gagal memuat kategori.')
      }

      const options = result.data.map((item) => ({
        label: item.nama_kategori,
        value: item.nama_kategori,
      }))

      setCategories(options)
    } catch (error) {
      setCategoriesError(
        error instanceof Error ? error.message : 'Gagal memuat kategori.'
      )
    } finally {
      setCategoriesLoading(false)
    }
  }

  useEffect(() => {
    void fetchCategories()
  }, [])

  useEffect(() => {
    if (!open) {
      setPhotoPreview('')
      setPhotoError('')
      return
    }

    if (selectedPhoto instanceof File) {
      const previewUrl = URL.createObjectURL(selectedPhoto)
      setPhotoPreview(previewUrl)

      return () => URL.revokeObjectURL(previewUrl)
    }

    setPhotoPreview('')
  }, [selectedPhoto, open])

  useEffect(() => {
    if (open) {
      form.reset({
        title: currentRow?.title ?? '',
        category: currentRow?.category ?? '',
        location: currentRow?.location ?? '',
        description: currentRow?.description ?? '',
        photo: undefined,
        status: currentRow?.status ?? 'menunggu',
      })

      setPhotoError('')
    }
  }, [open, currentRow, form])

  const handlePhotoChange = async (file?: File) => {
    setPhotoError('')

    if (!file) return

    if (!allowedTypes.includes(file.type)) {
      setPhotoError('Format foto harus JPG, PNG, WEBP, atau GIF.')
      return
    }

    try {
      const processedFile = await compressPhoto(file)

      form.setValue('photo', processedFile, {
        shouldDirty: true,
        shouldValidate: true,
      })
    } catch (error) {
      setPhotoError(
        error instanceof Error ? error.message : 'Gagal memproses foto.'
      )
    }
  }

  const onSubmit = async (data: TaskForm) => {
    try {
      setPhotoError('')

      // Pastikan kategori terbaru sudah tersedia sebelum menyimpan.
      const categoryResponse = await fetch('/api/daftar_kategori.php')
      const categoryResult: CategoryApiResponse = await categoryResponse.json()

      if (
        !categoryResponse.ok ||
        !categoryResult.success ||
        !Array.isArray(categoryResult.data)
      ) {
        throw new Error('Gagal memeriksa kategori terbaru.')
      }

      const categoryExists = categoryResult.data.some(
        (item) => item.nama_kategori === data.category
      )

      if (!categoryExists) {
        await fetchCategories()
        throw new Error(
          'Kategori ini sudah tidak tersedia. Silakan pilih kategori lain.'
        )
      }

      const formData = new FormData()

      formData.append('title', data.title)
      formData.append('category', data.category)
      formData.append('location', data.location)
      formData.append('description', data.description)

      if (data.photo instanceof File) {
        if (data.photo.size > MAX_PHOTO_SIZE) {
          throw new Error('Ukuran foto maksimal 5 MB.')
        }

        if (!allowedTypes.includes(data.photo.type)) {
          throw new Error('Format foto tidak didukung.')
        }

        formData.append('photo', data.photo)
      }

      let response: Response

      if (isUpdate) {
        const idDatabase = Number(String(currentRow?.id).replace('SW-', ''))

        if (!Number.isInteger(idDatabase) || idDatabase <= 0) {
          throw new Error('ID laporan tidak valid.')
        }

        formData.append('id', String(idDatabase))
        formData.append('status', data.status)

        response = await fetch('/api/edit_laporan.php', {
          method: 'POST',
          body: formData,
        })
      } else {
        response = await fetch('/api/tambah_laporan.php', {
          method: 'POST',
          body: formData,
        })
      }

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal menyimpan laporan.')
      }

      if (!isUpdate) {
        setTasks((currentTasks) => [
          ...currentTasks,
          {
            ...data,
            photo: result.foto ?? '',
            id: `SW-${String(result.id).padStart(3, '0')}`,
          },
        ])
      } else {
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task.id === currentRow?.id
              ? {
                  ...task,
                  ...data,
                  photo: result.foto ?? task.photo ?? '',
                }
              : task
          )
        )
      }

      onOpenChange(false)
      form.reset()
      setPhotoPreview('')
      setPhotoError('')
    } catch (error) {
      console.error('Gagal menyimpan laporan:', error)

      alert(
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menyimpan laporan.'
      )
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value)

        if (!value) {
          form.reset()
          setPhotoPreview('')
          setPhotoError('')
        }
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>
            {isUpdate ? 'Edit Laporan Sampah' : 'Tambah Laporan Sampah'}
          </SheetTitle>

          <SheetDescription>
            {isUpdate
              ? 'Ubah informasi laporan sampah.'
              : 'Masukkan informasi sampah yang ingin dilaporkan.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='tasks-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul Laporan</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='Contoh: Sampah menumpuk di pinggir jalan'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='category'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategori Sampah</FormLabel>

                  <SelectDropdown
                    key={`${currentRow?.id ?? 'baru'}-${open}-${categories.length}`}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder={
                      categoriesLoading
                        ? 'Memuat kategori...'
                        : categoriesError
                          ? 'Kategori gagal dimuat'
                          : 'Pilih kategori'
                    }
                    items={categories}
                  />

                  {categoriesError && (
                    <div className='space-y-2'>
                      <p className='text-sm text-destructive'>
                        {categoriesError}
                      </p>

                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        disabled={categoriesLoading}
                        onClick={() => void fetchCategories()}
                      >
                        Coba Lagi
                      </Button>
                    </div>
                  )}

                  {!categoriesLoading &&
                    !categoriesError &&
                    categories.length === 0 && (
                      <p className='text-sm text-muted-foreground'>
                        Belum ada kategori. Tambahkan kategori terlebih dahulu.
                      </p>
                    )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='location'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lokasi</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Contoh: Jl. Ahmad Yani' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='description'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder='Jelaskan kondisi sampah yang ditemukan...'
                      className='min-h-24'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Foto sampah: kamera dan galeri */}
            <FormField
              control={form.control}
              name='photo'
              render={() => (
                <FormItem>
                  <FormLabel>Foto Sampah</FormLabel>

                  <div className='grid grid-cols-2 gap-3'>
                    <Button
                      type='button'
                      variant='outline'
                      className='w-full'
                      onClick={() =>
                        document.getElementById('camera-photo-input')?.click()
                      }
                    >
                      <Camera className='mr-2 size-4' />
                      Ambil Foto
                    </Button>

                    <Button
                      type='button'
                      variant='outline'
                      className='w-full'
                      onClick={() =>
                        document.getElementById('gallery-photo-input')?.click()
                      }
                    >
                      <ImagePlus className='mr-2 size-4' />
                      Pilih Galeri
                    </Button>
                  </div>

                  <input
                    id='camera-photo-input'
                    type='file'
                    accept='image/*'
                    capture='environment'
                    className='hidden'
                    onChange={(event) => {
                      void handlePhotoChange(event.target.files?.[0])
                      event.target.value = ''
                    }}
                  />

                  <input
                    id='gallery-photo-input'
                    type='file'
                    accept='image/jpeg,image/png,image/webp,image/gif'
                    className='hidden'
                    onChange={(event) => {
                      void handlePhotoChange(event.target.files?.[0])
                      event.target.value = ''
                    }}
                  />

                  {photoPreview && (
                    <div className='relative mt-3 overflow-hidden rounded-lg border'>
                      <img
                        src={photoPreview}
                        alt='Pratinjau foto sampah'
                        className='max-h-64 w-full object-contain'
                      />

                      <Button
                        type='button'
                        variant='destructive'
                        size='icon'
                        className='absolute top-2 right-2'
                        aria-label='Hapus foto pilihan'
                        onClick={() => {
                          form.setValue('photo', undefined, {
                            shouldDirty: true,
                          })
                          setPhotoPreview('')
                          setPhotoError('')
                        }}
                      >
                        <X className='size-4' />
                      </Button>
                    </div>
                  )}

                  {isUpdate && currentRow?.photo && !selectedPhoto && (
                    <p className='text-sm text-muted-foreground'>
                      Foto lama tetap digunakan jika kamu tidak memilih foto
                      baru.
                    </p>
                  )}

                  {!photoPreview && (
                    <p className='text-sm text-muted-foreground'>
                      Ambil foto dengan kamera HP atau pilih dari galeri. Foto
                      lebih dari 5 MB akan dikompres otomatis.
                    </p>
                  )}

                  {photoError && (
                    <p className='text-sm font-medium text-destructive'>
                      {photoError}
                    </p>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>

                  {isUpdate ? (
                    <SelectDropdown
                      key={`${currentRow?.id ?? 'baru'}-${open}-status`}
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder='Pilih status'
                      items={[
                        { label: 'Menunggu', value: 'menunggu' },
                        { label: 'Diproses', value: 'diproses' },
                        { label: 'Selesai', value: 'selesai' },
                        { label: 'Dibatalkan', value: 'dibatalkan' },
                      ]}
                    />
                  ) : (
                    <Input value='Menunggu' disabled />
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Batal</Button>
          </SheetClose>

          <Button
            form='tasks-form'
            type='submit'
            disabled={form.formState.isSubmitting || categoriesLoading}
          >
            {form.formState.isSubmitting
              ? 'Menyimpan...'
              : isUpdate
                ? 'Simpan Perubahan'
                : 'Simpan Laporan'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
