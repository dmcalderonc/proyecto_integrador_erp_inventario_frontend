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
    <div className="bg-card backdrop-blur-md rounded-2xl border border-border p-4 hover:border-primary hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] flex flex-col h-full shadow-lg">
      <div className="w-full h-40 rounded-xl mb-3 bg-background border border-border flex items-center justify-center overflow-hidden shrink-0">
        {material.imagen ? (
          <img src={material.imagen} alt={material.nombre} className="max-w-full max-h-full object-contain p-2" />
        ) : (
          <Package size={36} className="text-muted-foreground/40" />
        )}
      </div>
      <div className="space-y-1 flex-1">
        <span className="font-mono text-[11px] bg-background text-primary px-2.5 py-0.5 rounded-lg border border-border font-semibold inline-block mb-1">
          {material.sku}
        </span>
        <h3 className="text-sm font-bold text-card-foreground truncate">{material.nombre}</h3>
        {material.descripcion && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{material.descripcion}</p>
        )}
      </div>
      <div className="mt-3 pt-2 border-t border-border flex items-center justify-between">
        <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-md font-semibold border border-accent/20">
          {material.unidadMedida?.simbolo || '-'}
        </span>
        {canEdit && (
          <div className="flex gap-3">
            <button onClick={() => onEdit(material)} className="text-accent hover:text-accent/80 text-xs font-semibold flex items-center transition-colors cursor-pointer">
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
      <div className="space-y-8">
        <h1 className="text-3xl font-extrabold text-card-foreground" style={{ fontFamily: "var(--font-heading)" }}>Catálogo de Materiales</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card rounded-2xl border border-border p-4 animate-pulse flex flex-col h-full shadow-2xl">
              <div className="w-full h-40 bg-secondary rounded-xl mb-3 shrink-0" />
              <div className="h-3 bg-secondary rounded w-1/3 mb-2" />
              <div className="h-4 bg-secondary rounded w-2/3" />
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
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-card-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>Catálogo de Materiales</h1>
          <p className="text-muted-foreground text-sm">Gestiona tus artículos organizados por categorías.</p>
        </div>
        <div className="flex gap-3 self-start sm:self-auto flex-wrap">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar nombre o SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-card text-card-foreground border border-border rounded-xl text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent transition-all w-48 sm:w-56"
            />
          </div>
          <select
            value={filterCategory ?? ''}
            onChange={e => setFilterCategory(e.target.value ? Number(e.target.value) : null)}
            className="bg-card text-card-foreground border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent cursor-pointer transition-all"
          >
            <option value="" className="bg-card">Todas las categorías</option>
            {categorias.map(c => <option key={c.id} value={c.id} className="bg-card">{c.nombre}</option>)}
          </select>
          {canEdit && (
            <Button 
              onClick={() => openCreate()}
              className="bg-accent hover:bg-accent/80 text-white font-bold px-5 py-3 rounded-xl border border-border transition-all shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
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
            <div key={cat.id} className="bg-card backdrop-blur-lg rounded-3xl border border-border p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <h2 className="text-base font-bold text-card-foreground tracking-wide flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  {cat.nombre}
                  <span className="text-xs font-semibold text-muted-foreground bg-background px-2.5 py-0.5 rounded-lg border border-border">
                    {items.length}
                  </span>
                </h2>
                {canEdit && (
                  <button 
                    onClick={() => openCreate(cat.id)} 
                    className="text-primary hover:text-primary/80 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus size={14} /> Agregar a {cat.nombre}
                  </button>
                )}
              </div>
              {items.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
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
                <p className="text-sm text-muted-foreground/60 italic py-2">Sin materiales en esta categoría</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Crear / Editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Material' : 'Nuevo Material'}>
        <form onSubmit={handleSubmit} className="space-y-5 text-muted-foreground p-1">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Nombre</label>
            <input
              placeholder="Ej: Disco de corte"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Descripción (opcional)</label>
            <textarea
              placeholder="Descripción del material"
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              rows={2}
            />
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Imagen (opcional)</label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-2xl border border-border bg-background" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-4 py-3 bg-background border border-dashed border-border rounded-xl cursor-pointer hover:border-accent text-sm text-muted-foreground transition-all w-fit">
                <ImagePlus size={18} className="text-accent" />
                Subir archivo
                <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif" onChange={handleImageChange} className="hidden" />
              </label>
            )}
            <input
              type="text"
              placeholder="O pegar URL de imagen..."
              value={form.imagen?.startsWith('data:') ? '' : (form.imagen || '')}
              onChange={e => handleImageUrl(e.target.value)}
              className="mt-2.5 w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Unidad de Medida</label>
            <select
              value={form.unidad_medida_id}
              onChange={e => setForm(f => ({ ...f, unidad_medida_id: Number(e.target.value) }))}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-all cursor-pointer"
              required
            >
              <option value={0} disabled className="bg-background">Seleccione unidad</option>
              {unidadesMedida.map(u => <option key={u.id} value={u.id} className="bg-background">{u.nombre} ({u.simbolo})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Categoría</label>
            <select
              value={form.categoria_id}
              onChange={e => setForm(f => ({ ...f, categoria_id: Number(e.target.value) }))}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-all cursor-pointer"
              required
            >
              <option value={0} disabled className="bg-background">Seleccione categoría</option>
              {categorias.map(c => <option key={c.id} value={c.id} className="bg-background">{c.nombre}</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setModalOpen(false)}
              className="bg-secondary hover:bg-black/10 dark:hover:bg-white/10 text-card-foreground border border-border px-5 py-2.5 rounded-xl font-medium transition-all cursor-pointer"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={crear.isPending || actualizar.isPending || form.categoria_id === 0 || form.unidad_medida_id === 0}
              className="bg-accent hover:bg-accent/80 text-white font-bold px-6 py-2.5 rounded-xl border border-border transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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