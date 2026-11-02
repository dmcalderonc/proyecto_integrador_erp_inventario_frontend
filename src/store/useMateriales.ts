import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { materialesApi } from '../api/materiales.api';
import type { CreateMaterialDto } from '../types';
import type { MaterialesParams } from '../api/materiales.api';

export function useMateriales(params: MaterialesParams = {}) {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['materiales', params.page, params.limit, params.search, params.sort, params.order, params.categoriaId, params.bodegaId, params.stock],
    queryFn: async () => {
      const res = await materialesApi.getAll(params);
      return res; 
    },
    placeholderData: keepPreviousData,
  });

  const crear = useMutation({
    mutationFn: (dto: CreateMaterialDto) => materialesApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiales'] });
      toast.success('Material creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear material');
    },
  });

  const actualizar = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateMaterialDto> }) =>
      materialesApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiales'] });
      toast.success('Material actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar material');
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: number) => materialesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiales'] });
      toast.success('Material eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar material');
    },
  });

  // Retornamos 'data' (que contiene data.data y data.meta) y el estado de 'isFetching'
  return { 
    materiales: data?.data || [], 
    meta: data?.meta, 
    isLoading: isLoading || isFetching, 
    crear, 
    actualizar, 
    eliminar 
  };
}