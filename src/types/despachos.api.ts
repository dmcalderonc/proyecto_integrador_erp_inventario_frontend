import api from './http';
import type { CreateEntregaDirectaDto, DespachoResponse } from '../types';

export const despachosApi = {
  entregaDirecta: (dto: CreateEntregaDirectaDto) =>
    api.post<DespachoResponse>('/despachos/entrega-directa', dto),
};