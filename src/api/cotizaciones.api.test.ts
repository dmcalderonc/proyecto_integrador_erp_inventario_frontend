import { cotizacionesApi } from './cotizaciones.api';
import api from './http';

vi.mock('./http');

describe('cotizacionesApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getAll llama GET sin params', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await cotizacionesApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/cotizaciones');
  });

  test('getById llama ruta correcta', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: {} });
    await cotizacionesApi.getById(7);
    expect(api.get).toHaveBeenCalledWith('/cotizaciones/7');
  });

  test('create envía dto', async () => {
    const dto = { proveedorId: 1, detalles: [], total: 100 } as any;
    (api.post as vi.Mock).mockResolvedValue({ data: { id: 1 } });
    await cotizacionesApi.create(dto);
    expect(api.post).toHaveBeenCalledWith('/cotizaciones', dto);
  });

  test('update usa PATCH', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await cotizacionesApi.update(3, { total: 200 });
    expect(api.patch).toHaveBeenCalledWith('/cotizaciones/3', { total: 200 });
  });

  test('delete llama DELETE', async () => {
    (api.delete as vi.Mock).mockResolvedValue({ data: {} });
    await cotizacionesApi.delete(9);
    expect(api.delete).toHaveBeenCalledWith('/cotizaciones/9');
  });

  test('seleccionar llama PATCH', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await cotizacionesApi.seleccionar(4);
    expect(api.patch).toHaveBeenCalledWith('/cotizaciones/4/seleccionar');
  });

  test('descartar llama PATCH', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await cotizacionesApi.descartar(4);
    expect(api.patch).toHaveBeenCalledWith('/cotizaciones/4/descartar');
  });

  test('getRequerimientosEnCompras llama GET', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await cotizacionesApi.getRequerimientosEnCompras();
    expect(api.get).toHaveBeenCalledWith('/cotizaciones/en-compras');
  });

  test('getCotizacionesByRequirement llama GET con requirementId', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: { detalles: [], cotizaciones: [] } });
    await cotizacionesApi.getCotizacionesByRequirement(12);
    expect(api.get).toHaveBeenCalledWith('/cotizaciones/by-requirement/12');
  });

  test('generarOC llama POST', async () => {
    (api.post as vi.Mock).mockResolvedValue({ data: {} });
    await cotizacionesApi.generarOC(12);
    expect(api.post).toHaveBeenCalledWith('/cotizaciones/generar-oc/12');
  });
});
