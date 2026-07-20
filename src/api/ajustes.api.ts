import api from './http';
import type { CreateAjusteDto } from '../types/ajuste.types';

export const ajustesApi = {
  getAll: () => api.get('/ajustes-inventario'),
  create: (dto: CreateAjusteDto) => api.post('/ajustes-inventario', dto),
};
