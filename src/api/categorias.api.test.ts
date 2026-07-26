import { categoriasApi } from './categorias.api';
import api from './http';

vi.mock('./http');

describe('categoriasApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getAll por defecto NO incluye suspendidas', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await categoriasApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/categorias', { params: { includeSuspended: undefined } });
  });

  test('getAll includeSuspended=true', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await categoriasApi.getAll(true);
    expect(api.get).toHaveBeenCalledWith('/categorias', { params: { includeSuspended: 'true' } });
  });

  test('create envía dto', async () => {
    const dto = { nombre: 'Electrónica' } as any;
    (api.post as vi.Mock).mockResolvedValue({ data: { id: 1 } });
    await categoriasApi.create(dto);
    expect(api.post).toHaveBeenCalledWith('/categorias', dto);
  });

  test('update usa PUT', async () => {
    (api.put as vi.Mock).mockResolvedValue({ data: {} });
    await categoriasApi.update(2, { nombre: 'Ropa' });
    expect(api.put).toHaveBeenCalledWith('/categorias/2', { nombre: 'Ropa' });
  });

  test('delete llama DELETE', async () => {
    (api.delete as vi.Mock).mockResolvedValue({ data: {} });
    await categoriasApi.delete(4);
    expect(api.delete).toHaveBeenCalledWith('/categorias/4');
  });
});
