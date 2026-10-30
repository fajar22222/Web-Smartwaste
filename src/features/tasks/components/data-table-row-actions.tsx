import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { taskSchema } from '../data/schema'
import { useTasks } from './tasks-provider'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const task = taskSchema.parse(row.original)
  const { setOpen, setCurrentRow } = useTasks()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='size-8 rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary data-[state=open]:bg-primary/10 data-[state=open]:text-primary'
          aria-label='Buka menu aksi laporan'
        >
          <DotsHorizontalIcon className='size-4' />
          <span className='sr-only'>Buka menu aksi</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        sideOffset={6}
        className='w-44 rounded-xl p-1.5 shadow-lg'
      >
        <DropdownMenuItem
          className='cursor-pointer gap-2 rounded-lg py-2'
          onClick={() => {
            setCurrentRow(task)
            setOpen('detail')
          }}
        >
          <Eye className='size-4 text-muted-foreground' />
          <span>Detail laporan</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className='cursor-pointer gap-2 rounded-lg py-2'
          onClick={() => {
            setCurrentRow(task)
            setOpen('update')
          }}
        >
          <Pencil className='size-4 text-muted-foreground' />
          <span>Edit laporan</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className='my-1' />

        <DropdownMenuItem
          className='cursor-pointer gap-2 rounded-lg py-2 text-destructive focus:bg-destructive/10 focus:text-destructive'
          onClick={() => {
            setCurrentRow(task)
            setOpen('delete')
          }}
        >
          <Trash2 className='size-4' />
          <span>Hapus laporan</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
