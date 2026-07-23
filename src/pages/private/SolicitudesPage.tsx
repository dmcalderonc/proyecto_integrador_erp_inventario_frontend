import { useState } from 'react';
import { useSolicitudes } from '../../store/useSolicitudes';
import { useProyectos } from '../../store/useProyectos';
import { useMateriales } from '../../store/useMateriales';
import { useAuth } from '../../contexts/AuthContext';
import type { SolicitudCompra, UpdateSolicitudDto, EstadoSolicitud, NivelPrioridad } from '../../types';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';

const badgeEstado: Record<string, string> = {
  PENDIENTE: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  COTIZANDO: 'bg-accent/10 text-accent border-accent/30',
  APROBADA: 'bg-primary/10 text-primary border-primary/30',
  RECHAZADA: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const badgePrioridad: Record<string, string> = {
  ALTA: 'bg-red-500/10 text-red-400 border-red-500/30',
  MEDIA: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  BAJA: 'bg-background text-muted-foreground border-border',
};

interface DetalleForm {
  materialId: number;
  cantidadRequerida: number;
}

export default function SolicitudesPage() {
  const { hasRole, user } = useAuth();
  const { proyectos } = useProyectos();
  const { materiales } = useMateriales();

  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroProyecto, setFiltroProyecto] = useState<string>('');

  const { solicitudes, isLoading, crear, actualizar } = useSolicitudes({
    estado: filtroEstado || undefined,
    proyectoId: filtroProyecto || undefined,
  });

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selected, setSelected] = useState<SolicitudCompra | null>(null);
  const [editForm, setEditForm] = useState<UpdateSolicitudDto>({});

  const [createForm, setCreateForm] = useState({
    proyectoId: '',
    usuarioSolicitanteId: user?.id ?? '',
    nivelPrioridad: 'MEDIA' as NivelPrioridad,
    detalles: [] as DetalleForm[],
  });

  const openCreate = () => {
    setCreateForm({
      proyectoId: '',
      usuarioSolicitanteId: user?.id ?? '',
      nivelPrioridad: 'MEDIA',
      detalles: [{ materialId: 0, cantidadRequerida: 1 }],
    });
    setCreateModalOpen(true);
  };

  const openEdit = (item: SolicitudCompra) => {
    setSelected(item);
    setEditForm({ estado: item.estado, nivelPrioridad: item.nivelPrioridad });
    setEditModalOpen(true);
  };

  const openDetail = (item: SolicitudCompra) => {
    setSelected(item);
    setDetailModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const detalles = createForm.detalles
      .filter(d => d.materialId !== 0)
      .map(d => ({ materialId: Number(d.materialId), cantidadRequerida: Number(d.cantidadRequerida) }));
    await crear.mutateAsync({
      proyectoId: createForm.proyectoId,
      usuarioSolicitanteId: createForm.usuarioSolicitanteId,
      nivelPrioridad: createForm.nivelPrioridad,
      detalles,
    });
    setCreateModalOpen(false);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    await actualizar.mutateAsync({ id: selected.id, dto: editForm });
    setEditModalOpen(false);
    setSelected(null);
  };

  const addDetalle = () => {
    setCreateForm({ ...createForm, detalles: [...createForm.detalles, { materialId: 0, cantidadRequerida: 1 }] });
  };

  const removeDetalle = (index: number) => {
    setCreateForm({ ...createForm, detalles: createForm.detalles.filter((_: DetalleForm, i: number) => i !== index) });
  };

  const updateDetalle = (index: number, field: keyof DetalleForm, value: string | number) => {
    const newDetalles = [...createForm.detalles];
    newDetalles[index] = { ...newDetalles[index], [field]: value };
    setCreateForm({ ...createForm, detalles: newDetalles });
  };

  const columns = [
    { 
      key: 'codigo', 
      header: 'Código',
      render: (item: SolicitudCompra) => (
        <span className="font-mono text-xs bg-background text-primary px-2.5 py-1 rounded-lg border border-border font-semibold">
          {item.codigo}
        </span>
      )
    },
    {
      key: 'proyecto', header: 'Proyecto',
      render: (item: SolicitudCompra) => <span className="text-card-foreground font-medium">{item.proyecto?.nombre ?? '-'}</span>,
    },
    {
      key: 'usuarioSolicitante', header: 'Solicitante',
      render: (item: SolicitudCompra) => <span className="text-muted-foreground">{item.usuarioSolicitante?.nombre ?? '-'}</span>,
    },
    {
      key: 'fechaSolicitud', header: 'Fecha',
      render: (item: SolicitudCompra) => <span className="text-muted-foreground">{new Date(item.fechaSolicitud).toLocaleDateString()}</span>,
    },
    {
      key: 'estado', header: 'Estado',
      render: (item: SolicitudCompra) => (
        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold border ${badgeEstado[item.estado] ?? 'bg-background text-muted-foreground border-border'}`}>
          {item.estado}
        </span>
      ),
    },
    {
      key: 'nivelPrioridad', header: 'Prioridad',
      render: (item: SolicitudCompra) => (
        <span className={`inline-block px-3 py-1 rounded-xl text-xs font-semibold border ${badgePrioridad[item.nivelPrioridad] ?? 'bg-background text-muted-foreground border-border'}`}>
          {item.nivelPrioridad}
        </span>
      ),
    },
    {
      key: 'acciones', header: 'Acciones',
      render: (item: SolicitudCompra) => (
        <div className="flex gap-1.5 justify-end">
          <Button 
            className="!px-2.5 !py-1.5 !text-xs bg-secondary hover:bg-black/10 dark:hover:bg-white/10 text-card-foreground border border-border rounded-xl transition-all" 
            onClick={() => openEdit(item)}
          >
            <Pencil size={14} className="inline mr-1 text-amber-400" /> Editar
          </Button>
          <Button 
            className="!px-2.5 !py-1.5 !text-xs bg-secondary hover:bg-black/10 dark:hover:bg-white/10 text-card-foreground border border-border rounded-xl transition-all" 
            onClick={() => openDetail(item)}
          >
            <Eye size={14} className="inline mr-1 text-accent" /> Ver
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-card-foreground mb-4" style={{ fontFamily: "var(--font-heading)" }}>Solicitudes de Compra</h1>
          <p className="text-muted-foreground text-sm">Creación y seguimiento de requerimientos de abastecimiento.</p>
        </div>
        <Button 
          onClick={openCreate}
          className="bg-accent hover:bg-accent/80 text-white font-bold px-5 py-3 rounded-xl border border-border transition-all shadow-lg shadow-accent/20 hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
        >
          <Plus size={18} /> Nueva Solicitud
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-card backdrop-blur-lg rounded-2xl border border-border p-4 shadow-lg flex flex-col sm:flex-row gap-4 items-end">
        <div className="w-full sm:w-48">
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Estado</label>
          <select 
            value={filtroEstado} 
            onChange={e => setFiltroEstado(e.target.value)}
            className="w-full bg-background text-card-foreground border border-border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-accent transition-all cursor-pointer"
          >
            <option value="" className="bg-background">Todos</option>
            <option value="PENDIENTE" className="bg-background">PENDIENTE</option>
            <option value="COTIZANDO" className="bg-background">COTIZANDO</option>
            <option value="APROBADA" className="bg-background">APROBADA</option>
            <option value="RECHAZADA" className="bg-background">RECHAZADA</option>
          </select>
        </div>

        {hasRole(['ADMIN']) && (
          <div className="w-full sm:w-64">
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Proyecto</label>
            <select 
              value={filtroProyecto} 
              onChange={e => setFiltroProyecto(e.target.value)}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-accent transition-all cursor-pointer"
            >
              <option value="" className="bg-background">Todos</option>
              {proyectos.map(p => (
                <option key={p.id} value={p.id} className="bg-background">{p.nombre}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabla de Solicitudes */}
      <div className="bg-card backdrop-blur-lg rounded-3xl border border-border p-6 shadow-2xl overflow-hidden">
        <DataTable columns={columns} data={solicitudes} loading={isLoading} searchable searchKeys={["codigo", "estado"]} />
      </div>

      {/* Modal Crear */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Nueva Solicitud de Compra">
        <form onSubmit={handleCreateSubmit} className="space-y-5 text-muted-foreground p-1">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Proyecto</label>
            <select 
              value={createForm.proyectoId}
              onChange={e => setCreateForm({ ...createForm, proyectoId: e.target.value })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer" 
              required
            >
              <option value="" className="bg-background">Seleccione proyecto</option>
              {proyectos.map(p => <option key={p.id} value={p.id} className="bg-background">{p.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Prioridad</label>
            <select 
              value={createForm.nivelPrioridad}
              onChange={e => setCreateForm({ ...createForm, nivelPrioridad: e.target.value as NivelPrioridad })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-all cursor-pointer font-bold"
            >
              <option value="ALTA" className="bg-background">ALTA</option>
              <option value="MEDIA" className="bg-background">MEDIA</option>
              <option value="BAJA" className="bg-background">BAJA</option>
            </select>
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-semibold text-card-foreground">Materiales</label>
              <button 
                type="button" 
                onClick={addDetalle} 
                className="text-primary hover:text-primary/80 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={16} /> Agregar
              </button>
            </div>

            {createForm.detalles.length === 0 && (
              <div className="p-4 rounded-2xl bg-background border border-border text-center">
                <p className="text-sm text-muted-foreground">Agrega al menos un material a la solicitud.</p>
              </div>
            )}

            <div className="space-y-3">
              {createForm.detalles.map((det, i) => (
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
                    value={det.cantidadRequerida}
                    onChange={e => updateDetalle(i, 'cantidadRequerida', Number(e.target.value))}
                    onKeyDown={e => { if (['.', ',', 'e', '+', '-'].includes(e.key)) e.preventDefault(); }}
                    className="w-full sm:w-28 bg-card text-card-foreground border border-border rounded-xl px-3.5 py-2 text-sm placeholder-muted-foreground/50 focus:outline-none focus:border-accent transition-all font-bold" 
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
              onClick={() => setCreateModalOpen(false)}
              className="bg-secondary hover:bg-black/10 dark:hover:bg-white/10 text-card-foreground border border-border px-5 py-2.5 rounded-xl font-medium transition-all cursor-pointer"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={crear.isPending || createForm.detalles.length === 0}
              className="bg-accent hover:bg-accent/80 text-white font-bold px-6 py-2.5 rounded-xl border border-border transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {crear.isPending ? 'Creando...' : 'Crear Solicitud'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Editar Solicitud — ${selected?.codigo ?? ''}`}>
        <form onSubmit={handleEditSubmit} className="space-y-5 text-muted-foreground p-1">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Estado</label>
            <select 
              value={editForm.estado}
              onChange={e => setEditForm({ ...editForm, estado: e.target.value as EstadoSolicitud })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-all cursor-pointer"
            >
              <option value="PENDIENTE" className="bg-background">PENDIENTE</option>
              <option value="COTIZANDO" className="bg-background">COTIZANDO</option>
              <option value="APROBADA" className="bg-background">APROBADA</option>
              <option value="RECHAZADA" className="bg-background">RECHAZADA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Nivel de Prioridad</label>
            <select 
              value={editForm.nivelPrioridad}
              onChange={e => setEditForm({ ...editForm, nivelPrioridad: e.target.value as NivelPrioridad })}
              className="w-full bg-background text-card-foreground border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-all cursor-pointer"
            >
              <option value="ALTA" className="bg-background">ALTA</option>
              <option value="MEDIA" className="bg-background">MEDIA</option>
              <option value="BAJA" className="bg-background">BAJA</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setEditModalOpen(false)}
              className="bg-secondary hover:bg-black/10 dark:hover:bg-white/10 text-card-foreground border border-border px-5 py-2.5 rounded-xl font-medium transition-all cursor-pointer"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={actualizar.isPending}
              className="bg-accent hover:bg-accent/80 text-white font-bold px-6 py-2.5 rounded-xl border border-border transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {actualizar.isPending ? 'Guardando...' : 'Actualizar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Ver Detalle */}
      <Modal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title={`Detalle — ${selected?.codigo ?? ''}`}>
        {selected && (
          <div className="space-y-6 text-muted-foreground p-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-background p-4 rounded-2xl border border-border text-sm">
              <div><span className="font-semibold text-card-foreground">Estado:</span> <span className={`inline-block ml-2 px-2.5 py-0.5 rounded-xl text-xs font-bold border ${badgeEstado[selected.estado]}`}>{selected.estado}</span></div>
              <div><span className="font-semibold text-card-foreground">Prioridad:</span> <span className={`inline-block ml-2 px-2.5 py-0.5 rounded-xl text-xs font-bold border ${badgePrioridad[selected.nivelPrioridad]}`}>{selected.nivelPrioridad}</span></div>
              <div><span className="font-semibold text-card-foreground">Proyecto:</span> <span className="text-muted-foreground ml-1">{selected.proyecto?.nombre ?? '-'}</span></div>
              <div><span className="font-semibold text-card-foreground">Solicitante:</span> <span className="text-muted-foreground ml-1">{selected.usuarioSolicitante?.nombre ?? '-'}</span></div>
              <div className="sm:col-span-2"><span className="font-semibold text-card-foreground">Fecha:</span> <span className="text-muted-foreground ml-1">{new Date(selected.fechaSolicitud).toLocaleString()}</span></div>
            </div>

            {selected.detalles && selected.detalles.length > 0 && (
              <div>
                <h4 className="font-bold text-card-foreground text-base mb-3">Materiales Requeridos</h4>
                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-background text-card-foreground border-b border-border">
                        <th className="text-left px-4 py-3 font-semibold">Material</th>
                        <th className="text-right px-4 py-3 font-semibold">Cantidad</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {selected.detalles.map((d, i) => (
                        <tr key={i} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-card-foreground font-medium">{d.material?.nombre ?? `Material #${d.materialId}`}</td>
                          <td className="text-right px-4 py-3 font-bold text-primary">{d.cantidadRequerida}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selected.cotizaciones && selected.cotizaciones.length > 0 && (
              <div>
                <h4 className="font-bold text-card-foreground text-base mb-3">Cotizaciones Recibidas</h4>
                <div className="overflow-x-auto rounded-2xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-background text-card-foreground border-b border-border">
                        <th className="text-left px-4 py-3 font-semibold">Proveedor</th>
                        <th className="text-right px-4 py-3 font-semibold">Precio Total</th>
                        <th className="text-center px-4 py-3 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {selected.cotizaciones.map((c, i) => (
                        <tr key={i} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-card-foreground font-medium">{c.proveedor?.razon_social ?? `Proveedor #${c.proveedorId}`}</td>
                          <td className="text-right px-4 py-3 font-bold text-primary">${Number(c.precioOfertadoTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                          <td className="text-center px-4 py-3">
                            <span className={`inline-block px-2.5 py-0.5 rounded-xl text-xs font-semibold border ${badgeEstado[c.estado] ?? 'bg-background text-muted-foreground border-border'}`}>
                              {c.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(!selected.detalles || selected.detalles.length === 0) && (!selected.cotizaciones || selected.cotizaciones.length === 0) && (
              <p className="text-sm text-muted-foreground/60 italic text-center py-2">Sin detalles ni cotizaciones asociadas.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}