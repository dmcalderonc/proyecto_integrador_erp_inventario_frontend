import { bodegasApi } from './bodegas.api';
import api from './http';

vi.mock('./http');

describe('bodegasApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getAll por defecto NO incluye suspendidas', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await bodegasApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/bodegas', { params: { includeSuspended: undefined } });
  });

  test('getAll includeSuspended=true', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await bodegasApi.getAll(true);
    expect(api.get).toHaveBeenCalledWith('/bodegas', { params: { includeSuspended: 'true' } });
  });

  test('create envía dto', async () => {
    const dto = { nombre: 'Bodega Principal' } as any;
    (api.post as vi.Mock).mockResolvedValue({ data: { id: 1 } });
    await bodegasApi.create(dto);
    expect(api.post).toHaveBeenCalledWith('/bodegas', dto);
  });

  test('update usa PATCH con id', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await bodegasApi.update(5, { nombre: 'Nueva' });
    expect(api.patch).toHaveBeenCalledWith('/bodegas/5', { nombre: 'Nueva' });
  });

  test('delete llama DELETE', async () => {
    (api.delete as vi.Mock).mockResolvedValue({ data: {} });
    await bodegasApi.delete(3);
    expect(api.delete).toHaveBeenCalledWith('/bodegas/3');
  });
});
