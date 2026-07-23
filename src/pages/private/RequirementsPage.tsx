import { useState } from 'react';
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
import { Plus, Trash2 } from 'lucide-react';

const badgeColors: Record<RequirementStatus, string> = {
  PENDIENTE: 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30',
  APROBADO: 'bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30',
  PARCIALMENTE_ATENDIDO: 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/30',
  ATENDIDO: 'bg-primary/10 text-primary border border-primary/30',
  RECHAZADO: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30',
};

type DetalleForm = { materialId: string; cantidadSolicitada: string };

const emptyDetalle = (): DetalleForm => ({ materialId: '', cantidadSolicitada: '' });

interface StatusAction {
  requirement: Requirement;
  estado: RequirementStatus;
  label: string;
}

export default function RequirementsPage() {
  const { requirements, isLoading, crear, actualizarEstado, eliminar } = useRequirements();
  const { proyectos } = useProyectos();
  const { hasRole } = useAuth();

  // Lógica de roles corregida
  const canChangeStatus = hasRole(['ADMIN', 'BODEGUERO']);
  const canCreate = hasRole(['ADMIN', 'BODEGUERO', 'SOLICITANTE']);
  const isAdmin = hasRole(['ADMIN']);

  // GET /materiales es público, se usa solo para poblar el select del formulario
  const { data: materiales = [] } = useQuery({
    queryKey: ['materiales'],
    queryFn: async () => {
      const res = await materialesApi.getAll();
      return res.data;
    },
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [proyectoId, setProyectoId] = useState('');
  const [detalles, setDetalles] = useState<DetalleForm[]>([emptyDetalle()]);

  const [statusAction, setStatusAction] = useState<StatusAction | null>(null);
  const [deleting, setDeleting] = useState<Requirement | null>(null);

  const openCreate = () => {
    setProyectoId('');
    setDetalles([emptyDetalle()]);
    setModalOpen(true);
  };

  const addDetalle = () => setDetalles([...detalles, emptyDetalle()]);
  const removeDetalle = (index: number) => setDetalles(detalles.filter((_, i) => i !== index));
  const updateDetalle = (index: number, field: keyof DetalleForm, value: string) => {
    const next = [...detalles];
    next[index] = { ...next[index], [field]: value };
    setDetalles(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proyectoId) {
      toast.error('Seleccioná un proyecto');
      return;
    }

    const detallesValidos = detalles
      .filter(d => d.materialId !== '' && Number(d.cantidadSolicitada) > 0)
      .map(d => ({ materialId: Number(d.materialId), cantidadSolicitada: Number(d.cantidadSolicitada) }));

    if (detallesValidos.length === 0) {
      toast.error('Agregá al menos un material con cantidad válida');
      return;
    }

    await crear.mutateAsync({ proyectoId, detalles: detallesValidos });
    setModalOpen(false);
  };

  const handleStatusConfirm = async () => {
    if (!statusAction) return;
    try {
      await actualizarEstado.mutateAsync({ id: statusAction.requirement.id, estado: statusAction.estado });
    } catch {
      // Error manejado por onError en useRequirements
    }
    setStatusAction(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await eliminar.mutateAsync(deleting.id);
    } catch {
      // Error manejado por onError en useRequirements
    }
    setDeleting(null);
  };

  const columns = [
    {
      key: 'id', header: 'ID',
      sortable: true,
      sortValue: (item: Requirement) => item.id,
      render: (item: Requirement) => (
        <span className="font-mono text-xs bg-card text-muted-foreground px-2.5 py-1 rounded-md border border-border font-semibold">
          REQ-{item.id}
        </span>
      ),
    },
    {
      key: 'proyecto', header: 'Proyecto',
      sortable: true,
      sortValue: (item: Requirement) => item.proyecto?.nombre ?? '',
      render: (item: Requirement) => <span className="text-card-foreground font-bold">{item.proyecto?.nombre ?? '-'}</span>,
    },
    {
      key: 'usuarioSolicitante', header: 'Solicitante',
      sortable: true,
      sortValue: (item: Requirement) => item.usuarioSolicitante?.nombre ?? '',
      render: (item: Requirement) => <span className="text-muted-foreground">{item.usuarioSolicitante?.nombre ?? '-'}</span>,
    },
    {
      key: 'fechaSolicitud', header: 'Fecha',
      sortable: true,
      sortValue: (item: Requirement) => item.fechaSolicitud ?? '',
      render: (item: Requirement) => <span className="text-muted-foreground">{item.fechaSolicitud ? new Date(item.fechaSolicitud).toLocaleDateString() : '-'}</span>,
    },
    {
      key: 'estado', header: 'Estado',
      render: (item: Requirement) => (
        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold border ${badgeColors[item.estado]}`}>
          {item.estado}
        </span>
      ),
    },
    {
      key: 'acciones', header: 'Acciones',
      render: (item: Requirement) => (
        <div className="flex justify-end gap-2">
          {canChangeStatus && item.estado === 'PENDIENTE' && (
            <button
              onClick={() => setStatusAction({ requirement: item, estado: 'APROBADO', label: 'aprobar' })}
              className="text-[#3B82F6] hover:text-[#3B82F6]/80 text-xs font-medium cursor-pointer"
            >
              Aprobar
            </button>
          )}
          {canChangeStatus && item.estado === 'APROBADO' && (
            <button
              onClick={() => setStatusAction({ requirement: item, estado: 'ATENDIDO', label: 'marcar como atendido' })}
              className="text-primary hover:text-primary/80 text-xs font-medium cursor-pointer"
            >
              Marcar Atendido
            </button>
          )}
          {canChangeStatus && item.estado !== 'RECHAZADO' && item.estado !== 'ATENDIDO' && (
            <button
              onClick={() => setStatusAction({ requirement: item, estado: 'RECHAZADO', label: 'rechazar' })}
              className="text-[#EF4444] hover:text-[#EF4444]/80 text-xs font-medium cursor-pointer"
            >
              Rechazar
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setDeleting(item)}
              className="text-muted-foreground hover:text-card-foreground text-xs font-medium cursor-pointer"
            >
              Eliminar
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-card-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>Requerimientos</h1>
          <p className="text-muted-foreground mt-2 text-sm">Gestioná las solicitudes de materiales para tus proyectos.</p>
        </div>
        {canCreate && (
          <Button onClick={openCreate} className="bg-accent hover:bg-accent/80 text-white font-bold px-6 py-2 rounded-xl border border-border transition-all shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 cursor-pointer flex items-center">
            <Plus size={18} className="mr-1.5" /> Nuevo Requerimiento
          </Button>
        )}
      </div>

      <div className="bg-card backdrop-blur-lg rounded-3xl border border-border p-6 shadow-2xl overflow-hidden">
        <DataTable columns={columns} data={requirements} loading={isLoading} searchable searchKeys={["codigo", "estado"]} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Requerimiento">
        <form onSubmit={handleSubmit} className="space-y-5 text-muted-foreground p-1">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Proyecto</label>
            <select value={proyectoId} onChange={e => setProyectoId(e.target.value)}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer" required>
              <option value="" className="bg-background">Seleccioná un proyecto</option>
              {proyectos.map(p => (
                <option key={p.id} value={p.id} className="bg-background">{p.codigoProyecto} - {p.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-card-foreground">Materiales</label>
              <button type="button" onClick={addDetalle} className="text-accent hover:text-accent/80 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer">
                <Plus size={14} /> Agregar material
              </button>
            </div>

            <div className="space-y-3">
              {detalles.map((detalle, index) => (
                <div key={index} className="flex gap-3 items-center bg-background p-3.5 rounded-2xl border border-border">
                  <select value={detalle.materialId}
                    onChange={e => updateDetalle(index, 'materialId', e.target.value)}
                    className="flex-1 bg-card text-card-foreground border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-all cursor-pointer" required>
                    <option value="" className="bg-card">Material...</option>
                    {materiales.map(m => (
                      <option key={m.id} value={m.id} className="bg-card">{m.nombre} ({m.sku})</option>
                    ))}
                  </select>
                  <input type="number" step="1" min="1" placeholder="Cantidad"
                    value={detalle.cantidadSolicitada}
                    onChange={e => updateDetalle(index, 'cantidadSolicitada', e.target.value)}
                    onKeyDown={e => { if (['.', ',', 'e', '+', '-'].includes(e.key)) e.preventDefault(); }}
                    className="w-full sm:w-28 bg-card text-card-foreground border border-border rounded-xl px-4 py-2.5 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent transition-all font-bold" required />
                  <button type="button" onClick={() => removeDetalle(index)}
                    disabled={detalles.length === 1}
                    className="text-[#EF4444] hover:text-[#EF4444]/80 disabled:opacity-30 p-2 rounded-xl transition-colors cursor-pointer">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="bg-secondary hover:bg-black/10 dark:hover:bg-white/10 text-card-foreground border border-border px-5 py-2.5 rounded-xl font-medium transition-all cursor-pointer">Cancelar</Button>
            <Button type="submit" disabled={crear.isPending} className="bg-accent hover:bg-accent/80 text-white font-bold px-6 py-2.5 rounded-xl border border-border transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
              {crear.isPending ? 'Guardando...' : 'Crear Requerimiento'}
            </Button>
          </div>
        </form>
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