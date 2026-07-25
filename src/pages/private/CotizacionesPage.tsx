import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useProveedores } from '../../store/useProveedores';
import { cotizacionesApi } from '../../api/cotizaciones.api';
import type { Cotizacion, CreateCotizacionDto } from '../../types/cotizacion.types';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { SmartCombobox } from '../../components/ui/SmartCombobox';
import type { ComboboxOption } from '../../components/ui/SmartCombobox';
import {
  ShoppingCart, Eye, XCircle, Plus, Trash2, Check, ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

const cotizacionEstadoStyle: Record<string, string> = {
  EN_EVALUACION: 'bg-warning/10 text-warning border-warning/20',
  ELEGIDA: 'bg-success/10 text-success border-success/20',
  DESCARTADA: 'bg-danger/10 text-danger border-danger/20',
};

const estadosFiltro: { value: string; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'EN_EVALUACION', label: 'En Evaluación' },
  { value: 'ELEGIDA', label: 'Elegida' },
  { value: 'DESCARTADA', label: 'Descartada' },
];

export default function CotizacionesPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const { proveedores } = useProveedores();
  const [selectedReqId, setSelectedReqId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDetalleId, setSelectedDetalleId] = useState<number | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<ComboboxOption | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [precioUnitario, setPrecioUnitario] = useState('');
  const [tiempoEntrega, setTiempoEntrega] = useState('');
  const [marca, setMarca] = useState('');
  const [observaciones, setObservaciones] = useState('');

  const proveedorOptions: ComboboxOption[] = proveedores.map((p: any) => ({ id: p.id, nombre: p.razon_social }));

  const { data: requerimientosEnCompras = [], isLoading } = useQuery({
    queryKey: ['cotizaciones-en-compras'],
    queryFn: async () => {
      const { data } = await cotizacionesApi.getRequerimientosEnCompras();
      return data || [];
    },
  });

  const { data: reqDetail, isLoading: loadingDetail } = useQuery({
    queryKey: ['cotizaciones-by-req', selectedReqId],
    queryFn: async () => {
      if (!selectedReqId) return null;
      const { data } = await cotizacionesApi.getCotizacionesByRequirement(selectedReqId);
      return data;
    },
    enabled: !!selectedReqId,
  });

  const crearCotizacion = useMutation({
    mutationFn: (dto: CreateCotizacionDto) => cotizacionesApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones-by-req'] });
      queryClient.invalidateQueries({ queryKey: ['cotizaciones-en-compras'] });
      toast.success('Cotización creada');
      setModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al crear cotización');
    },
  });

  const seleccionar = useMutation({
    mutationFn: (id: number) => cotizacionesApi.seleccionar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones-by-req'] });
      toast.success('Cotización seleccionada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al seleccionar');
    },
  });

  const descartar = useMutation({
    mutationFn: (id: number) => cotizacionesApi.descartar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones-by-req'] });
      toast.success('Cotización descartada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al descartar');
    },
  });

  const eliminar = useMutation({
    mutationFn: (id: number) => cotizacionesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones-by-req'] });
      toast.success('Cotización eliminada');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    },
  });

  const generarOC = useMutation({
    mutationFn: (requirementId: number) => cotizacionesApi.generarOC(requirementId),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones-by-req'] });
      queryClient.invalidateQueries({ queryKey: ['cotizaciones-en-compras'] });
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      const oc = res?.data || res;
      const total = oc?.total ? `$${Number(oc.total).toFixed(2)}` : '';
      toast.success(`OC generada${total ? ` (${total})` : ''}. Pendiente de aprobación por el administrador.`);
      setSelectedReqId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al generar OC');
    },
  });

  const resetForm = () => {
    setSelectedDetalleId(null);
    setProveedorSeleccionado(null);
    setCantidad('');
    setPrecioUnitario('');
    setTiempoEntrega('');
    setMarca('');
    setObservaciones('');
  };

  const openCotizar = (detalleId: number, cantidadSugerida: number) => {
    setSelectedDetalleId(detalleId);
    setProveedorSeleccionado(null);
    setCantidad(String(cantidadSugerida));
    setPrecioUnitario('');
    setTiempoEntrega('');
    setMarca('');
    setObservaciones('');
    setModalOpen(true);
  };

  const handleSubmitCotizacion = () => {
    if (!proveedorSeleccionado) { toast.error('Selecciona un proveedor'); return; }
    if (!selectedDetalleId) { toast.error('No hay detalle seleccionado'); return; }
    if (!cantidad || Number(cantidad) <= 0) { toast.error('Ingresa una cantidad válida'); return; }
    if (!precioUnitario || Number(precioUnitario) <= 0) { toast.error('Ingresa un precio válido'); return; }

    crearCotizacion.mutate({
      requerimientoDetalleId: selectedDetalleId,
      proveedorId: Number(proveedorSeleccionado.id),
      cantidad: Number(cantidad),
      precioUnitario: Number(precioUnitario),
      tiempoEntregaDias: tiempoEntrega ? Number(tiempoEntrega) : undefined,
      marca: marca.trim() || undefined,
      observaciones: observaciones.trim() || undefined,
    });
  };

  const reqSeleccionado = reqDetail?.detalles?.[0];

return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Cotizaciones</h1>
          <p className="text-sm text-text-secondary mt-1">
            {selectedReqId
              ? `Cotizar materiales del REQ-${String(selectedReqId).padStart(3, '0')}`
              : 'Requerimientos con materiales pendientes de compra'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedReqId && (
            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              className="px-3 py-2 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
            >
              {estadosFiltro.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          )}
          {selectedReqId && (
            <Button variant="secondary" onClick={() => setSelectedReqId(null)} className="gap-1.5">
              <ArrowLeft size={16} /> Volver
            </Button>
          )}
        </div>
      </div>

      {!selectedReqId ? (
        <div className="bg-surface rounded-xl border border-border-subtle p-6">
          {isLoading ? (
            <p className="text-text-muted text-sm">Cargando...</p>
          ) : requerimientosEnCompras.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart size={40} className="mx-auto text-text-muted mb-3" />
              <p className="text-text-secondary font-medium">No hay requerimientos con materiales pendientes de compra</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requerimientosEnCompras.map((group: any) => (
                <div
                  key={group.requirement?.id}
                  className="bg-base rounded-xl border border-border-subtle p-4 hover:border-accent/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedReqId(group.requirement?.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-accent font-semibold bg-accent/10 px-2.5 py-1 rounded-lg border border-accent/20">
                        REQ-{String(group.requirement?.id).padStart(3, '0')}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{group.requirement?.proyecto?.nombre ?? '-'}</p>
                        <p className="text-xs text-text-muted">{group.requirement?.bodega?.nombre ?? '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted">{group.detalles.length} materiales</span>
                      <Eye size={16} className="text-accent" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reqSeleccionado && (
            <div className="bg-surface rounded-xl border border-border-subtle p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-base rounded-xl border border-border-subtle p-3">
                  <p className="text-xs text-text-muted mb-1">Proyecto</p>
                  <p className="text-sm font-semibold text-text-primary">{reqSeleccionado.proyecto?.nombre ?? '-'}</p>
                </div>
                <div className="bg-base rounded-xl border border-border-subtle p-3">
                  <p className="text-xs text-text-muted mb-1">Solicitante</p>
                  <p className="text-sm font-semibold text-text-primary">{reqSeleccionado.usuarioSolicitante?.nombre ?? '-'}</p>
                </div>
                <div className="bg-base rounded-xl border border-border-subtle p-3">
                  <p className="text-xs text-text-muted mb-1">Bodega Destino</p>
                  <p className="text-sm font-semibold text-text-primary">{reqSeleccionado.bodega?.nombre ?? '-'}</p>
                </div>
                <div className="bg-base rounded-xl border border-border-subtle p-3 flex flex-col justify-center">
                  <p className="text-xs text-text-muted mb-1">Estado</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border bg-info/10 text-info border-info/20">
                    {reqSeleccionado.estado?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-surface rounded-xl border border-border-subtle p-6">
            {loadingDetail ? (
              <p className="text-text-muted text-sm">Cargando detalles...</p>
            ) : reqDetail?.detalles?.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">No hay detalles de requerimiento</p>
            ) : (
              <div className="space-y-4">
{reqDetail?.detalles?.map((det: any) => {
                    const cotizacionesDelDetalle = reqDetail.cotizaciones?.filter(
                      (c: Cotizacion) => c.requerimientoDetalleId === det.id,
                    ) || [];
                    const cotizacionesFiltradas = filtroEstado
                      ? cotizacionesDelDetalle.filter((c: Cotizacion) => c.estado === filtroEstado)
                      : cotizacionesDelDetalle;

                    const totalCotizado = cotizacionesDelDetalle
                      .filter((c: Cotizacion) => c.estado !== 'DESCARTADA')
                      .reduce((sum: number, c: Cotizacion) => sum + Number(c.cantidad), 0);
                    const cantidadRestante = Number(det.cantidadSolicitada) - totalCotizado;

                    // Check if there's already an active cotización for this detalle
                    const tieneCotizacionActiva = cotizacionesDelDetalle.some(
                      (c: Cotizacion) => c.estado === 'EN_EVALUACION' || c.estado === 'ELEGIDA',
                    );

                    return (
                      <div key={det.id} className="bg-base rounded-xl border border-border-subtle p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-sm font-semibold text-text-primary">{det.material?.nombre ?? `Material #${det.materialId}`}</p>
                              <p className="text-xs text-text-muted font-mono">{det.material?.sku ?? '-'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs text-text-muted">Solicitado: <span className="font-semibold text-text-primary">{det.cantidadSolicitada}</span></p>
                              <p className="text-xs text-text-muted">Cotizado: <span className="font-semibold text-info">{totalCotizado}</span></p>
                              {cantidadRestante > 0 && (
                                <p className="text-xs text-warning font-medium">Pendiente: {cantidadRestante}</p>
                              )}
                            </div>
                            {hasRole(['COMPRADOR', 'ADMIN']) && cantidadRestante > 0 && !tieneCotizacionActiva && (
                              <Button size="sm" onClick={() => openCotizar(det.id, cantidadRestante)} className="gap-1">
                                <Plus size={14} /> Cotizar
                              </Button>
                            )}
                            {tieneCotizacionActiva && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-semibold border bg-info/10 text-info border-info/20">
                                Ya cotizado
                              </span>
                            )}
                          </div>
                        </div>

                      {cotizacionesFiltradas.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border-subtle">
                                <th className="text-left py-2 px-3 text-text-muted font-medium text-xs">Proveedor</th>
                                <th className="text-center py-2 px-3 text-text-muted font-medium text-xs">Cantidad</th>
                                <th className="text-right py-2 px-3 text-text-muted font-medium text-xs">P. Unitario</th>
                                <th className="text-right py-2 px-3 text-text-muted font-medium text-xs">Subtotal</th>
                                <th className="text-center py-2 px-3 text-text-muted font-medium text-xs">Estado</th>
                                <th className="text-right py-2 px-3 text-text-muted font-medium text-xs">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cotizacionesFiltradas.map((cot: Cotizacion) => (
                                <tr key={cot.id} className="border-b border-border-subtle/50 hover:bg-elevated/30">
                                  <td className="py-2 px-3 font-medium text-text-primary">{cot.proveedor?.razon_social ?? '-'}</td>
                                  <td className="py-2 px-3 text-center text-text-primary">{cot.cantidad}</td>
                                  <td className="py-2 px-3 text-right text-text-secondary">${Number(cot.precioUnitario).toFixed(2)}</td>
                                  <td className="py-2 px-3 text-right font-semibold text-text-primary">
                                    ${(Number(cot.cantidad) * Number(cot.precioUnitario)).toFixed(2)}
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-semibold border ${cotizacionEstadoStyle[cot.estado] || ''}`}>
                                      {cot.estado?.replace(/_/g, ' ')}
                                    </span>
                                  </td>
                                  <td className="py-2 px-3 text-right">
                                    <div className="flex gap-1 justify-end">
                                      {hasRole(['ADMIN', 'COMPRADOR']) && cot.estado === 'EN_EVALUACION' && (
                                        <>
                                          <button
                                            onClick={() => seleccionar.mutate(cot.id)}
                                            className="text-success hover:text-success/80 p-1 transition-colors"
                                            title="Seleccionar"
                                          >
                                            <Check size={14} />
                                          </button>
                                          <button
                                            onClick={() => descartar.mutate(cot.id)}
                                            className="text-danger hover:text-danger/80 p-1 transition-colors"
                                            title="Descartar"
                                          >
                                            <XCircle size={14} />
                                          </button>
                                        </>
                                      )}
                                      {hasRole(['ADMIN', 'COMPRADOR']) && cot.estado === 'EN_EVALUACION' && (
                                        <button
                                          onClick={() => eliminar.mutate(cot.id)}
                                          className="text-text-muted hover:text-danger p-1 transition-colors"
                                          title="Eliminar"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {selectedReqId && (() => {
            const totalElegidas = reqDetail?.cotizaciones?.filter((c: Cotizacion) => c.estado === 'ELEGIDA').length || 0;
            return totalElegidas > 0 && (
              <div className="flex justify-end">
                <Button
                  onClick={() => generarOC.mutate(selectedReqId)}
                  loading={generarOC.isPending}
                  className="gap-2"
                >
                  <ShoppingCart size={16} /> Generar OC ({totalElegidas} cotizaciones elegidas)
                </Button>
              </div>
            );
          })()}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva Cotización"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Proveedor *</label>
            <SmartCombobox
              options={proveedorOptions}
              value={proveedorSeleccionado}
              onChange={setProveedorSeleccionado}
              placeholder="Seleccionar proveedor..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Cantidad *</label>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Precio Unitario *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={precioUnitario}
                onChange={(e) => setPrecioUnitario(e.target.value)}
                className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Tiempo Entrega (días)</label>
              <input
                type="number"
                min="0"
                value={tiempoEntrega}
                onChange={(e) => setTiempoEntrega(e.target.value)}
                className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-accent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Marca</label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Marca del material"
                className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Observaciones</label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              rows={2}
              placeholder="Notas adicionales..."
              className="w-full px-4 py-2.5 bg-base text-text-primary border border-border-subtle rounded-xl text-sm placeholder-text-muted focus:outline-none focus:border-accent transition-all resize-none"
            />
          </div>

          {cantidad && precioUnitario && (
            <div className="bg-base rounded-xl border border-border-subtle p-3 text-sm">
              <p className="text-text-secondary">Subtotal: <span className="font-semibold text-text-primary">${(Number(cantidad) * Number(precioUnitario)).toFixed(2)}</span></p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border-subtle">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmitCotizacion} loading={crearCotizacion.isPending}>
              Crear Cotización
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
