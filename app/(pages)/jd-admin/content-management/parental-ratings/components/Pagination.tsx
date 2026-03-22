import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { useEffect, useState } from 'react';

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export function PaginationItems(props: Readonly<PaginationProps>) {
  const { currentPage, totalItems, perPage, onPageChange, disabled } = props;
  const totalPages = Math.ceil(totalItems / perPage);
  const [maxPages, setMaxPages] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      setMaxPages(window.innerWidth < 560 ? 0 : 5);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getPageNumbers = () => {
    const pages: number[] = [];
    let start = Math.max(currentPage - Math.floor(maxPages / 2), 0);
    const end = Math.min(start + maxPages - 1, totalPages - 1);
    start = Math.max(end - maxPages + 1, 0);

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <Pagination>
      <PaginationContent>
        {/* First Page */}
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 0) onPageChange(0);
            }}
            className={currentPage === 0 || disabled ? 'pointer-events-none opacity-50' : ''}
          >
            First
          </PaginationLink>
        </PaginationItem>

        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 0) onPageChange(currentPage - 1);
            }}
            className={currentPage === 0 || disabled ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>

        {/* Numeric Pages */}
        {pages.map((page) => (
          <PaginationItem key={page} className={disabled ? 'pointer-events-none opacity-50' : ''}>
            <PaginationLink
              href="#"
              isActive={page === currentPage}
              onClick={(e) => {
                e.preventDefault();
                onPageChange(page);
              }}
            >
              {page + 1}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Ellipsis if more pages */}
        {pages[pages.length - 1] < totalPages - 1 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Next */}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages - 1) onPageChange(currentPage + 1);
            }}
            className={
              currentPage >= totalPages - 1 || disabled ? 'pointer-events-none opacity-50' : ''
            }
          />
        </PaginationItem>

        {/* Last Page */}
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages - 1) onPageChange(totalPages - 1);
            }}
            className={
              currentPage >= totalPages - 1 || disabled ? 'pointer-events-none opacity-50' : ''
            }
          >
            Last
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
