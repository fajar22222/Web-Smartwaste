import { type ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTableColumnHeader } from '@/components/data-table'
import { type Task } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

const statusOptions = [
  { value: 'menunggu', label: 'Menunggu' },
  { value: 'diproses', label: 'Diproses' },
  { value: 'selesai', label: 'Selesai' },
  { value: 'dibatalkan', label: 'Dibatalkan' },
]

const statusStyles: Record<string, string> = {
  menunggu:
    'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
  diproses:
    'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
  selesai:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  dibatalkan: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400',
}

const statusLabels: Record<string, string> = {
  menunggu: 'Menunggu',
  diproses: 'Diproses',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
}

const categoryLabels: Record<string, string> = {
  organik: 'Organik',
  anorganik: 'Anorganik',
  plastik: 'Plastik',
  'rumah-tangga': 'Rumah Tangga',
}

export function createTasksColumns(
  onStatusChange: (taskId: string, statusBaru: string) => Promise<void>
): ColumnDef<Task>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label='Pilih semua'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label='Pilih laporan'
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='ID' />
      ),
      cell: ({ row }) => (
        <div className='w-20 font-mono text-xs font-medium text-muted-foreground'>
          {row.getValue('id')}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Laporan Sampah' />
      ),
      meta: {
        className: 'ps-1 max-w-0 w-2/3',
        tdClassName: 'ps-4',
      },
      cell: ({ row }) => (
        <span className='truncate font-medium'>{row.getValue('title')}</span>
      ),
    },
    {
      accessorKey: 'category',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Kategori' />
      ),
      cell: ({ row }) => {
        const category = String(row.getValue('category'))
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')

        return (
          <Badge
            variant='outline'
            className='rounded-md border-border/70 bg-muted/40 font-normal'
          >
            {categoryLabels[category] ?? String(row.getValue('category'))}
          </Badge>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status' />
      ),
      cell: ({ row }) => {
        const status = String(row.getValue('status')).toLowerCase()

        return (
          <Select
            value={status}
            onValueChange={async (statusBaru) => {
              try {
                await onStatusChange(String(row.original.id), statusBaru)
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : 'Gagal mengubah status laporan'
                )
              }
            }}
          >
            <SelectTrigger
              className={`h-8 w-32 rounded-lg border text-xs font-medium shadow-none focus:ring-1 focus:ring-primary/30 ${
                statusStyles[status] ??
                'border-border bg-muted/40 text-foreground'
              }`}
              aria-label={`Status laporan ${row.getValue('id')}`}
            >
              <SelectValue placeholder='Pilih status'>
                {statusLabels[status] ?? status}
              </SelectValue>
            </SelectTrigger>

            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <Badge
                    variant='outline'
                    className={`pointer-events-none rounded-md font-normal ${
                      statusStyles[option.value]
                    }`}
                  >
                    {option.label}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
      filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    },
    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} />,
    },
  ]
}
