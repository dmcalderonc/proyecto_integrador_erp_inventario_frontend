import { previsionApi } from './prevision.api';
import api from './http';

vi.mock('./http');

describe('previsionApi', () => {
  beforeEach(() => vi.clearAllMocks());

  test('getPrevision llama GET con los parámetros de la ventana', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: { materiales: [] } });

    await previsionApi.getPrevision({ dias: 30, soloAlertas: true });

    expect(api.get).toHaveBeenCalledWith('/dashboard/prediccion', {
      params: { dias: 30, soloAlertas: true },
    });
  });

  test('getPrevision funciona sin parámetros', async () => {
    (api.get as vi.Mock).mockResolvedValue({ data: { materiales: [] } });

    await previsionApi.getPrevision();

    expect(api.get).toHaveBeenCalledWith('/dashboard/prediccion', { params: {} });
  });

  test('generarAlertas llama POST a la ruta de alertas', async () => {
    (api.post as vi.Mock).mockResolvedValue({ data: { alertasGeneradas: 0 } });

    await previsionApi.generarAlertas();

    expect(api.post).toHaveBeenCalledWith('/dashboard/prediccion/alertas', {});
  });

  test('generarAlertas acota a la bodega cuando se envía', async () => {
    (api.post as vi.Mock).mockResolvedValue({ data: { alertasGeneradas: 0 } });

    await previsionApi.generarAlertas(7);

    expect(api.post).toHaveBeenCalledWith('/dashboard/prediccion/alertas', { bodegaId: 7 });
  });
});
