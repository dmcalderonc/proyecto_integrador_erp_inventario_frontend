import api from './http';
import type { Proveedor, CreateProveedorDto } from '../types';

export const proveedoresApi = {
  getAll: (includeSuspended = false) =>
    api.get<Proveedor[]>('/proveedores', { params: { includeSuspended: includeSuspended ? 'true' : undefined } }),
  create: (dto: CreateProveedorDto) => api.post('/proveedores', dto),
  update: (id: number, dto: Partial<CreateProveedorDto>) => api.patch(`/proveedores/${id}`, dto),
  delete: (id: number) => api.delete(`/proveedores/${id}`),
};
