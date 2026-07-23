// src/types/common.types.ts

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
}