import { useState } from 'react';
import { useMovimientos } from '../../store/useMovimientos';
import { useBodegas } from '../../store/useBodegas';
import { useMateriales } from '../../store/useMateriales';
import type { Movimiento, CrearMovimientoDto, MovimientoDetalle, TipoMovimiento } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, ArrowDown, ArrowUp, ArrowLeftRight } from 'lucide-react';

const emptyForm: CrearMovimientoDto = {
  tipo: 'INGRESO',
  observaciones: '',
  bodegaOrigenId: undefined,
  bodegaDestinoId: undefined,
  detalles: [],
};

const badgeTipo: Record<string, string> = {
  INGRESO: 'bg-green-100 text-green-800',
  EGRESO: 'bg-red-100 text-red-800',
  TRANSFERENCIA: 'bg-blue-100 text-blue-800',
};

const iconTipo: Record<string, React.ReactNode> = {
  INGRESO: <ArrowDown size={14} />,
  EGRESO: <ArrowUp size={14} />,
  TRANSFERENCIA: <ArrowLeftRight size={14} />,
};

export default function MovimientosPage() {
  const { movimientos, isLoading, crear } = useMovimientos();
  const { bodegas } = useBodegas();
  const { materiales } = useMateriales();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CrearMovimientoDto>(emptyForm);

  const openCreate = () => {
    setForm({ ...emptyForm, detalles: [{ materialId: 0, cantidad: 1 }] });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const detallesNumeros = form.detalles
      .filter(d => d.materialId !== 0 && d.materialId !== '')
      .map(d => ({ materialId: Number(d.materialId), cantidad: Number(d.cantidad) }));
    const dto = {
      ...form,
      bodegaOrigenId: form.bodegaOrigenId ? Number(form.bodegaOrigenId) : undefined,
      bodegaDestinoId: form.bodegaDestinoId ? Number(form.bodegaDestinoId) : undefined,
      detalles: detallesNumeros,
    };
    await crear.mutateAsync(dto);
    setModalOpen(false);
  };

  const addDetalle = () => {
    setForm({ ...form, detalles: [...form.detalles, { materialId: 0, cantidad: 1 }] });
  };

  const removeDetalle = (index: number) => {
    setForm({ ...form, detalles: form.detalles.filter((_, i) => i !== index) });
  };

  const updateDetalle = (index: number, field: keyof MovimientoDetalle, value: string | number) => {
    const newDetalles = [...form.detalles];
    newDetalles[index] = { ...newDetalles[index], [field]: value };
    setForm({ ...form, detalles: newDetalles });
  };

  const columns = [
    {
      key: 'id', header: 'ID',
      render: (item: Movimiento) => <span className="font-mono text-xs">{String(item.id).substring(0, 8)}</span>,
    },
    {
      key: 'tipo', header: 'Tipo',
      render: (item: Movimiento) => (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badgeTipo[item.tipo] ?? ''}`}>
          {iconTipo[item.tipo]} {item.tipo}
        </span>
      ),
    },
    { key: 'fecha', header: 'Fecha', render: (item: Movimiento) => new Date(item.fecha).toLocaleDateString() },
    { key: 'bodegaOrigenId', header: 'Origen', render: (item: Movimiento) => item.bodegaOrigenId ?? '-' },
    { key: 'bodegaDestinoId', header: 'Destino', render: (item: Movimiento) => item.bodegaDestinoId ?? '-' },
    { key: 'estado', header: 'Estado' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Movimientos de Inventario</h1>
        <Button onClick={openCreate}><Plus size={16} className="inline mr-1" /> Nuevo</Button>
      </div>

      <DataTable columns={columns} data={movimientos} loading={isLoading} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Movimiento">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tipo de Movimiento</label>
            <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value as TipoMovimiento, bodegaOrigenId: undefined, bodegaDestinoId: undefined })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required>
              <option value="INGRESO">INGRESO</option>
              <option value="EGRESO">EGRESO</option>
              <option value="TRANSFERENCIA">TRANSFERENCIA</option>
            </select>
          </div>

          {(form.tipo === 'EGRESO' || form.tipo === 'TRANSFERENCIA') && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Bodega Origen</label>
              <select value={form.bodegaOrigenId ?? ''} onChange={e => setForm({ ...form, bodegaOrigenId: Number(e.target.value) || undefined })}
                className="w-full border rounded-lg px-3 py-2 text-sm" required>
                <option value="">Seleccione bodega</option>
                {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
            </div>
          )}

          {(form.tipo === 'INGRESO' || form.tipo === 'TRANSFERENCIA') && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">Bodega Destino</label>
              <select value={form.bodegaDestinoId ?? ''} onChange={e => setForm({ ...form, bodegaDestinoId: Number(e.target.value) || undefined })}
                className="w-full border rounded-lg px-3 py-2 text-sm" required>
                <option value="">Seleccione bodega</option>
                {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-600 mb-1">Observaciones</label>
            <textarea value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Materiales</label>
              <button type="button" onClick={addDetalle} className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                <Plus size={14} /> Agregar
              </button>
            </div>
            {form.detalles.map((det, i) => (
              <div key={i} className="flex gap-2 mb-2 items-end">
                <select value={det.materialId} onChange={e => updateDetalle(i, 'materialId', Number(e.target.value))}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm" required>
                  <option value={0}>Seleccione material</option>
                  {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.sku})</option>)}
                </select>
                <input type="number" min="1" placeholder="Cantidad" value={det.cantidad}
                  onChange={e => updateDetalle(i, 'cantidad', Number(e.target.value))}
                  className="w-24 border rounded-lg px-3 py-2 text-sm" required />
                <button type="button" onClick={() => removeDetalle(i)} className="text-red-500 hover:text-red-700 p-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={crear.isPending}>Registrar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}