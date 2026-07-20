import api from './http';
import type { CrearMovimientoDto, Movimiento } from '../types/movimiento.types';

export const movimientosApi = {
  getAll: () => api.get<Movimiento[]>('/movimientos'),
  getById: (id: string) => api.get<Movimiento>(`/movimientos/${id}`),
  create: (dto: CrearMovimientoDto) => api.post<Movimiento>('/movimientos', dto),
};
