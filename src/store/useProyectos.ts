import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/http';
import { proyectosApi } from '../api/proyectos.api';
import type { Proyecto, CreateProyectoDto } from '../types';

export function useProyectos() {
  const queryClient = useQueryClient();

  const { data: proyectos = [], isLoading } = useQuery({
    queryKey: ['proyectos'],
    queryFn: async () => {
      const res = await api.get<Proyecto[]>('/proyectos');
      return res.data;
    },
  });

  const crear = useMutation({
    mutationFn: (dto: CreateProyectoDto) => proyectosApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
      toast.success('Proyecto creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear proyecto');
    },
  });

  const actualizar = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateProyectoDto> }) =>
      proyectosApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
      toast.success('Proyecto actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar proyecto');
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: string) => proyectosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
      toast.success('Proyecto eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar proyecto');
    },
  });

  return { proyectos, isLoading, crear, actualizar, eliminar };
}