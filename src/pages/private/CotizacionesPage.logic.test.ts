import {
  tieneCotizacionActiva,
  calcularCantidadRestante,
  filtrarCotizaciones,
} from './CotizacionesPage.logic';

describe('CotizacionesPage - lógica pura', () => {
  describe('tieneCotizacionActiva', () => {
    test('retorna true si hay cotización EN_EVALUACION', () => {
      expect(tieneCotizacionActiva([{ estado: 'EN_EVALUACION', cantidad: 10 }])).toBe(true);
    });

    test('retorna true si hay cotización ELEGIDA', () => {
      expect(tieneCotizacionActiva([{ estado: 'ELEGIDA', cantidad: 10 }])).toBe(true);
    });

    test('retorna true con mix de estados incluyendo activa', () => {
      expect(
        tieneCotizacionActiva([
          { estado: 'DESCARTADA', cantidad: 5 },
          { estado: 'EN_EVALUACION', cantidad: 10 },
        ]),
      ).toBe(true);
    });

    test('retorna false si todas son DESCARTADA', () => {
      expect(
        tieneCotizacionActiva([
          { estado: 'DESCARTADA', cantidad: 5 },
          { estado: 'DESCARTADA', cantidad: 10 },
        ]),
      ).toBe(false);
    });

    test('retorna false con array vacío', () => {
      expect(tieneCotizacionActiva([])).toBe(false);
    });
  });

  describe('calcularCantidadRestante', () => {
    test('calcula correctamente con mix de estados', () => {
      const cotizaciones = [
        { estado: 'EN_EVALUACION', cantidad: 30 },
        { estado: 'DESCARTADA', cantidad: 50 },
        { estado: 'ELEGIDA', cantidad: 20 },
      ];
      // 30 + 20 = 50 cotizados (DESCARTADA no cuenta)
      expect(calcularCantidadRestante(100, cotizaciones)).toBe(50);
    });

    test('retorna cantidad solicitada si no hay cotizaciones', () => {
      expect(calcularCantidadRestante(50, [])).toBe(50);
    });

    test('retorna 0 si todo está cotizado exactamente', () => {
      const cotizaciones = [{ estado: 'EN_EVALUACION', cantidad: 100 }];
      expect(calcularCantidadRestante(100, cotizaciones)).toBe(0);
    });

    test('retorna negativo si se cotizó de más', () => {
      const cotizaciones = [{ estado: 'EN_EVALUACION', cantidad: 150 }];
      expect(calcularCantidadRestante(100, cotizaciones)).toBe(-50);
    });

    test('solo cuenta DESCARTADA como no cotizada', () => {
      const cotizaciones = [
        { estado: 'DESCARTADA', cantidad: 100 },
        { estado: 'DESCARTADA', cantidad: 50 },
      ];
      expect(calcularCantidadRestante(100, cotizaciones)).toBe(100);
    });
  });

  describe('filtrarCotizaciones', () => {
    test('retorna todas si filtro es string vacío', () => {
      const data = [{ estado: 'ELEGIDA' }, { estado: 'DESCARTADA' }];
      expect(filtrarCotizaciones(data, '')).toEqual(data);
    });

    test('filtra por estado específico', () => {
      const data = [
        { estado: 'ELEGIDA' },
        { estado: 'DESCARTADA' },
        { estado: 'ELEGIDA' },
      ];
      expect(filtrarCotizaciones(data, 'ELEGIDA')).toHaveLength(2);
    });

    test('retorna vacío si no hay match', () => {
      expect(filtrarCotizaciones([{ estado: 'X' }], 'ELEGIDA')).toHaveLength(0);
    });

    test('filtra correctamente EN_EVALUACION', () => {
      const data = [
        { estado: 'EN_EVALUACION' },
        { estado: 'EN_EVALUACION' },
        { estado: 'ELEGIDA' },
      ];
      const result = filtrarCotizaciones(data, 'EN_EVALUACION');
      expect(result).toHaveLength(2);
      expect(result.every(c => c.estado === 'EN_EVALUACION')).toBe(true);
    });
  });
});
