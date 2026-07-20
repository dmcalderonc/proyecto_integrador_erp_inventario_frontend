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
  PENDIENTE: 'bg-yellow-100 text-yellow-800',
  APROBADO: 'bg-blue-100 text-blue-800',
  PARCIALMENTE_ATENDIDO: 'bg-orange-100 text-orange-800',
  ATENDIDO: 'bg-green-100 text-green-800',
  RECHAZADO: 'bg-red-100 text-red-800',
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
  const canManage = hasRole(['ADMIN', 'BODEGUERO']);
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
    await actualizarEstado.mutateAsync({ id: statusAction.requirement.id, estado: statusAction.estado });
    setStatusAction(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await eliminar.mutateAsync(deleting.id);
    setDeleting(null);
  };

  const columns = [
    { key: 'id', header: 'ID', render: (item: Requirement) => `REQ-${item.id}` },
    { key: 'proyecto', header: 'Proyecto', render: (item: Requirement) => item.proyecto?.nombre ?? '-' },
    {
      key: 'usuarioSolicitante', header: 'Solicitante',
      render: (item: Requirement) => item.usuarioSolicitante?.nombre ?? '-',
    },
    {
      key: 'fechaSolicitud', header: 'Fecha',
      render: (item: Requirement) => item.fechaSolicitud ? new Date(item.fechaSolicitud).toLocaleDateString() : '-',
    },
    {
      key: 'estado', header: 'Estado',
      render: (item: Requirement) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColors[item.estado]}`}>
          {item.estado}
        </span>
      ),
    },
    {
      key: 'acciones', header: 'Acciones',
      render: (item: Requirement) => (
        <div className="flex justify-end gap-2">
          {canManage && item.estado === 'PENDIENTE' && (
            <button
              onClick={() => setStatusAction({ requirement: item, estado: 'APROBADO', label: 'aprobar' })}
              className="text-blue-600 hover:underline text-xs font-medium"
            >
              Aprobar
            </button>
          )}
          {canManage && item.estado === 'APROBADO' && (
            <button
              onClick={() => setStatusAction({ requirement: item, estado: 'ATENDIDO', label: 'marcar como atendido' })}
              className="text-green-600 hover:underline text-xs font-medium"
            >
              Marcar Atendido
            </button>
          )}
          {canManage && item.estado !== 'RECHAZADO' && item.estado !== 'ATENDIDO' && (
            <button
              onClick={() => setStatusAction({ requirement: item, estado: 'RECHAZADO', label: 'rechazar' })}
              className="text-red-600 hover:underline text-xs font-medium"
            >
              Rechazar
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setDeleting(item)}
              className="text-gray-500 hover:underline text-xs font-medium"
            >
              Eliminar
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Requerimientos</h1>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus size={16} className="inline mr-1" /> Nuevo
          </Button>
        )}
      </div>

      <DataTable columns={columns} data={requirements} loading={isLoading} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Requerimiento">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Proyecto</label>
            <select value={proyectoId} onChange={e => setProyectoId(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm" required>
              <option value="">Seleccioná un proyecto</option>
              {proyectos.map(p => (
                <option key={p.id} value={p.id}>{p.codigoProyecto} - {p.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm text-gray-600">Materiales</label>
              <button type="button" onClick={addDetalle} className="text-blue-600 hover:underline text-xs font-medium">
                + Agregar material
              </button>
            </div>

            <div className="space-y-2">
              {detalles.map((detalle, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <select value={detalle.materialId}
                    onChange={e => updateDetalle(index, 'materialId', e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm" required>
                    <option value="">Material...</option>
                    {materiales.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre} ({m.sku})</option>
                    ))}
                  </select>
                  <input type="number" min="0.1" step="0.01" placeholder="Cantidad"
                    value={detalle.cantidadSolicitada}
                    onChange={e => updateDetalle(index, 'cantidadSolicitada', e.target.value)}
                    className="w-28 border rounded-lg px-3 py-2 text-sm" required />
                  <button type="button" onClick={() => removeDetalle(index)}
                    disabled={detalles.length === 1}
                    className="text-red-500 hover:text-red-700 disabled:opacity-30 p-2">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={crear.isPending}>
              {crear.isPending ? 'Guardando...' : 'Crear'}
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