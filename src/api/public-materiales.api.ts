import api from './http';
import type { Material } from '../types';

export interface PublicMaterialResponse {
  data: Material[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const publicMaterialesApi = {
  getAll: (params: { search?: string; page?: number; limit?: number; sort?: string; order?: string }) =>
    api.get<PublicMaterialResponse>('/public/materiales', { params }),
  getById: (id: number) => api.get<Material>(`/public/materiales/${id}`),
};
