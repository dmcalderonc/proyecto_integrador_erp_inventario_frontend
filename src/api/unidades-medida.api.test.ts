import { unidadesMedidaApi } from './unidades-medida.api';
import api from './http';

vi.mock('./http');

describe('unidadesMedidaApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getAll por defecto NO incluye suspendidas', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await unidadesMedidaApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/unidades-medida', { params: { includeSuspended: undefined } });
  });

  test('getAll includeSuspended=true', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await unidadesMedidaApi.getAll(true);
    expect(api.get).toHaveBeenCalledWith('/unidades-medida', { params: { includeSuspended: 'true' } });
  });

  test('create envía dto', async () => {
    const dto = { nombre: 'Kilogramo', abreviatura: 'kg' } as any;
    (api.post as vi.Mock).mockResolvedValue({ data: { id: 1 } });
    await unidadesMedidaApi.create(dto);
    expect(api.post).toHaveBeenCalledWith('/unidades-medida', dto);
  });

  test('update usa PUT', async () => {
    (api.put as vi.Mock).mockResolvedValue({ data: {} });
    await unidadesMedidaApi.update(3, { nombre: 'Metro' });
    expect(api.put).toHaveBeenCalledWith('/unidades-medida/3', { nombre: 'Metro' });
  });

  test('delete llama DELETE', async () => {
    (api.delete as vi.Mock).mockResolvedValue({ data: {} });
    await unidadesMedidaApi.delete(2);
    expect(api.delete).toHaveBeenCalledWith('/unidades-medida/2');
  });
});
