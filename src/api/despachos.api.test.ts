import { despachosApi } from './despachos.api';
import api from './http';

vi.mock('./http');

describe('despachosApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('entregaDirecta envía dto', async () => {
    const dto = { requerimientoId: 1, detalles: [] } as any;
    (api.post as vi.Mock).mockResolvedValue({ data: { id: 1 } });
    await despachosApi.entregaDirecta(dto);
    expect(api.post).toHaveBeenCalledWith('/despachos/entrega-directa', dto);
  });
});
