import { useState } from 'react';
import { useSolicitudes } from '../../store/useSolicitudes';
import { useProyectos } from '../../store/useProyectos';
import { useMateriales } from '../../store/useMateriales';
import { useAuth } from '../../contexts/AuthContext';
import type { SolicitudCompra, UpdateSolicitudDto, EstadoSolicitud, NivelPrioridad } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Eye, Pencil, Plus, Trash2, CheckCircle } from 'lucide-react';
import { getBadgeStyle } from '../../lib/design-tokens';

interface DetalleForm {
  materialId: number;
  cantidadRequerida: number;
}

export default function SolicitudesPage() {
  const { hasRole, user } = useAuth();
  const { proyectos } = useProyectos();
  const { materiales } = useMateriales();

  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroProyecto, setFiltroProyecto] = useState<string>('');

  const { solicitudes, isLoading, crear, actualizar, cotizar, aprobar, procesar } = useSolicitudes({
    estado: filtroEstado || undefined,
    proyectoId: filtroProyecto || undefined,
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selected, setSelected] = useState<SolicitudCompra | null>(null);
  const [editForm, setEditForm] = useState<UpdateSolicitudDto>({});

  const [createForm, setCreateForm] = useState({
    proyectoId: '',
    usuarioSolicitanteId: user?.id ?? '',
    nivelPrioridad: 'MEDIA' as NivelPrioridad,
    detalles: [] as DetalleForm[],
  });

  const openCreate = () => {
    setCreateForm({
      proyectoId: '',
      usuarioSolicitanteId: user?.id ?? '',
      nivelPrioridad: 'MEDIA',
      detalles: [{ materialId: 0, cantidadRequerida: 1 }],
    });
    setCreateModalOpen(true);
  };

  const openEdit = (item: SolicitudCompra) => {
    setSelected(item);
    setEditForm({ estado: item.estado, nivelPrioridad: item.nivelPrioridad });
    setEditModalOpen(true);
  };

  const openDetail = (item: SolicitudCompra) => {
    setSelected(item);
    setDetailModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const detalles = createForm.detalles
      .filter(d => d.materialId !== 0)
      .map(d => ({ materialId: Number(d.materialId), cantidadRequerida: Number(d.cantidadRequerida) }));
    await crear.mutateAsync({
      proyectoId: createForm.proyectoId,
      usuarioSolicitanteId: createForm.usuarioSolicitanteId,
      nivelPrioridad: createForm.nivelPrioridad,
      detalles,
    });
    setCreateModalOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    await actualizar.mutateAsync({ id: selected.id, dto: editForm });
    setEditModalOpen(false);
    setSelected(null);
  };

  const addDetalle = () => {
    setCreateForm({ ...createForm, detalles: [...createForm.detalles, { materialId: 0, cantidadRequerida: 1 }] });
  };

  const removeDetalle = (index: number) => {
    setCreateForm({ ...createForm, detalles: createForm.detalles.filter((_: DetalleForm, i: number) => i !== index) });
  };

  const updateDetalle = (index: number, field: keyof DetalleForm, value: string | number) => {
    const newDetalles = [...createForm.detalles];
    newDetalles[index] = { ...newDetalles[index], [field]: value };
    setCreateForm({ ...createForm, detalles: newDetalles });
  };

  const columns = [
    {
      key: 'codigo',
      header: 'Código',
      render: (item: SolicitudCompra) => (
        <span className="font-mono text-xs bg-success-bg text-success px-2.5 py-1 rounded-lg border border-success/20 font-semibold">
          {item.codigo}
        </span>
      )
    },
    {
      key: 'proyecto', header: 'Proyecto',
      render: (item: SolicitudCompra) => <span className="text-text-primary font-medium">{item.proyecto?.nombre ?? '-'}</span>,
    },
    {
      key: 'usuarioSolicitante', header: 'Solicitante',
      render: (item: SolicitudCompra) => <span className="text-text-secondary">{item.usuarioSolicitante?.nombre ?? '-'}</span>,
    },
    {
      key: 'fechaSolicitud', header: 'Fecha',
      render: (item: SolicitudCompra) => <span className="text-text-secondary">{new Date(item.fechaSolicitud).toLocaleDateString()}</span>,
    },
    {
      key: 'estado', header: 'Estado',
      render: (item: SolicitudCompra) => (
        <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-semibold border ${getBadgeStyle(item.estado)}`}>
          {item.estado}
        </span>
      ),
    },
    {
      key: 'nivelPrioridad', header: 'Prioridad',
      render: (item: SolicitudCompra) => (
        <span className={`inline-block px-2.5 py-1 rounded-xl text-xs font-semibold border ${getBadgeStyle(item.nivelPrioridad)}`}>
          {item.nivelPrioridad}
        </span>
      ),
    },
    {
      key: 'acciones', header: 'Acciones',
      render: (item: SolicitudCompra) => (
        <div className="flex gap-1.5 justify-end">
          {hasRole(['COMPRADOR']) && item.estado === 'PENDIENTE' && (
            <Button variant="primary" size="sm" onClick={() => cotizar.mutateAsync(item.id)}>
              Marcar como Cotizando
            </Button>
          )}
          {hasRole(['ADMIN']) && item.estado === 'COTIZADO' && (
            <Button variant="primary" size="sm" onClick={() => aprobar.mutateAsync(item.id)}>
              <CheckCircle size={14} /> Aprobar
            </Button>
          )}
          {hasRole(['ADMIN']) && item.estado === 'APROBADA' && (
            <Button variant="primary" size="sm" onClick={() => procesar.mutateAsync(item.id)}>
              <CheckCircle size={14} /> Procesar
            </Button>
          )}
          {hasRole(['SOLICITANTE']) && item.estado === 'PENDIENTE' && item.usuarioSolicitanteId === user?.id && (
            <Button variant="secondary" size="sm" onClick={() => openEdit(item)}>
              <Pencil size={14} className="text-warning" /> Editar
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => openDetail(item)}>
            <Eye size={14} className="text-info" /> Ver
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Solicitudes de Compra</h1>
          <p className="text-sm text-text-secondary mt-1">Creación y seguimiento de requerimientos de abastecimiento.</p>
        </div>
        {hasRole(['SOLICITANTE']) && (
          <Button onClick={openCreate} className="gap-1.5">
            <Plus size={16} /> Nueva Solicitud
          </Button>
        )}
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle p-4 flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full sm:w-48">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Estado</label>
          <select
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            className="w-full px-3 py-2 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
          >
            <option value="">Todos</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="COTIZANDO">COTIZANDO</option>
            <option value="APROBADA">APROBADA</option>
            <option value="RECHAZADA">RECHAZADA</option>
          </select>
        </div>

        {hasRole(['ADMIN']) && (
          <div className="w-full sm:w-64">
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">Proyecto</label>
            <select
              value={filtroProyecto}
              onChange={e => setFiltroProyecto(e.target.value)}
              className="w-full px-3 py-2 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
            >
              <option value="">Todos</option>
              {proyectos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle p-6">
        <DataTable columns={columns} data={solicitudes} loading={isLoading} searchable searchKeys={["codigo", "estado"]} />
      </div>

      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Nueva Solicitud de Compra">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Proyecto</label>
            <select
              value={createForm.proyectoId}
              onChange={e => setCreateForm({ ...createForm, proyectoId: e.target.value })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              required
            >
              <option value="">Seleccione proyecto</option>
              {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Prioridad</label>
            <select
              value={createForm.nivelPrioridad}
              onChange={e => setCreateForm({ ...createForm, nivelPrioridad: e.target.value as NivelPrioridad })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
            >
              <option value="ALTA">ALTA</option>
              <option value="MEDIA">MEDIA</option>
              <option value="BAJA">BAJA</option>
            </select>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-text-primary">Materiales</label>
              <button
                type="button"
                onClick={addDetalle}
                className="text-success hover:text-success/80 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={16} /> Agregar
              </button>
            </div>

            {createForm.detalles.length === 0 && (
              <div className="p-4 rounded-xl bg-base border border-border-subtle text-center">
                <p className="text-sm text-text-secondary">Agrega al menos un material a la solicitud.</p>
              </div>
            )}

            <div className="space-y-3">
              {createForm.detalles.map((det, i) => (
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
                    placeholder="Cantidad"
                    value={det.cantidadRequerida}
                    onChange={e => updateDetalle(i, 'cantidadRequerida', Number(e.target.value))}
                    onKeyDown={e => { if (['.', ',', 'e', '+', '-'].includes(e.key)) e.preventDefault(); }}
                    className="w-full sm:w-28 px-3 py-2 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent transition-all"
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

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button variant="secondary" type="button" onClick={() => setCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={crear.isPending || createForm.detalles.length === 0} loading={crear.isPending}>
              Crear Solicitud
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Editar Solicitud — ${selected?.codigo ?? ''}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Estado</label>
            <select
              value={editForm.estado}
              onChange={e => setEditForm({ ...editForm, estado: e.target.value as EstadoSolicitud })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
            >
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="COTIZANDO">COTIZANDO</option>
              <option value="APROBADA">APROBADA</option>
              <option value="RECHAZADA">RECHAZADA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Nivel de Prioridad</label>
            <select
              value={editForm.nivelPrioridad}
              onChange={e => setEditForm({ ...editForm, nivelPrioridad: e.target.value as NivelPrioridad })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
            >
              <option value="ALTA">ALTA</option>
              <option value="MEDIA">MEDIA</option>
              <option value="BAJA">BAJA</option>
            </select>
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

      <Modal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title={`Detalle — ${selected?.codigo ?? ''}`}>
        {selected && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-base p-4 rounded-xl border border-border-subtle text-sm">
              <div><span className="font-semibold text-text-primary">Estado:</span> <span className={`inline-block ml-2 px-2.5 py-0.5 rounded-xl text-xs font-bold border ${getBadgeStyle(selected.estado)}`}>{selected.estado}</span></div>
              <div><span className="font-semibold text-text-primary">Prioridad:</span> <span className={`inline-block ml-2 px-2.5 py-0.5 rounded-xl text-xs font-bold border ${getBadgeStyle(selected.nivelPrioridad)}`}>{selected.nivelPrioridad}</span></div>
              <div><span className="font-semibold text-text-primary">Proyecto:</span> <span className="text-text-secondary ml-1">{selected.proyecto?.nombre ?? '-'}</span></div>
              <div><span className="font-semibold text-text-primary">Solicitante:</span> <span className="text-text-secondary ml-1">{selected.usuarioSolicitante?.nombre ?? '-'}</span></div>
              <div className="sm:col-span-2"><span className="font-semibold text-text-primary">Fecha:</span> <span className="text-text-secondary ml-1">{new Date(selected.fechaSolicitud).toLocaleString()}</span></div>
            </div>

            {selected.detalles && selected.detalles.length > 0 && (
              <div>
                <h4 className="font-bold text-text-primary text-base mb-3">Materiales Requeridos</h4>
                <div className="overflow-x-auto rounded-xl border border-border-subtle">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-base text-text-primary border-b border-border-subtle">
                        <th className="text-left px-4 py-3 font-semibold">Material</th>
                        <th className="text-right px-4 py-3 font-semibold">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle bg-surface">
                      {selected.detalles.map((d, i) => (
                        <tr key={i} className="hover:bg-elevated/50 transition-colors">
                          <td className="px-4 py-3 text-text-primary font-medium">{d.material?.nombre ?? `Material #${d.materialId}`}</td>
                          <td className="text-right px-4 py-3 font-bold text-success">{d.cantidadRequerida}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selected.cotizaciones && selected.cotizaciones.length > 0 && (
              <div>
                <h4 className="font-bold text-text-primary text-base mb-3">Cotizaciones Recibidas</h4>
                <div className="overflow-x-auto rounded-xl border border-border-subtle">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-base text-text-primary border-b border-border-subtle">
                        <th className="text-left px-4 py-3 font-semibold">Proveedor</th>
                        <th className="text-right px-4 py-3 font-semibold">Precio Total</th>
                        <th className="text-center px-4 py-3 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle bg-surface">
                      {selected.cotizaciones.map((c, i) => (
                        <tr key={i} className="hover:bg-elevated/50 transition-colors">
                          <td className="px-4 py-3 text-text-primary font-medium">{c.proveedor?.razon_social ?? `Proveedor #${c.proveedorId}`}</td>
                          <td className="text-right px-4 py-3 font-bold text-success">${Number(c.precioOfertadoTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="text-center px-4 py-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded-xl text-xs font-semibold border ${getBadgeStyle(c.estado)}`}>
                              {c.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(!selected.detalles || selected.detalles.length === 0) && (!selected.cotizaciones || selected.cotizaciones.length === 0) && (
              <p className="text-sm text-text-muted italic text-center py-2">Sin detalles ni cotizaciones asociadas.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
