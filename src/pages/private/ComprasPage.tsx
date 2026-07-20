import { useState } from 'react';
import { useCompras } from '../../store/useCompras';
import { useMateriales } from '../../store/useMateriales';
import type { OrdenCompra, CrearCompraDto, DetalleCompra } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { useProveedores } from '../../store/useProveedores';

const emptyForm: CrearCompraDto = {
  proveedorId: 0,
  detalles: [],
};

export default function ComprasPage() {
  const { compras, isLoading, crear, actualizar, recibir } = useCompras();
  const { materiales } = useMateriales();
  const { proveedores } = useProveedores();

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [form, setForm] = useState<CrearCompraDto>(emptyForm);
  const [impuestoRate, setImpuestoRate] = useState(15);
  const [editing, setEditing] = useState<OrdenCompra | null>(null);
  const [editForm, setEditForm] = useState({ subtotal: 0, impuestos: 0, total: 0 });

  const openCreate = () => {
    setForm({ ...emptyForm, detalles: [{ materialId: 0, cantidad: 1, precioUnitario: 0 }] });
    setImpuestoRate(15);
    setModalOpen(true);
  };

  const openEdit = (item: OrdenCompra) => {
    setEditing(item);
    setEditForm({
      subtotal: Number(item.subtotal),
      impuestos: Number(item.impuestos),
      total: Number(item.total),
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await actualizar.mutateAsync({ id: editing.id, dto: editForm });
    setEditModalOpen(false);
    setEditing(null);
  };

  const addDetalle = () => {
    setForm({ ...form, detalles: [...(form.detalles ?? []), { materialId: 0, cantidad: 1, precioUnitario: 0 }] });
  };

  const removeDetalle = (index: number) => {
    const newDetalles = (form.detalles ?? []).filter((_: DetalleCompra, i: number) => i !== index);
    setForm({ ...form, detalles: newDetalles });
  };

  const updateDetalle = (index: number, field: keyof DetalleCompra, value: string | number) => {
    const newDetalles = [...(form.detalles ?? [])];
    newDetalles[index] = { ...newDetalles[index], [field]: value };
    setForm({ ...form, detalles: newDetalles });
  };

  const subtotalCalc = (form.detalles ?? []).reduce(
    (sum: number, d: DetalleCompra) => sum + Number(d.cantidad) * Number(d.precioUnitario), 0
  );
  const impuestosCalc = subtotalCalc * (impuestoRate / 100);
  const totalCalc = subtotalCalc + impuestosCalc;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const detallesNumeros = (form.detalles ?? [])
      .filter((d: DetalleCompra) => d.materialId !== 0)
      .map((d: DetalleCompra) => ({
        materialId: Number(d.materialId),
        cantidad: Number(d.cantidad),
        precioUnitario: Number(d.precioUnitario),
      }));
    const dto: CrearCompraDto = {
      proveedorId: Number(form.proveedorId),
      subtotal: subtotalCalc,
      impuestos: impuestosCalc,
      total: totalCalc,
      detalles: detallesNumeros,
    };
    await crear.mutateAsync(dto);
    setModalOpen(false);
  };

  const handleRecibir = async (id: number) => {
    await recibir.mutateAsync(id);
  };

  const columns = [
    { key: 'codigo', header: 'Código' },
    {
      key: 'proveedor', header: 'Proveedor',
      render: (item: OrdenCompra) => item.proveedor?.razon_social ?? '-',
    },
    { key: 'estado', header: 'Estado' },
    {
      key: 'subtotal', header: 'Subtotal',
      render: (item: OrdenCompra) => `$${Number(item.subtotal).toFixed(2)}`,
    },
    {
      key: 'impuestos', header: 'Impuestos',
      render: (item: OrdenCompra) => `$${Number(item.impuestos).toFixed(2)}`,
    },
    {
      key: 'total', header: 'Total',
      render: (item: OrdenCompra) => (
        <span className="font-semibold">${Number(item.total).toFixed(2)}</span>
      ),
    },
    {
      key: 'acciones', header: '',
      render: (item: OrdenCompra) => (
        <div className="flex gap-1">
          {(item.estado === 'BORRADOR' || item.estado === 'PENDIENTE') && (
            <>
              <Button className="!px-2 !py-1 !text-xs" onClick={() => openEdit(item)}>Editar</Button>
              <Button className="!px-2 !py-1 !text-xs" onClick={() => handleRecibir(item.id)}>Recibir</Button>
            </>
          )}
          {item.estado === 'EMITIDA' && (
            <Button className="!px-2 !py-1 !text-xs" onClick={() => handleRecibir(item.id)}>Recibir</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Órdenes de Compra</h1>
        <Button onClick={openCreate}><Plus size={16} className="inline mr-1" /> Nueva</Button>
      </div>

      <DataTable columns={columns} data={compras} loading={isLoading} />

      {/* Modal Crear */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva Orden de Compra">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Proveedor</label>
            <select value={form.proveedorId}
              onChange={e => setForm({ ...form, proveedorId: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required>
              <option value={0}>Seleccione proveedor</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.razon_social}</option>)}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Detalles</label>
              <button type="button" onClick={addDetalle} className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                <Plus size={14} /> Agregar
              </button>
            </div>
            {(form.detalles ?? []).map((det: DetalleCompra, i: number) => (
              <div key={i} className="flex gap-2 mb-2 items-end">
                <select value={det.materialId} onChange={e => updateDetalle(i, 'materialId', Number(e.target.value))}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm" required>
                  <option value={0}>Seleccione material</option>
                  {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.sku})</option>)}
                </select>
                <input type="number" min="1" placeholder="Cantidad" value={det.cantidad}
                  onChange={e => updateDetalle(i, 'cantidad', Number(e.target.value))}
                  className="w-20 border rounded-lg px-3 py-2 text-sm" required />
                <input type="number" min="0" step="0.01" placeholder="P. Unitario" value={det.precioUnitario}
                  onChange={e => updateDetalle(i, 'precioUnitario', Number(e.target.value))}
                  className="w-28 border rounded-lg px-3 py-2 text-sm" required />
                <button type="button" onClick={() => removeDetalle(i)} className="text-red-500 hover:text-red-700 p-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-2 text-sm text-right">
            <p>Subtotal: <span className="font-medium">${subtotalCalc.toFixed(2)}</span></p>
            <div className="flex items-center justify-end gap-2">
              <span>Impuestos</span>
              <input type="number" min="0" max="100" step="0.5" value={impuestoRate}
                onChange={e => setImpuestoRate(Number(e.target.value))}
                className="w-16 border rounded px-2 py-1 text-sm text-right" />%
              <span className="font-medium">= ${impuestosCalc.toFixed(2)}</span>
            </div>
            <p className="text-base font-bold">Total: <span>${totalCalc.toFixed(2)}</span></p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={crear.isPending}>Crear</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Editar OC - ${editing?.codigo ?? ''}`}>
        <form onSubmit={handleEditSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Subtotal</label>
            <input type="number" step="0.01" min="0" value={editForm.subtotal}
              onChange={e => {
                const sub = Number(e.target.value);
                const imp = sub * (impuestoRate / 100);
                setEditForm({ subtotal: sub, impuestos: imp, total: sub + imp });
              }}
              className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Impuestos</label>
            <input type="number" step="0.01" min="0" value={editForm.impuestos}
              onChange={e => setEditForm({ ...editForm, impuestos: Number(e.target.value), total: editForm.subtotal + Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Total</label>
            <input type="number" step="0.01" min="0" value={editForm.total}
              onChange={e => setEditForm({ ...editForm, total: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 text-sm font-bold" required />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={actualizar.isPending}>Actualizar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
