export const badgeStyles: Record<string, { bg: string; text: string; border: string }> = {
  ACTIVO:      { bg: 'bg-success-bg', text: 'text-success', border: 'border-success/30' },
  INACTIVO:    { bg: 'bg-danger-bg', text: 'text-danger', border: 'border-danger/30' },
  PENDIENTE:   { bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning/30' },
  APROBADO:    { bg: 'bg-info-bg', text: 'text-info', border: 'border-info/30' },
  RECIBIDA:    { bg: 'bg-success-bg', text: 'text-success', border: 'border-success/30' },
  EMITIDA:     { bg: 'bg-info-bg', text: 'text-info', border: 'border-info/30' },
  BORRADOR:    { bg: 'bg-elevated', text: 'text-text-muted', border: 'border-border-default' },
  CANCELADA:   { bg: 'bg-danger-bg', text: 'text-danger', border: 'border-danger/30' },
  RECHAZADO:   { bg: 'bg-danger-bg', text: 'text-danger', border: 'border-danger/30' },
  DESPACHADO:  { bg: 'bg-success-bg', text: 'text-success', border: 'border-success/30' },
  EN_EVALUACION: { bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning/30' },
  ELEGIDA:     { bg: 'bg-success-bg', text: 'text-success', border: 'border-success/30' },
  DESCARTADA:  { bg: 'bg-danger-bg', text: 'text-danger', border: 'border-danger/30' },
  COTIZANDO:   { bg: 'bg-info-bg', text: 'text-info', border: 'border-info/30' },
  PROCESADO:   { bg: 'bg-success-bg', text: 'text-success', border: 'border-success/30' },
  ATENDIDO:    { bg: 'bg-success-bg', text: 'text-success', border: 'border-success/30' },
  COMPRAS:     { bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning/30' },
  SOLICITANTE: { bg: 'bg-info-bg', text: 'text-info', border: 'border-info/30' },
  ADMIN:       { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  BODEGUERO:   { bg: 'bg-info-bg', text: 'text-info', border: 'border-info/30' },
  COMPRADOR:   { bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning/30' },
  INGRESO:     { bg: 'bg-success-bg', text: 'text-success', border: 'border-success/30' },
  EGRESO:      { bg: 'bg-danger-bg', text: 'text-danger', border: 'border-danger/30' },
  TRANSFERENCIA: { bg: 'bg-info-bg', text: 'text-info', border: 'border-info/30' },
  CERRADO:     { bg: 'bg-elevated', text: 'text-text-muted', border: 'border-border-default' },
  ALTA:        { bg: 'bg-danger-bg', text: 'text-danger', border: 'border-danger/30' },
  MEDIA:       { bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning/30' },
  BAJA:        { bg: 'bg-elevated', text: 'text-text-muted', border: 'border-border-default' },
  EN_TRASLADO: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  APROBADO_BODEGA: { bg: 'bg-success-bg', text: 'text-success', border: 'border-success/20' },
  EN_TRANSITO: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  RECIBIDO:    { bg: 'bg-success-bg', text: 'text-success', border: 'border-success/20' },
  EN_COMPRAS:  { bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning/20' },
  PARCIALMENTE_ATENDIDO: { bg: 'bg-warning-bg', text: 'text-warning', border: 'border-warning/20' },
};

export function getBadgeStyle(estado: string): string {
  const style = badgeStyles[estado];
  if (style) return `${style.bg} ${style.text} ${style.border}`;
  return 'bg-elevated text-text-muted border-border-default';
}
