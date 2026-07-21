import { useState } from 'react';
import { useMateriales } from '../../store/useMateriales';
import { useCategorias } from '../../store/useCategorias';
import { useUnidadesMedida } from '../../store/useUnidadesMedida';
import type { Material, CreateMaterialDto } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus } from 'lucide-react';

const emptyForm: CreateMaterialDto = {
  nombre: '',
  descripcion: '',
  unidad_medida_id: 0,
  categoria_id: 0,
};

export default function MaterialesPage() {
  const { materiales, isLoading, crear, actualizar, eliminar } = useMateriales();
  const { categorias, isLoading: isLoadingCats } = useCategorias();
  const { unidades: unidadesMedida, isLoading: isLoadingUnidades } = useUnidadesMedida();

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState<Material | null>(null);
  const [form, setForm] = useState<CreateMaterialDto>(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: Material) => {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      descripcion: item.descripcion ?? '',
      unidad_medida_id: item.unidadMedida?.id ?? 0,
      categoria_id: item.categoria?.id ?? 0,
    });
    setModalOpen(true);
  };

  const openDelete = (item: Material) => {
    setDeleting(item);
    setConfirmOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dto: CreateMaterialDto = {
      ...form,
      unidad_medida_id: Number(form.unidad_medida_id),
      categoria_id: Number(form.categoria_id),
    };

    if (editing) {
      await actualizar.mutateAsync({ id: editing.id, dto });
    } else {
      await crear.mutateAsync(dto);
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
    { key: 'sku', header: 'SKU' },
    { key: 'nombre', header: 'Nombre' },
    { key: 'descripcion', header: 'Descripción', render: (item: Material) => item.descripcion || '-' },
    { key: 'unidadMedida', header: 'Unidad', render: (item: Material) => item.unidadMedida?.simbolo || '-' },
    { key: 'categoria', header: 'Categoría', render: (item: Material) => item.categoria?.nombre || '-' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Catálogo de Materiales</h1>
        <Button onClick={openCreate}>
          <Plus size={16} className="inline mr-1" /> Nuevo
        </Button>
      </div>

      <DataTable columns={columns} data={materiales} loading={isLoading} onEdit={openEdit} onDelete={openDelete} searchable searchKeys={["sku", "nombre"]} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Material' : 'Nuevo Material'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              placeholder="Ej: Disco de corte"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <textarea
              placeholder="Descripción del material"
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida</label>
            <select
              value={form.unidad_medida_id}
              onChange={e => setForm({ ...form, unidad_medida_id: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value={0} disabled>Seleccione unidad</option>
              {unidadesMedida.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.simbolo})</option>)}
            </select>
            {isLoadingUnidades && <p className="text-xs text-gray-400 mt-1">Cargando unidades...</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={form.categoria_id}
              onChange={e => setForm({ ...form, categoria_id: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value={0} disabled>Seleccione categoría</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            {isLoadingCats && <p className="text-xs text-gray-400 mt-1">Cargando categorías...</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={crear.isPending || actualizar.isPending || form.categoria_id === 0 || form.unidad_medida_id === 0}>
              {editing ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar material"
        message={`¿Estás seguro de eliminar el material "${deleting?.nombre}"? Esta acción no se puede deshacer.`}
        loading={eliminar.isPending}
      />
    </div>
  );
}
