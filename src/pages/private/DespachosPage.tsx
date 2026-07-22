import React, { useState } from 'react';
import { useDespachos } from '../../store/useDespachos';
import { useCompras } from '../../store/useCompras';
import { useRequirements } from '../../store/useRequirements';
import { useProyectos } from '../../store/useProyectos';
import { useMateriales } from '../../store/useMateriales';
import type { CreateEntregaDirectaDto } from '../../types';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Truck, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

type DetalleForm = { materialId: string; cantidad: string };

const emptyDetalle = (): DetalleForm => ({ materialId: '', cantidad: '' });

export default function DespachosPage() {
  const { ejecutar, isExecuting } = useDespachos();
  const { compras } = useCompras();
  const { requirements } = useRequirements();
  const { proyectos } = useProyectos();
  const { materiales } = useMateriales();

  const reqAprobados = requirements.filter(r => r.estado === 'APROBADO');

  const [ordenCompraId, setOrdenCompraId] = useState('');
  const [requerimientoId, setRequerimientoId] = useState('');
  const [proyectoId, setProyectoId] = useState('');
  const [detalles, setDetalles] = useState<DetalleForm[]>([emptyDetalle()]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const addDetalle = () => setDetalles([...detalles, emptyDetalle()]);

  const removeDetalle = (index: number) => setDetalles(detalles.filter((_, i) => i !== index));

  const updateDetalle = (index: number, field: keyof DetalleForm, value: string) => {
    const next = [...detalles];
    next[index] = { ...next[index], [field]: value };
    setDetalles(next);
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const detallesValidos = detalles.filter(d => d.materialId !== '' && Number(d.cantidad) > 0);

    if (detallesValidos.length === 0) {
      toast.error('Agrega al menos un material con cantidad válida (mayor a 0)');
      return;
    }

    if (!ordenCompraId || !requerimientoId || !proyectoId) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    const dto: CreateEntregaDirectaDto = {
      ordenCompraId: Number(ordenCompraId),
      requerimientoId: Number(requerimientoId),
      proyectoId: proyectoId,
      detalles: detalles
        .filter(d => d.materialId !== '' && Number(d.cantidad) > 0)
        .map(d => ({ materialId: Number(d.materialId), cantidad: Number(d.cantidad) }))
    };

    await ejecutar.mutateAsync(dto);

    setConfirmOpen(false);
    setOrdenCompraId('');
    setRequerimientoId('');
    setProyectoId('');
    setDetalles([emptyDetalle()]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="p-3 bg-accent/10 text-accent rounded-xl">
          <Truck size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Entrega Directa a Obra</h1>
          <p className="text-sm text-text-secondary mt-1">Registrar despacho de materiales directamente desde proveedor a bodega de proyecto.</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle p-6">
        <form onSubmit={handlePreSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Orden de Compra *</label>
              <select
                value={ordenCompraId}
                onChange={e => setOrdenCompraId(e.target.value)}
                className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                required
              >
                <option value="">Selecciona una OC</option>
                {compras.map(c => (
                  <option key={c.id} value={c.id}>{c.codigo} - {c.estado}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Requerimiento Aprobado *</label>
              <select
                value={requerimientoId}
                onChange={e => setRequerimientoId(e.target.value)}
                className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                required
              >
                <option value="">Selecciona un Requerimiento</option>
                {reqAprobados.map(r => (
                  <option key={r.id} value={r.id}>REQ-{r.id} - {r.proyecto?.nombre ?? 'Sin Proyecto'}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-1.5">Proyecto (Bodega Destino) *</label>
              <select
                value={proyectoId}
                onChange={e => setProyectoId(e.target.value)}
                className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                required
              >
                <option value="">Selecciona un Proyecto</option>
                {proyectos.map(p => (
                  <option key={p.id} value={p.id}>{p.codigoProyecto} - {p.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-border-subtle pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-text-primary">Detalles del Despacho</h3>
              <button
                type="button"
                onClick={addDetalle}
                className="text-success hover:text-success/80 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={16} /> Agregar material
              </button>
            </div>

            <div className="space-y-3">
              {detalles.map((detalle, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 items-center bg-base p-3 rounded-xl border border-border-subtle">
                  <select
                    value={detalle.materialId}
                    onChange={e => updateDetalle(index, 'materialId', e.target.value)}
                    className="flex-1 px-3 py-2 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all w-full"
                    required
                  >
                    <option value="">Material...</option>
                    {materiales.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre} ({m.sku})</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="Cantidad"
                    value={detalle.cantidad}
                    onChange={e => updateDetalle(index, 'cantidad', e.target.value)}
                    onKeyDown={e => { if (['.', ',', 'e', '+', '-'].includes(e.key)) e.preventDefault(); }}
                    className="w-full sm:w-36 px-3 py-2 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent transition-all"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => removeDetalle(index)}
                    disabled={detalles.length === 1}
                    className="text-danger hover:text-danger/80 hover:bg-danger-bg disabled:opacity-30 disabled:hover:bg-transparent p-2 rounded-xl transition-colors self-end sm:self-auto cursor-pointer"
                    title="Eliminar fila"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border-subtle pt-6 flex justify-end">
            <Button type="submit" loading={isExecuting} size="lg">
              Registrar Despacho
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Confirmar Entrega Directa"
        message="¿Confirmar entrega directa? Se creará un ingreso automático a la bodega del proyecto y el requerimiento cambiará a DESPACHADO."
        loading={isExecuting}
      />
    </div>
  );
}
