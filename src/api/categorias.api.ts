import api from './http';
import type { Categoria, CreateCategoriaDto } from '../types';

export const categoriasApi = {
  getAll: (includeSuspended = false) =>
    api.get<Categoria[]>('/categorias', { params: { includeSuspended: includeSuspended ? 'true' : undefined } }),
  create: (dto: CreateCategoriaDto) => api.post('/categorias', dto),
  update: (id: number, dto: Partial<CreateCategoriaDto>) => api.put(`/categorias/${id}`, dto),
  delete: (id: number) => api.delete(`/categorias/${id}`),
};
