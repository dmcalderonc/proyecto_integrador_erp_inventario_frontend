import {
  calcularSubtotal,
  calcularImpuestos,
  calcularTotal,
  requiereJustificativo,
  calcularPendiente,
  tieneDiferencia,
} from './ComprasPage.logic';

describe('ComprasPage - lógica pura', () => {
  describe('calcularSubtotal', () => {
    test('suma cantidad * precioUnitario de cada detalle', () => {
      expect(
        calcularSubtotal([
          { cantidad: 10, precioUnitario: 5 },
          { cantidad: 5, precioUnitario: 20 },
        ]),
      ).toBe(150);
    });

    test('retorna 0 con array vacío', () => {
      expect(calcularSubtotal([])).toBe(0);
    });

    test('maneja un solo detalle', () => {
      expect(calcularSubtotal([{ cantidad: 3, precioUnitario: 10 }])).toBe(30);
    });

    test('maneja precios decimales', () => {
      expect(
        calcularSubtotal([{ cantidad: 2, precioUnitario: 19.99 }]),
      ).toBeCloseTo(39.98);
    });
  });

  describe('calcularImpuestos', () => {
    test('calcula 15%', () => {
      expect(calcularImpuestos(100, 15)).toBe(15);
    });

    test('calcula 0%', () => {
      expect(calcularImpuestos(100, 0)).toBe(0);
    });

    test('calcula 100%', () => {
      expect(calcularImpuestos(50, 100)).toBe(50);
    });

    test('maneja subtotal de 0', () => {
      expect(calcularImpuestos(0, 15)).toBe(0);
    });
  });

  describe('calcularTotal', () => {
    test('suma subtotal + impuestos', () => {
      expect(calcularTotal(100, 15)).toBe(115);
    });

    test('funciona con 0 impuestos', () => {
      expect(calcularTotal(200, 0)).toBe(200);
    });

    test('funciona con 0 subtotal', () => {
      expect(calcularTotal(0, 15)).toBe(15);
    });
  });

  describe('requiereJustificativo', () => {
    test('true cuando cantidades difieren (menos)', () => {
      expect(requiereJustificativo(8, 10)).toBe(true);
    });

    test('true cuando cantidades difieren (más)', () => {
      expect(requiereJustificativo(15, 10)).toBe(true);
    });

    test('false cuando cantidades coinciden', () => {
      expect(requiereJustificativo(10, 10)).toBe(false);
    });

    test('true cuando recibido es 0 y ordenado es 10', () => {
      expect(requiereJustificativo(0, 10)).toBe(true);
    });
  });

  describe('calcularPendiente', () => {
    test('calcula pendiente normal', () => {
      expect(calcularPendiente(10, 3)).toBe(7);
    });

    test('retorna 0 cuando todo fue recibido', () => {
      expect(calcularPendiente(10, 10)).toBe(0);
    });

    test('retorna 0 cuando recibido es mayor (no negativo)', () => {
      expect(calcularPendiente(10, 15)).toBe(0);
    });

    test('retorna total cuando nada fue recibido', () => {
      expect(calcularPendiente(10, 0)).toBe(10);
    });
  });

  describe('tieneDiferencia', () => {
    test('true cuando totalRecibido + cantidadNueva ≠ ordenada', () => {
      expect(tieneDiferencia(5, 3, 10)).toBe(true);
    });

    test('false cuando totalRecibido + cantidadNueva = ordenada', () => {
      expect(tieneDiferencia(7, 3, 10)).toBe(false);
    });

    test('false cuando cantidadNueva es 0', () => {
      expect(tieneDiferencia(0, 3, 10)).toBe(false);
    });

    test('true cuando excede la ordenada', () => {
      expect(tieneDiferencia(8, 3, 10)).toBe(true);
    });
  });
});
