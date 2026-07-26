import { proveedoresApi } from './proveedores.api';
import api from './http';

vi.mock('./http');

describe('proveedoresApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getAll por defecto NO incluye suspendidos', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await proveedoresApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/proveedores', { params: { includeSuspended: undefined } });
  });

  test('getAll includeSuspended=true', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await proveedoresApi.getAll(true);
    expect(api.get).toHaveBeenCalledWith('/proveedores', { params: { includeSuspended: 'true' } });
  });

  test('create envía dto', async () => {
    const dto = { nombre: 'Proveedor A' } as any;
    (api.post as vi.Mock).mockResolvedValue({ data: { id: 1 } });
    await proveedoresApi.create(dto);
    expect(api.post).toHaveBeenCalledWith('/proveedores', dto);
  });

  test('update usa PATCH', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await proveedoresApi.update(5, { nombre: 'Nuevo' });
    expect(api.patch).toHaveBeenCalledWith('/proveedores/5', { nombre: 'Nuevo' });
  });

  test('delete llama DELETE', async () => {
    (api.delete as vi.Mock).mockResolvedValue({ data: {} });
    await proveedoresApi.delete(3);
    expect(api.delete).toHaveBeenCalledWith('/proveedores/3');
  });
});
