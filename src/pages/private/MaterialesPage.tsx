import { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMateriales } from '../../store/useMateriales';
import { useCategorias } from '../../store/useCategorias';
import { useUnidadesMedida } from '../../store/useUnidadesMedida';
import type { Material, CreateMaterialDto } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, Package, ImagePlus, X } from 'lucide-react';
import toast from 'react-hot-toast';

const emptyForm: CreateMaterialDto = {
  nombre: '',
  descripcion: '',
  imagen: '',
  unidad_medida_id: 0,
  categoria_id: 0,
};

function MaterialCard({ material, onEdit, onDelete, canEdit }: {
  material: Material;
  onEdit: (m: Material) => void;
  onDelete: (m: Material) => void;
  canEdit: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="w-full h-40 rounded-lg mb-3 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
        {material.imagen ? (
          <img src={material.imagen} alt={material.nombre} className="max-w-full max-h-full object-contain" />
        ) : (
          <Package size={32} className="text-gray-300" />
        )}
      </div>
      <div className="space-y-1 flex-1">
        <p className="text-xs font-mono text-blue-600">{material.sku}</p>
        <h3 className="text-sm font-semibold text-gray-800 truncate">{material.nombre}</h3>
        {material.descripcion && (
          <p className="text-xs text-gray-500 line-clamp-2">{material.descripcion}</p>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2 shrink-0">{material.unidadMedida?.simbolo || '-'}</p>
      {canEdit && (
        <div className="flex gap-2 mt-3 pt-3 border-t">
          <button onClick={() => onEdit(material)} className="text-blue-600 hover:underline text-xs font-medium">
            <Edit2 size={14} className="inline mr-1" />Editar
          </button>
          <button onClick={() => onDelete(material)} className="text-red-600 hover:underline text-xs font-medium">
            <Trash2 size={14} className="inline mr-1" />Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

export default function MaterialesPage() {
  const { materiales, isLoading, crear, actualizar, eliminar } = useMateriales();
  const { categorias } = useCategorias();
  const { unidades: unidadesMedida } = useUnidadesMedida();
  const { hasRole } = useAuth();

  const canEdit = hasRole(['ADMIN', 'BODEGUERO']);

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState<Material | null>(null);
  const [form, setForm] = useState<CreateMaterialDto>(emptyForm);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<number | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<number, Material[]>();
    categorias.forEach(c => map.set(c.id, []));
    materiales.forEach(m => {
      const catId = m.categoria?.id;
      if (catId && map.has(catId)) {
        map.get(catId)!.push(m);
      }
    });
    return map;
  }, [materiales, categorias]);

  const openCreate = (catId?: number) => {
    setEditing(null);
    setForm({ ...emptyForm, categoria_id: catId || 0 });
    setImagePreview('');
    setModalOpen(true);
  };

  const openEdit = (item: Material) => {
    setEditing(item);
    setForm({
      nombre: item.nombre,
      descripcion: item.descripcion ?? '',
      imagen: item.imagen ?? '',
      unidad_medida_id: item.unidadMedida?.id ?? 0,
      categoria_id: item.categoria?.id ?? 0,
    });
    setImagePreview(item.imagen || '');
    setModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato no soportado. Usa PNG, JPG, WEBP o GIF');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setForm(f => ({ ...f, imagen: base64 }));
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrl = (url: string) => {
    setForm(f => ({ ...f, imagen: url }));
    setImagePreview(url);
  };

  const removeImage = () => {
    setForm(f => ({ ...f, imagen: '' }));
    setImagePreview('');
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

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Catálogo de Materiales</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse border border-gray-100 flex flex-col h-full">
              <div className="w-full h-40 bg-gray-200 rounded-lg mb-3 shrink-0" />
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filteredCategorias = filterCategory
    ? categorias.filter(c => c.id === filterCategory)
    : categorias;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Catálogo de Materiales</h1>
        <div className="flex gap-2">
          <select
            value={filterCategory ?? ''}
            onChange={e => setFilterCategory(e.target.value ? Number(e.target.value) : null)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          {canEdit && (
            <Button onClick={() => openCreate()}>
              <Plus size={16} className="inline mr-1" /> Nuevo
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {filteredCategorias.map(cat => {
          const items = grouped.get(cat.id) || [];
          return (
            <div key={cat.id}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                  {cat.nombre}
                  <span className="ml-2 text-xs font-normal text-gray-400">({items.length})</span>
                </h2>
                {canEdit && (
                  <button onClick={() => openCreate(cat.id)} className="text-blue-600 hover:underline text-xs font-medium">
                    + Agregar
                  </button>
                )}
              </div>
              {items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
                  {items.map(m => (
                    <MaterialCard
                      key={m.id}
                      material={m}
                      onEdit={openEdit}
                      onDelete={(m) => { setDeleting(m); setConfirmOpen(true); }}
                      canEdit={canEdit}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Sin materiales en esta categoría</p>
              )}
            </div>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Material' : 'Nuevo Material'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              placeholder="Ej: Disco de corte"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
            <textarea
              placeholder="Descripción del material"
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen (opcional)</label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-600 w-fit">
                <ImagePlus size={16} />
                Subir archivo
                <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif" onChange={handleImageChange} className="hidden" />
              </label>
            )}
            <input
              type="text"
              placeholder="O pegar URL de imagen..."
              value={form.imagen?.startsWith('data:') ? '' : (form.imagen || '')}
              onChange={e => handleImageUrl(e.target.value)}
              className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida</label>
            <select
              value={form.unidad_medida_id}
              onChange={e => setForm(f => ({ ...f, unidad_medida_id: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value={0} disabled>Seleccione unidad</option>
              {unidadesMedida.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.simbolo})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={form.categoria_id}
              onChange={e => setForm(f => ({ ...f, categoria_id: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value={0} disabled>Seleccione categoría</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
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
        message={`¿Estás seguro de eliminar "${deleting?.nombre}"? Esta acción no se puede deshacer.`}
        loading={eliminar.isPending}
      />
    </div>
  );
}
