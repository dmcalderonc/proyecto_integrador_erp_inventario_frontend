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
        <span className="font-mono text-xs bg-[#0A1128] text-[#10B981] px-2.5 py-1 rounded-lg border border-[#334155] font-semibold">
          {String(item.id).substring(0, 8)}
        </span>
      ),
    },
    { key: 'bodega', header: 'Bodega', render: (item: AjusteRecord) => <span className="text-[#FFFFFF] font-medium">{item.bodega?.nombre ?? '-'}</span> },
    { key: 'motivo', header: 'Motivo', render: (item: AjusteRecord) => <span className="text-[#94A3B8]">{item.motivo}</span> },
    { key: 'fechaAjuste', header: 'Fecha', render: (item: AjusteRecord) => <span className="text-[#94A3B8]">{item.fechaAjuste ? new Date(item.fechaAjuste).toLocaleDateString() : '-'}</span> },
    {
      key: 'acciones', header: '',
      render: (item: AjusteRecord) => (
        <Button 
          className="!px-3 !py-1.5 !text-xs bg-[#1E293B] hover:bg-white/10 text-[#FFFFFF] border border-[#334155] rounded-xl transition-all" 
          onClick={() => openDetail(item)}
        >
          <Eye size={14} className="inline mr-1 text-[#06B6D4]" /> Ver
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-[#FFFFFF] mb-2">Ajustes de Inventario</h1>
        <p className="text-[#94A3B8] text-sm">Gestiona discrepancias y audita los niveles de stock en bodegas.</p>
      </div>

      {/* Formulario de Nuevo Ajuste */}
      <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-6 sm:p-8 max-w-2xl shadow-2xl">
        <h2 className="text-xl font-bold text-[#FFFFFF] mb-6 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
          Nuevo Ajuste
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Bodega</label>
            <select 
              value={form.bodegaId}
              onChange={e => setForm({ ...form, bodegaId: Number(e.target.value) })}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all cursor-pointer" 
              required
            >
              <option value={0} className="bg-[#0A1128]">Seleccione bodega</option>
              {bodegas.map(b => <option key={b.id} value={b.id} className="bg-[#0A1128]">{b.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#FFFFFF] mb-1.5">Motivo</label>
            <textarea 
              placeholder="Motivo del ajuste (ej: Conteo físico semestral, merma, rotura)" 
              value={form.motivo}
              onChange={e => setForm({ ...form, motivo: e.target.value })}
              className="w-full bg-[#0A1128] text-[#FFFFFF] border border-[#334155] rounded-xl px-4 py-2.5 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] focus:ring-2 focus:ring-[#06B6D4]/20 transition-all" 
              rows={2} 
              required 
            />
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-[#FFFFFF]">Detalles de Materiales</label>
              <button 
                type="button" 
                onClick={addDetalle} 
                className="text-[#10B981] hover:text-[#10B981]/80 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={16} /> Agregar material
              </button>
            </div>

            {form.detalles.length === 0 && (
              <div className="p-4 rounded-2xl bg-[#0A1128] border border-[#334155] text-center">
                <p className="text-sm text-[#94A3B8]">Agrega al menos un material para realizar el ajuste de stock.</p>
              </div>
            )}

            <div className="space-y-3">
              {form.detalles.map((det, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2.5 sm:items-center bg-[#0A1128] p-3 rounded-2xl border border-[#334155]">
                  <select 
                    value={det.materialId} 
                    onChange={e => updateDetalle(i, 'materialId', Number(e.target.value))}
                    className="flex-1 bg-[#111D4A] text-[#FFFFFF] border border-[#334155] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#06B6D4] transition-all cursor-pointer" 
                    required
                  >
                    <option value={0} className="bg-[#111D4A]">Seleccione material</option>
                    {materiales.map(m => <option key={m.id} value={m.id} className="bg-[#111D4A]">{m.nombre} ({m.sku})</option>)}
                  </select>

                  <input 
                    type="number" 
                    step="1" 
                    min="0" 
                    placeholder="Stock físico" 
                    value={det.stockFisico}
                    onChange={e => updateDetalle(i, 'stockFisico', Number(e.target.value))}
                    onKeyDown={e => { if (['.', ',', 'e', '+', '-'].includes(e.key)) e.preventDefault(); }}
                    className="w-full sm:w-36 bg-[#111D4A] text-[#FFFFFF] border border-[#334155] rounded-xl px-3.5 py-2 text-sm placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#06B6D4] transition-all" 
                    required 
                  />

                  <button 
                    type="button" 
                    onClick={() => removeDetalle(i)} 
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-xl transition-colors self-end sm:self-auto cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#334155]">
            <Button 
              type="submit" 
              disabled={crear.isPending || form.detalles.length === 0}
              className="bg-[#06B6D4] hover:bg-[#0284C7] text-white font-bold px-6 py-3 rounded-xl border border-[#334155] transition-all shadow-lg shadow-[#06B6D4]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {crear.isPending ? 'Guardando...' : 'Registrar Ajuste'}
            </Button>
          </div>
        </form>
      </div>

      {/* Historial de Ajustes */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#FFFFFF]">Historial de Ajustes</h2>
        <div className="bg-[#111D4A] backdrop-blur-lg rounded-3xl border border-[#334155] p-6 shadow-2xl overflow-hidden">
          <DataTable columns={columns} data={ajustes} loading={isLoading} searchable searchKeys={["codigo", "estado"]} />
        </div>
      </div>

      {/* Modal de Detalle */}
      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Ajuste - ${selectedAjuste?.bodega?.nombre ?? ''}`}>
        {selectedAjuste && (
          <div className="space-y-5 text-[#94A3B8] p-1">
            <div className="bg-[#0A1128] p-4 rounded-2xl border border-[#334155] space-y-2">
              <p className="text-sm"><span className="font-semibold text-[#FFFFFF]">Motivo:</span> {selectedAjuste.motivo}</p>
              <p className="text-sm"><span className="font-semibold text-[#FFFFFF]">Fecha:</span> {selectedAjuste.fechaAjuste ? new Date(selectedAjuste.fechaAjuste).toLocaleString() : '-'}</p>
            </div>

            {selectedAjuste.detalles && selectedAjuste.detalles.length > 0 && (
              <div className="overflow-x-auto rounded-2xl border border-[#334155]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#0A1128] text-[#FFFFFF] border-b border-[#334155]">
                      <th className="text-left px-4 py-3 font-semibold">Material</th>
                      <th className="text-right px-4 py-3 font-semibold">Stock Sistema</th>
                      <th className="text-right px-4 py-3 font-semibold">Stock Físico</th>
                      <th className="text-right px-4 py-3 font-semibold">Diferencia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#334155] bg-[#111D4A]">
                    {selectedAjuste.detalles.map((d, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-[#FFFFFF] font-medium">{d.material?.nombre ?? `Material #${i + 1}`}</td>
                        <td className="text-right px-4 py-3 text-[#94A3B8]">{d.stockSistema}</td>
                        <td className="text-right px-4 py-3 text-[#94A3B8]">{d.stockFisico}</td>
                        <td className={`text-right px-4 py-3 font-bold ${d.diferencia >= 0 ? 'text-[#10B981]' : 'text-red-400'}`}>
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