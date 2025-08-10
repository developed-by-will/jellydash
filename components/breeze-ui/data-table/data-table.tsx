'use client';

import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState
} from '@tanstack/react-table';

import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useState } from 'react';
import { DataTablePagination } from './components/pagination';
import { DataTableViewOptions } from './components/view-options';
import { DataTableProps } from './types';

export function DataTable<TData, TValue>(props: Readonly<DataTableProps<TData, TValue>>) {
  const { columns, data, loading, pagination, filterInput, visibilityToggle } = props;
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter
    },
    onGlobalFilterChange: setGlobalFilter
  });

  if (loading)
    return (
      <div className="p-4">
        <Skeleton className="h-96 w-full" />
      </div>
    );

  return (
    <div className="flex flex-col overflow-hidden border m-4 p-4 gap-4">
      <div className={`${!filterInput && !visibilityToggle ? 'hidden' : 'flex items-center py-4'}`}>
        {filterInput && (
          <Input
            placeholder="Filter data..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />
        )}

        {visibilityToggle && <DataTableViewOptions table={table} />}
      </div>

      <Table className="overflow-hidden">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {pagination && <DataTablePagination table={table} />}
    </div>
  );
}
