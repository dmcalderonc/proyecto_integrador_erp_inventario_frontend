import { getBadgeStyle } from './design-tokens';

describe('design-tokens', () => {
  test('getBadgeStyle retorna clases correctas por estado', () => {
    expect(getBadgeStyle('PENDIENTE')).toContain('bg-warning-bg');
    expect(getBadgeStyle('APROBADO')).toContain('bg-info-bg');
    expect(getBadgeStyle('RECHAZADO')).toContain('bg-danger');
    expect(getBadgeStyle('DESCONOCIDO')).toContain('bg-elevated'); // fallback
  });
});
