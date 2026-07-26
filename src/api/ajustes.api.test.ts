import { ajustesApi } from './ajustes.api';
import api from './http';

vi.mock('./http');

describe('ajustesApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getAll llama GET', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await ajustesApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/ajustes-inventario');
  });

  test('create envía dto', async () => {
    const dto = { inventarioId: 1, cantidadAjustada: 5, motivo: 'Corrección' } as any;
    (api.post as vi.Mock).mockResolvedValue({ data: { id: 1 } });
    await ajustesApi.create(dto);
    expect(api.post).toHaveBeenCalledWith('/ajustes-inventario', dto);
  });
});
