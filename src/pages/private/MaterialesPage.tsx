import { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMateriales } from '../../store/useMateriales';
import { useCategorias } from '../../store/useCategorias';
import { useUnidadesMedida } from '../../store/useUnidadesMedida';
import type { Material, CreateMaterialDto } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, Package, ImagePlus, X, Search } from 'lucide-react';
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
    <div className="bg-[#111D4A] backdrop-blur-md rounded-2xl border border-[#334155] p-4 hover:border-[#10B981] hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] flex flex-col h-full shadow-lg">
      <div className="w-full h-40 rounded-xl mb-3 bg-[#0A1128] border border-[#334155] flex items-center justify-center overflow-hidden shrink-0">
        {material.imagen ? (
          <img src={material.imagen} alt={material.nombre} className="max-w-full max-h-full object-contain p-2" />
        ) : (
          <Package size={36} className="text-[#94A3B8]/40" />
        )}
      </div>
      <div className="space-y-1 flex-1">
        <span className="font-mono text-[11px] bg-[#0A1128] text-[#10B981] px-2.5 py-0.5 rounded-lg border border-[#334155] font-semibold inline-block mb-1">
          {material.sku}
        </span>
        <h3 className="text-sm font-bold text-[#FFFFFF] truncate">{material.nombre}</h3>
        {material.descripcion && (
          <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">{material.descripcion}</p>
        )}
      </div>
      <div className="mt-3 pt-2 border-t border-[#334155] flex items-center justify-between">
        <span className="text-xs bg-[#06B6D4]/10 text-[#06B6D4] px-2 py-0.5 rounded-md font-semibold border border-[#06B6D4]/20">
          {material.unidadMedida?.simbolo || '-'}
        </span>
        {canEdit && (
          <div className="flex gap-3">
            <button onClick={() => onEdit(material)} className="text-[#06B6D4] hover:text-[#06B6D4]/80 text-xs font-semibold flex items-center transition-colors cursor-pointer">
              <Edit2 size={13} className="inline mr-1" />Editar
            </button>
            <button onClick={() => onDelete(material)} className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center transition-colors cursor-pointer">
              <Trash2 size={13} className="inline mr-1" />Eliminar
            </button>
          </div>
        )}
      </div>
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
  const [search, setSearch] = useState('');

  const grouped = useMemo(() => {
    const map = new Map<number, Material[]>();
    categorias.forEach(c => map.set(c.id, []));
    const q = search.toLowerCase().trim();
    materiales.forEach(m => {
      const matchesSearch = !q || m.nombre.toLowerCase().includes(q);
      if (!matchesSearch) return;
      const catId = m.categoria?.id;
      if (catId && map.has(catId)) {
        map.get(catId)!.push(m);
      }
    });
    return map;
  }, [materiales, categorias, search]);

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
      <div className="space-y-6">
        <h1 className="text-3xl font-extrabold text-[#FFFFFF]">Catálogo de Materiales</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-[#111D4A] rounded-2xl border border-[#334155] p-4 animate-pulse flex flex-col h-full shadow-2xl">
              <div className="w-full h-40 bg-[#1E293B] rounded-xl mb-3 shrink-0" />
              <div className="h-3 bg-[#1E293B] rounded w-1/3 mb-2" />
              <div className="h-4 bg-[#1E293B] rounded w-2/3" />
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
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#FFFFFF] mb-2">Catálogo de Materiales</h1>
          <p className="text-[#94A3B8] text-sm">Gestiona tus artículos organizados por categorías.</p>
        </div>
        <div className="flex gap-3 self-start sm:self-auto flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Buscar nombre o SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-[#111D4A] text-[#FFFFFF] border border-[#334155] rounded-xl text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] transition-all w-48 sm:w-56"
            />
          </div>
          <select
            value={filterCategory ?? ''}
            onChange={e => setFilterCategory(e.target.value ? Number(e.target.value) : null)}
            className="bg-[#111D4A] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#06B6D4] cursor-pointer transition-all"
          >
            <option value="" className="bg-[#111D4A]">Todas las categorías</option>
            {categorias.map(c => <option key={c.id} value={c.id} className="bg-[#111D4A]">{c.nombre}</option>)}
          </select>
          {canEdit && (
            <Button 
              onClick={() => openCreate()}
              className="bg-[#06B6D4] hover:bg-[#0284C7] text-white font-bold px-5 py-3 rounded-xl border border-[#334155] transition-all shadow-lg shadow-[#06B6D4]/20 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={18} /> Nuevo
            </Button>
          )}
        </div>
      </div>

      {/* Lista por categorías */}
      <div className="space-y-8">
        {filteredCategorias.map(cat => {
          const items = grouped.get(cat.id) || [];
          return (
            <div key={cat.id} className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 border-b border-[#334155] pb-3">
                <h2 className="text-base font-bold text-[#FFFFFF] tracking-wide flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                  {cat.nombre}
                  <span className="text-xs font-semibold text-[#94A3B8] bg-[#0A1128] px-2.5 py-0.5 rounded-lg border border-[#334155]">
                    {items.length}
                  </span>
                </h2>
                {canEdit && (
                  <button 
                    onClick={() => openCreate(cat.id)} 
                    className="text-[#10B981] hover:text-[#10B981]/80 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus size={14} /> Agregar a {cat.nombre}
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
                <p className="text-sm text-[#94A3B8]/60 italic py-2">Sin materiales en esta categoría</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Crear / Editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Material' : 'Nuevo Material'}>
        <form onSubmit={handleSubmit} className="space-y-5 text-[#94A3B8] p-1">
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Nombre</label>
            <input
              placeholder="Ej: Disco de corte"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Descripción (opcional)</label>
            <textarea
              placeholder="Descripción del material"
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all"
              rows={2}
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Imagen (opcional)</label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-2xl border border-[#334155] bg-[#0A1128]" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-4 py-3 bg-[#0A1128] border border-dashed border-[#334155] rounded-xl cursor-pointer hover:border-[#06B6D4] text-sm text-[#94A3B8] transition-all w-fit">
                <ImagePlus size={18} className="text-[#06B6D4]" />
                Subir archivo
                <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif" onChange={handleImageChange} className="hidden" />
              </label>
            )}
            <input
              type="text"
              placeholder="O pegar URL de imagen..."
              value={form.imagen?.startsWith('data:') ? '' : (form.imagen || '')}
              onChange={e => handleImageUrl(e.target.value)}
              className="mt-2.5 w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Unidad de Medida</label>
            <select
              value={form.unidad_medida_id}
              onChange={e => setForm(f => ({ ...f, unidad_medida_id: Number(e.target.value) }))}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#06B6D4] transition-all cursor-pointer"
              required
            >
              <option value={0} disabled className="bg-[#0A1128]">Seleccione unidad</option>
              {unidadesMedida.map(u => <option key={u.id} value={u.id} className="bg-[#0A1128]">{u.nombre} ({u.simbolo})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Categoría</label>
            <select
              value={form.categoria_id}
              onChange={e => setForm(f => ({ ...f, categoria_id: Number(e.target.value) }))}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#06B6D4] transition-all cursor-pointer"
              required
            >
              <option value={0} disabled className="bg-[#0A1128]">Seleccione categoría</option>
              {categorias.map(c => <option key={c.id} value={c.id} className="bg-[#0A1128]">{c.nombre}</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#334155]">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setModalOpen(false)}
              className="bg-[#1E293B] hover:bg-white/10 text-[#FFFFFF] border border-[#334155] px-5 py-2.5 rounded-xl font-medium transition-all cursor-pointer"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={crear.isPending || actualizar.isPending || form.categoria_id === 0 || form.unidad_medida_id === 0}
              className="bg-[#06B6D4] hover:bg-[#0284C7] text-white font-bold px-6 py-2.5 rounded-xl border border-[#334155] transition-all shadow-lg shadow-[#06B6D4]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {editing ? (actualizar.isPending ? 'Guardando...' : 'Actualizar') : (crear.isPending ? 'Creando...' : 'Crear')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diálogo de Confirmación */}
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