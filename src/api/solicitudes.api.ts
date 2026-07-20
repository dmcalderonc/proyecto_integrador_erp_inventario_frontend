import api from './http';
import type { SolicitudCompra, UpdateSolicitudDto } from '../types/solicitud.types';

interface CreateSolicitudDto {
  proyectoId: string;
  usuarioSolicitanteId: string;
  nivelPrioridad?: string;
  detalles: Array<{ materialId: number; cantidadRequerida: number }>;
}

export const solicitudesApi = {
  getAll: (params?: Record<string, string>) =>
    api.get<SolicitudCompra[]>('/solicitudes-compra', { params }),
  create: (dto: CreateSolicitudDto) =>
    api.post<SolicitudCompra>('/solicitudes-compra', dto),
  update: (id: number, dto: UpdateSolicitudDto) =>
    api.patch<SolicitudCompra>(`/solicitudes-compra/${id}`, dto),
};
