import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCompras } from '../../store/useCompras';
import { useMateriales } from '../../store/useMateriales';
import { useAuth } from '../../contexts/AuthContext';
import type { OrdenCompra, CrearCompraDto, DetalleCompra } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, FileDown, Edit, CheckCircle, Eye, XCircle } from 'lucide-react';
import { useProveedores } from '../../store/useProveedores';
import { comprasApi } from '../../api/compras.api';
import { triggerDownload } from '../../lib/download';
import { getBadgeStyle } from '../../lib/design-tokens';
import toast from 'react-hot-toast';

const emptyForm: CrearCompraDto = {
  proveedorId: 0,
  detalles: [],
};

const ocStatusStyle: Record<string, string> = {
  PENDIENTE: 'bg-warning/10 text-warning border-warning/20',
  BORRADOR: 'bg-text-muted/10 text-text-muted border-text-muted/20',
  EMITIDA: 'bg-info/10 text-info border-info/20',
  RECIBIDA: 'bg-success/10 text-success border-success/20',
  RECIBIDA_PARCIAL: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  CANCELADA: 'bg-danger/10 text-danger border-danger/20',
};

export default function ComprasPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const { materiales } = useMateriales();
  const { proveedores } = useProveedores();

  const { data: compras = [], isLoading } = useQuery({
    queryKey: ['compras'],
    queryFn: async () => {
      const res = await comprasApi.getAll();
      return res.data || [];
    },
  });

  const crear = useMutation({
    mutationFn: (dto: CrearCompraDto) => comprasApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Orden de compra creada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear OC');
    },
  });

  const aprobar = useMutation({
    mutationFn: (id: number) => comprasApi.aprobar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Orden de compra aprobada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al aprobar OC');
    },
  });

  const recibir = useMutation({
    mutationFn: (id: number) => comprasApi.recibir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Orden de compra recibida y stock actualizado');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al recibir OC');
    },
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOC, setSelectedOC] = useState<OrdenCompra | null>(null);
  const [form, setForm] = useState<CrearCompraDto>(emptyForm);
  const [impuestoRate, setImpuestoRate] = useState(15);

  const openCreate = () => {
    setForm({ ...emptyForm, detalles: [{ materialId: 0, cantidad: 1, precioUnitario: 0 }] });
    setImpuestoRate(15);
    setModalOpen(true);
  };

  const openDetail = async (item: OrdenCompra) => {
    const { data } = await comprasApi.getById(item.id);
    setSelectedOC(data);
    setDetailOpen(true);
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
    (sum: number, d: DetalleCompra) => sum + Number(d.cantidad) * Number(d.precioUnitario), 0,
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
      detalles: detallesNumeros as any,
    };
    await crear.mutateAsync(dto);
    setModalOpen(false);
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
      ),
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
      render: (item: OrdenCompra) => {
        const style = ocStatusStyle[item.estado] || ocStatusStyle.BORRADOR;
        return (
          <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-semibold border ${style}`}>
            {item.estado?.replace(/_/g, ' ')}
          </span>
        );
      },
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
          <Button variant="ghost" size="sm" onClick={() => openDetail(item)}>
            <Eye size={14} className="text-accent" /> Detalle
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDownloadPdf(item)}>
            <FileDown size={14} className="text-info" /> PDF
          </Button>
          {item.estado === 'PENDIENTE' && hasRole(['ADMIN']) && (
            <Button variant="primary" size="sm" onClick={() => aprobar.mutateAsync(item.id)} loading={aprobar.isPending}>
              <CheckCircle size={14} /> Aprobar
            </Button>
          )}
          {item.estado === 'EMITIDA' && hasRole(['ADMIN', 'BODEGUERO']) && (
            <Button variant="primary" size="sm" onClick={() => recibir.mutateAsync(item.id)} loading={recibir.isPending}>
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
        <DataTable columns={columns} data={compras} loading={isLoading} searchable searchKeys={['codigo', 'estado']} />
      </div>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`OC Detalle — ${selectedOC?.codigo ?? ''}`} size="lg">
        {selectedOC && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-base rounded-xl border border-border-subtle p-3">
                <p className="text-xs text-text-muted mb-1">Código</p>
                <p className="text-sm font-semibold text-text-primary font-mono">{selectedOC.codigo}</p>
              </div>
              <div className="bg-base rounded-xl border border-border-subtle p-3">
                <p className="text-xs text-text-muted mb-1">Proveedor</p>
                <p className="text-sm font-semibold text-text-primary">{selectedOC.proveedor?.razon_social ?? '-'}</p>
              </div>
              <div className="bg-base rounded-xl border border-border-subtle p-3">
                <p className="text-xs text-text-muted mb-1">Estado</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${ocStatusStyle[selectedOC.estado] || ocStatusStyle.BORRADOR}`}>
                  {selectedOC.estado?.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="bg-base rounded-xl border border-border-subtle p-3">
                <p className="text-xs text-text-muted mb-1">Total</p>
                <p className="text-sm font-bold text-success">${Number(selectedOC.total).toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-base rounded-xl border border-border-subtle overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle bg-elevated/50">
                    <th className="text-left py-3 px-3 text-text-muted font-medium">Material</th>
                    <th className="text-center py-3 px-3 text-text-muted font-medium">Cantidad</th>
                    <th className="text-right py-3 px-3 text-text-muted font-medium">P. Unitario</th>
                    <th className="text-right py-3 px-3 text-text-muted font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOC.detalles?.map((det: any, idx: number) => (
                    <tr key={idx} className="border-b border-border-subtle/50 hover:bg-elevated/30">
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="text-text-primary font-medium">{det.material?.nombre ?? `Material #${det.materialId}`}</span>
                          <span className="text-text-muted font-mono text-xs">{det.material?.sku ?? '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-text-primary font-semibold">{det.cantidad}</td>
                      <td className="py-3 px-3 text-right text-text-secondary">${Number(det.precioUnitario).toFixed(2)}</td>
                      <td className="py-3 px-3 text-right font-semibold text-text-primary">
                        ${(Number(det.cantidad) * Number(det.precioUnitario)).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-end gap-1 text-sm">
              <p className="text-text-secondary">Subtotal: <span className="font-semibold text-text-primary ml-1">${Number(selectedOC.subtotal).toFixed(2)}</span></p>
              <p className="text-text-secondary">Impuestos: <span className="font-semibold text-text-primary ml-1">${Number(selectedOC.impuestos).toFixed(2)}</span></p>
              <p className="text-base font-bold text-text-primary pt-1 border-t border-border-subtle w-full text-right">
                Total: <span className="text-success ml-1">${Number(selectedOC.total).toFixed(2)}</span>
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {selectedOC.estado === 'PENDIENTE' && hasRole(['ADMIN']) && (
                <Button variant="primary" onClick={() => { aprobar.mutateAsync(selectedOC.id); setDetailOpen(false); }} loading={aprobar.isPending}>
                  <CheckCircle size={14} /> Aprobar Orden
                </Button>
              )}
              {selectedOC.estado === 'EMITIDA' && hasRole(['ADMIN', 'BODEGUERO']) && (
                <Button variant="primary" onClick={() => { recibir.mutateAsync(selectedOC.id); setDetailOpen(false); }} loading={recibir.isPending}>
                  <CheckCircle size={14} /> Recibir Orden
                </Button>
              )}
              <Button variant="secondary" onClick={() => setDetailOpen(false)}>Cerrar</Button>
            </div>
          </div>
        )}
      </Modal>

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
    </div>
  );
}
