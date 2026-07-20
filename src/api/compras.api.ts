import api from './http';
import type { CrearCompraDto, OrdenCompra } from '../types/compra.types';

export const comprasApi = {
  getAll: () => api.get<OrdenCompra[]>('/compras'),
  getById: (id: number) => api.get<OrdenCompra>(`/compras/${id}`),
  create: (dto: CrearCompraDto) => api.post<OrdenCompra>('/compras', dto),
  update: (id: number, dto: Partial<CrearCompraDto>) => api.patch<OrdenCompra>(`/compras/${id}`, dto),
  delete: (id: number) => api.delete(`/compras/${id}`),
  recibir: (id: number) => api.patch(`/compras/${id}/recibir`),
};
