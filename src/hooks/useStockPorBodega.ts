import { useQuery } from '@tanstack/react-query';
import { inventarioApi } from '../api/inventario.api';
import type { StockPorBodega } from '../types/material.types';

export function useStockPorBodega(materialId: number | null) {
  const { data, isLoading } = useQuery({
    queryKey: ['stock-por-bodega', materialId],
    queryFn: async () => {
      const res = await inventarioApi.getStockByMaterial(materialId!);
      return res.data;
    },
    enabled: !!materialId && materialId > 0,
  });

  const stockPorBodega: StockPorBodega[] = data || [];
  const totalDisponible = stockPorBodega.reduce((sum, s) => sum + s.cantidad_disponible, 0);
  const totalReservado = stockPorBodega.reduce((sum, s) => sum + s.cantidad_reservada, 0);

  return { stockPorBodega, isLoading, totalDisponible, totalReservado };
}
