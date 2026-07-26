import { movimientosApi } from './movimientos.api';
import api from './http';

vi.mock('./http');

describe('movimientosApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getAll llama GET', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await movimientosApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/movimientos');
  });

  test('getById llama ruta correcta', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: {} });
    await movimientosApi.getById('abc-123');
    expect(api.get).toHaveBeenCalledWith('/movimientos/abc-123');
  });

  test('create envía dto', async () => {
    const dto = { tipo: 'INGRESO', detalles: [] } as any;
    (api.post as vi.Mock).mockResolvedValue({ data: { id: '1' } });
    await movimientosApi.create(dto);
    expect(api.post).toHaveBeenCalledWith('/movimientos', dto);
  });

  test('downloadTicket retorna blob exitoso', async () => {
    const mockBlob = new Blob(['ticket'], { type: 'text/plain' });
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('token-abc');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(mockBlob) }));

    const result = await movimientosApi.downloadTicket('mov-1');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/movimientos/mov-1/ticket'),
      expect.objectContaining({ headers: { Authorization: 'Bearer token-abc' } })
    );
    expect(result).toBe(mockBlob);
    vi.restoreAllMocks();
  });

  test('downloadTicket lanza error si response no ok', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('token-abc');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await expect(movimientosApi.downloadTicket('mov-1')).rejects.toThrow('Error al descargar ticket');
    vi.restoreAllMocks();
  });
});
