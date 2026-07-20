import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { movimientosApi } from '../api/movimientos.api';
import type { CrearMovimientoDto } from '../types';

export function useMovimientos() {
  const queryClient = useQueryClient();

  const { data: movimientos = [], isLoading } = useQuery({
    queryKey: ['movimientos'],
    queryFn: async () => {
      const res = await movimientosApi.getAll();
      return res.data;
    },
  });

  const crear = useMutation({
    mutationFn: (dto: CrearMovimientoDto) => movimientosApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      toast.success('Movimiento registrado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al registrar movimiento');
    },
  });

  return { movimientos, isLoading, crear };
}
