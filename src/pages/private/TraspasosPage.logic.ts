export interface TraspasoRow {
  estado: string;
  bodegaOrigenId: number;
  bodegaDestinoId: number;
}

export function filtrarPorEntregar(
  traspasos: TraspasoRow[],
  userBodegaIds: number[],
): TraspasoRow[] {
  return traspasos.filter(
    t =>
      (t.estado === 'PENDIENTE' || t.estado === 'EN_TRANSITO') &&
      userBodegaIds.includes(t.bodegaOrigenId),
  );
}

export function filtrarPorRecibir(
  traspasos: TraspasoRow[],
  userBodegaIds: number[],
): TraspasoRow[] {
  return traspasos.filter(
    t => t.estado === 'EN_TRANSITO' && userBodegaIds.includes(t.bodegaDestinoId),
  );
}
