import { useQuery } from '@tanstack/react-query';
import api from '../api/http';
import type { Proyecto } from '../types';

export function useProyectos() {
  const { data: proyectos = [], isLoading } = useQuery({
    queryKey: ['proyectos'],
    queryFn: async () => {
      const res = await api.get<Proyecto[]>('/proyectos');
      return res.data;
    },
  });

  return { proyectos, isLoading };
}
