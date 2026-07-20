import { useQuery } from '@tanstack/react-query';
import { inventarioApi } from '../api/inventario.api';

export function useInventario() {
    const { data: inventario = [], isLoading } = useQuery({
        queryKey: ['inventario'],
        queryFn: async () => {
            const res = await inventarioApi.getAll();
            return res.data;
        },
    });

    return { inventario, isLoading };
}