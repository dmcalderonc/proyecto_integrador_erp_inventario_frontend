import { requirementsApi } from './requirements.api';
import api from './http';

vi.mock('./http');

describe('requirementsApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getAll llama GET', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await requirementsApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/requirements');
  });

  test('getById llama ruta correcta', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: {} });
    await requirementsApi.getById(8);
    expect(api.get).toHaveBeenCalledWith('/requirements/8');
  });

  test('create envía dto', async () => {
    const dto = { proyectoId: '1', detalles: [] } as any;
    (api.post as vi.Mock).mockResolvedValue({ data: { id: 1 } });
    await requirementsApi.create(dto);
    expect(api.post).toHaveBeenCalledWith('/requirements', dto);
  });

  test('updateStatus llama PATCH con dto', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await requirementsApi.updateStatus(4, { estado: 'APROBADO' } as any);
    expect(api.patch).toHaveBeenCalledWith('/requirements/4/status', { estado: 'APROBADO' });
  });

  test('despachar llama PATCH', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await requirementsApi.despachar(6);
    expect(api.patch).toHaveBeenCalledWith('/requirements/6/despachar');
  });

  test('delete llama DELETE', async () => {
    (api.delete as vi.Mock).mockResolvedValue({ data: {} });
    await requirementsApi.delete(9);
    expect(api.delete).toHaveBeenCalledWith('/requirements/9');
  });

  test('evaluarItem llama PATCH con accion', async () => {
    (api.patch as vi.Mock).mockResolvedValue({ data: {} });
    await requirementsApi.evaluarItem(10, 20, 'APROBAR');
    expect(api.patch).toHaveBeenCalledWith('/requirements/10/evaluar-item/20', { accion: 'APROBAR' });
  });
});
