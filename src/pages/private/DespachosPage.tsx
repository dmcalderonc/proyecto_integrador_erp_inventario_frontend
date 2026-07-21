import { useState } from 'react';
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

  // Filtrar requerimientos solo APROBADOS
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

    // Validación de detalles
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

    // Resetear formulario si es exitoso
    setConfirmOpen(false);
    setOrdenCompraId('');
    setRequerimientoId('');
    setProyectoId('');
    setDetalles([emptyDetalle()]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3.5 mb-2">
          <div className="p-3 bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30 rounded-2xl">
            <Truck size={28} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#FFFFFF]">Entrega Directa a Obra</h1>
        </div>
        <p className="text-[#94A3B8] text-sm">Registrar despacho de materiales directamente desde proveedor a bodega de proyecto.</p>
      </div>

      {/* Formulario de Despacho */}
      <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-6 md:p-8 shadow-2xl">
        <form onSubmit={handlePreSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Orden de Compra *</label>
              <select
                value={ordenCompraId}
                onChange={e => setOrdenCompraId(e.target.value)}
                className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all cursor-pointer"
                required
              >
                <option value="" className="bg-[#0A1128]">Selecciona una OC</option>
                {compras.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#0A1128]">{c.codigo} - {c.estado}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Requerimiento Aprobado *</label>
              <select
                value={requerimientoId}
                onChange={e => setRequerimientoId(e.target.value)}
                className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all cursor-pointer"
                required
              >
                <option value="" className="bg-[#0A1128]">Selecciona un Requerimiento</option>
                {reqAprobados.map(r => (
                  <option key={r.id} value={r.id} className="bg-[#0A1128]">REQ-{r.id} - {r.proyecto?.nombre ?? 'Sin Proyecto'}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Proyecto (Bodega Destino) *</label>
              <select
                value={proyectoId}
                onChange={e => setProyectoId(e.target.value)}
                className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all cursor-pointer"
                required
              >
                <option value="" className="bg-[#0A1128]">Selecciona un Proyecto</option>
                {proyectos.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#0A1128]">{p.codigoProyecto} - {p.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sección de Materiales */}
          <div className="border-t border-[#334155] pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#FFFFFF]">Detalles del Despacho</h3>
              <button
                type="button"
                onClick={addDetalle}
                className="text-[#10B981] hover:text-[#10B981]/80 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={16} /> Agregar material
              </button>
            </div>

            <div className="space-y-3">
              {detalles.map((detalle, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 items-center bg-[#0A1128] p-3.5 rounded-2xl border border-[#334155]">
                  <select
                    value={detalle.materialId}
                    onChange={e => updateDetalle(index, 'materialId', e.target.value)}
                    className="flex-1 bg-[#111D4A] text-[#FFFFFF] border border-[#334155] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#06B6D4] transition-all cursor-pointer w-full"
                    required
                  >
                    <option value="" className="bg-[#111D4A]">Material...</option>
                    {materiales.map(m => (
                      <option key={m.id} value={m.id} className="bg-[#111D4A]">{m.nombre} ({m.sku})</option>
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
                    className="w-full sm:w-36 bg-[#111D4A] text-[#FFFFFF] border border-[#334155] rounded-xl px-3.5 py-2.5 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] transition-all font-semibold"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => removeDetalle(index)}
                    disabled={detalles.length === 1}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 disabled:opacity-30 disabled:hover:bg-transparent p-2 rounded-xl transition-colors self-end sm:self-auto cursor-pointer"
                    title="Eliminar fila"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#334155] pt-6 flex justify-end">
            <Button
              type="submit"
              disabled={isExecuting}
              className="bg-[#06B6D4] hover:bg-[#0284C7] text-white font-bold px-8 py-3.5 rounded-xl border border-[#334155] transition-all shadow-lg shadow-[#06B6D4]/20 hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center"
            >
              {isExecuting ? (
                <>
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent mr-2"></div>
                  Procesando...
                </>
              ) : (
                'Registrar Despacho'
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Diálogo de Confirmación */}
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