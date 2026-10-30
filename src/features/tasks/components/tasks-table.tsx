import { useEffect, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { statuses } from '../data/data'
import { type Task } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { createTasksColumns } from './tasks-columns'

const route = getRouteApi('/_authenticated/tasks/')

type DataTableProps = {
  data: Task[]
  onStatusChange: (taskId: string, statusBaru: string) => Promise<void>
}

export function TasksTable({ data, onStatusChange }: DataTableProps) {
  const columns = createTasksColumns(onStatusChange)

  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: {
      defaultPage: 1,
      defaultPageSize: 10,
    },
    globalFilter: {
      enabled: true,
      key: 'filter',
    },
    columnFilters: [
      {
        columnId: 'status',
        searchKey: 'status',
        type: 'array',
      },
    ],
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,

    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = String(filterValue ?? '')
        .trim()
        .toLowerCase()

      if (!searchValue) return true

      const id = String(row.getValue('id') ?? '').toLowerCase()
      const title = String(row.getValue('title') ?? '').toLowerCase()
      const category = String(row.getValue('category') ?? '').toLowerCase()
      const status = String(row.getValue('status') ?? '').toLowerCase()

      const statusLabel = String(
        statuses.find(
          (item) =>
            String(item.value).toLowerCase() === status ||
            String(item.label).toLowerCase() === status
        )?.label ?? ''
      ).toLowerCase()

      return (
        id.includes(searchValue) ||
        title.includes(searchValue) ||
        category.includes(searchValue) ||
        status.includes(searchValue) ||
        statusLabel.includes(searchValue)
      )
    },

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  const pageCount = table.getPageCount()

  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex min-w-0 flex-1 flex-col gap-4 sm:gap-5'
      )}
    >
      {/* Toolbar pencarian dan filter */}
      <DataTableToolbar
        table={table}
        searchPlaceholder='Cari judul, ID, kategori, atau status...'
        filters={[
          {
            columnId: 'status',
            title: 'Status laporan',
            options: statuses,
          },
        ]}
      />

      {/* Kartu laporan untuk perangkat mobile */}
      <div className='space-y-3 md:hidden'>
        {table.getRowModel().rows.map((row) => {
          const cells = row.getVisibleCells()

          const getCell = (id: string) =>
            cells.find((cell) => cell.column.id === id)

          const categoryCell = getCell('category')
          const statusCell = getCell('status')
          const selectCell = getCell('select')
          const actionsCell = getCell('actions')

          return (
            <div
              key={row.id}
              className='min-w-0 space-y-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:border-primary/30'
            >
              <div className='flex items-start justify-between gap-3'>
                <div className='flex min-w-0 items-start gap-2'>
                  {selectCell && (
                    <div className='shrink-0 pt-1'>
                      {flexRender(
                        selectCell.column.columnDef.cell,
                        selectCell.getContext()
                      )}
                    </div>
                  )}

                  <div className='min-w-0 space-y-1'>
                    <p className='text-xs font-medium text-muted-foreground'>
                      {String(row.getValue('id'))}
                    </p>

                    <h3 className='leading-snug font-semibold break-words'>
                      {String(row.getValue('title'))}
                    </h3>
                  </div>
                </div>

                {actionsCell && (
                  <div className='shrink-0'>
                    {flexRender(
                      actionsCell.column.columnDef.cell,
                      actionsCell.getContext()
                    )}
                  </div>
                )}
              </div>

              <div className='grid grid-cols-2 gap-3 border-t pt-3'>
                <div className='min-w-0 space-y-1'>
                  <p className='text-xs text-muted-foreground'>Kategori</p>

                  {categoryCell &&
                    flexRender(
                      categoryCell.column.columnDef.cell,
                      categoryCell.getContext()
                    )}
                </div>

                <div className='col-span-2 min-w-0 space-y-1'>
                  <p className='text-xs text-muted-foreground'>
                    Status laporan
                  </p>

                  {statusCell &&
                    flexRender(
                      statusCell.column.columnDef.cell,
                      statusCell.getContext()
                    )}
                </div>
              </div>
            </div>
          )
        })}

        {table.getRowModel().rows.length === 0 && (
          <div className='rounded-xl border bg-card p-8 text-center'>
            <p className='text-sm font-medium'>
              Tidak ada laporan yang ditemukan.
            </p>
            <p className='mt-1 text-xs text-muted-foreground'>
              Coba ubah kata kunci pencarian atau filter status.
            </p>
          </div>
        )}
      </div>

      {/* Tabel untuk tablet dan desktop */}
      <div className='hidden w-full min-w-0 overflow-x-auto rounded-xl border bg-card shadow-sm md:block'>
        <Table className='min-w-[800px]'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className='border-b bg-muted/40 hover:bg-muted/40'
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'h-11 text-xs font-semibold tracking-wide',
                      header.column.columnDef.meta?.className,
                      header.column.columnDef.meta?.thClassName
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='transition-colors hover:bg-muted/40'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'py-3',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-28 text-center'
                >
                  <div className='space-y-1'>
                    <p className='text-sm font-medium'>
                      Tidak ada laporan yang ditemukan.
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Coba ubah kata kunci pencarian atau filter status.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DataTablePagination table={table} className='mt-auto' />

      {/* Aksi untuk beberapa laporan sekaligus */}
      <DataTableBulkActions table={table} />
    </div>
  )
}
