// --- Lógica extraída de SolicitudesPage.tsx ---

const solicitudEstadoStyle: Record<string, string> = {
  PENDIENTE: 'bg-warning/10 text-warning border-warning/20',
  COTIZANDO: 'bg-info/10 text-info border-info/20',
  APROBADA:  'bg-success/10 text-success border-success/20',
  RECHAZADA: 'bg-danger/10 text-danger border-danger/20',
  PROCESADO: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
};

function getEstadoStyle(estado: string): string {
  return solicitudEstadoStyle[estado] || 'bg-elevated text-text-muted border-border-default';
}

function puedeAprobar(estado: string, rol: string): boolean {
  return rol === 'ADMIN' && estado === 'COTIZANDO';
}

function puedeProcesar(estado: string, rol: string): boolean {
  return rol === 'ADMIN' && estado === 'APROBADA';
}

function puedeEditar(estado: string, rol: string, esSolicitante: boolean): boolean {
  return rol === 'SOLICITANTE' && estado === 'PENDIENTE' && esSolicitante;
}

function getColumnas(rol: string) {
  const base = ['Proyecto', 'Solicitante', 'Prioridad', 'Estado', 'Fecha'];
  if (rol === 'ADMIN' || rol === 'COMPRADOR') base.push('Acciones');
  return base;
}

function getFilteredSolicitudes(
  solicitudes: Array<{ estado: string; proyectoId?: string }>,
  filtroEstado: string,
): Array<{ estado: string; proyectoId?: string }> {
  return filtroEstado
    ? solicitudes.filter(s => s.estado === filtroEstado)
    : solicitudes;
}

// --- Tests ---

describe('SolicitudesPage - solicitudEstadoStyle', () => {
  test('todos los estados tienen estilos definidos', () => {
    const estados = ['PENDIENTE', 'COTIZANDO', 'APROBADA', 'RECHAZADA', 'PROCESADO'];
    estados.forEach(estado => {
      expect(solicitudEstadoStyle[estado]).toBeTruthy();
      expect(solicitudEstadoStyle[estado]).toContain('border-');
    });
  });

  test('PENDIENTE tiene warning', () => {
    expect(getEstadoStyle('PENDIENTE')).toContain('text-warning');
  });

  test('APROBADA tiene success', () => {
    expect(getEstadoStyle('APROBADA')).toContain('text-success');
  });

  test('RECHAZADA tiene danger', () => {
    expect(getEstadoStyle('RECHAZADA')).toContain('text-danger');
  });

  test('estado no existe retorna fallback', () => {
    expect(getEstadoStyle('XYZ')).toBe('bg-elevated text-text-muted border-border-default');
  });
});

describe('SolicitudesPage - puedeAprobar', () => {
  test('ADMIN puede aprobar COTIZANDO', () => {
    expect(puedeAprobar('COTIZANDO', 'ADMIN')).toBe(true);
  });

  test('ADMIN no puede aprobar PENDIENTE', () => {
    expect(puedeAprobar('PENDIENTE', 'ADMIN')).toBe(false);
  });

  test('COMPRADOR no puede aprobar', () => {
    expect(puedeAprobar('COTIZANDO', 'COMPRADOR')).toBe(false);
  });

  test('BODEGUERO no puede aprobar', () => {
    expect(puedeAprobar('COTIZANDO', 'BODEGUERO')).toBe(false);
  });
});

describe('SolicitudesPage - puedeProcesar', () => {
  test('ADMIN puede procesar APROBADA', () => {
    expect(puedeProcesar('APROBADA', 'ADMIN')).toBe(true);
  });

  test('ADMIN no puede procesar COTIZANDO', () => {
    expect(puedeProcesar('COTIZANDO', 'ADMIN')).toBe(false);
  });

  test('COMPRADOR no puede procesar', () => {
    expect(puedeProcesar('APROBADA', 'COMPRADOR')).toBe(false);
  });
});

describe('SolicitudesPage - puedeEditar', () => {
  test('SOLICITANTE puede editar PENDIENTE propio', () => {
    expect(puedeEditar('PENDIENTE', 'SOLICITANTE', true)).toBe(true);
  });

  test('SOLICITANTE no puede editar PENDIENTE ajeno', () => {
    expect(puedeEditar('PENDIENTE', 'SOLICITANTE', false)).toBe(false);
  });

  test('SOLICITANTE no puede editar COTIZANDO', () => {
    expect(puedeEditar('COTIZANDO', 'SOLICITANTE', true)).toBe(false);
  });

  test('ADMIN no puede editar (no es SOLICITANTE)', () => {
    expect(puedeEditar('PENDIENTE', 'ADMIN', false)).toBe(false);
  });
});

describe('SolicitudesPage - getColumnas', () => {
  test('ADMIN ve columna Acciones', () => {
    expect(getColumnas('ADMIN')).toContain('Acciones');
  });

  test('COMPRADOR ve columna Acciones', () => {
    expect(getColumnas('COMPRADOR')).toContain('Acciones');
  });

  test('SOLICITANTE NO ve columna Acciones', () => {
    expect(getColumnas('SOLICITANTE')).not.toContain('Acciones');
  });

  test('BODEGUERO NO ve columna Acciones', () => {
    expect(getColumnas('BODEGUERO')).not.toContain('Acciones');
  });

  test('todas las columnas base están presentes', () => {
    const cols = getColumnas('ADMIN');
    expect(cols).toContain('Proyecto');
    expect(cols).toContain('Solicitante');
    expect(cols).toContain('Estado');
    expect(cols).toContain('Fecha');
  });
});

describe('SolicitudesPage - getFilteredSolicitudes', () => {
  const solicitudes = [
    { estado: 'PENDIENTE' },
    { estado: 'APROBADA' },
    { estado: 'COTIZANDO' },
  ];

  test('filtro vacío retorna todas', () => {
    expect(getFilteredSolicitudes(solicitudes, '')).toHaveLength(3);
  });

  test('filtro por estado', () => {
    expect(getFilteredSolicitudes(solicitudes, 'APROBADA')).toHaveLength(1);
  });

  test('filtro sin coincidencias', () => {
    expect(getFilteredSolicitudes(solicitudes, 'PROCESADO')).toHaveLength(0);
  });
});
