import { comprasApi } from './compras.api';
import api from './http';

vi.mock('./http');

describe('comprasApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getAll llama GET', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await comprasApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/compras');
  });

  test('getById llama ruta correcta', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: {} });
    await comprasApi.getById(10);
    expect(api.get).toHaveBeenCalledWith('/compras/10');
  });

  test('create envía dto', async () => {
    const dto = { proveedorId: 1, detalles: [] } as any;
    (api.post as vi.Mock).mockResolvedValue({ data: { id: 1 } });
    await comprasApi.create(dto);
    expect(api.post).toHaveBeenCalledWith('/compras', dto);
  });

  test('createFromRequirement llama POST con requirementId', async () => {
    const dto = { proveedorId: 2, subtotal: 100 };
    (api.post as vi.Mock).mockResolvedValue({ data: { id: 1 } });
    await comprasApi.createFromRequirement(5, dto);
    expect(api.post).toHaveBeenCalledWith('/compras/from-requirement/5', dto);
  });

  test('getItemsEnCompras llama GET', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await comprasApi.getItemsEnCompras();
    expect(api.get).toHaveBeenCalledWith('/compras/items-en-compras');
  });

  test('update usa PATCH', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await comprasApi.update(3, { total: 500 });
    expect(api.patch).toHaveBeenCalledWith('/compras/3', { total: 500 });
  });

  test('delete llama DELETE', async () => {
    (api.delete as vi.Mock).mockResolvedValue({ data: {} });
    await comprasApi.delete(7);
    expect(api.delete).toHaveBeenCalledWith('/compras/7');
  });

  test('aprobar llama PATCH', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await comprasApi.aprobar(8);
    expect(api.patch).toHaveBeenCalledWith('/compras/8/aprobar');
  });

  test('recibir llama PATCH', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await comprasApi.recibir(8);
    expect(api.patch).toHaveBeenCalledWith('/compras/8/recibir');
  });

  test('recibirItem llama PATCH con body', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await comprasApi.recibirItem(10, 20, 5, 'ok');
    expect(api.patch).toHaveBeenCalledWith('/compras/10/recibir-item/20', {
      cantidadRecibida: 5,
      justificativo: 'ok'
    });
  });

  test('downloadPdf retorna blob exitoso', async () => {
    const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('token-123');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(mockBlob) }));

    const result = await comprasApi.downloadPdf(5);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/compras/5/pdf'),
      expect.objectContaining({ headers: { Authorization: 'Bearer token-123' } })
    );
    expect(result).toBe(mockBlob);

    vi.restoreAllMocks();
  });

  test('downloadPdf lanza error si response no ok', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('token-123');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await expect(comprasApi.downloadPdf(5)).rejects.toThrow('Error al descargar PDF');
    vi.restoreAllMocks();
  });
});
