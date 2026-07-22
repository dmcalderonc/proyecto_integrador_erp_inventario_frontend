import { useInventario } from '../../store/useInventario';
import { Package } from 'lucide-react';
import type { Inventario } from '../../types';
import { cn } from '../../lib/utils';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';

export default function InventarioPage() {
    const { inventario, isLoading } = useInventario();

    const columns: Column<Inventario>[] = [
        {
            key: 'material', header: 'Material',
            render: (item: Inventario) => <span className="font-bold text-text-primary">{item.material?.nombre ?? 'N/A'}</span>,
        },
        {
            key: 'sku', header: 'SKU',
            render: (item: Inventario) => (
                <span className="font-mono text-xs bg-base text-success px-2.5 py-1 rounded-lg border border-border-subtle font-semibold">
                    {item.material?.sku ?? '-'}
                </span>
            ),
        },
        {
            key: 'bodega', header: 'Bodega',
            render: (item: Inventario) => <span className="text-text-primary font-medium">{item.bodega?.nombre ?? 'N/A'}</span>,
        },
        {
            key: 'ubicacion', header: 'Ubicación',
            render: (item: Inventario) => <span className="text-text-secondary text-xs">{item.bodega?.ubicacion ?? '-'}</span>,
        },
        {
            key: 'cantidad_disponible', header: 'Stock Disponible',
            render: (item: Inventario) => (
                <span className={cn(
                    "inline-flex items-center px-3 py-1 rounded-xl font-bold text-xs border",
                    item.cantidad_disponible === 0
                        ? "bg-danger-bg text-danger border-danger/30"
                        : "bg-success-bg text-success border-success/30"
                )}>
                    {item.cantidad_disponible}
                </span>
            ),
        },
        {
            key: 'cantidad_reservada', header: 'Stock Reservado',
            render: (item: Inventario) => (
                <span className={cn(
                    "inline-flex items-center px-3 py-1 rounded-xl font-bold text-xs border",
                    item.cantidad_reservada > 0
                        ? "bg-warning-bg text-warning border-warning/30"
                        : "bg-elevated text-text-muted border-border-default"
                )}>
                    {item.cantidad_reservada}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Inventario Consolidado</h1>
                    <p className="text-sm text-text-secondary mt-1">Visualización global y disponibilidad de existencias por bodega.</p>
                </div>
            </div>

            <div className="bg-surface rounded-xl border border-border-subtle p-6">
                <DataTable
                    columns={columns}
                    data={inventario}
                    loading={isLoading}
                    searchable
                    searchKeys={["material", "sku"]}
                />
            </div>
        </div>
    );
}
