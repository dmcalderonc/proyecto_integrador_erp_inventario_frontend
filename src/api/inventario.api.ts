import api from './http';
import type { Inventario } from '../types/inventario.types';
import type { StockPorBodega } from '../types/material.types';

export const inventarioApi = {
    getAll: () => api.get<Inventario[]>('/inventario'),
    getById: (id: number) => api.get<Inventario>(`/inventario/${id}`),
    getStockByMaterial: (materialId: number) =>
        api.get<StockPorBodega[]>(`/inventario/material/${materialId}/stock-por-bodega`),
};