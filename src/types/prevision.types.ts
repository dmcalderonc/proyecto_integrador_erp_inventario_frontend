export type NivelQuiebre = 'AGOTADO' | 'CRITICO' | 'RIESGO' | 'ESTABLE' | 'SIN_DATOS';

export type Tendencia = 'SUBE' | 'BAJA' | 'ESTABLE';

export interface PuntoSerie {
  semana: string;
  consumo: number;
}

export interface PrevisionMaterial {
  materialId: number;
  nombre: string;
  sku: string;
  unidad?: string;
  categoria?: string;
  bodegaId?: number;
  bodegaNombre?: string;
  stockActual: number;
  stockReservado: number;
  stockEfectivo: number;
  consumoPromedio: number;
  diasHastaAgotar: number | null;
  nivel: NivelQuiebre;
  tendencia: Tendencia;
  pendiente: number;
  serieSemanal: PuntoSerie[];
  esAnomalo: boolean;
  z: number | null;
  variacionPct: number | null;
  salidasEnVentana: number;
  diasHistoria: number;
}

export interface ResumenPrevision {
  totalMateriales: number;
  agotados: number;
  criticos: number;
  riesgo: number;
  estables: number;
  sinDatos: number;
  anomalias: number;
  criticosSinCobertura: number;
}

export interface PrevisionResponse {
  generadoEn: string;
  ventanaDias: number;
  alcance: { bodegaId: number | null; nivel: 'GLOBAL' | 'BODEGA' };
  resumen: ResumenPrevision;
  materiales: PrevisionMaterial[];
}

export interface AlertaGenerada {
  materialId: number;
  nivel: NivelQuiebre;
  diasHastaAgotar: number | null;
  titulo: string;
  mensaje: string;
  notificada: boolean;
}

export interface ResultadoAlertas {
  evaluados: number;
  alertasGeneradas: number;
  alertasOmitidasPorDuplicado: number;
  alertas: AlertaGenerada[];
}

export interface PrediccionParams {
  dias?: number;
  umbralCritico?: number;
  umbralRiesgo?: number;
  soloAlertas?: boolean;
  bodegaId?: number;
  limite?: number;
}
