import { useState } from 'react';
import { useMovimientos } from '../../store/useMovimientos';
import { useBodegas } from '../../store/useBodegas';
import { useMateriales } from '../../store/useMateriales';
import type { Movimiento, CrearMovimientoDto, MovimientoDetalle, TipoMovimiento } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, ArrowDown, ArrowUp, ArrowLeftRight, FileDown } from 'lucide-react';
import { movimientosApi } from '../../api/movimientos.api';
import { triggerDownload } from '../../lib/download';
import toast from 'react-hot-toast';

const emptyForm: CrearMovimientoDto = {
  tipo: 'INGRESO',
  observaciones: '',
  bodegaOrigenId: undefined,
  bodegaDestinoId: undefined,
  detalles: [],
};

const badgeTipo: Record<string, string> = {
  INGRESO: 'bg-primary/10 text-primary border-primary/30',
  EGRESO: 'bg-red-500/10 text-red-400 border-red-500/30',
  TRANSFERENCIA: 'bg-accent/10 text-accent border-accent/30',
};

const iconTipo: Record<string, React.ReactNode> = {
  INGRESO: <ArrowDown size={14} className="text-primary" />,
  EGRESO: <ArrowUp size={14} className="text-red-400" />,
  TRANSFERENCIA: <ArrowLeftRight size={14} className="text-accent" />,
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

  const handleDownloadTicket = async (item: Movimiento) => {
    try {
      const blob = await movimientosApi.downloadTicket(String(item.id));
      triggerDownload(blob, `TICKET-MOV-${String(item.id).substring(0, 8)}.pdf`);
    } catch {
      toast.error('Error al descargar el ticket');
    }
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
      render: (item: Movimiento) => (
        <span className="font-mono text-xs bg-background text-primary px-2.5 py-1 rounded-lg border border-border font-semibold">
          {String(item.id).substring(0, 8)}
        </span>
      ),
    },
    {
      key: 'tipo', header: 'Tipo',
      render: (item: Movimiento) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${badgeTipo[item.tipo] ?? 'bg-background text-muted-foreground border-border'}`}>
          {iconTipo[item.tipo]} {item.tipo}
        </span>
      ),
    },
    { 
      key: 'fecha', header: 'Fecha', 
      render: (item: Movimiento) => <span className="text-muted-foreground">{new Date(item.fecha).toLocaleDateString()}</span> 
    },
    { 
      key: 'bodegaOrigenId', header: 'Origen', 
      render: (item: Movimiento) => <span className="text-card-foreground font-medium">{item.bodegaOrigen?.nombre ?? '-'}</span> 
    },
    { 
      key: 'bodegaDestinoId', header: 'Destino', 
      render: (item: Movimiento) => <span className="text-card-foreground font-medium">{item.bodegaDestino?.nombre ?? '-'}</span> 
    },
    { 
      key: 'estado', header: 'Estado',
      render: (item: Movimiento) => (
        <span className="inline-block px-2.5 py-1 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/30">
          {item.estado || 'PROCESADO'}
        </span>
      )
    },
    {
      key: 'ticket', header: '',
      render: (item: Movimiento) => (
        <Button 
          className="!px-3 !py-1.5 !text-xs bg-secondary hover:bg-black/10 dark:hover:bg-white/10 text-card-foreground border border-border rounded-xl transition-all" 
          onClick={() => handleDownloadTicket(item)}
        >
          <FileDown size={14} className="inline mr-1 text-accent" /> Ticket
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-card-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>Movimientos de Inventario</h1>
          <p className="text-muted-foreground text-sm">Registro e historial de entradas, salidas y transferencias entre bodegas.</p>
        </div>
        <Button 
          onClick={openCreate}
          className="bg-accent hover:bg-accent/80 text-white font-bold px-5 py-3 rounded-xl border border-border transition-all shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={18} /> Nuevo Movimiento
        </Button>
      </div>

      {/* Tabla de Movimientos */}
      <div className="bg-card backdrop-blur-lg rounded-3xl border border-border p-6 shadow-2xl overflow-hidden">
        <DataTable columns={columns} data={movimientos} loading={isLoading} searchable searchKeys={["codigo", "tipo", "estado"]} />
      </div>

      {/* Modal Crear */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Movimiento">
        <form onSubmit={handleSubmit} className="space-y-5 text-muted-foreground p-1">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Tipo de Movimiento</label>
            <select 
              value={form.tipo} 
              onChange={e => setForm({ ...form, tipo: e.target.value as TipoMovimiento, bodegaOrigenId: undefined, bodegaDestinoId: undefined })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer font-bold" 
              required
            >
              <option value="INGRESO" className="bg-background">INGRESO</option>
              <option value="EGRESO" className="bg-background">EGRESO</option>
              <option value="TRANSFERENCIA" className="bg-background">TRANSFERENCIA</option>
            </select>
          </div>

          {(form.tipo === 'EGRESO' || form.tipo === 'TRANSFERENCIA') && (
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1.5">Bodega Origen</label>
              <select 
                value={form.bodegaOrigenId ?? ''} 
                onChange={e => setForm({ ...form, bodegaOrigenId: Number(e.target.value) || undefined })}
                className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer" 
                required
              >
                <option value="" className="bg-background">Seleccione bodega origen</option>
                {bodegas.map(b => <option key={b.id} value={b.id} className="bg-background">{b.nombre}</option>)}
              </select>
            </div>
          )}

          {(form.tipo === 'INGRESO' || form.tipo === 'TRANSFERENCIA') && (
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-1.5">Bodega Destino</label>
              <select 
                value={form.bodegaDestinoId ?? ''} 
                onChange={e => setForm({ ...form, bodegaDestinoId: Number(e.target.value) || undefined })}
                className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer" 
                required
              >
                <option value="" className="bg-background">Seleccione bodega destino</option>
                {bodegas.map(b => <option key={b.id} value={b.id} className="bg-background">{b.nombre}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Observaciones</label>
            <textarea 
              value={form.observaciones} 
              onChange={e => setForm({ ...form, observaciones: e.target.value })}
              placeholder="Detalles adicionales o motivo del movimiento..."
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all" 
              rows={2} 
            />
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-card-foreground">Materiales</label>
              <button 
                type="button" 
                onClick={addDetalle} 
                className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={16} /> Agregar material
              </button>
            </div>

            <div className="space-y-3">
              {form.detalles.map((det, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-2.5 sm:items-center bg-background p-3 rounded-2xl border border-border">
                  <select 
                    value={det.materialId} 
                    onChange={e => updateDetalle(i, 'materialId', Number(e.target.value))}
                    className="flex-1 bg-card text-card-foreground border border-border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-accent transition-all cursor-pointer" 
                    required
                  >
                    <option value={0} className="bg-card">Seleccione material</option>
                    {materiales.map(m => <option key={m.id} value={m.id} className="bg-card">{m.nombre} ({m.sku})</option>)}
                  </select>

                  <input 
                    type="number" 
                    step="1" 
                    min="1" 
                    placeholder="Cantidad" 
                    value={det.cantidad}
                    onChange={e => updateDetalle(i, 'cantidad', Number(e.target.value))}
                    onKeyDown={e => { if (['.', ',', 'e', '+', '-'].includes(e.key)) e.preventDefault(); }}
                    className="w-full sm:w-28 bg-card text-card-foreground border border-border rounded-xl px-3.5 py-2 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent transition-all font-semibold" 
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
              disabled={crear.isPending || form.detalles.length === 0}
              className="bg-accent hover:bg-accent/80 text-white font-bold px-6 py-2.5 rounded-xl border border-border transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {crear.isPending ? 'Registrando...' : 'Registrar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}