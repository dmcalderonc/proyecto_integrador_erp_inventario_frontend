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

const PIE_COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];

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
      <div>
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse border border-gray-100">
              <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center border border-red-100">
        <p className="font-medium">Error al cargar los datos del dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><Users size={22} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Usuarios</p>
            <p className="text-2xl font-bold text-gray-900">{kpis?.totalUsuarios ?? 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
          <div className="bg-cyan-100 p-3 rounded-lg text-cyan-600"><Tags size={22} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Categorías</p>
            <p className="text-2xl font-bold text-gray-900">{kpis?.totalCategorias ?? 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
          <div className="bg-rose-100 p-3 rounded-lg text-rose-600"><Package size={22} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Materiales</p>
            <p className="text-2xl font-bold text-gray-900">{kpis?.totalMateriales ?? 0}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><FolderOpen size={22} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Proyectos Activos</p>
            <p className="text-2xl font-bold text-gray-900">{kpis?.proyectosActivos ?? 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
          <div className="bg-orange-100 p-3 rounded-lg text-orange-600"><ClipboardList size={22} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Requerimientos Pendientes</p>
            <p className="text-2xl font-bold text-gray-900">{kpis?.requerimientosPendientes ?? 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-600"><DollarSign size={22} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Valorización Inventario</p>
            <p className="text-2xl font-bold text-gray-900">
              ${(kpis?.valorizacionTotalInventario ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Actividad por Módulo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-blue-600" />
            <h2 className="font-semibold text-gray-800">Actividad por Módulo</h2>
          </div>
          {modulosData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={modulosData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-sm text-gray-400">Sin datos disponibles</div>
          )}
        </div>

        {/* Pie Chart - Acciones Recientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-purple-600" />
            <h2 className="font-semibold text-gray-800">Tipos de Acción</h2>
          </div>
          {accionesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={accionesData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name.substring(0, 10)} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {accionesData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-sm text-gray-400">Sin datos disponibles</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas de Stock Bajo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="font-semibold text-gray-800">Alertas de Stock Bajo</h2>
          </div>
          {alertas.length > 0 ? (
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {alertas.map(a => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.material?.nombre || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{a.bodega?.nombre || 'N/A'} · {a.material?.sku}</p>
                  </div>
                  <span className="text-sm font-bold text-amber-600">{a.cantidad_disponible} uds</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-gray-400">No hay alertas de stock</div>
          )}
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-green-600" />
            <h2 className="font-semibold text-gray-800">Actividad Reciente</h2>
          </div>
          {timeline.length > 0 ? (
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {timeline.map(log => (
                <div key={log._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{log.accion?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{log.modulo} · {log.usuario_id}</p>
                    <p className="text-xs text-gray-400">{formatTime(log)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-gray-400">Sin actividad reciente</div>
          )}
        </div>
      </div>
    </div>
  );
}
