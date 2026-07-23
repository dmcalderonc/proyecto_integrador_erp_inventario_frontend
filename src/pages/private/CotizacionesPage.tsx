import { useState } from 'react';
import { useCotizaciones } from '../../store/useCotizaciones';
import { useSolicitudes } from '../../store/useSolicitudes';
import { useProveedores } from '../../store/useProveedores';
import type { Cotizacion, CreateCotizacionDto, EstadoCotizacion } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { getBadgeStyle } from '../../lib/design-tokens';
import { Plus, ExternalLink } from 'lucide-react';

const emptyForm: CreateCotizacionDto = {
  solicitudId: 0,
  proveedorId: 0,
  precioOfertadoTotal: 0,
  archivoRespaldoUrl: '',
  estado: 'EN_EVALUACION',
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
        <span className="font-mono text-xs bg-base text-accent px-2.5 py-1 rounded-lg border border-border-subtle font-semibold">
          {item.solicitud?.codigo ?? `#${item.solicitudId}`}
        </span>
      ),
    },
    {
      key: 'proveedor', header: 'Proveedor',
      sortable: true,
      sortValue: (item: Cotizacion) => item.proveedor?.razon_social ?? '',
      render: (item: Cotizacion) => <span className="text-text-primary font-medium">{item.proveedor?.razon_social ?? `#${item.proveedorId}`}</span>,
    },
    {
      key: 'precioOfertadoTotal', header: 'Precio',
      sortable: true,
      sortValue: (item: Cotizacion) => Number(item.precioOfertadoTotal),
      render: (item: Cotizacion) => (
        <span className="font-bold text-text-primary">
          ${Number(item.precioOfertadoTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'estado', header: 'Estado',
      render: (item: Cotizacion) => (
        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold border ${getBadgeStyle(item.estado)}`}>
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
            className="inline-flex items-center gap-1 text-xs text-accent hover:text-success font-semibold transition-colors"
          >
            Ver <ExternalLink size={12} />
          </a>
        ) : <span className="text-text-muted">-</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Cotizaciones</h1>
          <p className="text-sm text-text-secondary mt-1">Gestiona y evalua las ofertas de precios enviadas por proveedores.</p>
        </div>
        <Button onClick={openCreate} className="gap-1.5">
          <Plus size={16} /> Nueva Cotizacion
        </Button>
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle p-6">
        <DataTable columns={columns} data={cotizaciones} loading={isLoading} onEdit={openEdit} onDelete={openDelete} searchable searchKeys={["codigo", "estado"]} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Cotizacion' : 'Nueva Cotizacion'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Solicitud de Compra</label>
            <select 
              value={form.solicitudId}
              onChange={e => setForm({ ...form, solicitudId: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all cursor-pointer disabled:opacity-50" 
              required 
              disabled={!!editing}
            >
              <option value={0}>Seleccione solicitud</option>
              {solicitudes.map(s => (
                <option key={s.id} value={s.id}>{s.codigo} — {s.estado}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Proveedor</label>
            <select 
              value={form.proveedorId}
              onChange={e => setForm({ ...form, proveedorId: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all cursor-pointer" 
              required
            >
              <option value={0}>Seleccione proveedor</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.razon_social}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Precio Ofertado Total</label>
            <input 
              type="number" 
              step="0.01" 
              min="0" 
              value={form.precioOfertadoTotal}
              onChange={e => setForm({ ...form, precioOfertadoTotal: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all" 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">URL Archivo de Respaldo (opcional)</label>
            <input 
              type="text" 
              placeholder="https://..." 
              value={form.archivoRespaldoUrl ?? ''}
              onChange={e => setForm({ ...form, archivoRespaldoUrl: e.target.value })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Estado</label>
            <select 
              value={form.estado}
              onChange={e => setForm({ ...form, estado: e.target.value as EstadoCotizacion })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all cursor-pointer"
            >
              <option value="EN_EVALUACION">EN_EVALUACION</option>
              <option value="ELEGIDA">ELEGIDA</option>
              <option value="DESCARTADA">DESCARTADA</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button 
              type="submit" 
              disabled={crear.isPending || actualizar.isPending}
            >
              {editing ? (actualizar.isPending ? 'Guardando...' : 'Actualizar') : (crear.isPending ? 'Creando...' : 'Crear')}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar cotizacion"
        message="Estas seguro de eliminar esta cotizacion?"
        loading={eliminar.isPending} 
      />
    </div>
  );
}
