import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import {
  ordenarPorUrgencia,
  chipDeNivel,
  textoDiasRestantes,
  iconoDeTendencia,
  topUrgentes,
} from './PrevisionPage.logic';
import type { NivelQuiebre, PrevisionMaterial } from '../../types/prevision.types';

const material = (overrides: Partial<PrevisionMaterial>): PrevisionMaterial => ({
  materialId: 1,
  nombre: 'Material',
  sku: 'MAT-001',
  stockActual: 10,
  stockReservado: 0,
  stockEfectivo: 10,
  consumoPromedio: 1,
  diasHastaAgotar: 10,
  nivel: 'ESTABLE',
  tendencia: 'ESTABLE',
  pendiente: 0,
  serieSemanal: [],
  esAnomalo: false,
  z: null,
  variacionPct: null,
  salidasEnVentana: 30,
  diasHistoria: 60,
  ...overrides,
});

describe('PrevisionPage.logic — ordenarPorUrgencia', () => {
  test('coloca los niveles en orden de urgencia', () => {
    const niveles: NivelQuiebre[] = ['ESTABLE', 'SIN_DATOS', 'RIESGO', 'AGOTADO', 'CRITICO'];

    const ordenado = ordenarPorUrgencia(
      niveles.map((nivel, i) => material({ materialId: i, nivel, nombre: `M${i}` })),
    );

    expect(ordenado.map(m => m.nivel)).toEqual([
      'AGOTADO', 'CRITICO', 'RIESGO', 'ESTABLE', 'SIN_DATOS',
    ]);
  });

  test('dentro de un nivel ordena por días ascendente con el null al final', () => {
    const ordenado = ordenarPorUrgencia([
      material({ materialId: 1, nivel: 'CRITICO', diasHastaAgotar: null, nombre: 'Sin estimación' }),
      material({ materialId: 2, nivel: 'CRITICO', diasHastaAgotar: 4, nombre: 'Pronto' }),
      material({ materialId: 3, nivel: 'CRITICO', diasHastaAgotar: 1, nombre: 'Urgente' }),
    ]);

    expect(ordenado.map(m => m.materialId)).toEqual([3, 2, 1]);
  });

  test('desempata por menor stock y luego por nombre', () => {
    const ordenado = ordenarPorUrgencia([
      material({ materialId: 1, nivel: 'CRITICO', diasHastaAgotar: 2, stockEfectivo: 20, nombre: 'Zeta' }),
      material({ materialId: 2, nivel: 'CRITICO', diasHastaAgotar: 2, stockEfectivo: 5, nombre: 'Alfa' }),
      material({ materialId: 3, nivel: 'CRITICO', diasHastaAgotar: 2, stockEfectivo: 5, nombre: 'Beta' }),
    ]);

    expect(ordenado.map(m => m.materialId)).toEqual([2, 3, 1]);
  });

  test('no muta la lista recibida', () => {
    const entrada = [material({ materialId: 1, nivel: 'SIN_DATOS' }), material({ materialId: 2, nivel: 'AGOTADO' })];
    const copia = [...entrada];

    ordenarPorUrgencia(entrada);

    expect(entrada).toEqual(copia);
  });
});

describe('PrevisionPage.logic — chipDeNivel', () => {
  test('mapea cada nivel a su estilo de badge', () => {
    expect(chipDeNivel('AGOTADO')).toBe('RECHAZADO'); // danger
    expect(chipDeNivel('CRITICO')).toBe('ALTA');      // danger
    expect(chipDeNivel('RIESGO')).toBe('MEDIA');      // warning
    expect(chipDeNivel('ESTABLE')).toBe('ACTIVO');    // success
    expect(chipDeNivel('SIN_DATOS')).toBe('PENDIENTE'); // muted
  });
});

describe('PrevisionPage.logic — textoDiasRestantes', () => {
  test('traduce los casos borde', () => {
    expect(textoDiasRestantes(null)).toBe('sin estimación');
    expect(textoDiasRestantes(undefined)).toBe('sin estimación');
    expect(textoDiasRestantes(0)).toBe('agotado');
    expect(textoDiasRestantes(-3)).toBe('agotado');
    expect(textoDiasRestantes(1)).toBe('hoy');
    expect(textoDiasRestantes(2)).toBe('2 días');
    expect(textoDiasRestantes(15)).toBe('15 días');
  });
});

describe('PrevisionPage.logic — iconoDeTendencia', () => {
  test('devuelve el icono correspondiente', () => {
    expect(iconoDeTendencia('SUBE')).toBe(TrendingUp);
    expect(iconoDeTendencia('BAJA')).toBe(TrendingDown);
    expect(iconoDeTendencia('ESTABLE')).toBe(Minus);
  });
});

describe('PrevisionPage.logic — topUrgentes', () => {
  test('devuelve los N más urgentes ya ordenados', () => {
    const items = [
      material({ materialId: 1, nivel: 'SIN_DATOS', nombre: 'A' }),
      material({ materialId: 2, nivel: 'AGOTADO', nombre: 'B' }),
      material({ materialId: 3, nivel: 'CRITICO', nombre: 'C' }),
      material({ materialId: 4, nivel: 'RIESGO', nombre: 'D' }),
    ];

    expect(topUrgentes(items, 3).map(m => m.materialId)).toEqual([2, 3, 4]);
    expect(topUrgentes(items, 1).map(m => m.materialId)).toEqual([2]);
  });

  test('con n no válido devuelve lista vacía en lugar de fallar', () => {
    const items = [material({ materialId: 1 })];

    expect(topUrgentes(items, 0)).toEqual([]);
    expect(topUrgentes(items, -2)).toEqual([]);
    expect(topUrgentes(items, Number.NaN)).toEqual([]);
    expect(topUrgentes([], 3)).toEqual([]);
  });
});
