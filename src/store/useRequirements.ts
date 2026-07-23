import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { requirementsApi } from '../api/requirements.api';
import type { CreateRequirementDto, RequirementStatus } from '../types';

export function useRequirements() {
  const queryClient = useQueryClient();

  const { data: requirements = [], isLoading } = useQuery({
    queryKey: ['requirements'],
    queryFn: async () => {
      const res = await requirementsApi.getAll();
      return res.data;
    },
  });

  const crear = useMutation({
    mutationFn: (dto: CreateRequirementDto) => requirementsApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      toast.success('Requerimiento creado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear requerimiento');
    },
  });

  const actualizarEstado = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: RequirementStatus }) =>
      requirementsApi.updateStatus(id, { estado }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      queryClient.invalidateQueries({ queryKey: ['traspasos'] });
      toast.success('Estado actualizado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar estado');
    },
  });

  const evaluarItem = useMutation({
    mutationFn: ({ reqId, detalleId, accion }: { reqId: number; detalleId: number; accion: string }) =>
      requirementsApi.evaluarItem(reqId, detalleId, accion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      queryClient.invalidateQueries({ queryKey: ['traspasos'] });
      toast.success('Item evaluado correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al evaluar item');
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: number) => requirementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      toast.success('Requerimiento eliminado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar requerimiento');
    },
  });

  return { requirements, isLoading, crear, actualizarEstado, evaluarItem, eliminar };
}