import { useState } from 'react';
import { useCotizaciones } from '../../store/useCotizaciones';
import { useSolicitudes } from '../../store/useSolicitudes';
import { useProveedores } from '../../store/useProveedores';
import type { Cotizacion, CreateCotizacionDto, EstadoCotizacion } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Plus } from 'lucide-react';

const emptyForm: CreateCotizacionDto = {
  solicitudId: 0,
  proveedorId: 0,
  precioOfertadoTotal: 0,
  archivoRespaldoUrl: '',
  estado: 'EN_EVALUACION',
};

const badgeEstado: Record<string, string> = {
  EN_EVALUACION: 'bg-yellow-100 text-yellow-800',
  ELEGIDA: 'bg-green-100 text-green-800',
  DESCARTADA: 'bg-red-100 text-red-800',
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
      render: (item: Cotizacion) => item.solicitud?.codigo ?? `#${item.solicitudId}`,
    },
    {
      key: 'proveedor', header: 'Proveedor',
      render: (item: Cotizacion) => item.proveedor?.razon_social ?? `#${item.proveedorId}`,
    },
    {
      key: 'precioOfertadoTotal', header: 'Precio',
      render: (item: Cotizacion) => (
        <span className="font-semibold">${Number(item.precioOfertadoTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      key: 'estado', header: 'Estado',
      render: (item: Cotizacion) => (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${badgeEstado[item.estado] ?? ''}`}>
          {item.estado}
        </span>
      ),
    },
    {
      key: 'archivoRespaldoUrl', header: 'Respaldo',
      render: (item: Cotizacion) =>
        item.archivoRespaldoUrl ? (
          <a href={item.archivoRespaldoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">Ver</a>
        ) : '-',
    },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Cotizaciones</h1>
        <Button onClick={openCreate}><Plus size={16} className="inline mr-1" /> Nueva</Button>
      </div>

      <DataTable columns={columns} data={cotizaciones} loading={isLoading} onEdit={openEdit} onDelete={openDelete} searchable searchKeys={["codigo", "estado"]} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Cotización' : 'Nueva Cotización'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Solicitud de Compra</label>
            <select value={form.solicitudId}
              onChange={e => setForm({ ...form, solicitudId: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required disabled={!!editing}>
              <option value={0}>Seleccione solicitud</option>
              {solicitudes.map(s => (
                <option key={s.id} value={s.id}>{s.codigo} — {s.estado}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Proveedor</label>
            <select value={form.proveedorId}
              onChange={e => setForm({ ...form, proveedorId: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required>
              <option value={0}>Seleccione proveedor</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.razon_social}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Precio Ofertado Total</label>
            <input type="number" step="0.01" min="0" value={form.precioOfertadoTotal}
              onChange={e => setForm({ ...form, precioOfertadoTotal: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">URL Archivo de Respaldo (opcional)</label>
            <input type="text" placeholder="https://..." value={form.archivoRespaldoUrl ?? ''}
              onChange={e => setForm({ ...form, archivoRespaldoUrl: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Estado</label>
            <select value={form.estado}
              onChange={e => setForm({ ...form, estado: e.target.value as EstadoCotizacion })}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="EN_EVALUACION">EN_EVALUACION</option>
              <option value="ELEGIDA">ELEGIDA</option>
              <option value="DESCARTADA">DESCARTADA</option>
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
        title="Eliminar cotización"
        message={`¿Estás seguro de eliminar esta cotización?`}
        loading={eliminar.isPending} />
    </div>
  );
}
