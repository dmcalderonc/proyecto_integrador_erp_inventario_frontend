import { vi } from 'vitest';

// --- Lógica extraída de RequirementsPage.tsx ---

const itemStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDIENTE:       { label: 'Pendiente',       color: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
  APROBADO_BODEGA: { label: 'Aprobado Bodega', color: 'text-success', bg: 'bg-success/10 border-success/20' },
  RECHAZADO:       { label: 'Rechazado',       color: 'text-danger',  bg: 'bg-danger/10 border-danger/20' },
  EN_COMPRAS:      { label: 'En Compras',      color: 'text-info',    bg: 'bg-info/10 border-info/20' },
  EN_TRASLADO:     { label: 'En Traslado',     color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  DESPACHADO:      { label: 'Despachado',      color: 'text-success', bg: 'bg-success/10 border-success/20' },
};

const requirementStatusStyle: Record<string, string> = {
  PENDIENTE: 'bg-warning/10 text-warning border-warning/20',
  APROBADO: 'bg-success/10 text-success border-success/20',
  EN_PROCESO: 'bg-info/10 text-info border-info/20',
  CERRADO: 'bg-elevated text-text-muted border-border-default',
};

function getItemCounts(detalles: Array<{ estadoItem: string }>) {
  const total = detalles.length;
  const pendientes = detalles.filter(d => d.estadoItem === 'PENDIENTE').length;
  const aprobados = detalles.filter(d => d.estadoItem === 'APROBADO_BODEGA').length;
  const despachados = detalles.filter(d => d.estadoItem === 'DESPACHADO').length;
  const enCompras = detalles.filter(d => d.estadoItem === 'EN_COMPRAS').length;
  return { total, pendientes, aprobados, despachados, enCompras };
}

// --- Tests ---

describe('RequirementsPage - itemStatusConfig', () => {
  test('tiene config para todos los estados esperados', () => {
    const estados = ['PENDIENTE', 'APROBADO_BODEGA', 'RECHAZADO', 'EN_COMPRAS', 'EN_TRASLADO', 'DESPACHADO'];
    estados.forEach(estado => {
      expect(itemStatusConfig[estado]).toBeDefined();
      expect(itemStatusConfig[estado].label).toBeTruthy();
      expect(itemStatusConfig[estado].color).toContain('text-');
    });
  });

  test('PENDIENTE tiene color warning', () => {
    expect(itemStatusConfig.PENDIENTE.color).toBe('text-warning');
  });

  test('RECHAZADO tiene color danger', () => {
    expect(itemStatusConfig.RECHAZADO.color).toBe('text-danger');
  });
});

describe('RequirementsPage - requirementStatusStyle', () => {
  test('APROBADO retorna estilo success', () => {
    expect(requirementStatusStyle.APROBADO).toContain('text-success');
  });

  test('estado no existente retorna undefined', () => {
    expect(requirementStatusStyle['NO_EXISTE']).toBeUndefined();
  });
});

describe('RequirementsPage - getItemCounts', () => {
  const detalles = [
    { estadoItem: 'PENDIENTE' },
    { estadoItem: 'PENDIENTE' },
    { estadoItem: 'APROBADO_BODEGA' },
    { estadoItem: 'DESPACHADO' },
    { estadoItem: 'EN_COMPRAS' },
  ];

  test('cuenta total correctamente', () => {
    expect(getItemCounts(detalles).total).toBe(5);
  });

  test('cuenta pendientes', () => {
    expect(getItemCounts(detalles).pendientes).toBe(2);
  });

  test('cuenta aprobados bodega', () => {
    expect(getItemCounts(detalles).aprobados).toBe(1);
  });

  test('cuenta despachados', () => {
    expect(getItemCounts(detalles).despachados).toBe(1);
  });

  test('cuenta en compras', () => {
    expect(getItemCounts(detalles).enCompras).toBe(1);
  });

  test('array vacío retorna todos en 0', () => {
    expect(getItemCounts([])).toEqual({ total: 0, pendientes: 0, aprobados: 0, despachados: 0, enCompras: 0 });
  });
});
