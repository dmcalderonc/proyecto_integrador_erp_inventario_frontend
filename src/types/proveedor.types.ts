export interface Proveedor {
  id: number;
  ruc: string;
  razon_social: string;
  email: string;
  telefono?: string;
  direccion?: string;
  isActive: boolean;
}

export interface CreateProveedorDto {
  ruc: string;
  razon_social: string;
  email: string;
  telefono?: string;
  direccion?: string;
}
