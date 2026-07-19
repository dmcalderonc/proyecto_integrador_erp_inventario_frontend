export interface Proveedor {
  id: number;
  ruc: string;
  razon_social: string;
  email: string;
  telefono?: string;
  direccion?: string;
  estado: boolean;
}

export interface CreateProveedorDto {
  ruc: string;
  razon_social: string;
  email: string;
  telefono?: string;
  direccion?: string;
}
