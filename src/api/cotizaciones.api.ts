import api from './http';
import type { Cotizacion, CreateCotizacionDto } from '../types/cotizacion.types';

export const cotizacionesApi = {
  getAll: () => api.get<Cotizacion[]>('/cotizaciones'),
  getById: (id: number) => api.get<Cotizacion>(`/cotizaciones/${id}`),
  create: (dto: CreateCotizacionDto) => api.post<Cotizacion>('/cotizaciones', dto),
  update: (id: number, dto: Partial<CreateCotizacionDto>) => api.patch<Cotizacion>(`/cotizaciones/${id}`, dto),
  delete: (id: number) => api.delete(`/cotizaciones/${id}`),
  seleccionar: (id: number) => api.patch<Cotizacion>(`/cotizaciones/${id}/seleccionar`),
  descartar: (id: number) => api.patch<Cotizacion>(`/cotizaciones/${id}/descartar`),
  getRequerimientosEnCompras: () => api.get<any[]>('/cotizaciones/en-compras'),
  getCotizacionesByRequirement: (requirementId: number) =>
    api.get<{ detalles: any[]; cotizaciones: Cotizacion[] }>(`/cotizaciones/by-requirement/${requirementId}`),
  generarOC: (requirementId: number) => api.post<any>(`/cotizaciones/generar-oc/${requirementId}`),
};
