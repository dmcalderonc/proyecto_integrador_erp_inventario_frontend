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
      render: (item: AjusteRecord) => (
        <span className="font-mono text-xs bg-base text-success px-2.5 py-1 rounded-lg border border-border-subtle font-semibold">
          {String(item.id).substring(0, 8)}
        </span>
      ),
    },
    { key: 'bodega', header: 'Bodega', render: (item: AjusteRecord) => <span className="text-text-primary font-medium">{item.bodega?.nombre ?? '-'}</span> },
    { key: 'motivo', header: 'Motivo', render: (item: AjusteRecord) => <span className="text-text-secondary">{item.motivo}</span> },
    { key: 'fechaAjuste', header: 'Fecha', render: (item: AjusteRecord) => <span className="text-text-secondary">{item.fechaAjuste ? new Date(item.fechaAjuste).toLocaleDateString() : '-'}</span> },
    {
      key: 'acciones', header: '',
      render: (item: AjusteRecord) => (
        <Button variant="secondary" size="sm" onClick={() => openDetail(item)}>
          <Eye size={14} className="text-accent" /> Ver
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Ajustes de Inventario</h1>
          <p className="text-sm text-text-secondary mt-1">Gestiona discrepancias y audita los niveles de stock en bodegas.</p>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle p-6 sm:p-8 max-w-2xl">
        <h2 className="text-lg font-bold text-text-primary mb-6">Nuevo Ajuste</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Bodega</label>
            <select 
              value={form.bodegaId}
              onChange={e => setForm({ ...form, bodegaId: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all cursor-pointer" 
              required
            >
              <option value={0}>Seleccione bodega</option>
              {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Motivo</label>
            <textarea 
              placeholder="Motivo del ajuste (ej: Conteo fisico semestral, merma, rotura)" 
              value={form.motivo}
              onChange={e => setForm({ ...form, motivo: e.target.value })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all" 
              rows={2} 
              required 
            />
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-text-primary">Detalles de Materiales</label>
              <button 
                type="button" 
                onClick={addDetalle} 
                className="text-success hover:text-success/80 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={16} /> Agregar material
              </button>
            </div>

            {form.detalles.length === 0 && (
              <div className="p-4 rounded-xl bg-base border border-border-subtle text-center">
                <p className="text-sm text-text-secondary">Agrega al menos un material para realizar el ajuste de stock.</p>
              </div>
            )}

            <div className="space-y-3">
              {form.detalles.map((det, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2.5 sm:items-center bg-base p-3 rounded-xl border border-border-subtle">
                  <select 
                    value={det.materialId} 
                    onChange={e => updateDetalle(i, 'materialId', Number(e.target.value))}
                    className="flex-1 px-3.5 py-2 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all cursor-pointer" 
                    required
                  >
                    <option value={0}>Seleccione material</option>
                    {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.sku})</option>)}
                  </select>

                  <input 
                    type="number" 
                    step="1" 
                    min="0" 
                    placeholder="Stock fisico" 
                    value={det.stockFisico}
                    onChange={e => updateDetalle(i, 'stockFisico', Number(e.target.value))}
                    onKeyDown={e => { if (['.', ',', 'e', '+', '-'].includes(e.key)) e.preventDefault(); }}
                    className="w-full sm:w-36 px-3.5 py-2 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all" 
                    required 
                  />

                  <button 
                    type="button" 
                    onClick={() => removeDetalle(i)} 
                    className="text-danger hover:text-danger/80 hover:bg-danger-bg p-2 rounded-xl transition-colors self-end sm:self-auto cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border-subtle">
            <Button 
              type="submit" 
              disabled={crear.isPending || form.detalles.length === 0}
            >
              {crear.isPending ? 'Guardando...' : 'Registrar Ajuste'}
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-text-primary">Historial de Ajustes</h2>
        <div className="bg-surface rounded-xl border border-border-subtle p-6">
          <DataTable columns={columns} data={ajustes} loading={isLoading} searchable searchKeys={["codigo", "estado"]} />
        </div>
      </div>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Ajuste - ${selectedAjuste?.bodega?.nombre ?? ''}`}>
        {selectedAjuste && (
          <div className="space-y-5">
            <div className="bg-base p-4 rounded-xl border border-border-subtle space-y-2">
              <p className="text-sm"><span className="font-semibold text-text-primary">Motivo:</span> <span className="text-text-secondary">{selectedAjuste.motivo}</span></p>
              <p className="text-sm"><span className="font-semibold text-text-primary">Fecha:</span> <span className="text-text-secondary">{selectedAjuste.fechaAjuste ? new Date(selectedAjuste.fechaAjuste).toLocaleString() : '-'}</span></p>
            </div>

            {selectedAjuste.detalles && selectedAjuste.detalles.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-border-subtle">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-base border-b border-border-subtle">
                      <th className="text-left px-4 py-3 font-semibold text-text-primary">Material</th>
                      <th className="text-right px-4 py-3 font-semibold text-text-primary">Stock Sistema</th>
                      <th className="text-right px-4 py-3 font-semibold text-text-primary">Stock Fisico</th>
                      <th className="text-right px-4 py-3 font-semibold text-text-primary">Diferencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle bg-surface">
                    {selectedAjuste.detalles.map((d, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3 text-text-primary font-medium">{d.material?.nombre ?? `Material #${i + 1}`}</td>
                        <td className="text-right px-4 py-3 text-text-secondary">{d.stockSistema}</td>
                        <td className="text-right px-4 py-3 text-text-secondary">{d.stockFisico}</td>
                        <td className={`text-right px-4 py-3 font-bold ${d.diferencia >= 0 ? 'text-success' : 'text-danger'}`}>
                          {d.diferencia > 0 ? '+' : ''}{d.diferencia}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
