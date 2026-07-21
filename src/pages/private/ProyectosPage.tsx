import { useState } from 'react';
import { useProyectos } from '../../store/useProyectos';
import { useAuth } from '../../contexts/AuthContext';
import type { Proyecto, EstadoProyecto } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus } from 'lucide-react';

const emptyForm = { nombre: '', codigoProyecto: '', fechaInicio: '', estado: 'ACTIVO' as EstadoProyecto };

export default function ProyectosPage() {
  const { proyectos, isLoading, crear, actualizar, eliminar } = useProyectos();
  const { hasRole } = useAuth();
  const isAdmin = hasRole(['ADMIN']);

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<Proyecto | null>(null);
  const [deleting, setDeleting] = useState<Proyecto | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (item: Proyecto) => {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      codigoProyecto: item.codigoProyecto ?? '',
      fechaInicio: item.fechaInicio ? item.fechaInicio.slice(0, 10) : '',
      estado: item.estado,
    });
    setModalOpen(true);
  };

  const openDelete = (item: Proyecto) => { setDeleting(item); setConfirmOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editing) {
      await actualizar.mutateAsync({
        id: editing.id,
        dto: {
          nombre: form.nombre,
          fechaInicio: form.fechaInicio,
          estado: form.estado,
          ...(form.codigoProyecto ? { codigoProyecto: form.codigoProyecto } : {}),
        },
      });
    } else {
      await crear.mutateAsync({
        nombre: form.nombre,
        fechaInicio: form.fechaInicio,
        ...(form.codigoProyecto ? { codigoProyecto: form.codigoProyecto } : {}),
      });
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await eliminar.mutateAsync(deleting.id);
    setConfirmOpen(false);
    setDeleting(null);
  };

  const columns = [
    { key: 'nombre', header: 'Nombre', sortable: true },
    { key: 'codigoProyecto', header: 'Código', sortable: true },
    {
      key: 'fechaInicio', header: 'Fecha de inicio',
      sortable: true,
      sortValue: (item: Proyecto) => item.fechaInicio ?? '',
      render: (item: Proyecto) => item.fechaInicio ? new Date(item.fechaInicio).toLocaleDateString() : '-',
    },
    {
      key: 'estado', header: 'Estado',
      render: (item: Proyecto) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}>
          {item.estado}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Proyectos</h1>
        {isAdmin && (
          <Button onClick={openCreate}>
            <Plus size={16} className="inline mr-1" /> Nuevo
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={proyectos}
        loading={isLoading}
        onEdit={isAdmin ? openEdit : undefined}
        onDelete={isAdmin ? openDelete : undefined}
        searchable
        searchKeys={["nombre", "estado"]}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Proyecto' : 'Nuevo Proyecto'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre</label>
            <input placeholder="Ej: Construcción Torre Norte" value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Código de proyecto (opcional)</label>
            <input placeholder="Se genera automático si se deja vacío: PROY-2026-001" value={form.codigoProyecto}
              onChange={e => setForm({ ...form, codigoProyecto: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Fecha de inicio</label>
            <input type="date" value={form.fechaInicio}
              onChange={e => setForm({ ...form, fechaInicio: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          {editing && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Estado</label>
              <select value={form.estado}
                onChange={e => setForm({ ...form, estado: e.target.value as EstadoProyecto })}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="ACTIVO">ACTIVO</option>
                <option value="CERRADO">CERRADO</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={crear.isPending || actualizar.isPending}>
              {editing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar proyecto"
        message={`¿Estás seguro de eliminar el proyecto "${deleting?.nombre}"? Se eliminará también la bodega de obra asociada.`}
        loading={eliminar.isPending} />
    </div>
  );
}