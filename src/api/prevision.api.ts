import api from './http';
import type { PrevisionResponse, ResultadoAlertas, PrediccionParams } from '../types/prevision.types';

export const previsionApi = {
  getPrevision: (params: PrediccionParams = {}) =>
    api.get<PrevisionResponse>('/dashboard/prediccion', { params }),

  generarAlertas: (bodegaId?: number) =>
    api.post<ResultadoAlertas>('/dashboard/prediccion/alertas', bodegaId ? { bodegaId } : {}),
};
