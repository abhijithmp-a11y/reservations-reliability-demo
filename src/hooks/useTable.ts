import { useState, useMemo } from 'react';

type SortDirection = 'asc' | 'desc';

interface UseTableProps<T> {
  initialData: T[];
  initialSortColumn: keyof T | '';
  initialSortDirection?: SortDirection;
  itemsPerPage?: number;
}

export function useTable<T>({
  initialData,
  initialSortColumn,
  initialSortDirection = 'asc',
  itemsPerPage = 8,
}: UseTableProps<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [sortColumn, setSortColumn] = useState<keyof T | ''>(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (column: keyof T) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }

  return {
    paginatedData,
    handleSort,
    sortColumn,
    sortDirection,
    currentPage,
    totalPages,
    goToPage,
    setSourceData: setData,
  };
}
