import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { unidadesMedidaApi } from '../api/unidades-medida.api';
import type { CreateUnidadMedidaDto } from '../types';

export function useUnidadesMedida() {
  const queryClient = useQueryClient();

  const { data: unidades = [], isLoading } = useQuery({
    queryKey: ['unidades-medida'],
    queryFn: async () => {
      const res = await unidadesMedidaApi.getAll();
      return res.data;
    },
  });

  const crear = useMutation({
    mutationFn: (dto: CreateUnidadMedidaDto) => unidadesMedidaApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades-medida'] });
      toast.success('Unidad de medida creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear unidad de medida');
    },
  });

  const actualizar = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateUnidadMedidaDto> }) =>
      unidadesMedidaApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades-medida'] });
      toast.success('Unidad de medida actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar unidad de medida');
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: number) => unidadesMedidaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades-medida'] });
      toast.success('Unidad de medida eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar unidad de medida');
    },
  });

  return { unidades, isLoading, crear, actualizar, eliminar };
}
