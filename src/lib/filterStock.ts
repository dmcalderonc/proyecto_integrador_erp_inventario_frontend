interface MaterialTest {
  stockDisponible?: number | null;
  [key: string]: unknown;
}

export function filterStock(materiales: MaterialTest[], filtro: string): MaterialTest[] {
  if (!filtro) return materiales;
  return materiales.filter((m) => {
    const d = m.stockDisponible ?? 0;
    if (filtro === 'agotado') return d === 0;
    if (filtro === 'bajo') return d > 0 && d <= 5;
    if (filtro === 'normal') return d > 5;
    return true;
  });
}