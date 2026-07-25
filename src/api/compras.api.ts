import api from './http';
import type { CrearCompraDto, OrdenCompra } from '../types/compra.types';

export const comprasApi = {
  getAll: () => api.get<OrdenCompra[]>('/compras'),
  getById: (id: number) => api.get<OrdenCompra>(`/compras/${id}`),
  create: (dto: CrearCompraDto) => api.post<OrdenCompra>('/compras', dto),
  createFromRequirement: (requirementId: number, dto: { proveedorId?: number; subtotal?: number; impuestos?: number; total?: number }) =>
    api.post<OrdenCompra>(`/compras/from-requirement/${requirementId}`, dto),
  getItemsEnCompras: () => api.get<any[]>('/compras/items-en-compras'),
  update: (id: number, dto: Partial<CrearCompraDto>) => api.patch<OrdenCompra>(`/compras/${id}`, dto),
  delete: (id: number) => api.delete(`/compras/${id}`),
  aprobar: (id: number) => api.patch<OrdenCompra>(`/compras/${id}/aprobar`),
  recibir: (id: number) => api.patch(`/compras/${id}/recibir`),
  downloadPdf: async (id: number) => {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${base}/compras/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al descargar PDF');
    return res.blob();
  },
};
