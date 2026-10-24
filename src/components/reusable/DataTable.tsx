"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { EmptyState } from "./EmptyState";
import { LoadingSkeleton } from "./LoadingSkeleton";

export interface Column<T = any> {
  header: string;
  accessorKey?: keyof T | string;
  id?: string;
  cell?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T = any> {
  columns: Column<T>[] | any[];
  data: T[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchKey?: keyof T | string;
  pageSize?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  emptyTitle?: string;
  emptyDescription?: string;
  disablePagination?: boolean;

  // Server-side dynamic pagination support
  serverSide?: boolean;
  totalRecords?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchChange?: (searchQuery: string) => void;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data = [],
  isLoading = false,
  searchPlaceholder = "Search records...",
  searchKey,
  pageSize = 10,
  initialPageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search query or filters.",
  disablePagination = false,
  serverSide = false,
  totalRecords,
  currentPage: externalPage,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize || initialPageSize || 10);

  const activePage = serverSide && externalPage !== undefined ? externalPage : internalCurrentPage;

  // Debounced server search dispatch
  useEffect(() => {
    if (serverSide && onSearchChange) {
      const timer = setTimeout(() => {
        onSearchChange(search);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [search, serverSide, onSearchChange]);

  // Client-side filtering (only active when NOT in server-side mode)
  const clientFiltered = useMemo(() => {
    if (serverSide) return data;
    if (!data || !Array.isArray(data)) return [];
    if (!search.trim()) return data;

    const query = search.toLowerCase();
    return data.filter((item) => {
      if (!item) return false;
      if (searchKey) {
        const val = item[searchKey as keyof T];
        if (typeof val === "string") return val.toLowerCase().includes(query);
        if (typeof val === "number") return String(val).includes(query);
        return false;
      }
      return Object.values(item).some((val) => {
        if (typeof val === "string") return val.toLowerCase().includes(query);
        if (typeof val === "number") return String(val).includes(query);
        return false;
      });
    });
  }, [data, search, searchKey, serverSide]);

  // Total record count calculation
  const totalItems = serverSide && totalRecords !== undefined ? totalRecords : clientFiltered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / currentPageSize));
  const effectiveCurrentPage = Math.min(activePage, totalPages);

  // Sliced page data (in serverSide mode, data is already sliced for the active page)
  const pageData = useMemo(() => {
    if (serverSide) return data;
    const startIndex = (effectiveCurrentPage - 1) * currentPageSize;
    return clientFiltered.slice(startIndex, startIndex + currentPageSize);
  }, [serverSide, data, clientFiltered, effectiveCurrentPage, currentPageSize]);

  const startItem = totalItems === 0 ? 0 : (effectiveCurrentPage - 1) * currentPageSize + 1;
  const endItem = Math.min(effectiveCurrentPage * currentPageSize, totalItems);

  const handlePageSelect = (newPage: number) => {
    const clamped = Math.max(1, Math.min(newPage, totalPages));
    if (serverSide && onPageChange) {
      onPageChange(clamped);
    } else {
      setInternalCurrentPage(clamped);
    }
  };

  const handlePageSizeSelect = (newSize: number) => {
    setCurrentPageSize(newSize);
    if (serverSide && onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      setInternalCurrentPage(1);
    }
  };

  // Compute page numbers with ellipses
  const paginationButtons = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (effectiveCurrentPage <= 3) {
        pages.push(1, 2, 3, 4, "…", totalPages);
      } else if (effectiveCurrentPage >= totalPages - 2) {
        pages.push(1, "…", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "…", effectiveCurrentPage - 1, effectiveCurrentPage, effectiveCurrentPage + 1, "…", totalPages);
      }
    }
    return pages;
  }, [effectiveCurrentPage, totalPages]);

  return (
    <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Search & page size toolbar */}
      <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs md:max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!serverSide) setInternalCurrentPage(1);
            }}
            className="pl-9 h-9 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          {!disablePagination && (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="whitespace-nowrap font-medium">Rows per page:</span>
              <Select
                value={currentPageSize.toString()}
                onValueChange={(val) => handlePageSizeSelect(Number(val))}
              >
                <SelectTrigger 
                  size="sm"
                  className="h-8 w-[100px] text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-[#A30B0B] font-medium"
                >
                  <SelectValue placeholder={`${currentPageSize} rows`} />
                </SelectTrigger>
                <SelectContent align="end" className="min-w-[100px] z-50">
                  {pageSizeOptions.map((opt) => (
                    <SelectItem key={opt} value={opt.toString()} className="text-xs cursor-pointer">
                      {opt} rows
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap hidden sm:inline">
            Showing <strong className="text-slate-900 dark:text-white font-mono">{startItem}–{endItem}</strong> of{" "}
            <strong className="text-slate-900 dark:text-white font-mono">{totalItems}</strong> records
          </span>
        </div>
      </div>

      {/* Table Container */}
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead key={idx} className={col.className}>
                {typeof col.header === "string" ? col.header : col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <LoadingSkeleton key={i} type="table-row" />
            ))
          ) : pageData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-8">
                <EmptyState title={emptyTitle} description={emptyDescription} />
              </TableCell>
            </TableRow>
          ) : (
            pageData.map((row, rowIdx) => (
              <TableRow key={rowIdx}>
                {columns.map((col, colIdx) => (
                  <TableCell key={colIdx} className={col.className}>
                    {col.cell ? col.cell(row) : (col.accessorKey ? String(row[col.accessorKey] ?? "") : null)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Rich Pagination Footer */}
      {!disablePagination && (
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Pagination Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start">
            {/* First Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 min-h-[32px] min-w-[32px] rounded-lg border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 cursor-pointer"
              onClick={() => handlePageSelect(1)}
              disabled={effectiveCurrentPage <= 1}
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 min-h-[32px] min-w-[32px] rounded-lg border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 cursor-pointer"
              onClick={() => handlePageSelect(effectiveCurrentPage - 1)}
              disabled={effectiveCurrentPage <= 1}
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Dynamic Numeric Page Buttons */}
            <div className="flex items-center gap-1">
              {paginationButtons.map((page, idx) => {
                if (typeof page === "string") {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1 text-xs text-slate-400 dark:text-slate-500 font-mono select-none"
                    >
                      …
                    </span>
                  );
                }
                const isCurrent = effectiveCurrentPage === page;
                return (
                  <Button
                    key={page}
                    variant={isCurrent ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageSelect(page)}
                    className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold tabular-nums transition-colors cursor-pointer ${
                      isCurrent
                        ? "bg-[#A30B0B] hover:bg-[#850909] text-white shadow-xs border-[#A30B0B]"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            {/* Next Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 min-h-[32px] min-w-[32px] rounded-lg border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 cursor-pointer"
              onClick={() => handlePageSelect(effectiveCurrentPage + 1)}
              disabled={effectiveCurrentPage >= totalPages}
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 min-h-[32px] min-w-[32px] rounded-lg border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-40 cursor-pointer"
              onClick={() => handlePageSelect(totalPages)}
              disabled={effectiveCurrentPage >= totalPages}
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Record Count Information */}
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-right font-medium">
            Showing <strong className="text-slate-900 dark:text-white tabular-nums font-mono">{startItem}–{endItem}</strong> of{" "}
            <strong className="text-slate-900 dark:text-white tabular-nums font-mono">{totalItems}</strong> records
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
