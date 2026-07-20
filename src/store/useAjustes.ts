import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ajustesApi } from '../api/ajustes.api';
import type { CreateAjusteDto } from '../types';

export function useAjustes() {
  const queryClient = useQueryClient();

  const { data: ajustes = [], isLoading } = useQuery({
    queryKey: ['ajustes'],
    queryFn: async () => {
      const res = await ajustesApi.getAll();
      return res.data;
    },
  });

  const crear = useMutation({
    mutationFn: (dto: CreateAjusteDto) => ajustesApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ajustes'] });
      toast.success('Ajuste registrado exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al registrar ajuste');
    },
  });

  return { ajustes, isLoading, crear };
}
