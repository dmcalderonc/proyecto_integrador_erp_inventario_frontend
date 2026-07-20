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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Truck size={28} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Entrega Directa a Obra</h1>
        </div>
        <p className="text-gray-500">Registrar despacho de materiales directamente desde proveedor a bodega de proyecto.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <form onSubmit={handlePreSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden de Compra *</label>
              <select
                value={ordenCompraId}
                onChange={e => setOrdenCompraId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecciona una OC</option>
                {compras.map(c => (
                  <option key={c.id} value={c.id}>{c.codigo} - {c.estado}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requerimiento Aprobado *</label>
              <select
                value={requerimientoId}
                onChange={e => setRequerimientoId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecciona un Requerimiento</option>
                {reqAprobados.map(r => (
                  <option key={r.id} value={r.id}>REQ-{r.id} - {r.proyecto?.nombre ?? 'Sin Proyecto'}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Proyecto (Bodega Destino) *</label>
              <select
                value={proyectoId}
                onChange={e => setProyectoId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Selecciona un Proyecto</option>
                {proyectos.map(p => (
                  <option key={p.id} value={p.id}>{p.codigoProyecto} - {p.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Detalles del Despacho</h3>
              <button
                type="button"
                onClick={addDetalle}
                className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1"
              >
                <Plus size={16} /> Agregar material
              </button>
            </div>

            <div className="space-y-3">
              {detalles.map((detalle, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <select
                    value={detalle.materialId}
                    onChange={e => updateDetalle(index, 'materialId', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                    className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeDetalle(index)}
                    disabled={detalles.length === 1}
                    className="text-red-500 hover:text-red-700 disabled:opacity-30 p-2 transition-colors"
                    title="Eliminar fila"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex justify-end">
            <Button
              type="submit"
              disabled={isExecuting}
              className="px-6 py-2.5 flex items-center"
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