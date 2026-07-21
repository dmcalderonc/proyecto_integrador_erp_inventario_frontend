import { useQuery } from '@tanstack/react-query';
import { FolderOpen, ClipboardList, DollarSign, Activity, AlertTriangle, TrendingUp, Users, Tags, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../api/http';

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

const PIE_COLORS = ['#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

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
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  })();

  const accionesData = (() => {
    const counts: Record<string, number> = {};
    timeline.forEach(log => {
      const acc = log.accion || 'Otro';
      counts[acc] = (counts[acc] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  })();

  const formatTime = (log: AuditLog) => {
    const d = log.fecha || log.createdAt;
    if (!d) return '';
    return new Date(d).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-extrabold text-[#FFFFFF]">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-[#111D4A] rounded-3xl border border-[#334155] p-6 animate-pulse shadow-2xl">
              <div className="h-10 w-10 bg-[#1E293B] rounded-xl mb-4"></div>
              <div className="h-4 bg-[#1E293B] rounded-lg w-1/2 mb-2"></div>
              <div className="h-8 bg-[#1E293B] rounded-xl w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-500/10 text-red-400 p-6 rounded-3xl text-center border border-red-500/30">
        <p className="font-semibold text-lg">Error al cargar los datos del dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-[#FFFFFF] mb-2">Dashboard</h1>
        <p className="text-[#94A3B8] text-sm">Resumen general y métricas clave de tu sistema de inventario.</p>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl p-6 border border-[#334155] shadow-2xl flex items-center gap-4 hover:border-[#334155]/80 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Total Usuarios</p>
            <p className="text-3xl font-extrabold text-[#FFFFFF] mt-1">{kpis?.totalUsuarios ?? 0}</p>
          </div>
        </div>

        <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl p-6 border border-[#334155] shadow-2xl flex items-center gap-4 hover:border-[#334155]/80 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4] shrink-0">
            <Tags size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Categorías</p>
            <p className="text-3xl font-extrabold text-[#FFFFFF] mt-1">{kpis?.totalCategorias ?? 0}</p>
          </div>
        </div>

        <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl p-6 border border-[#334155] shadow-2xl flex items-center gap-4 hover:border-[#334155]/80 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Total Materiales</p>
            <p className="text-3xl font-extrabold text-[#FFFFFF] mt-1">{kpis?.totalMateriales ?? 0}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl p-6 border border-[#334155] shadow-2xl flex items-center gap-4 hover:border-[#334155]/80 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
            <FolderOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Proyectos Activos</p>
            <p className="text-3xl font-extrabold text-[#FFFFFF] mt-1">{kpis?.proyectosActivos ?? 0}</p>
          </div>
        </div>

        <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl p-6 border border-[#334155] shadow-2xl flex items-center gap-4 hover:border-[#334155]/80 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Requerimientos Pendientes</p>
            <p className="text-3xl font-extrabold text-[#FFFFFF] mt-1">{kpis?.requerimientosPendientes ?? 0}</p>
          </div>
        </div>

        <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl p-6 border border-[#334155] shadow-2xl flex items-center gap-4 hover:border-[#334155]/80 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shrink-0">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Valorización Inventario</p>
            <p className="text-3xl font-extrabold text-[#10B981] mt-1">
              ${(kpis?.valorizacionTotalInventario ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Actividad por Módulo */}
        <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-6 shadow-2xl">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-center justify-center text-[#06B6D4]">
              <TrendingUp size={18} />
            </div>
            <h2 className="font-bold text-[#FFFFFF] text-lg">Actividad por Módulo</h2>
          </div>
          {modulosData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={modulosData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="#334155" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="#334155" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A1128', borderColor: '#334155', borderRadius: '12px', color: '#FFFFFF' }}
                  itemStyle={{ color: '#06B6D4' }}
                />
                <Bar dataKey="value" fill="#06B6D4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-[#94A3B8]">Sin datos disponibles</div>
          )}
        </div>

        {/* Pie Chart - Acciones Recientes */}
        <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-6 shadow-2xl">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Activity size={18} />
            </div>
            <h2 className="font-bold text-[#FFFFFF] text-lg">Tipos de Acción</h2>
          </div>
          {accionesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie 
                  data={accionesData} 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  dataKey="value" 
                  label={({ name, percent }) => `${(name ?? '').substring(0, 10)} ${((percent ?? 0) * 100).toFixed(0)}%`} 
                  labelLine={false}
                >
                  {accionesData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A1128', borderColor: '#334155', borderRadius: '12px', color: '#FFFFFF' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94A3B8' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-[#94A3B8]">Sin datos disponibles</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas de Stock Bajo */}
        <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-6 shadow-2xl">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle size={18} />
            </div>
            <h2 className="font-bold text-[#FFFFFF] text-lg">Alertas de Stock Bajo</h2>
          </div>
          {alertas.length > 0 ? (
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {alertas.map(a => (
                <div key={a.id} className="flex items-center justify-between p-4 bg-[#0A1128] rounded-2xl border border-amber-500/30">
                  <div>
                    <p className="text-sm font-bold text-[#FFFFFF]">{a.material?.nombre || 'N/A'}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{a.bodega?.nombre || 'N/A'} · SKU: {a.material?.sku}</p>
                  </div>
                  <span className="text-xs font-extrabold bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-xl border border-amber-500/30">
                    {a.cantidad_disponible} uds
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-[#94A3B8]">No hay alertas de stock</div>
          )}
        </div>

        {/* Actividad Reciente */}
        <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-6 shadow-2xl">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
              <Activity size={18} />
            </div>
            <h2 className="font-bold text-[#FFFFFF] text-lg">Actividad Reciente</h2>
          </div>
          {timeline.length > 0 ? (
            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {timeline.map(log => (
                <div key={log._id} className="flex items-start gap-3.5 p-3.5 bg-[#0A1128] rounded-2xl border border-[#334155]">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] mt-2 shrink-0 animate-pulse"></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#FFFFFF] truncate">{log.accion?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">{log.modulo} · Usuario: {log.usuario_id}</p>
                    <p className="text-[11px] text-[#94A3B8]/60 mt-1">{formatTime(log)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-[#94A3B8]">Sin actividad reciente</div>
          )}
        </div>
      </div>
    </div>
  );
}