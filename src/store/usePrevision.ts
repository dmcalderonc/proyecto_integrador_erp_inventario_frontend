import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { previsionApi } from '../api/prevision.api';
import type { PrediccionParams } from '../types/prevision.types';

/** Pronóstico de quiebre de stock. */
export function usePrevision(params: PrediccionParams = {}, enabled = true) {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [
      'prevision',
      params.dias,
      params.umbralCritico,
      params.umbralRiesgo,
      params.soloAlertas,
      params.bodegaId,
      params.limite,
      enabled,
    ],
    queryFn: async () => (await previsionApi.getPrevision(params)).data,
    staleTime: 60_000,
    enabled,
  });

  return {
    prevision: data,
    materiales: data?.materiales ?? [],
    resumen: data?.resumen,
    alcance: data?.alcance,
    generadoEn: data?.generadoEn,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}

export function useGenerarAlertas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bodegaId?: number) => previsionApi.generarAlertas(bodegaId),
    onSuccess: (res) => {
      const { alertasGeneradas, alertasOmitidasPorDuplicado } = res.data;
      if (alertasGeneradas > 0) {
        toast.success(
          `${alertasGeneradas} alerta(s) enviadas` +
            (alertasOmitidasPorDuplicado > 0
              ? `, ${alertasOmitidasPorDuplicado} omitida(s) por duplicado reciente`
              : ''),
        );
      } else {
        toast('No hay alertas nuevas pendientes de notificar', { icon: 'ℹ️' });
      }
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? 'No se pudieron generar las alertas');
    },
  });
}
