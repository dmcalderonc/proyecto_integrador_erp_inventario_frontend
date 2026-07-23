import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useRequirements } from '../../store/useRequirements';
import { useProyectos } from '../../store/useProyectos';
import { useBodegas } from '../../store/useBodegas';
import { materialesApi } from '../../api/materiales.api';
import { requirementsApi } from '../../api/requirements.api';
import type { Requirement } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { SmartCombobox } from '../../components/ui/SmartCombobox';
import type { ComboboxOption } from '../../components/ui/SmartCombobox';
import { getBadgeStyle } from '../../lib/design-tokens';
import { Plus, Trash2, Eye, CheckCircle, XCircle, Truck, ShoppingCart, Package } from 'lucide-react';
import toast from 'react-hot-toast';

type DetalleForm = { materialId: number; cantidadSolicitada: string };

const emptyDetalle = (): DetalleForm => ({ materialId: 0, cantidadSolicitada: '' });

const itemStatusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  PENDIENTE: { label: 'Pendiente', icon: null, color: 'text-warning' },
  APROBADO_BODEGA: { label: 'Aprobado', icon: <CheckCircle size={14} />, color: 'text-success' },
  RECHAZADO: { label: 'Rechazado', icon: <XCircle size={14} />, color: 'text-danger' },
  EN_COMPRAS: { label: 'En Compras', icon: <ShoppingCart size={14} />, color: 'text-info' },
  EN_TRASLADO: { label: 'En Traslado', icon: <Truck size={14} />, color: 'text-purple-400' },
  DESPACHADO: { label: 'Despachado', icon: <Package size={14} />, color: 'text-success' },
};

export default function RequirementsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [detalles, setDetalles] = useState<DetalleForm[]>([emptyDetalle()]);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<ComboboxOption | null>(null);
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState<ComboboxOption | null>(null);

  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const { crear } = useRequirements();
  const { proyectos } = useProyectos();
  const { bodegas } = useBodegas();

  const { data: materiales = [] } = useQuery({
    queryKey: ['materialesAll'],
    queryFn: async () => {
      const res = await materialesApi.getAll({ limit: 200 });
      return res.data || [];
    },
  });

  const { data: requirements = [], isLoading } = useQuery({
    queryKey: ['requirements'],
    queryFn: async () => {
      const res = await requirementsApi.getAll();
      return res.data || [];
    },
  });

  const evaluarItem = useMutation({
    mutationFn: async ({ reqId, detalleId, accion }: { reqId: number; detalleId: number; accion: string }) => {
      const { data } = await requirementsApi.evaluarItem(reqId, detalleId, accion);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      toast.success(`Ítem ${variables.accion === 'APROBADO' ? 'aprobado' : 'rechazado'} correctamente`);
      if (selectedReq) {
        requirementsApi.getById(selectedReq.id).then(({ data }) => {
          setSelectedReq(data);
        });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al evaluar ítem');
    },
  });

  const openDetail = async (req: Requirement) => {
    const { data } = await requirementsApi.getById(req.id);
    setSelectedReq(data);
    setDetailOpen(true);
  };

  const openCreate = () => {
    setDetalles([emptyDetalle()]);
    setProyectoSeleccionado(null);
    setBodegaSeleccionada(null);
    setModalOpen(true);
  };

  const addDetalle = () => setDetalles([...detalles, emptyDetalle()]);
  const removeDetalle = (index: number) => setDetalles(detalles.filter((_, i) => i !== index));
  const updateDetalle = (index: number, field: keyof DetalleForm, value: string | number) => {
    const updated = [...detalles];
    updated[index] = { ...updated[index], [field]: value };
    setDetalles(updated);
  };

  const handleSubmit = async () => {
    if (!proyectoSeleccionado) { toast.error('Selecciona un proyecto'); return; }
    if (!bodegaSeleccionada) { toast.error('Selecciona una bodega'); return; }
    const validDetalles = detalles.filter(d => d.materialId > 0 && Number(d.cantidadSolicitada) > 0);
    if (validDetalles.length === 0) { toast.error('Agrega al menos un material válido'); return; }

    await crear.mutateAsync({
      proyectoId: String(proyectoSeleccionado.id),
      bodegaId: Number(bodegaSeleccionada.id),
      detalles: validDetalles.map(d => ({
        materialId: d.materialId,
        cantidadSolicitada: Number(d.cantidadSolicitada),
      })),
    });
    setModalOpen(false);
  };

  const materialOptions: ComboboxOption[] = materiales.map((m: any) => ({ id: m.id, nombre: `${m.sku} - ${m.nombre}` }));
  const proyectoOptions: ComboboxOption[] = proyectos.map((p: any) => ({ id: p.id, nombre: `${p.codigoProyecto || 'PROY'} - ${p.nombre}` }));
  const bodegaOptions: ComboboxOption[] = bodegas.map((b: any) => ({ id: b.id, nombre: b.nombre }));

  const columns = [
    { key: 'id', header: 'ID', render: (item: Requirement) => <span className="font-mono text-sm text-accent">REQ-{String(item.id).padStart(3, '0')}</span>, sortable: true },
    { key: 'proyecto', header: 'Proyecto', render: (item: Requirement) => <span className="text-text-primary font-medium">{item.proyecto?.nombre ?? '-'}</span>, sortValue: (item: Requirement) => item.proyecto?.nombre ?? '' },
    { key: 'solicitante', header: 'Solicitante', render: (item: Requirement) => <span className="text-text-secondary">{item.usuarioSolicitante?.nombre ?? '-'}</span>, sortValue: (item: Requirement) => item.usuarioSolicitante?.nombre ?? '' },
    { key: 'bodega', header: 'Bodega', render: (item: Requirement) => <span className="text-text-secondary">{item.bodega?.nombre ?? '-'}</span>, sortValue: (item: Requirement) => item.bodega?.nombre ?? '' },
    { key: 'fecha', header: 'Fecha', render: (item: Requirement) => <span className="text-text-muted text-sm">{new Date(item.fechaSolicitud).toLocaleDateString()}</span> },
    { key: 'items', header: 'Ítems', render: (item: Requirement) => {
      const total = item.detalles?.length || 0;
      const despachados = item.detalles?.filter(d => d.estadoItem === 'DESPACHADO').length || 0;
      return <span className="text-text-primary font-medium">{despachados}/{total}</span>;
    }},
    { key: 'estado', header: 'Estado', render: (item: Requirement) => {
      const style = getBadgeStyle(item.estado);
      return <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${style}`}>{item.estado?.replace(/_/g, ' ')}</span>;
    }},
    { key: 'acciones', header: 'Acciones', render: (item: Requirement) => (
      <button onClick={() => openDetail(item)} className="text-accent hover:text-accent/80 text-xs font-semibold flex items-center gap-1 transition-colors">
        <Eye size={14} /> Ver Detalle
      </button>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Requerimientos</h1>
          <p className="text-sm text-text-secondary mt-1">Gestiona y evalúa los requerimientos de materiales</p>
        </div>
        {hasRole(['SOLICITANTE', 'ADMIN']) && (
          <Button onClick={openCreate} className="gap-1.5">
            <Plus size={16} /> Nuevo Requerimiento
          </Button>
        )}
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle p-6">
        <DataTable columns={columns} data={requirements} loading={isLoading} searchable searchKeys={['proyecto', 'solicitante']} searchPlaceholder="Buscar por proyecto o solicitante..." />
      </div>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`REQ-${selectedReq?.id ? String(selectedReq.id).padStart(3, '0') : ''} — Detalle`} size="lg">
        {selectedReq && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-base rounded-xl border border-border-subtle p-3">
                <p className="text-xs text-text-muted">Proyecto</p>
                <p className="text-sm font-semibold text-text-primary">{selectedReq.proyecto?.nombre ?? '-'}</p>
              </div>
              <div className="bg-base rounded-xl border border-border-subtle p-3">
                <p className="text-xs text-text-muted">Solicitante</p>
                <p className="text-sm font-semibold text-text-primary">{selectedReq.usuarioSolicitante?.nombre ?? '-'}</p>
              </div>
              <div className="bg-base rounded-xl border border-border-subtle p-3">
                <p className="text-xs text-text-muted">Bodega</p>
                <p className="text-sm font-semibold text-text-primary">{selectedReq.bodega?.nombre ?? '-'}</p>
              </div>
              <div className="bg-base rounded-xl border border-border-subtle p-3">
                <p className="text-xs text-text-muted">Estado</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getBadgeStyle(selectedReq.estado)}`}>{selectedReq.estado?.replace(/_/g, ' ')}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left py-3 px-3 text-text-muted font-medium">Material</th>
                    <th className="text-left py-3 px-3 text-text-muted font-medium">SKU</th>
                    <th className="text-center py-3 px-3 text-text-muted font-medium">Cant. Solicitada</th>
                    <th className="text-center py-3 px-3 text-text-muted font-medium">Estado Ítem</th>
                    <th className="text-right py-3 px-3 text-text-muted font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReq.detalles?.map((det) => {
                    const statusInfo = itemStatusConfig[det.estadoItem || 'PENDIENTE'];
                    return (
                      <tr key={det.id} className="border-b border-border-subtle/50 hover:bg-elevated/50">
                        <td className="py-3 px-3 text-text-primary font-medium">{det.material?.nombre ?? `Material #${det.materialId}`}</td>
                        <td className="py-3 px-3 text-text-muted font-mono text-xs">{det.material?.sku ?? '-'}</td>
                        <td className="py-3 px-3 text-text-primary text-center font-semibold">{det.cantidadSolicitada}</td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${getBadgeStyle(det.estadoItem || 'PENDIENTE')}`}>
                            {statusInfo?.icon}
                            {statusInfo?.label || det.estadoItem}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {det.estadoItem === 'PENDIENTE' && hasRole(['ADMIN']) && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => selectedReq && evaluarItem.mutate({ reqId: selectedReq.id, detalleId: det.id, accion: 'APROBADO' })}
                                disabled={evaluarItem.isPending}
                                className="text-success hover:text-success/80 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <CheckCircle size={14} /> Aprobar
                              </button>
                              <button
                                onClick={() => selectedReq && evaluarItem.mutate({ reqId: selectedReq.id, detalleId: det.id, accion: 'RECHAZADO' })}
                                disabled={evaluarItem.isPending}
                                className="text-danger hover:text-danger/80 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <XCircle size={14} /> Rechazar
                              </button>
                            </div>
                          )}
                          {det.estadoItem === 'APROBADO_BODEGA' && hasRole(['BODEGUERO']) && (
                            <div className="flex justify-end">
                              <button
                                disabled={evaluarItem.isPending}
                                className="text-info hover:text-info/80 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Truck size={14} /> Despachar
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Requerimiento" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Proyecto</label>
              <SmartCombobox options={proyectoOptions} value={proyectoSeleccionado} onChange={setProyectoSeleccionado} placeholder="Seleccionar proyecto..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Bodega de Retiro *</label>
              <SmartCombobox options={bodegaOptions} value={bodegaSeleccionada} onChange={setBodegaSeleccionada} placeholder="Seleccionar bodega..." />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-text-primary">Materiales</label>
              <button onClick={addDetalle} className="text-accent hover:text-accent/80 text-xs font-semibold flex items-center gap-1 transition-colors">
                <Plus size={14} /> Agregar
              </button>
            </div>
            <div className="space-y-2">
              {detalles.map((det, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <SmartCombobox
                      options={materialOptions}
                      value={det.materialId > 0 ? materialOptions.find(m => m.id === det.materialId) || null : null}
                      onChange={(opt) => { if (!opt) return; updateDetalle(i, 'materialId', Number(opt.id)); }}
                      placeholder="Buscar material..."
                    />
                  </div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Cant."
                    value={det.cantidadSolicitada}
                    onChange={(e) => updateDetalle(i, 'cantidadSolicitada', e.target.value)}
                    className="w-24 px-3 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm text-center focus:outline-none focus:border-accent transition-all"
                  />
                  {detalles.length > 1 && (
                    <button onClick={() => removeDetalle(i)} className="text-danger hover:text-danger/80 transition-colors p-1 cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} loading={crear.isPending}>Crear Requerimiento</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
