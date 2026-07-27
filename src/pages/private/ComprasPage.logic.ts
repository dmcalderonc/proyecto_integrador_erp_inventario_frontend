export interface DetalleCalculo {
  cantidad: number;
  precioUnitario: number;
}

export function calcularSubtotal(detalles: DetalleCalculo[]): number {
  return detalles.reduce((sum, d) => sum + d.cantidad * d.precioUnitario, 0);
}

export function calcularImpuestos(subtotal: number, rate: number): number {
  return subtotal * (rate / 100);
}

export function calcularTotal(subtotal: number, impuestos: number): number {
  return subtotal + impuestos;
}

export function requiereJustificativo(
  cantidadRecibida: number,
  cantidadOrdenada: number,
): boolean {
  return cantidadRecibida !== cantidadOrdenada;
}

export function calcularPendiente(
  cantidad: number,
  cantidadRecibida: number,
): number {
  const pendiente = cantidad - cantidadRecibida;
  return pendiente > 0 ? pendiente : 0;
}

export function tieneDiferencia(
  cantidadRecibida: number,
  cantidadAnteriorRecibida: number,
  cantidadOrdenada: number,
): boolean {
  return cantidadRecibida > 0 && cantidadAnteriorRecibida + cantidadRecibida !== cantidadOrdenada;
}
