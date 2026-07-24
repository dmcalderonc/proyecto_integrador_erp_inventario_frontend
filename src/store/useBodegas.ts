import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bodegasApi } from '../api/bodegas.api';
import type { CreateBodegaDto } from '../types';

export function useBodegas(includeSuspended = false) {
  const queryClient = useQueryClient();

  const { data: bodegas = [], isLoading } = useQuery({
    queryKey: ['bodegas', includeSuspended],
    queryFn: async () => {
      const res = await bodegasApi.getAll(includeSuspended);
      return res.data;
    },
  });

  const crear = useMutation({
    mutationFn: (dto: CreateBodegaDto) => bodegasApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bodegas'] });
      toast.success('Bodega creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear bodega');
    },
  });

  const actualizar = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateBodegaDto> & { isActive?: boolean } }) =>
      bodegasApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bodegas'] });
      toast.success('Bodega actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar bodega');
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: number) => bodegasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bodegas'] });
      toast.success('Bodega eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar bodega');
    },
  });

  return { bodegas, isLoading, crear, actualizar, eliminar };
}
