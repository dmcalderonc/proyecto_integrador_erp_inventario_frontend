import { useQuery } from '@tanstack/react-query';
import { FolderOpen, ClipboardList, DollarSign, Activity, AlertTriangle, TrendingUp, Users, Tags, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../api/http';
import { getBadgeStyle } from '../../lib/design-tokens';

interface DashboardKpis {
  proyectosActivos: number;
  requerimientosPendientes: number;
  valorizacionTotalInventario: number;
  totalUsuarios: number;
  totalCategorias: number;
  totalMateriales: number;
}

interface AuditLog {
  _id: string;
  usuario_id: string;
  accion: string;
  modulo: string;
  detalles: any;
  fecha?: string;
  createdAt?: string;
}

interface AlertaStock {
  id: number;
  cantidad_disponible: number;
  material?: { nombre: string; sku: string };
  bodega?: { nombre: string };
}

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function DashboardPage() {
  const { data: kpis, isLoading, isError } = useQuery({
    queryKey: ['dashboardKpis'],
    queryFn: async () => {
      const res = await api.get<DashboardKpis>('/dashboard/kpis');
      return res.data;
    },
  });

  const { data: alertas = [] } = useQuery({
    queryKey: ['dashboardAlertas'],
    queryFn: async () => {
      const res = await api.get<AlertaStock[]>('/dashboard/alertas-stock?umbral=10');
      return res.data;
    },
  });

  const { data: timeline = [] } = useQuery({
    queryKey: ['dashboardTimeline'],
    queryFn: async () => {
      const res = await api.get<AuditLog[]>('/dashboard/linea-tiempo');
      return res.data;
    },
  });

  const modulosData = (() => {
    const counts: Record<string, number> = {};
    timeline.forEach(log => {
      const mod = log.modulo || 'Otro';
      counts[mod] = (counts[mod] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  })();

  const accionesData = (() => {
    const counts: Record<string, number> = {};
    timeline.forEach(log => {
      const acc = log.accion || 'Otro';
      counts[acc] = (counts[acc] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value })).sort((a, b) => b.value - a.value).slice(0, 6);
  })();

  const formatTime = (log: AuditLog) => {
    const d = log.fecha || log.createdAt;
    if (!d) return '';
    return new Date(d).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">Resumen general del sistema</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-surface rounded-xl border border-border-subtle p-6 animate-pulse">
              <div className="h-10 w-10 bg-elevated rounded-xl mb-4" />
              <div className="h-4 bg-elevated rounded-lg w-1/2 mb-2" />
              <div className="h-8 bg-elevated rounded-lg w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-danger-bg text-danger p-6 rounded-xl text-center border border-danger/20">
        <p className="font-semibold">Error al cargar los datos del dashboard.</p>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Usuarios', value: kpis?.totalUsuarios ?? 0, icon: Users, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    { label: 'Categorías', value: kpis?.totalCategorias ?? 0, icon: Tags, color: 'text-accent bg-accent/10 border-accent/20' },
    { label: 'Materiales', value: kpis?.totalMateriales ?? 0, icon: Package, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { label: 'Proyectos Activos', value: kpis?.proyectosActivos ?? 0, icon: FolderOpen, color: 'text-info bg-info-bg border-info/20' },
    { label: 'Requerimientos Pend.', value: kpis?.requerimientosPendientes ?? 0, icon: ClipboardList, color: 'text-warning bg-warning-bg border-warning/20' },
    { label: 'Valorización Inventario', value: `$${(kpis?.valorizacionTotalInventario ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-success bg-success-bg border-success/20', isCurrency: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary mt-1">Resumen general y métricas clave</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="bg-surface rounded-xl border border-border-subtle p-5 flex items-center gap-4 hover:border-border-default transition-all">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${kpi.color}`}>
              <kpi.icon size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{kpi.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${kpi.isCurrency ? 'text-success' : 'text-text-primary'}`}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-surface rounded-xl border border-border-subtle p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <TrendingUp size={16} />
            </div>
            <h2 className="font-semibold text-text-primary">Actividad por Módulo</h2>
          </div>
          {modulosData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={modulosData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#1E293B" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6B7280' }} stroke="#1E293B" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#1E293B', borderRadius: '12px', color: '#F9FAFB' }} />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-sm text-text-muted">Sin datos</div>
          )}
        </div>

        <div className="bg-surface rounded-xl border border-border-subtle p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Activity size={16} />
            </div>
            <h2 className="font-semibold text-text-primary">Tipos de Acción</h2>
          </div>
          {accionesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={accionesData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${(name ?? '').substring(0, 10)} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                  {accionesData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#1E293B', borderRadius: '12px', color: '#F9FAFB' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#9CA3AF' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-sm text-text-muted">Sin datos</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-surface rounded-xl border border-border-subtle p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-warning-bg border border-warning/20 flex items-center justify-center text-warning">
              <AlertTriangle size={16} />
            </div>
            <h2 className="font-semibold text-text-primary">Alertas de Stock Bajo</h2>
          </div>
          {alertas.length > 0 ? (
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {alertas.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-base rounded-xl border border-border-subtle">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{a.material?.nombre || 'N/A'}</p>
                    <p className="text-xs text-text-muted">{a.bodega?.nombre} · {a.material?.sku}</p>
                  </div>
                  <span className="text-xs font-bold bg-warning-bg text-warning px-2.5 py-1 rounded-lg border border-warning/20 shrink-0 ml-3">
                    {a.cantidad_disponible}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-text-muted">Sin alertas</div>
          )}
        </div>

        <div className="bg-surface rounded-xl border border-border-subtle p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-success-bg border border-success/20 flex items-center justify-center text-success">
              <Activity size={16} />
            </div>
            <h2 className="font-semibold text-text-primary">Actividad Reciente</h2>
          </div>
          {timeline.length > 0 ? (
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {timeline.map(log => (
                <div key={log._id} className="flex items-start gap-3 p-3 bg-base rounded-xl border border-border-subtle">
                  <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">{log.accion?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-text-muted mt-0.5">{log.modulo} · {log.usuario_id}</p>
                    <p className="text-[11px] text-text-muted/60 mt-0.5">{formatTime(log)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-text-muted">Sin actividad</div>
          )}
        </div>
      </div>
    </div>
  );
}
