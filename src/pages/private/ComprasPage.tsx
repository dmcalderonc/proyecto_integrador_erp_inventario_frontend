import { useState } from 'react';
import { useCompras } from '../../store/useCompras';
import { useMateriales } from '../../store/useMateriales';
import type { OrdenCompra, CrearCompraDto, DetalleCompra } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, FileDown, Edit, CheckCircle } from 'lucide-react';
import { useProveedores } from '../../store/useProveedores';
import { comprasApi } from '../../api/compras.api';
import { triggerDownload } from '../../lib/download';
import toast from 'react-hot-toast';

const emptyForm: CrearCompraDto = {
  proveedorId: 0,
  detalles: [],
};

export default function ComprasPage() {
  const { compras, isLoading, crear, actualizar, recibir } = useCompras();
  const { materiales } = useMateriales();
  const { proveedores } = useProveedores();

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form, setForm] = useState<CrearCompraDto>(emptyForm);
  const [impuestoRate, setImpuestoRate] = useState(15);
  const [editing, setEditing] = useState<OrdenCompra | null>(null);
  const [editForm, setEditForm] = useState({ subtotal: 0, impuestos: 0, total: 0 });

  const openCreate = () => {
    setForm({ ...emptyForm, detalles: [{ materialId: 0, cantidad: 1, precioUnitario: 0 }] });
    setImpuestoRate(15);
    setModalOpen(true);
  };

  const openEdit = (item: OrdenCompra) => {
    setEditing(item);
    setEditForm({
      subtotal: Number(item.subtotal),
      impuestos: Number(item.impuestos),
      total: Number(item.total),
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await actualizar.mutateAsync({ id: editing.id, dto: editForm });
    setEditModalOpen(false);
    setEditing(null);
  };

  const addDetalle = () => {
    setForm({ ...form, detalles: [...(form.detalles ?? []), { materialId: 0, cantidad: 1, precioUnitario: 0 }] });
  };

  const removeDetalle = (index: number) => {
    const newDetalles = (form.detalles ?? []).filter((_: DetalleCompra, i: number) => i !== index);
    setForm({ ...form, detalles: newDetalles });
  };

  const updateDetalle = (index: number, field: keyof DetalleCompra, value: string | number) => {
    const newDetalles = [...(form.detalles ?? [])];
    newDetalles[index] = { ...newDetalles[index], [field]: value };
    setForm({ ...form, detalles: newDetalles });
  };

  const subtotalCalc = (form.detalles ?? []).reduce(
    (sum: number, d: DetalleCompra) => sum + Number(d.cantidad) * Number(d.precioUnitario), 0
  );
  const impuestosCalc = subtotalCalc * (impuestoRate / 100);
  const totalCalc = subtotalCalc + impuestosCalc;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const detallesNumeros = (form.detalles ?? [])
      .filter((d: DetalleCompra) => d.materialId !== 0)
      .map((d: DetalleCompra) => ({
        materialId: Number(d.materialId),
        cantidad: Number(d.cantidad),
        precioUnitario: Number(d.precioUnitario),
      }));
    const dto: CrearCompraDto = {
      proveedorId: Number(form.proveedorId),
      subtotal: subtotalCalc,
      impuestos: impuestosCalc,
      total: totalCalc,
      detalles: detallesNumeros,
    };
    await crear.mutateAsync(dto);
    setModalOpen(false);
  };

  const handleRecibir = async (id: number) => {
    await recibir.mutateAsync(id);
  };

  const handleDownloadPdf = async (item: OrdenCompra) => {
    try {
      const blob = await comprasApi.downloadPdf(item.id);
      triggerDownload(blob, `${item.codigo || 'OC'}_compra.pdf`);
    } catch {
      toast.error('Error al descargar el PDF');
    }
  };

  const columns = [
    { 
      key: 'codigo', 
      header: 'Código', 
      sortable: true,
      render: (item: OrdenCompra) => (
        <span className="font-mono text-xs bg-[#0A1128] text-[#10B981] px-2.5 py-1 rounded-lg border border-[#334155] font-semibold">
          {item.codigo}
        </span>
      )
    },
    {
      key: 'proveedor', 
      header: 'Proveedor',
      sortable: true,
      sortValue: (item: OrdenCompra) => item.proveedor?.razon_social ?? '',
      render: (item: OrdenCompra) => <span className="text-[#303357] font-medium">{item.proveedor?.razon_social ?? '-'}</span>,
    },
    { 
      key: 'estado', 
      header: 'Estado', 
      sortable: true,
      render: (item: OrdenCompra) => {
        const estadoStyles: Record<string, string> = {
          RECIBIDA: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30',
          EMITIDA: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/30',
          PENDIENTE: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          BORRADOR: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
        };
        const currentStyle = estadoStyles[item.estado] || 'bg-[#0A1128] text-[#94A3B8] border-[#334155]';
        return (
          <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-semibold border ${currentStyle}`}>
            {item.estado}
          </span>
        );
      }
    },
    {
      key: 'subtotal', 
      header: 'Subtotal',
      sortable: true,
      sortValue: (item: OrdenCompra) => Number(item.subtotal),
      render: (item: OrdenCompra) => <span className="text-[#94A3B8]">${Number(item.subtotal).toFixed(2)}</span>,
    },
    {
      key: 'impuestos', 
      header: 'Impuestos',
      sortable: true,
      sortValue: (item: OrdenCompra) => Number(item.impuestos),
      render: (item: OrdenCompra) => <span className="text-[#94A3B8]">${Number(item.impuestos).toFixed(2)}</span>,
    },
    {
      key: 'total', 
      header: 'Total',
      sortable: true,
      sortValue: (item: OrdenCompra) => Number(item.total),
      render: (item: OrdenCompra) => (
        <span className="font-bold text-[#303357]">${Number(item.total).toFixed(2)}</span>
      ),
    },
    {
      key: 'acciones', 
      header: '',
      render: (item: OrdenCompra) => (
        <div className="flex gap-1.5 flex-wrap">
          <Button 
            className="!px-2.5 !py-1 !text-xs bg-[#1E293B] hover:bg-white/10 text-[#303357] border border-[#334155] rounded-xl transition-all" 
            onClick={() => handleDownloadPdf(item)}
          >
            <FileDown size={14} className="inline mr-1 text-[#06B6D4]" /> PDF
          </Button>
          {(item.estado === 'BORRADOR' || item.estado === 'PENDIENTE') && (
            <>
              <Button 
                className="!px-2.5 !py-1 !text-xs bg-[#1E293B] hover:bg-white/10 text-[#FFFFFF] border border-[#334155] rounded-xl transition-all" 
                onClick={() => openEdit(item)}
              >
                <Edit size={14} className="inline mr-1 text-amber-400" /> Editar
              </Button>
              <Button 
                className="!px-2.5 !py-1 !text-xs bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/40 rounded-xl transition-all" 
                onClick={() => handleRecibir(item.id)}
              >
                <CheckCircle size={14} className="inline mr-1" /> Recibir
              </Button>
            </>
          )}
          {item.estado === 'EMITIDA' && (
            <Button 
              className="!px-2.5 !py-1 !text-xs bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] border border-[#10B981]/40 rounded-xl transition-all" 
              onClick={() => handleRecibir(item.id)}
            >
              <CheckCircle size={14} className="inline mr-1" /> Recibir
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header de la sección */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#FFFFFF] mb-2">Órdenes de Compra</h1>
          <p className="text-[#94A3B8] text-sm">Gestiona abastecimiento, cotizaciones y recepción de materiales.</p>
        </div>
        <Button 
          onClick={openCreate}
          className="bg-[#06B6D4] hover:bg-[#0284C7] text-white font-bold px-5 py-3 rounded-xl border border-[#334155] transition-all shadow-lg shadow-[#06B6D4]/20 hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={18} /> Nueva Orden
        </Button>
      </div>

      {/* Tabla de Compras */}
      <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-6 shadow-2xl overflow-hidden">
        <DataTable columns={columns} data={compras} loading={isLoading} searchable searchKeys={["codigo", "estado"]} />
      </div>

      {/* Modal Crear */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Orden de Compra">
        <form onSubmit={handleSubmit} className="space-y-5 text-[#94A3B8] p-1">
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Proveedor</label>
            <select 
              value={form.proveedorId}
              onChange={e => setForm({ ...form, proveedorId: Number(e.target.value) })}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all cursor-pointer" 
              required
            >
              <option value={0} className="bg-[#0A1128]">Seleccione proveedor</option>
              {proveedores.map(p => <option key={p.id} value={p.id} className="bg-[#0A1128]">{p.razon_social}</option>)}
            </select>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-[#FFFFFF]">Detalles de Materiales</label>
              <button 
                type="button" 
                onClick={addDetalle} 
                className="text-[#10B981] hover:text-[#10B981]/80 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={16} /> Agregar
              </button>
            </div>
            <div className="space-y-3">
              {(form.detalles ?? []).map((det: DetalleCompra, i: number) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2.5 sm:items-center bg-[#0A1128] p-3 rounded-2xl border border-[#334155]">
                  <select 
                    value={det.materialId} 
                    onChange={e => updateDetalle(i, 'materialId', Number(e.target.value))}
                    className="flex-1 bg-[#111D4A] text-[#FFFFFF] border border-[#334155] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#06B6D4] transition-all cursor-pointer" 
                    required
                  >
                    <option value={0} className="bg-[#111D4A]">Seleccione material</option>
                    {materiales.map(m => <option key={m.id} value={m.id} className="bg-[#111D4A]">{m.nombre} ({m.sku})</option>)}
                  </select>

                  <input 
                    type="number" 
                    step="1" 
                    min="1" 
                    placeholder="Cant." 
                    value={det.cantidad}
                    onChange={e => updateDetalle(i, 'cantidad', Number(e.target.value))}
                    onKeyDown={e => { if (['.', ',', 'e', '+', '-'].includes(e.key)) e.preventDefault(); }}
                    className="w-full sm:w-24 bg-[#111D4A] text-[#FFFFFF] border border-[#334155] rounded-xl px-3 py-2 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] transition-all" 
                    required 
                  />

                  <input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="P. Unit." 
                    value={det.precioUnitario}
                    onChange={e => updateDetalle(i, 'precioUnitario', Number(e.target.value))}
                    className="w-full sm:w-32 bg-[#111D4A] text-[#FFFFFF] border border-[#334155] rounded-xl px-3 py-2 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] transition-all" 
                    required 
                  />

                  <button 
                    type="button" 
                    onClick={() => removeDetalle(i)} 
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-xl transition-colors self-end sm:self-auto cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Desglose de Totales */}
          <div className="bg-[#0A1128] p-4 rounded-2xl border border-[#334155] space-y-2 text-sm text-right">
            <p className="text-[#94A3B8]">
              Subtotal: <span className="font-semibold text-[#FFFFFF] ml-1">${subtotalCalc.toFixed(2)}</span>
            </p>
            <div className="flex items-center justify-end gap-2 text-[#94A3B8]">
              <span>Impuestos</span>
              <input 
                type="number" 
                min="0" 
                max="100" 
                step="0.5" 
                value={impuestoRate}
                onChange={e => setImpuestoRate(Number(e.target.value))}
                className="w-16 bg-[#111D4A] text-[#FFFFFF] border border-[#334155] rounded-lg px-2 py-1 text-sm text-right focus:outline-none focus:border-[#06B6D4]" 
              />%
              <span className="font-semibold text-[#FFFFFF] ml-1">= ${impuestosCalc.toFixed(2)}</span>
            </div>
            <p className="text-base font-extrabold text-[#FFFFFF] pt-2 border-t border-[#334155]">
              Total: <span className="text-[#10B981] ml-1">${totalCalc.toFixed(2)}</span>
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setModalOpen(false)}
              className="bg-[#1E293B] hover:bg-white/10 text-[#FFFFFF] border border-[#334155] px-5 py-2.5 rounded-xl font-medium transition-all cursor-pointer"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={crear.isPending}
              className="bg-[#06B6D4] hover:bg-[#0284C7] text-white font-bold px-6 py-2.5 rounded-xl border border-[#334155] transition-all shadow-lg shadow-[#06B6D4]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {crear.isPending ? 'Creando...' : 'Crear Orden'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Editar OC - ${editing?.codigo ?? ''}`}>
        <form onSubmit={handleEditSubmit} className="space-y-5 text-[#94A3B8] p-1">
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Subtotal</label>
            <input 
              type="number" 
              step="0.01" 
              min="0" 
              value={editForm.subtotal}
              onChange={e => {
                const sub = Number(e.target.value);
                const imp = sub * (impuestoRate / 100);
                setEditForm({ subtotal: sub, impuestos: imp, total: sub + imp });
              }}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#06B6D4] transition-all" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Impuestos</label>
            <input 
              type="number" 
              step="0.01" 
              min="0" 
              value={editForm.impuestos}
              onChange={e => setEditForm({ ...editForm, impuestos: Number(e.target.value), total: editForm.subtotal + Number(e.target.value) })}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#06B6D4] transition-all" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Total</label>
            <input 
              type="number" 
              step="0.01" 
              min="0" 
              value={editForm.total}
              onChange={e => setEditForm({ ...editForm, total: Number(e.target.value) })}
              className="w-full bg-[#0A1128] text-[#10B981] border border-[#334155] rounded-xl px-4 py-3 text-sm font-extrabold focus:outline-none focus:border-[#06B6D4] transition-all" 
              required 
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setEditModalOpen(false)}
              className="bg-[#1E293B] hover:bg-white/10 text-[#FFFFFF] border border-[#334155] px-5 py-2.5 rounded-xl font-medium transition-all cursor-pointer"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={actualizar.isPending}
              className="bg-[#06B6D4] hover:bg-[#0284C7] text-white font-bold px-6 py-2.5 rounded-xl border border-[#334155] transition-all shadow-lg shadow-[#06B6D4]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {actualizar.isPending ? 'Guardando...' : 'Actualizar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}