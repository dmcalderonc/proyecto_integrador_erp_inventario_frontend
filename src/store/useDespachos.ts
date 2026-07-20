import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { despachosApi } from '../api/despachos.api';
import type { CreateEntregaDirectaDto } from '../types';

export function useDespachos() {
  const queryClient = useQueryClient();
  
  const ejecutar = useMutation({
    mutationFn: (dto: CreateEntregaDirectaDto) => despachosApi.entregaDirecta(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      toast.success('Despacho registrado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al registrar despacho');
    },
  });

  return { ejecutar, isExecuting: ejecutar.isPending };
}