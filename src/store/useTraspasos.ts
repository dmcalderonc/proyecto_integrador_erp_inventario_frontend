import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { traspasosApi } from '../api/traspasos.api';

export function useTraspasos(params?: { estado?: string; bodegaOrigenId?: number; bodegaDestinoId?: number }) {
  const queryClient = useQueryClient();

  const traspasos = useQuery({
    queryKey: ['traspasos', params],
    queryFn: async () => {
      const { data } = await traspasosApi.getAll(params);
      return data;
    },
  });

  const enviar = useMutation({
    mutationFn: (id: number) => traspasosApi.enviar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traspasos'] });
      toast.success('Envío confirmado correctamente');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al confirmar envío');
    },
  });

  const recibir = useMutation({
    mutationFn: (id: number) => traspasosApi.recibir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traspasos'] });
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      toast.success('Recepción confirmada correctamente');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al confirmar recepción');
    },
  });

  const cancelar = useMutation({
    mutationFn: (id: number) => traspasosApi.cancelar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traspasos'] });
      toast.success('Traspaso cancelado');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al cancelar traspaso');
    },
  });

  const autorizar = useMutation({
    mutationFn: (id: number) => traspasosApi.autorizar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traspasos'] });
      toast.success('Traspaso autorizado correctamente');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al autorizar traspaso');
    },
  });

  return { traspasos, enviar, recibir, cancelar, autorizar };
}
