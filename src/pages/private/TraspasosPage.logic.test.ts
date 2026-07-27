import { filtrarPorEntregar, filtrarPorRecibir } from './TraspasosPage.logic';

describe('TraspasosPage - lógica pura', () => {
  const traspasos = [
    { estado: 'PENDIENTE', bodegaOrigenId: 1, bodegaDestinoId: 2 },
    { estado: 'EN_TRANSITO', bodegaOrigenId: 1, bodegaDestinoId: 3 },
    { estado: 'PENDIENTE', bodegaOrigenId: 2, bodegaDestinoId: 1 },
    { estado: 'RECIBIDO', bodegaOrigenId: 1, bodegaDestinoId: 2 },
    { estado: 'EN_TRANSITO', bodegaOrigenId: 3, bodegaDestinoId: 1 },
    { estado: 'CANCELADO', bodegaOrigenId: 1, bodegaDestinoId: 2 },
  ];

  describe('filtrarPorEntregar', () => {
    test('filtra PENDIENTE + EN_TRANSITO de la bodega del usuario (origen)', () => {
      const result = filtrarPorEntregar(traspasos, [1]);
      expect(result).toHaveLength(2);
      expect(result.every(t => t.bodegaOrigenId === 1)).toBe(true);
    });

    test('no incluye RECIBIDO aunque sea bodega del usuario', () => {
      const result = filtrarPorEntregar(traspasos, [1]);
      expect(result.some(t => t.estado === 'RECIBIDO')).toBe(false);
    });

    test('no incluye CANCELADO', () => {
      const result = filtrarPorEntregar(traspasos, [1]);
      expect(result.some(t => t.estado === 'CANCELADO')).toBe(false);
    });

    test('retorna vacío si usuario no tiene bodegas', () => {
      expect(filtrarPorEntregar(traspasos, [])).toHaveLength(0);
    });

    test('retorna vacío con array vacío', () => {
      expect(filtrarPorEntregar([], [1, 2])).toHaveLength(0);
    });

    test('filtra por múltiples bodegas del usuario', () => {
      const result = filtrarPorEntregar(traspasos, [1, 2]);
      expect(result).toHaveLength(3);
    });

    test('retorna vacío si bodega no coincide', () => {
      expect(filtrarPorEntregar(traspasos, [99])).toHaveLength(0);
    });
  });

  describe('filtrarPorRecibir', () => {
    test('filtra EN_TRANSITO hacia la bodega del usuario (destino)', () => {
      const result = filtrarPorRecibir(traspasos, [3]);
      expect(result).toHaveLength(1);
      expect(result[0].bodegaDestinoId).toBe(3);
    });

    test('no incluye PENDIENTE', () => {
      const result = filtrarPorRecibir(traspasos, [2]);
      expect(result.some(t => t.estado === 'PENDIENTE')).toBe(false);
    });

    test('retorna vacío si bodega destino no coincide', () => {
      expect(filtrarPorRecibir(traspasos, [99])).toHaveLength(0);
    });

    test('retorna vacío si usuario no tiene bodegas', () => {
      expect(filtrarPorRecibir(traspasos, [])).toHaveLength(0);
    });

    test('retorna vacío con array vacío', () => {
      expect(filtrarPorRecibir([], [1])).toHaveLength(0);
    });

    test('filtra por múltiples bodegas destino del usuario', () => {
      const result = filtrarPorRecibir(traspasos, [1, 2, 3]);
      expect(result).toHaveLength(2);
    });

    test('no incluye RECIBIDO ni CANCELADO', () => {
      const result = filtrarPorRecibir(traspasos, [1, 2, 3]);
      expect(result.every(t => t.estado === 'EN_TRANSITO')).toBe(true);
    });
  });
});
