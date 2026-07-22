import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useRequirements } from '../../store/useRequirements';
import { useProyectos } from '../../store/useProyectos';
import { materialesApi } from '../../api/materiales.api';
import { useAuth } from '../../contexts/AuthContext';
import type { Requirement, RequirementStatus } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SmartCombobox } from '../../components/ui/SmartCombobox';
import type { ComboboxOption } from '../../components/ui/SmartCombobox';
import { RequirementTimeline } from '../../components/ui/RequirementTimeline';
import type { TimelineEvent } from '../../components/ui/RequirementTimeline';
import { getBadgeStyle } from '../../lib/design-tokens';
import { Plus, Trash2, History } from 'lucide-react';

type DetalleForm = { materialId: number; cantidadSolicitada: string };

const emptyDetalle = (): DetalleForm => ({ materialId: 0, cantidadSolicitada: '' });

interface StatusAction {
  requirement: Requirement;
  estado: RequirementStatus;
  label: string;
}

const generateMockTimeline = (req: Requirement): TimelineEvent[] => {
  const events: TimelineEvent[] = [
    {
      id: '1',
      fecha: req.fechaSolicitud || new Date().toISOString(),
      titulo: 'Requerimiento Creado',
      descripcion: `Solicitud REQ-${req.id} generada por ${req.usuarioSolicitante?.nombre || 'el usuario'}.`,
      tipo: 'CREACION'
    }
  ];

  if (req.estado !== 'PENDIENTE') {
    events.push({
      id: '2',
      fecha: new Date(new Date(req.fechaSolicitud || new Date()).getTime() + 3600000).toISOString(),
      titulo: req.estado === 'RECHAZADO' ? 'Requerimiento Rechazado' : 'Aprobación de Administrador',
      descripcion: req.estado === 'RECHAZADO' ? 'El requerimiento fue denegado.' : 'El requerimiento fue aprobado y pasó a revisión logística.',
      tipo: req.estado === 'RECHAZADO' ? 'RECHAZADO' : 'APROBACION'
    });
  }

  if (req.estado === 'PARCIALMENTE_ATENDIDO') {
    events.push({
      id: '3',
      fecha: new Date(new Date(req.fechaSolicitud || new Date()).getTime() + 7200000).toISOString(),
      titulo: 'División de Requerimiento (Split)',
      descripcion: `Stock insuficiente en bodega principal. Se preparó un despacho parcial y el remanente pasó a compras.`,
      tipo: 'SPLIT'
    });
  }

  if (req.estado === 'ATENDIDO' || req.estado === 'PARCIALMENTE_ATENDIDO') {
      events.push({
      id: '4',
      fecha: new Date().toISOString(),
      titulo: 'Despacho Confirmado',
      descripcion: 'Materiales entregados en obra de forma exitosa.',
      tipo: 'DESPACHO'
    });
  }

  return events;
};

export default function RequirementsPage() {
  const { requirements, isLoading, crear, actualizarEstado, eliminar } = useRequirements();
  const { proyectos } = useProyectos();
  const { hasRole } = useAuth();

  const canApproveReject = hasRole(['ADMIN']); 
  const canMarkAttended = hasRole(['ADMIN', 'BODEGUERO']); 
  const canCreate = hasRole(['ADMIN', 'SOLICITANTE']); 
  const isAdmin = hasRole(['ADMIN']);

  const { data: materiales = [] } = useQuery({
    queryKey: ['materiales'],
    queryFn: async () => {
      const res = await materialesApi.getAll();
      return res.data;
    },
  });

  const materialOptions: ComboboxOption[] = materiales.map((m: any) => ({
    id: m.id,
    nombre: `${m.sku} - ${m.nombre}`,
  }));

  const proyectoOptions: ComboboxOption[] = proyectos.map((p: any) => ({
    id: p.id,
    nombre: `${p.codigoProyecto || 'PROY'} - ${p.nombre}`,
  }));

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProyecto, setSelectedProyecto] = useState<ComboboxOption | null>(null);
  const [detalles, setDetalles] = useState<DetalleForm[]>([emptyDetalle()]);

  const [statusAction, setStatusAction] = useState<StatusAction | null>(null);
  const [deleting, setDeleting] = useState<Requirement | null>(null);

  const [timelineOpen, setTimelineOpen] = useState(false);
  const [selectedReqForTimeline, setSelectedReqForTimeline] = useState<Requirement | null>(null);

  const openCreate = () => {
    setSelectedProyecto(null);
    setDetalles([emptyDetalle()]);
    setModalOpen(true);
  };

  const addDetalle = () => setDetalles([...detalles, emptyDetalle()]);
  const removeDetalle = (index: number) => setDetalles(detalles.filter((_, i) => i !== index));
  
  const updateCantidad = (index: number, cantidad: string) => {
    const next = [...detalles];
    next[index] = { ...next[index], cantidadSolicitada: cantidad };
    setDetalles(next);
  };

  const updateMaterial = (index: number, option: ComboboxOption) => {
    const next = [...detalles];
    next[index] = { ...next[index], materialId: Number(option.id) };
    setDetalles(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProyecto) {
      toast.error('Seleccioná un proyecto válido');
      return;
    }

    const detallesValidos = detalles
      .filter(d => d.materialId !== 0 && Number(d.cantidadSolicitada) > 0)
      .map(d => ({ materialId: d.materialId, cantidadSolicitada: Number(d.cantidadSolicitada) }));

    if (detallesValidos.length === 0) {
      toast.error('Agregá al menos un material con cantidad válida');
      return;
    }

    await crear.mutateAsync({ proyectoId: String(selectedProyecto.id), detalles: detallesValidos });
    setModalOpen(false);
  };

  const handleStatusConfirm = async () => {
    if (!statusAction) return;
    await actualizarEstado.mutateAsync({ id: statusAction.requirement.id, estado: statusAction.estado });
    setStatusAction(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await eliminar.mutateAsync(deleting.id);
    setDeleting(null);
  };

  const openTimeline = (req: Requirement) => {
    setSelectedReqForTimeline(req);
    setTimelineOpen(true);
  };

  const columns = [
    {
      key: 'id', header: 'ID',
      sortable: true,
      sortValue: (item: Requirement) => item.id,
      render: (item: Requirement) => (
        <span className="font-mono text-xs bg-base text-text-muted px-2.5 py-1 rounded-lg border border-border-subtle font-semibold">
          REQ-{item.id}
        </span>
      ),
    },
    {
      key: 'proyecto', header: 'Proyecto',
      sortable: true,
      sortValue: (item: Requirement) => item.proyecto?.nombre ?? '',
      render: (item: Requirement) => <span className="text-text-primary font-bold">{item.proyecto?.nombre ?? '-'}</span>,
    },
    {
      key: 'usuarioSolicitante', header: 'Solicitante',
      sortable: true,
      sortValue: (item: Requirement) => item.usuarioSolicitante?.nombre ?? '',
      render: (item: Requirement) => <span className="text-text-secondary">{item.usuarioSolicitante?.nombre ?? '-'}</span>,
    },
    {
      key: 'fechaSolicitud', header: 'Fecha',
      sortable: true,
      sortValue: (item: Requirement) => item.fechaSolicitud ?? '',
      render: (item: Requirement) => <span className="text-text-secondary">{item.fechaSolicitud ? new Date(item.fechaSolicitud).toLocaleDateString() : '-'}</span>,
    },
    {
      key: 'estado', header: 'Estado',
      render: (item: Requirement) => (
        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold border ${getBadgeStyle(item.estado)}`}>
          {item.estado}
        </span>
      ),
    },
    {
      key: 'acciones', header: 'Acciones',
      render: (item: Requirement) => (
        <div className="flex justify-end gap-3 items-center">
          <button
            onClick={() => openTimeline(item)}
            className="text-accent hover:text-accent/80 text-xs font-medium cursor-pointer flex items-center gap-1 transition-colors"
            title="Ver trazabilidad"
          >
            <History size={14} /> Historial
          </button>

          {canApproveReject && item.estado === 'PENDIENTE' && (
            <button
              onClick={() => setStatusAction({ requirement: item, estado: 'APROBADO', label: 'aprobar' })}
              className="text-accent hover:text-accent/80 text-xs font-medium cursor-pointer transition-colors"
            >
              Aprobar
            </button>
          )}
          {canMarkAttended && item.estado === 'APROBADO' && (
            <button
              onClick={() => setStatusAction({ requirement: item, estado: 'ATENDIDO', label: 'marcar como atendido' })}
              className="text-success hover:text-success/80 text-xs font-medium cursor-pointer transition-colors"
            >
              Marcar Atendido
            </button>
          )}
          {canApproveReject && item.estado !== 'RECHAZADO' && item.estado !== 'ATENDIDO' && (
            <button
              onClick={() => setStatusAction({ requirement: item, estado: 'RECHAZADO', label: 'rechazar' })}
              className="text-danger hover:text-danger/80 text-xs font-medium cursor-pointer transition-colors"
            >
              Rechazar
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setDeleting(item)}
              className="text-text-muted hover:text-text-primary text-xs font-medium cursor-pointer transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Requerimientos</h1>
          <p className="text-sm text-text-secondary mt-1">Gestioná las solicitudes de materiales para tus proyectos.</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate} className="gap-1.5">
            <Plus size={16} /> Nuevo Requerimiento
          </Button>
        )}
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle p-6">
        <DataTable columns={columns} data={requirements} loading={isLoading} searchable searchKeys={["codigo", "estado"]} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Requerimiento">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Proyecto</label>
            <SmartCombobox
              options={proyectoOptions}
              value={selectedProyecto}
              onChange={setSelectedProyecto}
              placeholder="Buscar proyecto por nombre o código..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-text-primary">Materiales</label>
              <button type="button" onClick={addDetalle} className="text-accent hover:text-accent/80 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer">
                <Plus size={14} /> Agregar material
              </button>
            </div>

            <div className="space-y-3">
              {detalles.map((detalle, index) => {
                const currentMaterialOption = materialOptions.find(m => m.id === detalle.materialId) || null;
                return (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 items-center bg-base p-3.5 rounded-xl border border-border-subtle">
                    <div className="flex-1 w-full">
                      <SmartCombobox
                        options={materialOptions}
                        value={currentMaterialOption}
                        onChange={(opt) => updateMaterial(index, opt)}
                        placeholder="Buscar material o SKU..."
                      />
                    </div>
                    <input type="number" step="1" min="1" placeholder="Cantidad"
                      value={detalle.cantidadSolicitada}
                      onChange={e => updateCantidad(index, e.target.value)}
                      onKeyDown={e => { if (['.', ',', 'e', '+', '-'].includes(e.key)) e.preventDefault(); }}
                      className="w-full sm:w-28 bg-base text-text-primary border border-border-subtle rounded-xl px-4 py-2.5 text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all" required />
                    <button type="button" onClick={() => removeDetalle(index)}
                      disabled={detalles.length === 1}
                      className="text-danger hover:text-danger/80 disabled:opacity-30 p-2 rounded-xl transition-colors cursor-pointer">
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={crear.isPending}>
              {crear.isPending ? 'Guardando...' : 'Crear Requerimiento'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal 
        open={timelineOpen} 
        onClose={() => setTimelineOpen(false)} 
        title={selectedReqForTimeline ? `Trazabilidad - REQ-${selectedReqForTimeline.id}` : 'Trazabilidad'}
      >
        <div className="p-2 sm:p-4 overflow-y-auto max-h-[70vh]">
          {selectedReqForTimeline ? (
            <RequirementTimeline 
              eventos={generateMockTimeline(selectedReqForTimeline)} 
              estadoActual={selectedReqForTimeline.estado} 
            />
          ) : (
            <p className="text-center text-text-secondary">Cargando historial...</p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!statusAction}
        onClose={() => setStatusAction(null)}
        onConfirm={handleStatusConfirm}
        title="Cambiar estado"
        message={statusAction ? `¿Confirmás que querés ${statusAction.label} el requerimiento REQ-${statusAction.requirement.id}?` : ''}
        loading={actualizarEstado.isPending}
        confirmLabel={statusAction?.estado === 'APROBADO' ? 'Aprobar' : statusAction?.estado === 'RECHAZADO' ? 'Rechazar' : statusAction?.estado === 'ATENDIDO' ? 'Marcar Atendido' : 'Confirmar'}
        loadingLabel={statusAction?.estado === 'APROBADO' ? 'Aprobando...' : statusAction?.estado === 'RECHAZADO' ? 'Rechazando...' : statusAction?.estado === 'ATENDIDO' ? 'Procesando...' : 'Procesando...'}
        variant={statusAction?.estado === 'APROBADO' ? 'success' : 'danger'}
      />

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Eliminar requerimiento"
        message={deleting ? `¿Estás seguro de eliminar el requerimiento REQ-${deleting.id}? Esta acción no se puede deshacer.` : ''}
        loading={eliminar.isPending}
      />
    </div>
  );
}
