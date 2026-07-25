import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTraspasos } from '../../store/useTraspasos';
import { useBodegas } from '../../store/useBodegas';
import { useAuth } from '../../contexts/AuthContext';
import { materialesApi } from '../../api/materiales.api';
import { inventarioApi } from '../../api/inventario.api';
import { traspasosApi } from '../../api/traspasos.api';
import type { Traspaso, Bodega, Material, CreateTraspasoDto, Inventario } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { SmartCombobox } from '../../components/ui/SmartCombobox';
import type { ComboboxOption } from '../../components/ui/SmartCombobox';
import { getBadgeStyle } from '../../lib/design-tokens';
import { Plus, Trash2, Eye, Send, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

type DetalleForm = { materialId: number; cantidad: string };
const emptyDetalle = (): DetalleForm => ({ materialId: 0, cantidad: '' });

export default function TraspasosPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Traspaso | null>(null);
  const [detalles, setDetalles] = useState<DetalleForm[]>([emptyDetalle()]);
  const [origenSeleccionada, setOrigenSeleccionada] = useState<ComboboxOption | null>(null);
  const [destinoSeleccionada, setDestinoSeleccionada] = useState<ComboboxOption | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [traspasoACancelar, setTraspasoACancelar] = useState<Traspaso | null>(null);
  const queryClient = useQueryClient();
  const { user, hasRole } = useAuth();
  const { enviar, recibir, cancelar, autorizar } = useTraspasos();
  const { bodegas } = useBodegas();

  const { data: traspasos = [], isLoading } = useQuery({
    queryKey: ['traspasos', filtroEstado],
    queryFn: async () => {
      const params: { estado?: string } = {};
      if (filtroEstado) params.estado = filtroEstado;
      const { data } = await traspasosApi.getAll(params);
      return data || [];
    },
  });

  const { data: materiales = [] } = useQuery({
    queryKey: ['materialesAll'],
    queryFn: async () => {
      const res = await materialesApi.getAll({ limit: 200 });
      return res.data || [];
    },
  });

  const { data: stockOrigen = [] } = useQuery({
    queryKey: ['stockOrigen', origenSeleccionada?.id],
    queryFn: async () => {
      if (!origenSeleccionada) return [];
      const res = await inventarioApi.getAll();
      return (res.data || []).filter((s: Inventario) => s.bodega_id === Number(origenSeleccionada.id) && s.cantidad_disponible > 0);
    },
    enabled: !!origenSeleccionada,
  });

  const crear = useMutation({
    mutationFn: (dto: CreateTraspasoDto) => traspasosApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['traspasos'] });
      toast.success('Traspaso creado correctamente');
      setModalOpen(false);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Error al crear traspaso');
    },
  });

  const openDetail = async (traspaso: Traspaso) => {
    const { data } = await traspasosApi.getById(traspaso.id);
    setSelected(data);
    setDetailOpen(true);
  };

  const openCreate = () => {
    setDetalles([emptyDetalle()]);
    setOrigenSeleccionada(null);
    setDestinoSeleccionada(null);
    setObservaciones('');
    setModalOpen(true);
  };

  const addDetalle = () => setDetalles([...detalles, emptyDetalle()]);
  const removeDetalle = (index: number) => setDetalles(detalles.filter((_, i) => i !== index));
  const updateDetalle = (index: number, field: keyof DetalleForm, value: string | number) => {
    const updated = [...detalles];
    updated[index] = { ...updated[index], [field]: value };
    setDetalles(updated);
  };

  const handleSubmit = () => {
    if (!origenSeleccionada || !destinoSeleccionada) { toast.error('Selecciona ambas bodegas'); return; }
    if (origenSeleccionada.id === destinoSeleccionada.id) { toast.error('Las bodegas deben ser diferentes'); return; }
    const valid = detalles.filter(d => d.materialId > 0 && Number(d.cantidad) > 0);
    if (valid.length === 0) { toast.error('Agrega al menos un material'); return; }

    crear.mutate({
      bodegaOrigenId: Number(origenSeleccionada.id),
      bodegaDestinoId: Number(destinoSeleccionada.id),
      observaciones,
      detalles: valid.map(d => ({ materialId: d.materialId, cantidad: Number(d.cantidad) })),
    });
  };

  const bodegaOptions: ComboboxOption[] = bodegas.map((b: Bodega) => ({ id: b.id, nombre: b.nombre }));
  const materialOptions: ComboboxOption[] = materiales.map((m: Material) => ({ id: m.id, nombre: `${m.sku} - ${m.nombre}` }));

  const userBodegaIds = (user as any)?.bodegaIds || [];
  const isBodeguero = hasRole(['BODEGUERO']);

  const porEntregar = isBodeguero
    ? traspasos.filter((t: Traspaso) =>
        (t.estado === 'PENDIENTE' || t.estado === 'EN_TRANSITO') && userBodegaIds.includes(t.bodegaOrigenId)
      )
    : [];

  const porRecibir = isBodeguero
    ? traspasos.filter((t: Traspaso) =>
        t.estado === 'EN_TRANSITO' && userBodegaIds.includes(t.bodegaDestinoId)
      )
    : [];

  const columns = [
    { key: 'codigo', header: 'Código', render: (t: Traspaso) => <span className="font-mono text-sm text-accent">{t.codigo}</span> },
    { key: 'origen', header: 'Origen', render: (t: Traspaso) => <span className="text-text-primary">{t.bodegaOrigen?.nombre ?? '-'}</span> },
    { key: 'destino', header: 'Destino', render: (t: Traspaso) => <span className="text-text-primary">{t.bodegaDestino?.nombre ?? '-'}</span> },
    { key: 'estado', header: 'Estado', render: (t: Traspaso) => <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getBadgeStyle(t.estado)}`}>{t.estado?.replace(/_/g, ' ')}</span> },
    { key: 'fecha', header: 'Fecha Creación', render: (t: Traspaso) => <span className="text-text-muted text-sm">{new Date(t.fechaCreacion).toLocaleDateString()}</span> },
    { key: 'acciones', header: 'Acciones', render: (t: Traspaso) => (
      <button onClick={() => openDetail(t)} className="text-accent hover:text-accent/80 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer">
        <Eye size={14} /> Ver
      </button>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Traspasos</h1>
          <p className="text-sm text-text-secondary mt-1">Gestiona los traslados entre bodegas</p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_TRANSITO">En Tránsito</option>
            <option value="RECIBIDO">Recibido</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
          <Button onClick={openCreate} className="gap-1.5">
            <Plus size={16} /> Nuevo Traspaso
          </Button>
        </div>
      </div>

      {isBodeguero && (
        <div className="space-y-6">
          {porEntregar.length > 0 && (
            <div className="bg-surface rounded-xl border border-border-subtle p-6">
              <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning" />
                Por Entregar ({porEntregar.length})
              </h3>
              <p className="text-xs text-text-muted mb-4">Traslados salientes que debes preparar y enviar.</p>
              <DataTable columns={columns} data={porEntregar} loading={isLoading} searchable searchKeys={['codigo']} searchPlaceholder="Buscar por código..." />
            </div>
          )}

          {porRecibir.length > 0 && (
            <div className="bg-surface rounded-xl border border-border-subtle p-6">
              <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-info" />
                Por Recibir ({porRecibir.length})
              </h3>
              <p className="text-xs text-text-muted mb-4">Traslados entrantes en tránsito hacia tu bodega.</p>
              <DataTable columns={columns} data={porRecibir} loading={isLoading} searchable searchKeys={['codigo']} searchPlaceholder="Buscar por código..." />
            </div>
          )}

          {porEntregar.length === 0 && porRecibir.length === 0 && (
            <div className="bg-surface rounded-xl border border-border-subtle p-6">
              <p className="text-sm text-text-muted text-center">No hay traspasos para tus bodegas.</p>
            </div>
          )}
        </div>
      )}

      {!isBodeguero && (
        <div className="bg-surface rounded-xl border border-border-subtle p-6">
          <DataTable columns={columns} data={traspasos} loading={isLoading} searchable searchKeys={['codigo']} searchPlaceholder="Buscar por código..." />
        </div>
      )}

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title={`Detalle — ${selected?.codigo || ''}`} size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-base rounded-xl border border-border-subtle p-3">
                <p className="text-xs text-text-muted">Estado</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getBadgeStyle(selected.estado)}`}>{selected.estado?.replace(/_/g, ' ')}</span>
              </div>
              <div className="bg-base rounded-xl border border-border-subtle p-3">
                <p className="text-xs text-text-muted">Bodega Origen</p>
                <p className="text-sm font-semibold text-text-primary">{selected.bodegaOrigen?.nombre ?? '-'}</p>
              </div>
              <div className="bg-base rounded-xl border border-border-subtle p-3">
                <p className="text-xs text-text-muted">Bodega Destino</p>
                <p className="text-sm font-semibold text-text-primary">{selected.bodegaDestino?.nombre ?? '-'}</p>
              </div>
              <div className="bg-base rounded-xl border border-border-subtle p-3">
                <p className="text-xs text-text-muted">Fecha Envío</p>
                <p className="text-sm font-semibold text-text-primary">{selected.fechaEnvio ? new Date(selected.fechaEnvio).toLocaleString() : 'Pendiente'}</p>
              </div>
              {selected.autorizadoPor && (
                <div className="bg-base rounded-xl border border-border-subtle p-3">
                  <p className="text-xs text-text-muted">Autorizado por</p>
                  <p className="text-sm font-semibold text-text-primary">{selected.autorizadoPor.nombre ?? '-'}</p>
                  {selected.fechaAutorizacion && <p className="text-xs text-text-muted">{new Date(selected.fechaAutorizacion).toLocaleString()}</p>}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-subtle">
                    <th className="text-left py-3 px-3 text-text-muted font-medium">Material</th>
                    <th className="text-left py-3 px-3 text-text-muted font-medium">SKU</th>
                    <th className="text-center py-3 px-3 text-text-muted font-medium">Cantidad</th>
                    <th className="text-center py-3 px-3 text-text-muted font-medium">Recibida</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.detalles?.map((det) => (
                    <tr key={det.id} className="border-b border-border-subtle/50 hover:bg-elevated/50">
                      <td className="py-3 px-3 text-text-primary font-medium">{det.material?.nombre ?? `Material #${det.materialId}`}</td>
                      <td className="py-3 px-3 text-text-muted font-mono text-xs">{det.material?.sku ?? '-'}</td>
                      <td className="py-3 px-3 text-text-primary text-center font-semibold">{det.cantidad}</td>
                      <td className="py-3 px-3 text-text-primary text-center">{det.cantidadRecibida || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selected.observaciones && (
              <div className="bg-base rounded-xl border border-border-subtle p-3">
                <p className="text-xs text-text-muted mb-1">Observaciones</p>
                <p className="text-sm text-text-primary">{selected.observaciones}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
              {selected.estado === 'PENDIENTE' && user?.rol === 'ADMIN' && !selected.autorizadoPorId && (
                <Button onClick={() => { autorizar.mutate(selected.id); setDetailOpen(false); }} loading={autorizar.isPending} className="gap-1.5">
                  <ShieldCheck size={16} /> Autorizar Traspaso
                </Button>
              )}
              {selected.estado === 'PENDIENTE' && selected.autorizadoPorId && (user?.rol === 'ADMIN' || (user?.rol === 'BODEGUERO' && (user as any).bodegaIds?.includes(selected.bodegaOrigenId))) && (
                <Button onClick={() => { enviar.mutate(selected.id); setDetailOpen(false); }} loading={enviar.isPending} className="gap-1.5">
                  <Send size={16} /> Confirmar Envío
                </Button>
              )}
              {selected.estado === 'PENDIENTE' && !selected.autorizadoPorId && user?.rol === 'BODEGUERO' && (
                <span className="text-xs text-text-muted italic">Pendiente de autorización admin</span>
              )}
              {selected.estado === 'EN_TRANSITO' && (user?.rol === 'ADMIN' || (user?.rol === 'BODEGUERO' && (user as any).bodegaIds?.includes(selected.bodegaDestinoId))) && (
                <Button onClick={() => { recibir.mutate(selected.id); setDetailOpen(false); }} loading={recibir.isPending} className="gap-1.5">
                  <CheckCircle size={16} /> Confirmar Recepción
                </Button>
              )}
              {selected.estado === 'PENDIENTE' && user?.rol === 'ADMIN' && (
                <Button variant="danger" onClick={() => { setTraspasoACancelar(selected); setCancelConfirmOpen(true); }} loading={cancelar.isPending} className="gap-1.5">
                  <XCircle size={16} /> Cancelar
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Traspaso" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Bodega Origen *</label>
              <SmartCombobox options={bodegaOptions} value={origenSeleccionada} onChange={setOrigenSeleccionada} placeholder="Seleccionar origen..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Bodega Destino *</label>
              <SmartCombobox options={bodegaOptions} value={destinoSeleccionada} onChange={setDestinoSeleccionada} placeholder="Seleccionar destino..." />
            </div>
          </div>

          {origenSeleccionada && stockOrigen.length > 0 && (
            <div className="bg-base rounded-xl border border-border-subtle p-3">
              <p className="text-xs text-text-muted font-medium uppercase tracking-wide mb-2">Stock disponible en {origenSeleccionada.nombre}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto">
                {stockOrigen.map((s: Inventario) => {
                  const mat = materiales.find((m: Material) => m.id === s.material_id);
                  const libre = s.cantidad_disponible - s.cantidad_reservada;
                  return (
                    <div key={s.id} className="flex items-center justify-between text-xs py-1 px-2 bg-elevated/50 rounded-lg">
                      <span className="text-text-primary truncate">{mat?.sku ?? `#${s.material_id}`} — {mat?.nombre ?? 'Material'}</span>
                      <span className={`font-semibold ml-2 ${libre > 0 ? 'text-success' : 'text-danger'}`}>{libre} disp.</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-text-primary">Materiales</label>
              <button onClick={addDetalle} className="text-accent hover:text-accent/80 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer">
                <Plus size={14} /> Agregar
              </button>
            </div>
            <div className="space-y-2">
              {detalles.map((det, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <div className="flex-1">
                    <SmartCombobox
                      options={materialOptions}
                      value={det.materialId > 0 ? materialOptions.find(m => m.id === det.materialId) || null : null}
                      onChange={(opt) => { if (!opt) return; updateDetalle(i, 'materialId', Number(opt.id)); }}
                      placeholder="Buscar material..."
                    />
                  </div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Cant."
                    value={det.cantidad}
                    onChange={(e) => updateDetalle(i, 'cantidad', e.target.value)}
                    className="w-24 px-3 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm text-center focus:outline-none focus:border-accent transition-all"
                  />
                  {detalles.length > 1 && (
                    <button onClick={() => removeDetalle(i)} className="text-danger hover:text-danger/80 transition-colors p-1 cursor-pointer">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Notas sobre el traspaso..."
              rows={2}
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent transition-all"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} loading={crear.isPending}>Crear Traspaso</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={cancelConfirmOpen}
        onClose={() => setCancelConfirmOpen(false)}
        onConfirm={() => {
          if (traspasoACancelar) {
            cancelar.mutate(traspasoACancelar.id);
            setCancelConfirmOpen(false);
            setDetailOpen(false);
            setTraspasoACancelar(null);
          }
        }}
        title="Cancelar Traspaso"
        message={`¿Estás seguro de cancelar el traspaso ${traspasoACancelar?.codigo}? Esta acción no se puede deshacer.`}
        loading={cancelar.isPending}
        confirmLabel="Cancelar Traspaso"
        loadingLabel="Cancelando..."
        variant="danger"
      />
    </div>
  );
}
