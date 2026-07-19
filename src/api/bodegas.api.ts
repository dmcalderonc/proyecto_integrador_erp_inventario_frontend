import api from './http';
import type { Bodega, CreateBodegaDto } from '../types';

export const bodegasApi = {
  getAll: () => api.get<Bodega[]>('/bodegas'),
  create: (dto: CreateBodegaDto) => api.post('/bodegas', dto),
  update: (id: number, dto: Partial<CreateBodegaDto>) => api.patch(`/bodegas/${id}`, dto),
  delete: (id: number) => api.delete(`/bodegas/${id}`),
};
