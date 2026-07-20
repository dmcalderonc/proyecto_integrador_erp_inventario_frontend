import api from './http';
import type { CrearMovimientoDto, Movimiento } from '../types/movimiento.types';

export const movimientosApi = {
  getAll: () => api.get<Movimiento[]>('/movimientos'),
  getById: (id: string) => api.get<Movimiento>(`/movimientos/${id}`),
  create: (dto: CrearMovimientoDto) => api.post<Movimiento>('/movimientos', dto),
  downloadTicket: async (id: string) => {
    const token = localStorage.getItem('token');
    const base = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${base}/movimientos/${id}/ticket`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Error al descargar ticket');
    return res.blob();
  },
};
