import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { comprasApi } from '../api/compras.api';
import type { CrearCompraDto } from '../types';

export function useCompras() {
  const queryClient = useQueryClient();

  const { data: compras = [], isLoading } = useQuery({
    queryKey: ['compras'],
    queryFn: async () => {
      const res = await comprasApi.getAll();
      return res.data;
    },
  });

  const crear = useMutation({
    mutationFn: (dto: CrearCompraDto) => comprasApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Compra creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear compra');
    },
  });

  const actualizar = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CrearCompraDto> }) =>
      comprasApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Compra actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar compra');
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: number) => comprasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Compra eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar compra');
    },
  });

  const aprobar = useMutation({
    mutationFn: (id: number) => comprasApi.aprobar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Compra aprobada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al aprobar compra');
    },
  });

  const recibir = useMutation({
    mutationFn: (id: number) => comprasApi.recibir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Compra recibida exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al recibir compra');
    },
  });

  return { compras, isLoading, crear, actualizar, eliminar, aprobar, recibir };
}
