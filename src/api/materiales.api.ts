import api from './http';
import type { Material, CreateMaterialDto } from '../types/material.types';

export const materialesApi = {
  getAll: () => api.get<Material[]>('/materiales'),
  getById: (id: number) => api.get<Material>(`/materiales/${id}`),
  create: (dto: CreateMaterialDto) => api.post<Material>('/materiales', dto),
  update: (id: number, dto: Partial<CreateMaterialDto>) => api.patch<Material>(`/materiales/${id}`, dto),
  delete: (id: number) => api.delete(`/materiales/${id}`),
};
