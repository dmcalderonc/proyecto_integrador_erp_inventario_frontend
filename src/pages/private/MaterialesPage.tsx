import { useState } from 'react';
import { useMateriales } from '../../store/useMateriales';
import { useCategorias } from '../../store/useCategorias';
import type { Material, CreateMaterialDto } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus } from 'lucide-react';

const emptyForm: CreateMaterialDto = {
  nombre: '',
  descripcion: '',
  unidad_medida: 'U',
  categoria_id: 0,
};

const unidades = [
  { value: 'U', label: 'Unidad (U)' },
  { value: 'KG', label: 'Kilogramo (KG)' },
  { value: 'M', label: 'Metro (M)' },
  { value: 'M2', label: 'Metro cuadrado (M2)' },
];

export default function MaterialesPage() {
  const { materiales, isLoading, crear, actualizar, eliminar } = useMateriales();
  const { categorias } = useCategorias();

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState<Material | null>(null);
  const [form, setForm] = useState<CreateMaterialDto>(emptyForm);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };

  const openEdit = (item: Material) => {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      descripcion: item.descripcion ?? '',
      unidad_medida: item.unidad_medida,
      categoria_id: item.categoria_id ?? 0,
    });
    setModalOpen(true);
  };

  const openDelete = (item: Material) => { setDeleting(item); setConfirmOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dto: CreateMaterialDto = {
      ...form,
      categoria_id: Number(form.categoria_id),
    };
    if (editing) { await actualizar.mutateAsync({ id: editing.id, dto }); }
    else { await crear.mutateAsync(dto); }
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
    { key: 'descripcion', header: 'Descripción', render: (item: Material) => item.descripcion ?? '-' },
    { key: 'unidad_medida', header: 'Unidad' },
    { key: 'categoria', header: 'Categoría', render: (item: Material) => item.categoria?.nombre ?? '-' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Materiales</h1>
        <Button onClick={openCreate}>
          <Plus size={16} className="inline mr-1" /> Nuevo
        </Button>
      </div>

      <DataTable columns={columns} data={materiales} loading={isLoading} onEdit={openEdit} onDelete={openDelete} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Material' : 'Nuevo Material'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre</label>
            <input placeholder="Ej: Tornillo hexagonal" value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Descripción</label>
            <textarea placeholder="Descripción opcional" value={form.descripcion ?? ''}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Unidad de Medida</label>
            <select value={form.unidad_medida}
              onChange={e => setForm({ ...form, unidad_medida: e.target.value as CreateMaterialDto['unidad_medida'] })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required>
              {unidades.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Categoría</label>
            <select value={form.categoria_id}
              onChange={e => setForm({ ...form, categoria_id: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required>
              <option value={0}>Seleccione categoría</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
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
        title="Eliminar material"
        message={`¿Estás seguro de eliminar el material "${deleting?.nombre}"?`}
        loading={eliminar.isPending} />
    </div>
  );
}
