import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { DataTableColumnHeaderProps, DropdownMenuItemProps } from '../types';

const IconsClassName = 'ml-2 h-4 w-4';
const DropdownMenuItemClassName = 'mr-2 h-3.5 w-3.5';

const DropdownMenuItems = <TData, TValue>(
  props: Readonly<DropdownMenuItemProps<TData, TValue>>
) => {
  const { text, column, sort } = props;

  return (
    <DropdownMenuItem onClick={() => column.toggleSorting(sort)} className="cursor-pointer">
      {sort ? (
        <ArrowDown className={DropdownMenuItemClassName} />
      ) : (
        <ArrowUp className={DropdownMenuItemClassName} />
      )}
      {text}
    </DropdownMenuItem>
  );
};

export function DataTableColumnHeader<TData, TValue>(
  props: Readonly<DataTableColumnHeaderProps<TData, TValue>>
) {
  const { column, title, className } = props;

  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const sortingIcons = {
    asc: <ArrowUp className={IconsClassName} />,
    desc: <ArrowDown className={IconsClassName} />,
    false: <ChevronsUpDown className={IconsClassName} />
  };

  const currentSort = column.getIsSorted();
  const icon = sortingIcons[currentSort === false ? 'false' : currentSort];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="data-[state=open]:bg-accent -ml-3 h-8">
            <span>{title}</span>
            {icon}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItems<TData, TValue> text="Asc" column={column} sort={false} />
          <DropdownMenuItems<TData, TValue> text="Desc" column={column} sort={true} />
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
