import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/client';
import type { Proveedor, CreateProveedorDto } from '../types';

export function useProveedores() {
    const queryClient = useQueryClient();

    const { data: proveedores = [], isLoading } = useQuery({
        queryKey: ['proveedores'],
        queryFn: async () => {
            const res = await api.get<Proveedor[]>('/proveedores');
            return res.data;
        },
    });

    const crear = useMutation({
        mutationFn: (dto: CreateProveedorDto) => api.post('/proveedores', dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proveedores'] });
            toast.success('Proveedor creado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al crear proveedor');
        },
    });

    const actualizar = useMutation({
        mutationFn: ({ id, dto }: { id: number; dto: Partial<CreateProveedorDto> }) =>
            api.patch(`/proveedores/${id}`, dto),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proveedores'] });
            toast.success('Proveedor actualizado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al actualizar proveedor');
        },
    });

    const eliminar = useMutation({
        mutationFn: (id: number) => api.delete(`/proveedores/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['proveedores'] });
            toast.success('Proveedor eliminado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al eliminar proveedor');
        },
    });

    return { proveedores, isLoading, crear, actualizar, eliminar };
}