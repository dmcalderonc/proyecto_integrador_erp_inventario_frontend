import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { materialesApi } from '../api/materiales.api';
import type { CreateMaterialDto } from '../types';

export function useMateriales() {
  const queryClient = useQueryClient();

  const { data: materiales = [], isLoading } = useQuery({
    queryKey: ['materiales'],
    queryFn: async () => {
      const res = await materialesApi.getAll();
      return res.data;
    },
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

  return { materiales, isLoading, crear, actualizar, eliminar };
}