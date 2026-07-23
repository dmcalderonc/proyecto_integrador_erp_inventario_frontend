import { useState } from 'react';
import { useMovimientos } from '../../store/useMovimientos';
import { useBodegas } from '../../store/useBodegas';
import { useMateriales } from '../../store/useMateriales';
import { useAuth } from '../../contexts/AuthContext';
import type { Movimiento, CrearMovimientoDto, MovimientoDetalle, TipoMovimiento } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { getBadgeStyle } from '../../lib/design-tokens';
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

const iconTipo: Record<string, React.ReactNode> = {
  INGRESO: <ArrowDown size={14} className="text-success" />,
  EGRESO: <ArrowUp size={14} className="text-danger" />,
  TRANSFERENCIA: <ArrowLeftRight size={14} className="text-accent" />,
};

export default function MovimientosPage() {
  const { hasRole } = useAuth();
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
        <span className="font-mono text-xs bg-base text-success px-2.5 py-1 rounded-lg border border-border-subtle font-semibold">
          {String(item.id).substring(0, 8)}
        </span>
      ),
    },
    {
      key: 'tipo', header: 'Tipo',
      render: (item: Movimiento) => (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${getBadgeStyle(item.tipo)}`}>
          {iconTipo[item.tipo]} {item.tipo}
        </span>
      ),
    },
    { 
      key: 'fecha', header: 'Fecha', 
      render: (item: Movimiento) => <span className="text-text-secondary">{new Date(item.fecha).toLocaleDateString()}</span> 
    },
    { 
      key: 'bodegaOrigenId', header: 'Origen', 
      render: (item: Movimiento) => <span className="text-text-primary font-medium">{item.bodegaOrigen?.nombre ?? '-'}</span> 
    },
    { 
      key: 'bodegaDestinoId', header: 'Destino', 
      render: (item: Movimiento) => <span className="text-text-primary font-medium">{item.bodegaDestino?.nombre ?? '-'}</span> 
    },
    { 
      key: 'estado', header: 'Estado',
      render: (item: Movimiento) => (
        <span className="inline-block px-2.5 py-1 rounded-xl text-xs font-semibold border bg-success-bg text-success border-success/30">
          {item.estado || 'PROCESADO'}
        </span>
      )
    },
    {
      key: 'ticket', header: '',
      render: (item: Movimiento) => (
        <Button 
          variant="secondary"
          size="sm"
          onClick={() => handleDownloadTicket(item)}
        >
          <FileDown size={14} className="text-accent" /> Ticket
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Movimientos de Inventario</h1>
          <p className="text-sm text-text-secondary mt-1">Registro e historial de entradas, salidas y transferencias entre bodegas.</p>
        </div>
        {hasRole(['ADMIN', 'BODEGUERO']) && (
          <Button onClick={openCreate} className="gap-1.5">
            <Plus size={16} /> Nuevo Movimiento
          </Button>
        )}
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle p-6">
        <DataTable columns={columns} data={movimientos} loading={isLoading} searchable searchKeys={["codigo", "tipo", "estado"]} />
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar Movimiento">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Tipo de Movimiento</label>
            <select 
              value={form.tipo} 
              onChange={e => setForm({ ...form, tipo: e.target.value as TipoMovimiento, bodegaOrigenId: undefined, bodegaDestinoId: undefined })}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all cursor-pointer" 
              required
            >
              <option value="INGRESO">INGRESO</option>
              <option value="EGRESO">EGRESO</option>
              <option value="TRANSFERENCIA">TRANSFERENCIA</option>
            </select>
          </div>

          {(form.tipo === 'EGRESO' || form.tipo === 'TRANSFERENCIA') && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Bodega Origen</label>
              <select 
                value={form.bodegaOrigenId ?? ''} 
                onChange={e => setForm({ ...form, bodegaOrigenId: Number(e.target.value) || undefined })}
                className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all cursor-pointer" 
                required
              >
                <option value="">Seleccione bodega origen</option>
                {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
            </div>
          )}

          {(form.tipo === 'INGRESO' || form.tipo === 'TRANSFERENCIA') && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Bodega Destino</label>
              <select 
                value={form.bodegaDestinoId ?? ''} 
                onChange={e => setForm({ ...form, bodegaDestinoId: Number(e.target.value) || undefined })}
                className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all cursor-pointer" 
                required
              >
                <option value="">Seleccione bodega destino</option>
                {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Observaciones</label>
            <textarea 
              value={form.observaciones} 
              onChange={e => setForm({ ...form, observaciones: e.target.value })}
              placeholder="Detalles adicionales o motivo del movimiento..."
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all" 
              rows={2} 
            />
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-text-primary">Materiales</label>
              <button 
                type="button" 
                onClick={addDetalle} 
                className="text-success hover:text-success/80 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={16} /> Agregar material
              </button>
            </div>

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
                    min="1" 
                    placeholder="Cantidad" 
                    value={det.cantidad}
                    onChange={e => updateDetalle(i, 'cantidad', Number(e.target.value))}
                    onKeyDown={e => { if (['.', ',', 'e', '+', '-'].includes(e.key)) e.preventDefault(); }}
                    className="w-full sm:w-28 px-3.5 py-2 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all" 
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

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button 
              type="submit" 
              disabled={crear.isPending || form.detalles.length === 0}
            >
              {crear.isPending ? 'Registrando...' : 'Registrar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
