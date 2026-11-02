import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMateriales } from '../../store/useMateriales';
import { useCategorias } from '../../store/useCategorias';
import { useUnidadesMedida } from '../../store/useUnidadesMedida';
import { useBodegas } from '../../store/useBodegas';
import type { Material, CreateMaterialDto } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { MaterialDetailSlideOver } from '../../components/materials/MaterialDetailSlideOver';
import { Plus, Edit2, Trash2, Package, ImagePlus, X, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const emptyForm: CreateMaterialDto = {
  nombre: '',
  descripcion: '',
  imagen: '',
  unidad_medida_id: 0,
  categoria_id: 0,
};

export default function MaterialesPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(40);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | null>(null);
  const [filterBodega, setFilterBodega] = useState<number | null>(null);
  const [filterStock, setFilterStock] = useState<string>('');

  const { materiales, meta, isLoading, crear, actualizar, eliminar } = useMateriales({
    page, limit, search,
    categoriaId: filterCategory ?? undefined,
    bodegaId: filterBodega ?? undefined,
    stock: (filterStock || undefined) as 'agotado' | 'bajo' | 'normal' | undefined,
  });
  const { categorias } = useCategorias();
  const { unidades: unidadesMedida } = useUnidadesMedida();
  const { bodegas } = useBodegas();
  const { hasRole } = useAuth();
  const canEdit = hasRole(['ADMIN', 'BODEGUERO']);

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState<Material | null>(null);
  const [form, setForm] = useState<CreateMaterialDto>(emptyForm);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [detailMaterial, setDetailMaterial] = useState<Material | null>(null);

  const hasActiveFilters = filterCategory !== null || filterBodega !== null || search !== '' || filterStock !== '';

  // Debounce de la búsqueda para no lanzar una petición por tecla.
  const committedSearch = useRef(search);
  useEffect(() => {
    const term = searchInput.trim();
    if (term === committedSearch.current) return;
    const timer = window.setTimeout(() => {
      // El término pudo confirmarse con Enter mientras corría el temporizador.
      if (committedSearch.current === term) return;
      committedSearch.current = term;
      setSearch(term);
      setPage(1);
    }, 350);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const commitSearch = (value: string) => {
    const term = value.trim();
    committedSearch.current = term;
    setSearch(term);
    setPage(1);
  };

  const clearFilters = () => {
    setFilterCategory(null);
    setFilterBodega(null);
    setFilterStock('');
    committedSearch.current = '';
    setSearch('');
    setSearchInput('');
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
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

  const handleRowClick = (item: Material) => {
    setDetailMaterial(item);
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

  const removeImage = () => {
    setForm(f => ({ ...f, imagen: '' }));
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dto: CreateMaterialDto = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      imagen: form.imagen,
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

  const columns: Column<Material>[] = [
    {
      key: 'sku',
      header: 'SKU',
      render: (m: Material) => (
        <span className="font-mono text-xs bg-success-bg text-success px-2.5 py-1 rounded-lg border border-success/20 font-semibold">
          {m.sku}
        </span>
      ),
    },
    {
      key: 'imagen',
      header: '',
      render: (m: Material) => (
        <div className="w-9 h-9 rounded-lg bg-base border border-border-subtle flex items-center justify-center overflow-hidden shrink-0">
          {m.imagen ? (
            <img src={m.imagen} alt={m.nombre} className="max-w-full max-h-full object-contain" />
          ) : (
            <Package size={16} className="text-text-muted/40" />
          )}
        </div>
      ),
    },
    {
      key: 'nombre',
      header: 'Nombre',
      render: (m: Material) => <span className="font-semibold text-text-primary">{m.nombre}</span>,
    },
    {
      key: 'categoria',
      header: 'Categoría',
      render: (m: Material) => (
        <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-md border border-accent/20 font-medium">
          {m.categoria?.nombre ?? '—'}
        </span>
      ),
    },
    {
      key: 'unidadMedida',
      header: 'Unidad',
      render: (m: Material) => (
        <span className="text-xs text-text-secondary">{m.unidadMedida?.simbolo || '—'}</span>
      ),
    },
    {
      key: 'stockPorBodega',
      header: 'Stock por Bodega',
      render: (m: Material) => {
        const stock = m.stockPorBodega;
        if (!stock || stock.length === 0) {
          return <span className="text-xs text-text-muted">Sin registro</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {stock.map((s) => (
              <span
                key={s.bodegaId}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border",
                  s.cantidad_disponible === 0
                    ? "bg-danger/10 text-danger border-danger/20"
                    : "bg-success/10 text-success border-success/20"
                )}
                title={`${s.bodegaNombre}: ${s.cantidad_disponible} disp. / ${s.cantidad_reservada} reserv.`}
              >
                <span className="truncate max-w-[80px]">{s.bodegaNombre}</span>
                <span className="font-bold">{s.cantidad_disponible}</span>
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'stockDisponible',
      header: 'Stock Disp.',
      render: (m: Material) => {
        const disponible = m.stockDisponible ?? 0;
        return (
          <span className={cn(
            "inline-flex items-center px-3 py-1 rounded-xl font-bold text-xs border",
            disponible === 0
              ? "bg-danger-bg text-danger border-danger/30"
              : "bg-success-bg text-success border-success/30"
          )}>
            {disponible}
          </span>
        );
      },
    },
    {
      key: 'stockReservado',
      header: 'Stock Reserv.',
      render: (m: Material) => {
        const reservado = m.stockReservado ?? 0;
        return (
          <span className={cn(
            "inline-flex items-center px-3 py-1 rounded-xl font-bold text-xs border",
            reservado > 0
              ? "bg-warning-bg text-warning border-warning/30"
              : "bg-elevated text-text-muted border-border-subtle"
          )}>
            {reservado}
          </span>
        );
      },
    },
    ...(canEdit ? [{
      key: 'acciones' as const,
      header: 'Acciones',
      render: (m: Material) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(m); }}
            className="text-accent hover:text-accent/80 p-1.5 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer"
            title="Editar"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleting(m); setConfirmOpen(true); }}
            className="text-danger hover:text-danger/80 p-1.5 rounded-lg hover:bg-danger/10 transition-colors cursor-pointer"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Materiales e Inventario</h1>
          <p className="text-sm text-text-secondary mt-1">Catálogo de materiales con disponibilidad de stock por bodega.</p>
        </div>
        <div className="flex flex-wrap gap-3 self-start sm:self-auto items-center">
          <form onSubmit={e => { e.preventDefault(); commitSearch(searchInput); }} className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-4 pr-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all w-full sm:w-64"
            />
          </form>
          <select
            value={filterCategory ?? ''}
            onChange={e => { setFilterCategory(e.target.value ? Number(e.target.value) : null); setPage(1); }}
            className="px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <select
            value={filterBodega ?? ''}
            onChange={e => { setFilterBodega(e.target.value ? Number(e.target.value) : null); setPage(1); }}
            className="px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
          >
            <option value="">Todas las bodegas</option>
            {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
          </select>
          <select
            value={filterStock}
            onChange={e => { setFilterStock(e.target.value); setPage(1); }}
            className="px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
          >
            <option value="">Todo el stock</option>
            <option value="agotado">Agotado</option>
            <option value="bajo">Stock bajo</option>
            <option value="normal">Stock normal</option>
          </select>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="gap-1.5 text-text-muted hover:text-text-primary">
              <RotateCcw size={14} /> Limpiar
            </Button>
          )}
          {canEdit && (
            <Button onClick={openCreate} className="gap-1.5">
              <Plus size={16} /> Nuevo Material
            </Button>
          )}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle">
        <DataTable
          columns={columns}
          data={materiales}
          loading={isLoading}
          searchable={false}
          onRowClick={handleRowClick}
          pagination={false}
        />
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-between items-center bg-surface border border-border-subtle rounded-xl p-4">
          <p className="text-sm text-text-secondary">
            Página <span className="font-bold text-text-primary">{meta.page}</span> de <span className="font-bold text-text-primary">{meta.totalPages}</span>
            {' '} • Total: <span className="font-bold text-text-primary">{meta.total}</span> materiales
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || isLoading}>
              Anterior
            </Button>
            <Button variant="secondary" onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages || isLoading}>
              Siguiente
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
              <label className="flex items-center gap-2 px-4 py-3 bg-base border border-dashed border-border-subtle rounded-xl cursor-pointer hover:border-accent text-sm text-text-secondary transition-all w-fit">
                <ImagePlus size={18} className="text-accent" />
                Subir archivo
                <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif" onChange={handleImageChange} className="hidden" />
              </label>
            )}
            <input
              type="text"
              placeholder="O pegar URL de imagen..."
              value={form.imagen?.startsWith('data:') ? '' : (form.imagen || '')}
              onChange={e => setForm(f => ({ ...f, imagen: e.target.value }))}
              className="mt-2.5 w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Unidad de Medida</label>
              <select
                value={form.unidad_medida_id}
                onChange={e => setForm(f => ({ ...f, unidad_medida_id: Number(e.target.value) }))}
                className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
                required
              >
                <option value={0} disabled>Seleccione</option>
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
                <option value={0} disabled>Seleccione</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
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

      {detailMaterial && (
        <MaterialDetailSlideOver
          materialId={detailMaterial.id}
          materialNombre={detailMaterial.nombre}
          materialSku={detailMaterial.sku}
          materialImagen={detailMaterial.imagen}
          materialCategoria={detailMaterial.categoria?.nombre}
          materialUnidad={detailMaterial.unidadMedida?.nombre}
          materialDescripcion={detailMaterial.descripcion}
          open={!!detailMaterial}
          onClose={() => setDetailMaterial(null)}
        />
      )}
    </div>
  );
}
