import { Column, ColumnDef, Table } from '@tanstack/react-table';
import { HTMLAttributes } from 'react';

export type DataTableColumnHeaderProps<TData, TValue> = HTMLAttributes<HTMLDivElement> & {
  column: Column<TData, TValue>;
  title: string;
};

export type DropdownMenuItemProps<TData, TValue> = HTMLAttributes<HTMLDivElement> & {
  text: string;
  column: Column<TData, TValue>;
  sort: boolean;
};

export type DataTablePaginationProps<TData> = {
  table: Table<TData>;
};

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  pagination?: boolean;
  filterInput?: boolean;
  visibilityToggle?: boolean;
};
