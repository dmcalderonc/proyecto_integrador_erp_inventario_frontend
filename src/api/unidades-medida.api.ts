import api from './http';
import type { UnidadMedida, CreateUnidadMedidaDto } from '../types';

export const unidadesMedidaApi = {
  getAll: () => api.get<UnidadMedida[]>('/unidades-medida'),
  create: (dto: CreateUnidadMedidaDto) => api.post('/unidades-medida', dto),
  update: (id: number, dto: Partial<CreateUnidadMedidaDto>) => api.put(`/unidades-medida/${id}`, dto),
  delete: (id: number) => api.delete(`/unidades-medida/${id}`),
};
