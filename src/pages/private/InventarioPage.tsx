import React, { useState } from 'react';
import { useInventario } from '../../store/useInventario';
import { Search, Package } from 'lucide-react';
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
        <div className="space-y-8 animate-fade-in">
            {/* Header de la sección */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[#FFFFFF] mb-2">Inventario Consolidado</h1>
                    <p className="text-[#94A3B8] text-sm">Visualización global y disponibilidad de existencias por bodega.</p>
                </div>

                {/* Buscador */}
                <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-[#94A3B8]" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por material o SKU..."
                        className="block w-full pl-10 pr-4 py-2.5 bg-[#111D4A] text-[#FFFFFF] border border-[#334155] rounded-xl text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all shadow-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                /* Estado de Carga */
                <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-12 text-center shadow-2xl">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#06B6D4] border-r-transparent mb-3"></div>
                    <p className="text-sm font-medium text-[#94A3B8]">Cargando inventario...</p>
                </div>
            ) : filteredInventario.length === 0 ? (
                /* Estado Vacío */
                <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-12 text-center text-[#94A3B8] shadow-2xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-[#334155] mb-4 text-[#94A3B8]">
                        <Package size={36} />
                    </div>
                    <p className="text-[#FFFFFF] font-bold text-lg mb-1">No hay registros en el inventario</p>
                    <p className="text-sm text-[#94A3B8]">
                        {searchTerm ? 'No se encontraron resultados que coincidan con tu búsqueda.' : 'Aún no existen existencias registradas en el sistema.'}
                    </p>
                </div>
            ) : (
                /* Tabla de Inventario Consolidado */
                <div className="overflow-x-auto bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] shadow-2xl">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[#0A1128] border-b border-[#334155]">
                            <tr>
                                <th className="px-5 py-4 font-semibold text-[#FFFFFF]">Material</th>
                                <th className="px-5 py-4 font-semibold text-[#FFFFFF]">SKU</th>
                                <th className="px-5 py-4 font-semibold text-[#FFFFFF]">Bodega</th>
                                <th className="px-5 py-4 font-semibold text-[#FFFFFF]">Ubicación</th>
                                <th className="px-5 py-4 font-semibold text-[#FFFFFF] text-right">Stock Disponible</th>
                                <th className="px-5 py-4 font-semibold text-[#FFFFFF] text-right">Stock Reservado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#334155]">
                            {filteredInventario.map((item: Inventario) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-5 py-4 font-bold text-[#FFFFFF]">{item.material?.nombre ?? 'N/A'}</td>
                                    <td className="px-5 py-4">
                                        <span className="font-mono text-xs bg-[#0A1128] text-[#10B981] px-2.5 py-1 rounded-lg border border-[#334155] font-semibold">
                                            {item.material?.sku ?? '-'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-[#FFFFFF] font-medium">{item.bodega?.nombre ?? 'N/A'}</td>
                                    <td className="px-5 py-4 text-[#94A3B8] text-xs">{item.bodega?.ubicacion ?? '-'}</td>
                                    <td className="px-5 py-4 text-right">
                                        <span className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-xl font-bold text-xs border",
                                            item.cantidad_disponible === 0
                                                ? "bg-red-500/10 text-red-400 border-red-500/30"
                                                : "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30"
                                        )}>
                                            {item.cantidad_disponible}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <span className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-xl font-bold text-xs border",
                                            item.cantidad_reservada > 0
                                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                                : "bg-[#0A1128] text-[#94A3B8]/60 border-[#334155]"
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