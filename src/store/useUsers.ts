import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../api/client';
import type { User, CreateUserDto } from '../types';

export function useUsers() {
    const queryClient = useQueryClient();

    const { data: users = [], isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await api.get<User[]>('/users');
            return res.data;
        },
    });

    const crear = useMutation({
        mutationFn: (dto: CreateUserDto) => api.post('/users', dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Usuario creado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al crear usuario');
        },
    });

    const actualizar = useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateUserDto> }) =>
            api.patch(`/users/${id}`, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Usuario actualizado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al actualizar usuario');
        },
    });

    const eliminar = useMutation({
        mutationFn: (id: string) => api.delete(`/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('Usuario eliminado exitosamente');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Error al eliminar usuario');
        },
    });

    return { users, isLoading, crear, actualizar, eliminar };
}