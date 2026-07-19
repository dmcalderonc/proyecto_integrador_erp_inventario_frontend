import { useQuery } from '@tanstack/react-query';
import { FolderOpen, ClipboardList, DollarSign } from 'lucide-react';
import api from '../../api/http';

interface DashboardKpis {
    proyectosActivos: number;
    requerimientosPendientes: number;
    valorizacionTotalInventario: number;
}

export default function DashboardPage() {
    const { data: kpis, isLoading, isError } = useQuery({
        queryKey: ['dashboardKpis'],
        queryFn: async () => {
            const res = await api.get<DashboardKpis>('/dashboard/kpis');
            return res.data;
        },
    });

    if (isLoading) {
        return (
            <div>
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
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
                <p className="text-sm mt-1">Por favor, comprueba tu conexión o contacta a soporte.</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Card: Proyectos Activos */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                        <FolderOpen size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Proyectos Activos</p>
                        <p className="text-2xl font-bold text-gray-900">{kpis?.proyectosActivos ?? 0}</p>
                    </div>
                </div>

                {/* Card: Requerimientos Pendientes */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4">
                    <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                        <ClipboardList size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Requerimientos Pendientes</p>
                        <p className="text-2xl font-bold text-gray-900">{kpis?.requerimientosPendientes ?? 0}</p>
                    </div>
                </div>

                {/* Card: Valorización Total Inventario */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-lg text-green-600">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Valorización Inventario</p>
                        <p className="text-2xl font-bold text-gray-900">
                            ${(kpis?.valorizacionTotalInventario ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}