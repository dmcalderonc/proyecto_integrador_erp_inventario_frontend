import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { materialesApi } from '../api/materiales.api';
import type { CreateMaterialDto } from '../types';
import type { PaginationParams } from '../types/common.types'; // El tipo que creamos en el paso anterior

export function useMateriales(params: PaginationParams = {}) {
  const queryClient = useQueryClient();

  // 1. Añadimos los parámetros a la queryKey para que reaccione a los cambios
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['materiales', params.page, params.limit, params.search, params.sort, params.order],
    queryFn: async () => {
      // Pasamos los parámetros a la API
      const res = await materialesApi.getAll(params);
      // Asumiendo que tu Axios ahora retorna directamente la interfaz PaginatedResponse
      return res; 
    },
    // UX: Mantiene los datos anteriores en pantalla mientras trae la nueva página
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