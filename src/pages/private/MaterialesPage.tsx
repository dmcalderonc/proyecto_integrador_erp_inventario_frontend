import { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMateriales } from '../../store/useMateriales';
import { useCategorias } from '../../store/useCategorias';
import { useUnidadesMedida } from '../../store/useUnidadesMedida';
import type { Material, CreateMaterialDto } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, Edit2, Trash2, Package, ImagePlus, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="bg-surface rounded-xl border border-border-subtle p-4 hover:border-accent transition-all duration-200 flex flex-col h-full">
      <div className="w-full h-40 rounded-lg mb-3 bg-base border border-border-subtle flex items-center justify-center overflow-hidden shrink-0">
        {material.imagen ? (
          <img src={material.imagen} alt={material.nombre} className="max-w-full max-h-full object-contain p-2" />
        ) : (
          <Package size={36} className="text-text-muted/40" />
        )}
      </div>
      <div className="space-y-1 flex-1">
        <span className="font-mono text-[11px] bg-success-bg text-success px-2.5 py-0.5 rounded-lg border border-success/20 font-semibold inline-block mb-1">
          {material.sku}
        </span>
        <h3 className="text-sm font-bold text-text-primary truncate">{material.nombre}</h3>
        {material.descripcion && (
          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{material.descripcion}</p>
        )}
      </div>
      <div className="mt-3 pt-2 border-t border-border-subtle flex items-center justify-between">
        <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-md font-semibold border border-accent/20">
          {material.unidadMedida?.simbolo || '-'}
        </span>
        {canEdit && (
          <div className="flex gap-3">
            <button onClick={() => onEdit(material)} className="text-accent hover:text-accent/80 text-xs font-semibold flex items-center transition-colors cursor-pointer">
              <Edit2 size={13} className="inline mr-1" />Editar
            </button>
            <button onClick={() => onDelete(material)} className="text-danger hover:text-danger/80 text-xs font-semibold flex items-center transition-colors cursor-pointer">
              <Trash2 size={13} className="inline mr-1" />Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MaterialesPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { materiales, meta, isLoading, crear, actualizar, eliminar } = useMateriales({ page, limit, search });

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

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

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

  if (isLoading && materiales.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-text-primary">Catálogo de Materiales</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-surface rounded-xl border border-border-subtle p-4 animate-pulse flex flex-col h-full">
              <div className="w-full h-40 bg-elevated rounded-lg mb-3 shrink-0" />
              <div className="h-3 bg-elevated rounded w-1/3 mb-2" />
              <div className="h-4 bg-elevated rounded w-2/3" />
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Catálogo de Materiales</h1>
          <p className="text-sm text-text-secondary mt-1">Gestiona tus artículos organizados por categorías.</p>
        </div>
        <div className="flex flex-wrap gap-3 self-start sm:self-auto items-center">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Buscar material o SKU..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onBlur={handleSearchSubmit}
              className="pl-10 pr-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all w-full sm:w-64"
            />
          </form>

          <select
            value={filterCategory ?? ''}
            onChange={e => {
              setFilterCategory(e.target.value ? Number(e.target.value) : null);
              setPage(1);
            }}
            className="px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          {canEdit && (
            <Button onClick={() => openCreate()} className="gap-1.5">
              <Plus size={16} /> Nuevo
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6 relative">
        {isLoading && materiales.length > 0 && (
          <div className="absolute inset-0 bg-base/50 backdrop-blur-[1px] z-10 rounded-xl" />
        )}

        {filteredCategorias.map(cat => {
          const items = grouped.get(cat.id) || [];
          if (items.length === 0) return null;

          return (
            <div key={cat.id} className="bg-surface rounded-xl border border-border-subtle p-6">
              <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-3">
                <h2 className="text-base font-bold text-text-primary tracking-wide flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success"></span>
                  {cat.nombre}
                  <span className="text-xs font-semibold text-text-muted bg-base px-2.5 py-0.5 rounded-lg border border-border-subtle">
                    {items.length}
                  </span>
                </h2>
                {canEdit && (
                  <button
                    onClick={() => openCreate(cat.id)}
                    className="text-success hover:text-success/80 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus size={14} /> Agregar a {cat.nombre}
                  </button>
                )}
              </div>
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
            </div>
          );
        })}

        {materiales.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-surface rounded-xl border border-border-subtle">
            <Package size={48} className="mx-auto text-text-muted/40 mb-4" />
            <h3 className="text-text-primary text-lg font-bold">No se encontraron materiales</h3>
            <p className="text-text-secondary text-sm">Prueba con otro término de búsqueda.</p>
          </div>
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center bg-surface border border-border-subtle rounded-xl p-4 gap-4">
          <p className="text-sm text-text-secondary">
            Mostrando página <span className="font-bold text-text-primary">{meta.page}</span> de <span className="font-bold text-text-primary">{meta.totalPages}</span>
            <span className="mx-2">•</span>
            Total: <span className="font-bold text-text-primary">{meta.total}</span> registros
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Anterior
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={page === meta.totalPages || isLoading}
              className="flex items-center gap-1"
            >
              Siguiente <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Material' : 'Nuevo Material'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Nombre</label>
            <input
              placeholder="Ej: Disco de corte"
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Descripción (opcional)</label>
            <textarea
              placeholder="Descripción del material"
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Imagen (opcional)</label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border border-border-subtle bg-base" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1.5 hover:bg-danger/80 transition-colors shadow-lg"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-4 py-3 bg-base border border-dashed border-border-default rounded-xl cursor-pointer hover:border-accent text-sm text-text-secondary transition-all w-fit">
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
              className="mt-2.5 w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Unidad de Medida</label>
            <select
              value={form.unidad_medida_id}
              onChange={e => setForm(f => ({ ...f, unidad_medida_id: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
              required
            >
              <option value={0} disabled>Seleccione unidad</option>
              {unidadesMedida.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.simbolo})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Categoría</label>
            <select
              value={form.categoria_id}
              onChange={e => setForm(f => ({ ...f, categoria_id: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
              required
            >
              <option value={0} disabled>Seleccione categoría</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={crear.isPending || actualizar.isPending || form.categoria_id === 0 || form.unidad_medida_id === 0} loading={crear.isPending || actualizar.isPending}>
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
