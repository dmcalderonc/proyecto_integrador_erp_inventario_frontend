import type { ReactNode } from 'react';
import { useState, useMemo, useEffect } from 'react';
import { ArrowUpDown, Search, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  searchKeys?: string[];
  emptyMessage?: string;
  children?: ReactNode;
  onRowClick?: (item: T) => void;
  pageSize?: number;
  pagination?: boolean;
}

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, part) => acc?.[part] ?? '', obj) ?? '';
}

function getPageList(page: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | '...')[] = [1];
  if (page > 3) pages.push('...');
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
    pages.push(i);
  }
  if (page < totalPages - 2) pages.push('...');
  pages.push(totalPages);
  return pages;
}

export function DataTable<T extends { id?: any }>({
  columns,
  data,
  loading = false,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  searchKeys = [],
  onSearch,
  emptyMessage = 'No se encontraron registros',
  onRowClick,
  pageSize = 40,
  pagination = true,
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState('');
  const [page, setPage] = useState(1);

  const searchTerm = onSearch ? undefined : localSearch;

  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm || searchKeys.length === 0) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(item =>
      searchKeys.some(key => {
        const val = getNestedValue(item, key);
        return val.toString().toLowerCase().includes(term);
      })
    );
  }, [data, searchTerm, searchKeys, searchable]);

  const displayData = onSearch ? data : filteredData;

  const totalPages = pagination && displayData.length > 0
    ? Math.ceil(displayData.length / pageSize)
    : 1;

  // Solo el término de búsqueda reinicia la paginación (searchKeys llega como array inline).
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const startIndex = (page - 1) * pageSize;
  const pagedData = pagination && displayData.length > pageSize
    ? displayData.slice(startIndex, startIndex + pageSize)
    : displayData;

  const handleSearch = (value: string) => {
    if (onSearch) {
      onSearch(value);
    } else {
      setLocalSearch(value);
    }
  };

  if (loading && data.length === 0) {
    return (
      <div className="space-y-4">
        {searchable && (
          <div className="h-10 bg-elevated rounded-xl animate-pulse w-72" />
        )}
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-14 bg-elevated rounded-xl animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={onSearch ? undefined : localSearch}
            onChange={e => handleSearch(e.target.value)}
            className="w-full bg-elevated text-text-primary border border-border-subtle rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
          />
        </div>
      )}

      {/* Mobile cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {displayData.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          pagedData.map((item, i) => (
            <div key={item.id ?? `row-${startIndex + i}`} className={`bg-elevated rounded-xl border border-border-subtle p-4 space-y-2.5 ${onRowClick ? 'cursor-pointer hover:border-accent/30 transition-colors' : ''}`} onClick={() => onRowClick?.(item)}>
              {columns.map((col, colIndex) => (
                <div key={col.key} className={`flex justify-between items-center ${colIndex !== columns.length - 1 ? 'border-b border-border-subtle/50 pb-2' : ''}`}>
                  <span className="text-xs font-medium text-text-muted">{col.header}</span>
                  <div className="text-sm text-text-primary text-right">
                    {col.render ? col.render(item) : String((item as any)[col.key] ?? '')}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto bg-elevated rounded-xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle">
              {columns.map(col => (
                <th key={col.key} className="px-5 py-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && <ArrowUpDown size={12} className="text-border-default" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {displayData.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState message={emptyMessage} />
                </td>
              </tr>
            ) : (
              pagedData.map((item, i) => (
                <tr key={item.id ?? `row-${startIndex + i}`} className={`hover:bg-white/[0.02] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`} onClick={() => onRowClick?.(item)}>
                  {columns.map(col => (
                    <td key={col.key} className="px-5 py-3.5 text-text-primary">
                      {col.render ? col.render(item) : String((item as any)[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && displayData.length > 0 && (
        <PaginationFooter
          page={page}
          totalPages={totalPages}
          total={displayData.length}
          pageSize={pageSize}
          startIndex={startIndex}
          onPageChange={setPage}
        />
      )}

      {loading && data.length > 0 && (
        <div className="fixed inset-0 bg-base/30 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl pointer-events-none">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-r-transparent" />
        </div>
      )}
    </div>
  );
}

interface PaginationFooterProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  startIndex: number;
  onPageChange: (page: number) => void;
}

export function PaginationFooter({
  page,
  totalPages,
  total,
  pageSize,
  startIndex,
  onPageChange,
}: PaginationFooterProps) {
  if (totalPages <= 1) return null;

  const end = Math.min(startIndex + pageSize, total);

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-1">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-elevated disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        {getPageList(page, totalPages).map((item, idx) =>
          typeof item === 'number' ? (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={cn(
                'min-w-9 h-9 px-2.5 rounded-xl text-sm font-medium transition-colors',
                item === page
                  ? 'bg-accent text-white'
                  : 'text-text-secondary hover:bg-elevated hover:text-text-primary',
              )}
            >
              {item}
            </button>
          ) : (
            <span key={`ellipsis-${idx}`} className="px-1 text-text-muted">…</span>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-elevated disabled:opacity-40 disabled:pointer-events-none transition-colors"
          aria-label="Página siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <p className="text-xs text-text-muted">
        Mostrando <span className="font-semibold text-text-secondary">{startIndex + 1}–{end}</span> de <span className="font-semibold text-text-secondary">{total}</span> registros
      </p>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-xl bg-elevated border border-border-subtle flex items-center justify-center mb-3">
        <Inbox size={20} className="text-text-muted" />
      </div>
      <p className="text-sm text-text-muted font-medium">{message}</p>
    </div>
  );
}