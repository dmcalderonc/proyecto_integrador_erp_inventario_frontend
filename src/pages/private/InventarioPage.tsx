import { useInventario } from '../../store/useInventario';
import { Search, Package } from 'lucide-react';
import type { Inventario } from '../../types';
import { cn } from '../../lib/utils';
import { useState } from 'react';

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
        <div className="space-y-10 animate-fade-in">
            {/* Header de la sección */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-card-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>Inventario Consolidado</h1>
                    <p className="text-muted-foreground text-sm">Visualización global y disponibilidad de existencias por bodega.</p>
                </div>

                {/* Buscador */}
                <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por material o SKU..."
                        className="block w-full pl-10 pr-4 py-2.5 bg-card text-card-foreground border border-border rounded-xl text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                /* Estado de Carga */
                <div className="bg-card backdrop-blur-lg rounded-3xl border border-border p-12 text-center shadow-2xl">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-accent border-r-transparent mb-3"></div>
                    <p className="text-sm font-medium text-muted-foreground">Cargando inventario...</p>
                </div>
            ) : filteredInventario.length === 0 ? (
                /* Estado Vacío */
                <div className="bg-card backdrop-blur-lg rounded-3xl border border-border p-12 text-center text-muted-foreground shadow-2xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 border border-border mb-4 text-muted-foreground">
                        <Package size={36} />
                    </div>
                    <p className="text-card-foreground font-bold text-lg mb-1">No hay registros en el inventario</p>
                    <p className="text-sm text-muted-foreground">
                        {searchTerm ? 'No se encontraron resultados que coincidan con tu búsqueda.' : 'Aún no existen existencias registradas en el sistema.'}
                    </p>
                </div>
            ) : (
                /* Tabla de Inventario Consolidado */
                <div className="overflow-x-auto bg-card backdrop-blur-lg rounded-3xl border border-border shadow-2xl">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-background border-b border-border">
                            <tr>
                                <th className="px-5 py-4 font-semibold text-card-foreground">Material</th>
                                <th className="px-5 py-4 font-semibold text-card-foreground">SKU</th>
                                <th className="px-5 py-4 font-semibold text-card-foreground">Bodega</th>
                                <th className="px-5 py-4 font-semibold text-card-foreground">Ubicación</th>
                                <th className="px-5 py-4 font-semibold text-card-foreground text-right">Stock Disponible</th>
                                <th className="px-5 py-4 font-semibold text-card-foreground text-right">Stock Reservado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredInventario.map((item: Inventario) => (
                                <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-black/5 dark:bg-white/5 transition-colors">
                                    <td className="px-5 py-4 font-bold text-card-foreground">{item.material?.nombre ?? 'N/A'}</td>
                                    <td className="px-5 py-4">
                                        <span className="font-mono text-xs bg-background text-primary px-2.5 py-1 rounded-lg border border-border font-semibold">
                                            {item.material?.sku ?? '-'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-card-foreground font-medium">{item.bodega?.nombre ?? 'N/A'}</td>
                                    <td className="px-5 py-4 text-muted-foreground text-xs">{item.bodega?.ubicacion ?? '-'}</td>
                                    <td className="px-5 py-4 text-right">
                                        <span className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-xl font-bold text-xs border",
                                            item.cantidad_disponible === 0
                                                ? "bg-red-500/10 text-red-400 border-red-500/30"
                                                : "bg-primary/10 text-primary border-primary/30"
                                        )}>
                                            {item.cantidad_disponible}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <span className={cn(
                                            "inline-flex items-center px-3 py-1 rounded-xl font-bold text-xs border",
                                            item.cantidad_reservada > 0
                                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                                : "bg-background text-muted-foreground/60 border-border"
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