import api from './http';
import type { Material, CreateMaterialDto } from '../types/material.types';
import type { PaginationParams, PaginatedResponse } from '../types/common.types';

export interface MaterialesParams extends PaginationParams {
  categoriaId?: number;
  bodegaId?: number;
}

export const materialesApi = {
  getAll: async (params?: MaterialesParams): Promise<PaginatedResponse<Material>> => {
    const { data } = await api.get('/materiales', { params }); 
    return data;
  },
  getById: (id: number) => api.get<Material>(`/materiales/${id}`),
  create: (dto: CreateMaterialDto) => api.post<Material>('/materiales', dto),
  update: (id: number, dto: Partial<CreateMaterialDto>) => api.put<Material>(`/materiales/${id}`, dto),
  delete: (id: number) => api.delete(`/materiales/${id}`),
};
