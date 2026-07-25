import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useRequirements } from '../../store/useRequirements';
import { useProyectos } from '../../store/useProyectos';
import { useBodegas } from '../../store/useBodegas';
import { useProveedores } from '../../store/useProveedores';
import { materialesApi } from '../../api/materiales.api';
import { requirementsApi } from '../../api/requirements.api';
import { comprasApi } from '../../api/compras.api';
import type { Requirement, RequirementDetalle } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { SmartCombobox } from '../../components/ui/SmartCombobox';
import type { ComboboxOption } from '../../components/ui/SmartCombobox';
import {
  Plus, Trash2, Eye, CheckCircle, XCircle, Truck, ShoppingCart, Package, FileText, Send,
} from 'lucide-react';
import toast from 'react-hot-toast';

type DetalleForm = { materialId: number; cantidadSolicitada: string };

const emptyDetalle = (): DetalleForm => ({ materialId: 0, cantidadSolicitada: '' });

const itemStatusConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  PENDIENTE: { label: 'Pendiente', icon: null, color: 'text-warning', bg: 'bg-warning/10 border-warning/20' },
  APROBADO_BODEGA: { label: 'Aprobado Bodega', icon: <CheckCircle size={13} />, color: 'text-success', bg: 'bg-success/10 border-success/20' },
  RECHAZADO: { label: 'Rechazado', icon: <XCircle size={13} />, color: 'text-danger', bg: 'bg-danger/10 border-danger/20' },
  EN_COMPRAS: { label: 'En Compras', icon: <ShoppingCart size={13} />, color: 'text-info', bg: 'bg-info/10 border-info/20' },
  EN_TRASLADO: { label: 'En Traslado', icon: <Truck size={13} />, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  DESPACHADO: { label: 'Despachado', icon: <Package size={13} />, color: 'text-success', bg: 'bg-success/10 border-success/20' },
};

const requirementStatusStyle: Record<string, string> = {
  PENDIENTE: 'bg-warning/10 text-warning border-warning/20',
  APROBADO: 'bg-info/10 text-info border-info/20',
  PARCIALMENTE_ATENDIDO: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  ATENDIDO: 'bg-success/10 text-success border-success/20',
  RECHAZADO: 'bg-danger/10 text-danger border-danger/20',
  DESPACHADO: 'bg-success/10 text-success border-success/20',
};

function ItemStatusBadge({ estado }: { estado: string }) {
  const cfg = itemStatusConfig[estado] || itemStatusConfig.PENDIENTE;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

export default function RequirementsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [detalles, setDetalles] = useState<DetalleForm[]>([emptyDetalle()]);
  const [justificativo, setJustificativo] = useState('');
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<ComboboxOption | null>(null);
  const [bodegaSeleccionada, setBodegaSeleccionada] = useState<ComboboxOption | null>(null);

  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const { crear } = useRequirements();
  const { proyectos } = useProyectos();
  const { bodegas } = useBodegas();
  const { proveedores } = useProveedores();

  const [modalOCOpen, setModalOCOpen] = useState(false);
  const [proveedorOC, setProveedorOC] = useState<ComboboxOption | null>(null);

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

  const crearOCDesdeRequerimiento = useMutation({
    mutationFn: async ({ requirementId, proveedorId }: { requirementId: number; proveedorId: number }) => {
      const { data } = await comprasApi.createFromRequirement(requirementId, { proveedorId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      toast.success('Orden de compra creada desde requerimiento');
      setModalOCOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear OC desde requerimiento');
    },
  });

  const despacharReq = useMutation({
    mutationFn: async (reqId: number) => {
      const { data } = await requirementsApi.despachar(reqId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requirements'] });
      queryClient.invalidateQueries({ queryKey: ['inventario'] });
      toast.success('Requerimiento despachado correctamente');
      setDetailOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al despachar requerimiento');
    },
  });

  const openDetail = async (req: Requirement) => {
    const { data } = await requirementsApi.getById(req.id);
    setSelectedReq(data);
    setDetailOpen(true);
  };

  const openCreate = () => {
    setDetalles([emptyDetalle()]);
    setJustificativo('');
    setProyectoSeleccionado(null);
    setBodegaSeleccionada(null);
    setModalOpen(true);
  };

  const openOCModal = () => {
    setProveedorOC(null);
    setModalOCOpen(true);
  };

  const handleSubmitOC = () => {
    if (!proveedorOC) { toast.error('Selecciona un proveedor'); return; }
    if (!selectedReq) { toast.error('No hay requerimiento seleccionado'); return; }
    crearOCDesdeRequerimiento.mutate({
      requirementId: selectedReq.id,
      proveedorId: Number(proveedorOC.id),
    });
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
    if (!justificativo.trim()) { toast.error('El justificativo es obligatorio'); return; }
    const validDetalles = detalles.filter(d => d.materialId > 0 && Number(d.cantidadSolicitada) > 0);
    if (validDetalles.length === 0) { toast.error('Agrega al menos un material válido'); return; }

    await crear.mutateAsync({
      proyectoId: String(proyectoSeleccionado.id),
      bodegaId: Number(bodegaSeleccionada.id),
      justificativo: justificativo.trim(),
      detalles: validDetalles.map(d => ({
        materialId: d.materialId,
        cantidadSolicitada: Number(d.cantidadSolicitada),
      })),
    });
    setModalOpen(false);
  };

  const materialOptions: ComboboxOption[] = materiales.map((m: any) => ({ id: m.id, nombre: `${m.sku} - ${m.nombre}`, grupo: m.categoria?.nombre || 'Sin categoría' }));
  const proyectoOptions: ComboboxOption[] = proyectos.map((p: any) => ({ id: p.id, nombre: `${p.codigoProyecto || 'PROY'} - ${p.nombre}` }));
  const bodegaOptions: ComboboxOption[] = bodegas.map((b: any) => ({ id: b.id, nombre: b.nombre }));
  const proveedorOptions: ComboboxOption[] = proveedores.map((p: any) => ({ id: p.id, nombre: p.razon_social }));

  const getItemCounts = (req: Requirement) => {
    const total = req.detalles?.length || 0;
    const pendientes = req.detalles?.filter(d => d.estadoItem === 'PENDIENTE').length || 0;
    const aprobados = req.detalles?.filter(d => d.estadoItem === 'APROBADO_BODEGA').length || 0;
    const despachados = req.detalles?.filter(d => d.estadoItem === 'DESPACHADO').length || 0;
    const compras = req.detalles?.filter(d => d.estadoItem === 'EN_COMPRAS').length || 0;
    return { total, pendientes, aprobados, despachados, compras };
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (item: Requirement) => (
        <span className="font-mono text-sm text-accent font-semibold">REQ-{String(item.id).padStart(3, '0')}</span>
      ),
      sortable: true,
    },
    {
      key: 'proyecto',
      header: 'Proyecto',
      render: (item: Requirement) => <span className="text-text-primary font-medium">{item.proyecto?.nombre ?? '-'}</span>,
      sortValue: (item: Requirement) => item.proyecto?.nombre ?? '',
    },
    {
      key: 'solicitante',
      header: 'Solicitante',
      render: (item: Requirement) => <span className="text-text-secondary">{item.usuarioSolicitante?.nombre ?? '-'}</span>,
      sortValue: (item: Requirement) => item.usuarioSolicitante?.nombre ?? '',
    },
    {
      key: 'bodega',
      header: 'Bodega',
      render: (item: Requirement) => <span className="text-text-secondary">{item.bodega?.nombre ?? '-'}</span>,
      sortValue: (item: Requirement) => item.bodega?.nombre ?? '',
    },
    {
      key: 'fecha',
      header: 'Fecha',
      render: (item: Requirement) => <span className="text-text-muted text-sm">{new Date(item.fechaSolicitud).toLocaleDateString()}</span>,
    },
    {
      key: 'items',
      header: 'Ítems',
      render: (item: Requirement) => {
        const counts = getItemCounts(item);
        return (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-success font-semibold">{counts.despachados}</span>
            <span className="text-text-muted">/</span>
            <span className="text-text-primary font-medium">{counts.total}</span>
            {counts.compras > 0 && (
              <span className="ml-1 text-info font-semibold" title={`${counts.compras} en compras`}>({counts.compras}c)</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item: Requirement) => {
        const style = requirementStatusStyle[item.estado] || requirementStatusStyle.PENDIENTE;
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${style}`}>
            {item.estado?.replace(/_/g, ' ')}
          </span>
        );
      },
    },
    {
      key: 'acciones',
      header: '',
      render: (item: Requirement) => (
        <button
          onClick={() => openDetail(item)}
          className="text-accent hover:text-accent/80 text-xs font-semibold flex items-center gap-1 transition-colors"
        >
          <Eye size={14} /> Detalle
        </button>
      ),
    },
  ];

  const renderDetailItem = (det: RequirementDetalle) => {
    const cfg = itemStatusConfig[det.estadoItem || 'PENDIENTE'];
    const isPendiente = det.estadoItem === 'PENDIENTE';
    const canEvaluar = isPendiente && hasRole(['ADMIN']) && selectedReq?.estado === 'PENDIENTE';

    return (
      <tr key={det.id} className="border-b border-border-subtle/50 hover:bg-elevated/30 transition-colors">
        <td className="py-3 px-3">
          <div className="flex flex-col">
            <span className="text-text-primary font-medium text-sm">{det.material?.nombre ?? `Material #${det.materialId}`}</span>
            <span className="text-text-muted font-mono text-xs">{det.material?.sku ?? '-'}</span>
          </div>
        </td>
        <td className="py-3 px-3 text-center">
          <span className="text-text-primary font-semibold">{det.cantidadSolicitada}</span>
        </td>
        <td className="py-3 px-3 text-center">
          <ItemStatusBadge estado={det.estadoItem || 'PENDIENTE'} />
        </td>
        <td className="py-3 px-3 text-right">
          {canEvaluar && (
            <div className="flex justify-end gap-2">
              <button
                onClick={() => selectedReq && evaluarItem.mutate({ reqId: selectedReq.id, detalleId: det.id, accion: 'APROBADO' })}
                disabled={evaluarItem.isPending}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-success bg-success/10 border border-success/20 rounded-lg hover:bg-success/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                <CheckCircle size={13} /> Aprobar
              </button>
              <button
                onClick={() => selectedReq && evaluarItem.mutate({ reqId: selectedReq.id, detalleId: det.id, accion: 'RECHAZADO' })}
                disabled={evaluarItem.isPending}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-danger bg-danger/10 border border-danger/20 rounded-lg hover:bg-danger/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                <XCircle size={13} /> Rechazar
              </button>
            </div>
          )}
          {!canEvaluar && det.estadoItem && (
            <span className="text-text-muted text-xs">{cfg?.label}</span>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Requerimientos</h1>
          <p className="text-sm text-text-secondary mt-1">Gestiona y evalúa los requerimientos de materiales</p>
        </div>
        {hasRole(['SOLICITANTE', 'ADMIN', 'BODEGUERO']) && (
          <Button onClick={openCreate} className="gap-1.5">
            <Plus size={16} /> Nuevo Requerimiento
          </Button>
        )}
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle p-6">
        <DataTable
          columns={columns}
          data={requirements}
          loading={isLoading}
          searchable
          searchKeys={['proyecto', 'solicitante']}
          searchPlaceholder="Buscar por proyecto o solicitante..."
        />
      </div>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={`REQ-${selectedReq?.id ? String(selectedReq.id).padStart(3, '0') : ''} — Detalle`}
        size="lg"
      >
        {selectedReq && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-base rounded-xl border border-border-subtle p-3">
                <p className="text-xs text-text-muted mb-1">Proyecto</p>
                <p className="text-sm font-semibold text-text-primary">{selectedReq.proyecto?.nombre ?? '-'}</p>
              </div>
              <div className="bg-base rounded-xl border border-border-subtle p-3">
                <p className="text-xs text-text-muted mb-1">Solicitante</p>
                <p className="text-sm font-semibold text-text-primary">{selectedReq.usuarioSolicitante?.nombre ?? '-'}</p>
              </div>
              <div className="bg-base rounded-xl border border-border-subtle p-3">
                <p className="text-xs text-text-muted mb-1">Bodega</p>
                <p className="text-sm font-semibold text-text-primary">{selectedReq.bodega?.nombre ?? '-'}</p>
              </div>
              <div className="bg-base rounded-xl border border-border-subtle p-3">
                <p className="text-xs text-text-muted mb-1">Estado</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${requirementStatusStyle[selectedReq.estado] || requirementStatusStyle.PENDIENTE}`}>
                  {selectedReq.estado?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {selectedReq.justificativo && (
              <div className="bg-base rounded-xl border border-border-subtle p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={14} className="text-text-muted" />
                  <p className="text-xs text-text-muted font-medium uppercase tracking-wide">Justificativo</p>
                </div>
                <p className="text-sm text-text-primary leading-relaxed">{selectedReq.justificativo}</p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left py-3 px-3 text-text-muted font-medium">Material</th>
                    <th className="text-center py-3 px-3 text-text-muted font-medium">Cant. Solicitada</th>
                    <th className="text-center py-3 px-3 text-text-muted font-medium">Estado Ítem</th>
                    <th className="text-right py-3 px-3 text-text-muted font-medium">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReq.detalles?.map(renderDetailItem)}
                </tbody>
              </table>
            </div>

            {selectedReq.detalles && selectedReq.detalles.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <span className="text-text-muted">Pendiente: {selectedReq.detalles.filter(d => d.estadoItem === 'PENDIENTE').length}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-text-muted">Aprobados: {selectedReq.detalles.filter(d => d.estadoItem === 'APROBADO_BODEGA').length}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-danger" />
                  <span className="text-text-muted">Rechazados: {selectedReq.detalles.filter(d => d.estadoItem === 'RECHAZADO').length}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-info" />
                  <span className="text-text-muted">En Compras: {selectedReq.detalles.filter(d => d.estadoItem === 'EN_COMPRAS').length}</span>
                </div>
              </div>
            )}

            {selectedReq.detalles?.some(d => d.estadoItem === 'EN_COMPRAS') && hasRole(['ADMIN', 'COMPRADOR']) && (
              <div className="flex justify-end pt-3 border-t border-border-subtle">
                <Button onClick={openOCModal} className="gap-1.5">
                  <ShoppingCart size={16} /> Crear OC desde Requerimiento
                </Button>
              </div>
            )}

            {selectedReq.detalles?.some(d => d.estadoItem === 'APROBADO_BODEGA') && hasRole(['ADMIN', 'BODEGUERO']) && (selectedReq.estado === 'APROBADO' || selectedReq.estado === 'PARCIALMENTE_ATENDIDO') && (
              <div className="flex justify-end pt-3 border-t border-border-subtle">
                <Button onClick={() => despacharReq.mutate(selectedReq.id)} loading={despacharReq.isPending} className="gap-1.5">
                  <Send size={16} /> Despachar Materiales
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Requerimiento" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Proyecto *</label>
              <SmartCombobox options={proyectoOptions} value={proyectoSeleccionado} onChange={setProyectoSeleccionado} placeholder="Seleccionar proyecto..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Bodega de Retiro *</label>
              <SmartCombobox options={bodegaOptions} value={bodegaSeleccionada} onChange={setBodegaSeleccionada} placeholder="Seleccionar bodega..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Justificativo *</label>
            <textarea
              value={justificativo}
              onChange={(e) => setJustificativo(e.target.value)}
              rows={3}
              required
              placeholder="Describe la razón de esta solicitud de materiales..."
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
            />
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

      <Modal
        open={modalOCOpen}
        onClose={() => setModalOCOpen(false)}
        title={`Crear OC — REQ-${selectedReq ? String(selectedReq.id).padStart(3, '0') : ''}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-base rounded-xl border border-border-subtle p-4">
            <p className="text-xs text-text-muted mb-2 font-medium uppercase tracking-wide">Ítems a incluir en la OC</p>
            <div className="space-y-2">
              {selectedReq?.detalles?.filter(d => d.estadoItem === 'EN_COMPRAS').map(det => (
                <div key={det.id} className="flex items-center justify-between py-2 px-3 bg-elevated/50 rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-text-primary">{det.material?.nombre ?? `Material #${det.materialId}`}</span>
                    <span className="text-xs text-text-muted font-mono">{det.material?.sku ?? '-'}</span>
                  </div>
                  <span className="text-sm font-semibold text-info">{det.cantidadSolicitada} uds</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Proveedor *</label>
            <SmartCombobox
              options={proveedorOptions}
              value={proveedorOC}
              onChange={setProveedorOC}
              placeholder="Seleccionar proveedor..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button variant="secondary" onClick={() => setModalOCOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmitOC} loading={crearOCDesdeRequerimiento.isPending}>
              <ShoppingCart size={16} /> Crear Orden de Compra
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
