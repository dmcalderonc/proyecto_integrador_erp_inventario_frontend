import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  AlertOctagon,
  Minus,
  Sparkles,
  RefreshCw,
  PackageSearch,
  TrendingUp,
} from 'lucide-react';
import api from '../../api/http';
import { useAuth } from '../../contexts/AuthContext';
import { usePrevision, useGenerarAlertas } from '../../store/usePrevision';
import { QuiebreCard } from '../../components/prevision/QuiebreCard';
import { TendenciaChart } from '../../components/prevision/TendenciaChart';
import { ordenarPorUrgencia, topUrgentes } from './PrevisionPage.logic';
import { getBadgeStyle } from '../../lib/design-tokens';
import { cn } from '../../lib/utils';

const VENTANAS = [
  { valor: 15, etiqueta: '15 días' },
  { valor: 30, etiqueta: '30 días' },
  { valor: 60, etiqueta: '60 días' },
  { valor: 90, etiqueta: '90 días' },
];

const UMBRALES = [
  { valor: 3, etiqueta: 'Estricto' },
  { valor: 7, etiqueta: 'Estándar' },
  { valor: 15, etiqueta: 'Conservador' },
];

type ClaveResumen =
  | 'totalMateriales' | 'agotados' | 'criticos' | 'riesgo'
  | 'estables' | 'sinDatos' | 'anomalias' | 'criticosSinCobertura';

interface Bodega {
  id: number;
  nombre: string;
}

export default function PrevisionPage() {
  const { user, hasRole } = useAuth();
  const puedeGenerarAlertas = hasRole(['ADMIN']);
  const esBodeguero = user?.rol === 'BODEGUERO';

  const [searchParams, setSearchParams] = useSearchParams();
  const dias = Number(searchParams.get('dias')) || 30;
  const umbralCritico = Number(searchParams.get('umbralCritico')) || 7;
  const umbralRiesgo = Number(searchParams.get('umbralRiesgo')) || 15;
  const soloAlertas = searchParams.get('soloAlertas') === 'true';

  const [bodegaId, setBodegaId] = useState<number | ''>('');

  const { materiales, resumen, isLoading, isFetching, isError, error, refetch } = usePrevision({
    dias,
    umbralCritico,
    umbralRiesgo,
    soloAlertas,
    bodegaId: bodegaId === '' ? undefined : bodegaId,
  });

  const generarAlertas = useGenerarAlertas();

  const { data: bodegasData } = useQuery({
    queryKey: ['bodegas', 'lista-corta'],
    queryFn: async () => {
      const res = await api.get<Bodega[]>('/bodegas');
      return res.data;
    },
    staleTime: 5 * 60_000,
  });

  const bodegas = useMemo(() => {
    const todas = Array.isArray(bodegasData) ? bodegasData : [];
    if (!esBodeguero) return todas;
    const asignadas = Array.isArray(user?.bodegaIds) ? user.bodegaIds : [];
    return todas.filter(b => asignadas.includes(b.id));
  }, [bodegasData, esBodeguero, user?.bodegaIds]);

  const setParam = (clave: string, valor: string) => {
    const siguiente = new URLSearchParams(searchParams);
    siguiente.set(clave, valor);
    setSearchParams(siguiente, { replace: true });
  };

  const ordenados = useMemo(() => ordenarPorUrgencia(materiales), [materiales]);
  const masUrgentes = useMemo(() => topUrgentes(materiales, 8), [materiales]);

  const tarjetas: { clave: ClaveResumen; titulo: string; icono: typeof AlertTriangle; estilo: string }[] = [
    { clave: 'agotados', titulo: 'Agotados', icono: AlertOctagon, estilo: getBadgeStyle('RECHAZADO') },
    { clave: 'criticos', titulo: 'Críticos', icono: AlertTriangle, estilo: getBadgeStyle('ALTA') },
    { clave: 'riesgo', titulo: 'En riesgo', icono: AlertTriangle, estilo: getBadgeStyle('MEDIA') },
    { clave: 'sinDatos', titulo: 'Sin datos', icono: Minus, estilo: getBadgeStyle('PENDIENTE') },
    { clave: 'anomalias', titulo: 'Anomalías', icono: Sparkles, estilo: getBadgeStyle('EN_EVALUACION') },
    { clave: 'totalMateriales', titulo: 'Evaluados', icono: PackageSearch, estilo: getBadgeStyle('BORRADOR') },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Previsión de stock</h1>
          <p className="text-sm text-text-muted">
            Detección de quiebres y tendencia de demanda · ventana de {dias} días ·{' '}
            {esBodeguero ? 'bodegas asignadas' : 'alcance global'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-elevated px-3 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary disabled:opacity-50"
          >
            <RefreshCw size={15} className={cn(isFetching && 'animate-spin')} />
            Actualizar
          </button>
          {puedeGenerarAlertas ? (
            <button
              type="button"
              onClick={() => generarAlertas.mutate(bodegaId === '' ? undefined : bodegaId)}
              disabled={generarAlertas.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <AlertTriangle size={15} />
              {generarAlertas.isPending ? 'Generando…' : 'Generar alertas'}
            </button>
          ) : null}
        </div>
      </header>

      <section className="rounded-xl border border-border-subtle bg-elevated p-4">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <label className="space-y-1.5">
            <span className="block text-xs font-medium text-text-muted">Ventana de análisis</span>
            <div className="flex rounded-lg border border-border-subtle bg-base p-0.5">
              {VENTANAS.map(v => (
                <button
                  key={v.valor}
                  type="button"
                  onClick={() => setParam('dias', String(v.valor))}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    dias === v.valor ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary',
                  )}
                >
                  {v.etiqueta}
                </button>
              ))}
            </div>
          </label>

          <label className="space-y-1.5">
            <span className="block text-xs font-medium text-text-muted">Umbral de alerta</span>
            <div className="flex rounded-lg border border-border-subtle bg-base p-0.5">
              {UMBRALES.map(u => (
                <button
                  key={u.valor}
                  type="button"
                  onClick={() => {
                    const siguiente = new URLSearchParams(searchParams);
                    siguiente.set('umbralCritico', String(u.valor));
                    siguiente.set('umbralRiesgo', String(u.valor === 3 ? 7 : u.valor === 7 ? 15 : 30));
                    setSearchParams(siguiente, { replace: true });
                  }}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    umbralCritico === u.valor ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary',
                  )}
                >
                  {u.etiqueta}
                </button>
              ))}
            </div>
          </label>

          {bodegas.length > 0 ? (
            <label className="space-y-1.5">
              <span className="block text-xs font-medium text-text-muted">Bodega</span>
              <select
                value={bodegaId}
                onChange={e => setBodegaId(e.target.value === '' ? '' : Number(e.target.value))}
                className="rounded-lg border border-border-subtle bg-base px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              >
                <option value="">{esBodeguero && bodegas.length > 1 ? 'Todas mis bodegas' : 'Global'}</option>
                {bodegas.map(b => (
                  <option key={b.id} value={b.id}>{b.nombre}</option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="flex items-center gap-2 pb-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={soloAlertas}
              onChange={e => setParam('soloAlertas', String(e.target.checked))}
              className="h-4 w-4 rounded border-border-default accent-[var(--color-accent,#3B82F6)]"
            />
            Solo alertas
          </label>
        </div>
      </section>

      {isError ? (
        <div className="rounded-xl border border-danger/30 bg-danger-bg px-4 py-3 text-sm text-danger">
          No se pudo calcular la previsión:{' '}
          {(error as any)?.response?.data?.message ?? (error as any)?.message ?? 'error desconocido'}
        </div>
      ) : null}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {tarjetas.map(({ clave, titulo, icono: Icono, estilo }) => (
          <div key={clave} className="rounded-xl border border-border-subtle bg-elevated p-4">
            <p className="flex items-center gap-1.5 text-xs text-text-muted">
              <Icono size={13} />
              {titulo}
            </p>
            <p className={cn('mt-1.5 text-2xl font-semibold', estilo)}>
              {isLoading ? '—' : (resumen?.[clave] ?? 0)}
            </p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">
              Materiales más urgentes
              <span className="ml-2 font-normal text-text-muted">({materiales.length})</span>
            </h2>
            {isFetching && !isLoading ? (
              <span className="text-xs text-text-muted">Actualizando…</span>
            ) : null}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map(i => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-elevated" />
              ))}
            </div>
          ) : ordenados.length === 0 ? (
            <div className="rounded-xl border border-border-subtle bg-elevated px-6 py-12 text-center">
              <PackageSearch size={28} className="mx-auto text-text-muted" />
              <p className="mt-3 text-sm font-medium text-text-primary">Sin materiales para mostrar</p>
              <p className="mt-1 text-xs text-text-muted">
                Ajusta la ventana, el umbral o quita el filtro «Solo alertas».
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {ordenados.map(m => (
                <QuiebreCard key={`${m.materialId}-${m.bodegaId ?? 'global'}`} material={m} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3 rounded-xl border border-border-subtle bg-elevated p-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={15} className="text-accent" />
            <h2 className="text-sm font-semibold text-text-primary">Tendencia de consumo</h2>
          </div>
          <p className="text-xs text-text-muted">
            Consumo semanal de los materiales más urgentes (últimas 4 semanas).
          </p>
          {isLoading ? (
            <div className="h-64 animate-pulse rounded-lg bg-base" />
          ) : (
            <TendenciaChart materiales={masUrgentes} cantidad={3} />
          )}
        </section>
      </div>
    </div>
  );
}
