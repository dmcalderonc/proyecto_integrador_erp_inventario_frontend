import { inventarioApi } from './inventario.api';
import api from './http';

vi.mock('./http');

describe('inventarioApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getAll llama GET', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await inventarioApi.getAll();
    expect(api.get).toHaveBeenCalledWith('/inventario');
  });

  test('getById llama ruta correcta', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: {} });
    await inventarioApi.getById(15);
    expect(api.get).toHaveBeenCalledWith('/inventario/15');
  });

  test('getStockByMaterial llama ruta con materialId', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: [] });
    await inventarioApi.getStockByMaterial(42);
    expect(api.get).toHaveBeenCalledWith('/inventario/material/42/stock-por-bodega');
  });
});
