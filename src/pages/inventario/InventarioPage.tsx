import { useState } from 'react';
import { useInventario } from '../../store/useInventario';
import { Search } from 'lucide-react';
import type { Inventario } from '../../types';
import { cn } from '../../lib/utils';

export default function InventarioPage() {
    const { inventario, isLoading } = useInventario();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredInventario = inventario.filter((item: Inventario) => {
        const term = searchTerm.toLowerCase();
        const matName = item.material?.nombre?.toLowerCase() || '';
        const sku = item.material?.sku?.toLowerCase() || '';
        return matName.includes(term) || sku.includes(term);
    });

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Inventario Consolidado</h1>

                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por material o SKU..."
                        className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-100">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-r-transparent"></div>
                    <p className="mt-2 text-sm text-gray-500">Cargando inventario...</p>
                </div>
            ) : filteredInventario.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500 border border-gray-100">
                    No hay registros en el inventario{searchTerm && ' que coincidan con tu búsqueda.'}
                </div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-100">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-4 py-3 font-medium text-gray-600">Material</th>
                                <th className="px-4 py-3 font-medium text-gray-600">SKU</th>
                                <th className="px-4 py-3 font-medium text-gray-600">Bodega</th>
                                <th className="px-4 py-3 font-medium text-gray-600">Ubicación</th>
                                <th className="px-4 py-3 font-medium text-gray-600 text-right">Stock Disponible</th>
                                <th className="px-4 py-3 font-medium text-gray-600 text-right">Stock Reservado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInventario.map((item: Inventario) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">{item.material?.nombre ?? 'N/A'}</td>
                                    <td className="px-4 py-3 text-gray-600">{item.material?.sku ?? '-'}</td>
                                    <td className="px-4 py-3 text-gray-600">{item.bodega?.nombre ?? 'N/A'}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{item.bodega?.ubicacion ?? '-'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-0.5 rounded-full font-bold text-xs",
                                            item.cantidad_disponible === 0
                                                ? "bg-red-100 text-red-700"
                                                : "bg-green-100 text-green-700"
                                        )}>
                                            {item.cantidad_disponible}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-0.5 rounded-full font-bold text-xs",
                                            item.cantidad_reservada > 0
                                                ? "bg-orange-100 text-orange-700"
                                                : "text-gray-400"
                                        )}>
                                            {item.cantidad_reservada}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}