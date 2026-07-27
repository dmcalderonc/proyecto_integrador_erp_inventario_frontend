// --- Lógica extraída de CotizacionesPage.tsx ---

interface CotizacionTest {
  id: number;
  estado: string;
  cantidad: number | string;
  [key: string]: unknown;
}

function tieneCotizacionActiva(cotizaciones: CotizacionTest[]): boolean {
  return cotizaciones.some(c => c.estado === 'EN_EVALUACION' || c.estado === 'ELEGIDA');
}

function cotizacionesFiltradas(cotizaciones: CotizacionTest[], filtroEstado: string): CotizacionTest[] {
  return filtroEstado
    ? cotizaciones.filter(c => c.estado === filtroEstado)
    : cotizaciones;
}

function totalCotizado(cotizaciones: CotizacionTest[]): number {
  return cotizaciones
    .filter(c => c.estado !== 'DESCARTADA')
    .reduce((sum, c) => sum + Number(c.cantidad), 0);
}

function cantidadRestante(cantidadSolicitada: number | string, cotizaciones: CotizacionTest[]): number {
  return Number(cantidadSolicitada) - totalCotizado(cotizaciones);
}

const cotizacionEstadoStyle: Record<string, string> = {
  EN_EVALUACION: 'bg-warning/10 text-warning border-warning/20',
  ELEGIDA: 'bg-success/10 text-success border-success/20',
  DESCARTADA: 'bg-danger/10 text-danger border-danger/20',
};

// --- Tests ---

describe('CotizacionesPage - tieneCotizacionActiva', () => {
  test('retorna true si hay cotización EN_EVALUACION', () => {
    expect(tieneCotizacionActiva([{ id: 1, estado: 'EN_EVALUACION', cantidad: 5 }])).toBe(true);
  });

  test('retorna true si hay cotización ELEGIDA', () => {
    expect(tieneCotizacionActiva([{ id: 1, estado: 'ELEGIDA', cantidad: 5 }])).toBe(true);
  });

  test('retorna false si todas son DESCARTADA', () => {
    expect(tieneCotizacionActiva([{ id: 1, estado: 'DESCARTADA', cantidad: 5 }])).toBe(false);
  });

  test('retorna false para array vacío', () => {
    expect(tieneCotizacionActiva([])).toBe(false);
  });
});

describe('CotizacionesPage - cotizacionesFiltradas', () => {
  const cotizaciones = [
    { id: 1, estado: 'EN_EVALUACION', cantidad: 5 },
    { id: 2, estado: 'ELEGIDA', cantidad: 10 },
    { id: 3, estado: 'DESCARTADA', cantidad: 3 },
  ];

  test('filtro vacío retorna todas', () => {
    expect(cotizacionesFiltradas(cotizaciones, '')).toHaveLength(3);
  });

  test('filtro por estado retorna solo las que coinciden', () => {
    const result = cotizacionesFiltradas(cotizaciones, 'ELEGIDA');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  test('filtro sin coincidencias retorna array vacío', () => {
    expect(cotizacionesFiltradas(cotizaciones, 'PENDIENTE')).toHaveLength(0);
  });
});

describe('CotizacionesPage - totalCotizado', () => {
  test('suma solo cantidades no descartadas', () => {
    const cotizaciones = [
      { id: 1, estado: 'EN_EVALUACION', cantidad: 5 },
      { id: 2, estado: 'ELEGIDA', cantidad: 10 },
      { id: 3, estado: 'DESCARTADA', cantidad: 3 },
    ];
    expect(totalCotizado(cotizaciones)).toBe(15);
  });

  test('retorna 0 si todas están descartadas', () => {
    expect(totalCotizado([{ id: 1, estado: 'DESCARTADA', cantidad: 100 }])).toBe(0);
  });

  test('maneja cantidades string', () => {
    expect(totalCotizado([{ id: 1, estado: 'ELEGIDA', cantidad: '25' }])).toBe(25);
  });

  test('retorna 0 para array vacío', () => {
    expect(totalCotizado([])).toBe(0);
  });
});

describe('CotizacionesPage - cantidadRestante', () => {
  test('calcula restante correctamente', () => {
    const cotizaciones = [
      { id: 1, estado: 'ELEGIDA', cantidad: 10 },
      { id: 2, estado: 'EN_EVALUACION', cantidad: 5 },
    ];
    expect(cantidadRestante(20, cotizaciones)).toBe(5);
  });

  test('retorna total cuando no hay cotizaciones', () => {
    expect(cantidadRestante(15, [])).toBe(15);
  });

  test('retorna negativo cuando se excede', () => {
    expect(cantidadRestante(5, [{ id: 1, estado: 'ELEGIDA', cantidad: 10 }])).toBe(-5);
  });
});

describe('CotizacionesPage - cotizacionEstadoStyle', () => {
  test('EN_EVALUACION tiene estilo warning', () => {
    expect(cotizacionEstadoStyle.EN_EVALUACION).toContain('text-warning');
  });

  test('ELEGIDA tiene estilo success', () => {
    expect(cotizacionEstadoStyle.ELEGIDA).toContain('text-success');
  });

  test('DESCARTADA tiene estilo danger', () => {
    expect(cotizacionEstadoStyle.DESCARTADA).toContain('text-danger');
  });
});
