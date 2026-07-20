import api from './http';
import type { Inventario } from '../types/inventario.types';

export const inventarioApi = {
    getAll: () => api.get<Inventario[]>('/inventario'),
    getById: (id: number) => api.get<Inventario>(`/inventario/${id}`),
};