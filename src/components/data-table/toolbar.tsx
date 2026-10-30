import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from './faceted-filter'
import { DataTableViewOptions } from './view-options'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  searchPlaceholder?: string
  searchKey?: string
  filters?: {
    columnId: string
    title: string
    options: {
      label: string
      value: string
      icon?: React.ComponentType<{ className?: string }>
    }[]
  }[]
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = 'Filter...',
  searchKey,
  filters = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 ||
    Boolean(table.getState().globalFilter)

  const searchValue = searchKey
    ? ((table.getColumn(searchKey)?.getFilterValue() as string) ?? '')
    : (table.getState().globalFilter ?? '')

  const handleSearch = (value: string) => {
    if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(value)
    } else {
      table.setGlobalFilter(value)
    }
  }

  return (
    <div className='flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
      <div className='flex min-w-0 flex-1 flex-col gap-3'>
        {/* Kolom pencarian */}
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => handleSearch(event.target.value)}
          className='h-9 w-full sm:max-w-[250px]'
        />

        {/* Filter dan tombol reset */}
        <div className='flex min-w-0 flex-wrap items-center gap-2'>
          {filters.map((filter) => {
            const column = table.getColumn(filter.columnId)

            if (!column) return null

            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
              />
            )
          })}

          {isFiltered && (
            <Button
              variant='ghost'
              onClick={() => {
                table.resetColumnFilters()
                table.setGlobalFilter('')
              }}
              className='h-9 px-2 sm:px-3'
            >
              Reset
              <Cross2Icon className='ms-2 h-4 w-4' />
            </Button>
          )}
        </div>
      </div>

      {/* Pengaturan kolom tabel */}
      <div className='self-end sm:self-start'>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
