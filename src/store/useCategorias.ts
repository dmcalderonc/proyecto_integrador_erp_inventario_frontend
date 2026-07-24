import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { categoriasApi } from '../api/categorias.api';
import type { CreateCategoriaDto } from '../types';

export function useCategorias(includeSuspended = false) {
  const queryClient = useQueryClient();

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias', includeSuspended],
    queryFn: async () => {
      const res = await categoriasApi.getAll(includeSuspended);
      return res.data;
    },
  });

  const crear = useMutation({
    mutationFn: (dto: CreateCategoriaDto) => categoriasApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoría creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear categoría');
    },
  });

  const actualizar = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateCategoriaDto> & { isActive?: boolean } }) =>
      categoriasApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoría actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar categoría');
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: number) => categoriasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoría eliminada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar categoría');
    },
  });

  return { categorias, isLoading, crear, actualizar, eliminar };
}
