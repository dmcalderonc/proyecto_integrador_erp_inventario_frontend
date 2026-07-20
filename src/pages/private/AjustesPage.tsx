import { useState } from 'react';
import { useBodegas } from '../../store/useBodegas';
import { useMateriales } from '../../store/useMateriales';
import { useAjustes } from '../../store/useAjustes';
import type { CreateAjusteDto, DetalleAjuste } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, Eye } from 'lucide-react';

const emptyForm: CreateAjusteDto = {
  bodegaId: 0,
  motivo: '',
  detalles: [],
};

interface AjusteRecord {
  id: string;
  bodega?: { nombre: string };
  bodegaId: number;
  motivo: string;
  fechaAjuste: string;
  detalles?: Array<{
    material?: { nombre: string; sku: string };
    stockSistema: number;
    stockFisico: number;
    diferencia: number;
  }>;
}

export default function AjustesPage() {
  const { ajustes, isLoading, crear } = useAjustes();
  const { bodegas } = useBodegas();
  const { materiales } = useMateriales();

  const [form, setForm] = useState<CreateAjusteDto>(emptyForm);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAjuste, setSelectedAjuste] = useState<AjusteRecord | null>(null);

  const addDetalle = () => {
    setForm({ ...form, detalles: [...form.detalles, { materialId: 0, stockFisico: 0 }] });
  };

  const removeDetalle = (index: number) => {
    setForm({ ...form, detalles: form.detalles.filter((_: DetalleAjuste, i: number) => i !== index) });
  };

  const updateDetalle = (index: number, field: keyof DetalleAjuste, value: string | number) => {
    const newDetalles = [...form.detalles];
    newDetalles[index] = { ...newDetalles[index], [field]: value };
    setForm({ ...form, detalles: newDetalles });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const detallesNumeros = form.detalles
      .filter(d => d.materialId !== 0)
      .map(d => ({ materialId: Number(d.materialId), stockFisico: Number(d.stockFisico) }));
    const dto: CreateAjusteDto = {
      bodegaId: Number(form.bodegaId),
      motivo: form.motivo,
      detalles: detallesNumeros,
    };
    await crear.mutateAsync(dto);
    setForm(emptyForm);
  };

  const openDetail = (item: AjusteRecord) => {
    setSelectedAjuste(item);
    setDetailOpen(true);
  };

  const columns = [
    {
      key: 'id', header: 'ID',
      render: (item: AjusteRecord) => <span className="font-mono text-xs">{String(item.id).substring(0, 8)}</span>,
    },
    { key: 'bodega', header: 'Bodega', render: (item: AjusteRecord) => item.bodega?.nombre ?? '-' },
    { key: 'motivo', header: 'Motivo' },
    { key: 'fechaAjuste', header: 'Fecha', render: (item: AjusteRecord) => item.fechaAjuste ? new Date(item.fechaAjuste).toLocaleDateString() : '-' },
    {
      key: 'acciones', header: '',
      render: (item: AjusteRecord) => (
        <Button className="!px-2 !py-1 !text-xs" onClick={() => openDetail(item)}>
          <Eye size={14} className="inline mr-1" /> Ver
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Ajustes de Inventario</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl mb-8">
        <h2 className="text-lg font-semibold mb-4">Nuevo Ajuste</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Bodega</label>
            <select value={form.bodegaId}
              onChange={e => setForm({ ...form, bodegaId: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required>
              <option value={0}>Seleccione bodega</option>
              {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Motivo</label>
            <textarea placeholder="Motivo del ajuste" value={form.motivo}
              onChange={e => setForm({ ...form, motivo: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} required />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Detalles</label>
              <button type="button" onClick={addDetalle} className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                <Plus size={14} /> Agregar material
              </button>
            </div>
            {form.detalles.length === 0 && (
              <p className="text-sm text-gray-400">Agrega al menos un material para ajustar.</p>
            )}
            {form.detalles.map((det, i) => (
              <div key={i} className="flex gap-2 mb-2 items-end">
                <select value={det.materialId} onChange={e => updateDetalle(i, 'materialId', Number(e.target.value))}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm" required>
                  <option value={0}>Seleccione material</option>
                  {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.sku})</option>)}
                </select>
                <input type="number" min="0" placeholder="Stock físico" value={det.stockFisico}
                  onChange={e => updateDetalle(i, 'stockFisico', Number(e.target.value))}
                  className="w-32 border rounded-lg px-3 py-2 text-sm" required />
                <button type="button" onClick={() => removeDetalle(i)} className="text-red-500 hover:text-red-700 p-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={crear.isPending || form.detalles.length === 0}>
              Registrar Ajuste
            </Button>
          </div>
        </form>
      </div>

      <h2 className="text-lg font-semibold mb-3">Historial de Ajustes</h2>
      <DataTable columns={columns} data={ajustes} loading={isLoading} />

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Ajuste - ${selectedAjuste?.bodega?.nombre ?? ''}`}>
        {selectedAjuste && (
          <div className="space-y-3">
            <p className="text-sm"><span className="font-medium">Motivo:</span> {selectedAjuste.motivo}</p>
            <p className="text-sm"><span className="font-medium">Fecha:</span> {selectedAjuste.fechaAjuste ? new Date(selectedAjuste.fechaAjuste).toLocaleString() : '-'}</p>
            {selectedAjuste.detalles && selectedAjuste.detalles.length > 0 && (
              <table className="w-full text-sm border mt-2">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2">Material</th>
                    <th className="text-right px-3 py-2">Stock Sistema</th>
                    <th className="text-right px-3 py-2">Stock Físico</th>
                    <th className="text-right px-3 py-2">Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAjuste.detalles.map((d, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-3 py-2">{d.material?.nombre ?? `Material #${i + 1}`}</td>
                      <td className="text-right px-3 py-2">{d.stockSistema}</td>
                      <td className="text-right px-3 py-2">{d.stockFisico}</td>
                      <td className={`text-right px-3 py-2 font-medium ${d.diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {d.diferencia > 0 ? '+' : ''}{d.diferencia}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
