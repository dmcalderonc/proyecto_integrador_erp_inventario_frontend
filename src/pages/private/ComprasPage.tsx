import { useState } from 'react';
import { useCompras } from '../../store/useCompras';
import { useMateriales } from '../../store/useMateriales';
import { useAuth } from '../../contexts/AuthContext';
import type { OrdenCompra, CrearCompraDto, DetalleCompra } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, FileDown, Edit, CheckCircle } from 'lucide-react';
import { useProveedores } from '../../store/useProveedores';
import { comprasApi } from '../../api/compras.api';
import { triggerDownload } from '../../lib/download';
import { getBadgeStyle } from '../../lib/design-tokens';
import toast from 'react-hot-toast';

const emptyForm: CrearCompraDto = {
  proveedorId: 0,
  detalles: [],
};

export default function ComprasPage() {
  const { hasRole } = useAuth();
  const { compras, isLoading, crear, actualizar, aprobar, recibir } = useCompras();
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
      .map((d: DetalleCompra) => {
        const item: Record<string, unknown> = {
          materialId: Number(d.materialId),
          cantidad: Number(d.cantidad),
          precioUnitario: Number(d.precioUnitario),
        };
        if (d.requerimientoDetalleId) item.requerimientoDetalleId = d.requerimientoDetalleId;
        return item;
      });
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
        <span className="font-mono text-xs bg-success-bg text-success px-2.5 py-1 rounded-lg border border-success/20 font-semibold">
          {item.codigo}
        </span>
      )
    },
    {
      key: 'proveedor',
      header: 'Proveedor',
      sortable: true,
      sortValue: (item: OrdenCompra) => item.proveedor?.razon_social ?? '',
      render: (item: OrdenCompra) => <span className="text-text-primary font-medium">{item.proveedor?.razon_social ?? '-'}</span>,
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      render: (item: OrdenCompra) => (
        <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-semibold border ${getBadgeStyle(item.estado)}`}>
          {item.estado}
        </span>
      )
    },
    {
      key: 'subtotal',
      header: 'Subtotal',
      sortable: true,
      sortValue: (item: OrdenCompra) => Number(item.subtotal),
      render: (item: OrdenCompra) => <span className="text-text-secondary">${Number(item.subtotal).toFixed(2)}</span>,
    },
    {
      key: 'impuestos',
      header: 'Impuestos',
      sortable: true,
      sortValue: (item: OrdenCompra) => Number(item.impuestos),
      render: (item: OrdenCompra) => <span className="text-text-secondary">${Number(item.impuestos).toFixed(2)}</span>,
    },
    {
      key: 'total',
      header: 'Total',
      sortable: true,
      sortValue: (item: OrdenCompra) => Number(item.total),
      render: (item: OrdenCompra) => (
        <span className="font-bold text-text-primary">${Number(item.total).toFixed(2)}</span>
      ),
    },
    {
      key: 'acciones',
      header: '',
      render: (item: OrdenCompra) => (
        <div className="flex gap-1.5 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => handleDownloadPdf(item)}>
            <FileDown size={14} className="text-info" /> PDF
          </Button>
          {(item.estado === 'BORRADOR' || item.estado === 'PENDIENTE') && (
            <>
              {hasRole(['ADMIN']) && item.estado === 'BORRADOR' && (
                <Button variant="primary" size="sm" onClick={() => aprobar.mutateAsync(item.id)}>
                  <CheckCircle size={14} /> Aprobar OC
                </Button>
              )}
              {hasRole(['ADMIN', 'COMPRADOR']) && (
                <Button variant="secondary" size="sm" onClick={() => openEdit(item)}>
                  <Edit size={14} className="text-warning" /> Editar
                </Button>
              )}
              {hasRole(['ADMIN', 'BODEGUERO']) && (
                <Button variant="primary" size="sm" onClick={() => handleRecibir(item.id)}>
                  <CheckCircle size={14} /> Recibir
                </Button>
              )}
            </>
          )}
          {item.estado === 'EMITIDA' && hasRole(['ADMIN', 'BODEGUERO']) && (
            <Button variant="primary" size="sm" onClick={() => handleRecibir(item.id)}>
              <CheckCircle size={14} /> Recibir
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Órdenes de Compra</h1>
          <p className="text-sm text-text-secondary mt-1">Gestiona abastecimiento, cotizaciones y recepción de materiales.</p>
        </div>
        {hasRole(['ADMIN', 'COMPRADOR']) && (
          <Button onClick={openCreate} className="gap-1.5">
            <Plus size={16} /> Nueva Orden
          </Button>
        )}
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle p-6">
        <DataTable columns={columns} data={compras} loading={isLoading} searchable searchKeys={["codigo", "estado"]} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Orden de Compra">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Proveedor</label>
            <select
              value={form.proveedorId}
              onChange={e => setForm({ ...form, proveedorId: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              required
            >
              <option value={0}>Seleccione proveedor</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.razon_social}</option>)}
            </select>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-text-primary">Detalles de Materiales</label>
              <button
                type="button"
                onClick={addDetalle}
                className="text-success hover:text-success/80 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={16} /> Agregar
              </button>
            </div>
            <div className="space-y-3">
              {(form.detalles ?? []).map((det: DetalleCompra, i: number) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2.5 sm:items-center bg-base p-3 rounded-xl border border-border-subtle">
                  <select
                    value={det.materialId}
                    onChange={e => updateDetalle(i, 'materialId', Number(e.target.value))}
                    className="flex-1 px-3 py-2 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
                    required
                  >
                    <option value={0}>Seleccione material</option>
                    {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.sku})</option>)}
                  </select>

                  <input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="Cant."
                    value={det.cantidad}
                    onChange={e => updateDetalle(i, 'cantidad', Number(e.target.value))}
                    onKeyDown={e => { if (['.', ',', 'e', '+', '-'].includes(e.key)) e.preventDefault(); }}
                    className="w-full sm:w-24 px-3 py-2 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent transition-all"
                    required
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="P. Unit."
                    value={det.precioUnitario}
                    onChange={e => updateDetalle(i, 'precioUnitario', Number(e.target.value))}
                    className="w-full sm:w-32 px-3 py-2 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent transition-all"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => removeDetalle(i)}
                    className="text-danger hover:text-danger/80 hover:bg-danger-bg p-2 rounded-xl transition-colors self-end sm:self-auto cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-base p-4 rounded-xl border border-border-subtle space-y-2 text-sm text-right">
            <p className="text-text-secondary">
              Subtotal: <span className="font-semibold text-text-primary ml-1">${subtotalCalc.toFixed(2)}</span>
            </p>
            <div className="flex items-center justify-end gap-2 text-text-secondary">
              <span>Impuestos</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={impuestoRate}
                onChange={e => setImpuestoRate(Number(e.target.value))}
                className="w-16 px-2 py-1 bg-base text-text-primary border border-border-subtle rounded-lg text-sm text-right focus:outline-none focus:border-accent"
              />%
              <span className="font-semibold text-text-primary ml-1">= ${impuestosCalc.toFixed(2)}</span>
            </div>
            <p className="text-base font-bold text-text-primary pt-2 border-t border-border-subtle">
              Total: <span className="text-success ml-1">${totalCalc.toFixed(2)}</span>
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={crear.isPending}>
              Crear Orden
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Editar OC - ${editing?.codigo ?? ''}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Subtotal</label>
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
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Impuestos</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={editForm.impuestos}
              onChange={e => setEditForm({ ...editForm, impuestos: Number(e.target.value), total: editForm.subtotal + Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Total</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={editForm.total}
              onChange={e => setEditForm({ ...editForm, total: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-base text-success border border-border-subtle rounded-xl text-sm font-bold placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button variant="secondary" type="button" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={actualizar.isPending}>
              Actualizar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
