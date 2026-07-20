import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { solicitudesApi } from '../api/solicitudes.api';
import type { UpdateSolicitudDto } from '../types/solicitud.types';

interface CreateSolicitudDto {
  proyectoId: string;
  usuarioSolicitanteId: string;
  nivelPrioridad?: string;
  detalles: Array<{ materialId: number; cantidadRequerida: number }>;
}

export function useSolicitudes(filtros?: { estado?: string; proyectoId?: string }) {
  const queryClient = useQueryClient();

  const { data: solicitudes = [], isLoading } = useQuery({
    queryKey: ['solicitudes', filtros],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filtros?.estado) params.estado = filtros.estado;
      if (filtros?.proyectoId) params.proyectoId = filtros.proyectoId;
      const res = await solicitudesApi.getAll(Object.keys(params).length ? params : undefined);
      return res.data;
    },
  });

  const crear = useMutation({
    mutationFn: (dto: CreateSolicitudDto) => solicitudesApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      toast.success('Solicitud creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear solicitud');
    },
  });

  const actualizar = useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateSolicitudDto }) =>
      solicitudesApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      toast.success('Solicitud actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar solicitud');
    },
  });

  return { solicitudes, isLoading, crear, actualizar };
}
