import { useState, useMemo } from "react";
import useDebounce from "./use-debounce";

interface UseFilterOptions<T> {
  searchFields?: (keyof T)[];
  filterFn?: (item: T, filters: Record<string, any>) => boolean;
  debounceMs?: number;
}

/**
 * Generic hook for filtering and searching data
 * @param data - Array of items to filter
 * @param options - Configuration options
 */
export function useFilter<T>(data: T[], options: UseFilterOptions<T> = {}) {
  const { searchFields = [], filterFn, debounceMs = 500 } = options;

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Record<string, any>>({});

  const debouncedSearch = useDebounce(searchTerm, debounceMs);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (debouncedSearch && searchFields.length > 0) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return String(value || "")
            .toLowerCase()
            .includes(searchLower);
        })
      );
    }

    // Apply custom filters
    if (filterFn) {
      result = result.filter((item) => filterFn(item, filters));
    }

    return result;
  }, [data, debouncedSearch, filters, searchFields, filterFn]);

  const setFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({});
  };

  return {
    filteredData,
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    clearFilters,
  };
}

/**
 * Hook for table data with search, filter, sort, and pagination
 */
export function useTableData<T>(
  data: T[],
  options: {
    searchFields?: (keyof T)[];
    initialSort?: { field: keyof T; direction: "asc" | "desc" };
    itemsPerPage?: number;
  }
) {
  const {
    searchFields = [],
    initialSort,
    itemsPerPage: initialItemsPerPage = 10,
  } = options;

  // Filter state
  const { filteredData, searchTerm, setSearchTerm } = useFilter(data, {
    searchFields,
  });

  // Sort state
  const [sortConfig, setSortConfig] = useState<{
    field: keyof T;
    direction: "asc" | "desc";
  } | null>(initialSort || null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.field];
      const bVal = b[sortConfig.field];

      if (aVal === bVal) return 0;

      const comparison = aVal < bVal ? -1 : 1;
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortConfig]);

  // Apply pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  // Auto-reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig]);

  return {
    data: paginatedData,
    totalItems: sortedData.length,
    currentPage,
    totalPages,
    itemsPerPage,
    searchTerm,
    sortConfig,
    setSearchTerm,
    setSortConfig,
    setCurrentPage,
    setItemsPerPage,
  };
}
