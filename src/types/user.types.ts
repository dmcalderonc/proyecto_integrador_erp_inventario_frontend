import type { UserRole } from './auth.types';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  estado: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  rol: UserRole;
  is_active?: boolean;
  bodega_id?: number;
}
