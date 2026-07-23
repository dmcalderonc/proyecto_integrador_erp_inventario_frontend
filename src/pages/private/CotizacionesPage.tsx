import { useState } from 'react';
import { useCotizaciones } from '../../store/useCotizaciones';
import { useSolicitudes } from '../../store/useSolicitudes';
import { useProveedores } from '../../store/useProveedores';
import type { Cotizacion, CreateCotizacionDto, EstadoCotizacion } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus, ExternalLink } from 'lucide-react';

const emptyForm: CreateCotizacionDto = {
  solicitudId: 0,
  proveedorId: 0,
  precioOfertadoTotal: 0,
  archivoRespaldoUrl: '',
  estado: 'EN_EVALUACION',
};

const badgeEstado: Record<string, string> = {
  EN_EVALUACION: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  ELEGIDA: 'bg-primary/10 text-primary border-primary/30',
  DESCARTADA: 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function CotizacionesPage() {
  const { cotizaciones, isLoading, crear, actualizar, eliminar } = useCotizaciones();
  const { solicitudes } = useSolicitudes();
  const { proveedores } = useProveedores();

  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState<Cotizacion | null>(null);
  const [deleting, setDeleting] = useState<Cotizacion | null>(null);
  const [form, setForm] = useState<CreateCotizacionDto>(emptyForm);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: Cotizacion) => {
    setEditing(item);
    setForm({
      solicitudId: item.solicitudId,
      proveedorId: item.proveedorId,
      precioOfertadoTotal: Number(item.precioOfertadoTotal),
      archivoRespaldoUrl: item.archivoRespaldoUrl ?? '',
      estado: item.estado,
    });
    setModalOpen(true);
  };

  const openDelete = (item: Cotizacion) => {
    setDeleting(item);
    setConfirmOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dto: CreateCotizacionDto = {
      solicitudId: Number(form.solicitudId),
      proveedorId: Number(form.proveedorId),
      precioOfertadoTotal: Number(form.precioOfertadoTotal),
      archivoRespaldoUrl: form.archivoRespaldoUrl || undefined,
      estado: form.estado,
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
    {
      key: 'solicitud', header: 'Solicitud',
      sortable: true,
      sortValue: (item: Cotizacion) => item.solicitud?.codigo ?? `#${item.solicitudId}`,
      render: (item: Cotizacion) => (
        <span className="font-mono text-xs bg-background text-accent px-2.5 py-1 rounded-lg border border-border font-semibold">
          {item.solicitud?.codigo ?? `#${item.solicitudId}`}
        </span>
      ),
    },
    {
      key: 'proveedor', header: 'Proveedor',
      sortable: true,
      sortValue: (item: Cotizacion) => item.proveedor?.razon_social ?? '',
      render: (item: Cotizacion) => <span className="text-card-foreground font-medium">{item.proveedor?.razon_social ?? `#${item.proveedorId}`}</span>,
    },
    {
      key: 'precioOfertadoTotal', header: 'Precio',
      sortable: true,
      sortValue: (item: Cotizacion) => Number(item.precioOfertadoTotal),
      render: (item: Cotizacion) => (
        <span className="font-bold text-card-foreground">
          ${Number(item.precioOfertadoTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'estado', header: 'Estado',
      render: (item: Cotizacion) => (
        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold border ${badgeEstado[item.estado] ?? 'bg-background text-muted-foreground border-border'}`}>
          {item.estado}
        </span>
      ),
    },
    {
      key: 'archivoRespaldoUrl', header: 'Respaldo',
      render: (item: Cotizacion) =>
        item.archivoRespaldoUrl ? (
          <a 
            href={item.archivoRespaldoUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1 text-xs text-accent hover:text-primary font-semibold transition-colors"
          >
            Ver <ExternalLink size={12} />
          </a>
        ) : <span className="text-muted-foreground">-</span>,
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header de la sección */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-card-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>Cotizaciones</h1>
          <p className="text-muted-foreground text-sm">Gestiona y evalúa las ofertas de precios enviadas por proveedores.</p>
        </div>
        <Button 
          onClick={openCreate}
          className="bg-accent hover:bg-accent/80 text-white font-bold px-5 py-3 rounded-xl border border-border transition-all shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={18} /> Nueva Cotización
        </Button>
      </div>

      {/* Tabla de Cotizaciones */}
      <div className="bg-card backdrop-blur-lg rounded-3xl border border-border p-6 shadow-2xl overflow-hidden">
        <DataTable columns={columns} data={cotizaciones} loading={isLoading} onEdit={openEdit} onDelete={openDelete} searchable searchKeys={["codigo", "estado"]} />
      </div>

      {/* Modal Crear / Editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Cotización' : 'Nueva Cotización'}>
        <form onSubmit={handleSubmit} className="space-y-5 text-muted-foreground p-1">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Solicitud de Compra</label>
            <select 
              value={form.solicitudId}
              onChange={e => setForm({ ...form, solicitudId: Number(e.target.value) })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer disabled:opacity-50" 
              required 
              disabled={!!editing}
            >
              <option value={0} className="bg-background">Seleccione solicitud</option>
              {solicitudes.map(s => (
                <option key={s.id} value={s.id} className="bg-background">{s.codigo} — {s.estado}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Proveedor</label>
            <select 
              value={form.proveedorId}
              onChange={e => setForm({ ...form, proveedorId: Number(e.target.value) })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer" 
              required
            >
              <option value={0} className="bg-background">Seleccione proveedor</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id} className="bg-background">{p.razon_social}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Precio Ofertado Total</label>
            <input 
              type="number" 
              step="0.01" 
              min="0" 
              value={form.precioOfertadoTotal}
              onChange={e => setForm({ ...form, precioOfertadoTotal: Number(e.target.value) })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all font-semibold" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">URL Archivo de Respaldo (opcional)</label>
            <input 
              type="text" 
              placeholder="https://..." 
              value={form.archivoRespaldoUrl ?? ''}
              onChange={e => setForm({ ...form, archivoRespaldoUrl: e.target.value })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Estado</label>
            <select 
              value={form.estado}
              onChange={e => setForm({ ...form, estado: e.target.value as EstadoCotizacion })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer"
            >
              <option value="EN_EVALUACION" className="bg-background">EN_EVALUACION</option>
              <option value="ELEGIDA" className="bg-background">ELEGIDA</option>
              <option value="DESCARTADA" className="bg-background">DESCARTADA</option>
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
              disabled={crear.isPending || actualizar.isPending}
              className="bg-accent hover:bg-accent/80 text-white font-bold px-6 py-2.5 rounded-xl border border-border transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {editing ? (actualizar.isPending ? 'Guardando...' : 'Actualizar') : (crear.isPending ? 'Creando...' : 'Crear')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmación de Eliminación */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar cotización"
        message="¿Estás seguro de eliminar esta cotización?"
        loading={eliminar.isPending} 
      />
    </div>
  );
}