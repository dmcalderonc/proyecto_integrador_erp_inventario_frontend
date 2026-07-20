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
  PENDIENTE: 'bg-gray-100 text-gray-800',
  COTIZANDO: 'bg-blue-100 text-blue-800',
  APROBADA: 'bg-green-100 text-green-800',
  RECHAZADA: 'bg-red-100 text-red-800',
};

const badgePrioridad: Record<string, string> = {
  ALTA: 'bg-red-100 text-red-800',
  MEDIA: 'bg-yellow-100 text-yellow-800',
  BAJA: 'bg-gray-100 text-gray-800',
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
    { key: 'codigo', header: 'Código' },
    {
      key: 'proyecto', header: 'Proyecto',
      render: (item: SolicitudCompra) => item.proyecto?.nombre ?? '-',
    },
    {
      key: 'usuarioSolicitante', header: 'Solicitante',
      render: (item: SolicitudCompra) => item.usuarioSolicitante?.nombre ?? '-',
    },
    {
      key: 'fechaSolicitud', header: 'Fecha',
      render: (item: SolicitudCompra) => new Date(item.fechaSolicitud).toLocaleDateString(),
    },
    {
      key: 'estado', header: 'Estado',
      render: (item: SolicitudCompra) => (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${badgeEstado[item.estado] ?? ''}`}>
          {item.estado}
        </span>
      ),
    },
    {
      key: 'nivelPrioridad', header: 'Prioridad',
      render: (item: SolicitudCompra) => (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${badgePrioridad[item.nivelPrioridad] ?? ''}`}>
          {item.nivelPrioridad}
        </span>
      ),
    },
    {
      key: 'acciones', header: 'Acciones',
      render: (item: SolicitudCompra) => (
        <div className="flex gap-1 justify-end">
          <Button className="!px-2 !py-1 !text-xs" onClick={() => openEdit(item)}>
            <Pencil size={14} className="inline mr-1" /> Editar
          </Button>
          <Button className="!px-2 !py-1 !text-xs" onClick={() => openDetail(item)}>
            <Eye size={14} className="inline mr-1" /> Ver
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Solicitudes de Compra</h1>
        <Button onClick={openCreate}><Plus size={16} className="inline mr-1" /> Nueva</Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Estado</label>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm">
            <option value="">Todos</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="COTIZANDO">COTIZANDO</option>
            <option value="APROBADA">APROBADA</option>
            <option value="RECHAZADA">RECHAZADA</option>
          </select>
        </div>
        {hasRole(['ADMIN']) && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Proyecto</label>
            <select value={filtroProyecto} onChange={e => setFiltroProyecto(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm">
              <option value="">Todos</option>
              {proyectos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <DataTable columns={columns} data={solicitudes} loading={isLoading} />

      {/* Modal Crear */}
      <Modal open={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Nueva Solicitud de Compra">
        <form onSubmit={handleCreateSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Proyecto</label>
            <select value={createForm.proyectoId}
              onChange={e => setCreateForm({ ...createForm, proyectoId: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required>
              <option value="">Seleccione proyecto</option>
              {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Prioridad</label>
            <select value={createForm.nivelPrioridad}
              onChange={e => setCreateForm({ ...createForm, nivelPrioridad: e.target.value as NivelPrioridad })}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="ALTA">ALTA</option>
              <option value="MEDIA">MEDIA</option>
              <option value="BAJA">BAJA</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">Materiales</label>
              <button type="button" onClick={addDetalle} className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                <Plus size={14} /> Agregar
              </button>
            </div>
            {createForm.detalles.length === 0 && (
              <p className="text-sm text-gray-400">Agrega al menos un material.</p>
            )}
            {createForm.detalles.map((det, i) => (
              <div key={i} className="flex gap-2 mb-2 items-end">
                <select value={det.materialId} onChange={e => updateDetalle(i, 'materialId', Number(e.target.value))}
                  className="flex-1 border rounded-lg px-3 py-2 text-sm" required>
                  <option value={0}>Seleccione material</option>
                  {materiales.map(m => <option key={m.id} value={m.id}>{m.nombre} ({m.sku})</option>)}
                </select>
                <input type="number" min="1" placeholder="Cantidad" value={det.cantidadRequerida}
                  onChange={e => updateDetalle(i, 'cantidadRequerida', Number(e.target.value))}
                  className="w-24 border rounded-lg px-3 py-2 text-sm" required />
                <button type="button" onClick={() => removeDetalle(i)} className="text-red-500 hover:text-red-700 p-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={crear.isPending || createForm.detalles.length === 0}>Crear</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Editar Solicitud — ${selected?.codigo ?? ''}`}>
        <form onSubmit={handleEditSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Estado</label>
            <select value={editForm.estado}
              onChange={e => setEditForm({ ...editForm, estado: e.target.value as EstadoSolicitud })}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="PENDIENTE">PENDIENTE</option>
              <option value="COTIZANDO">COTIZANDO</option>
              <option value="APROBADA">APROBADA</option>
              <option value="RECHAZADA">RECHAZADA</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nivel de Prioridad</label>
            <select value={editForm.nivelPrioridad}
              onChange={e => setEditForm({ ...editForm, nivelPrioridad: e.target.value as NivelPrioridad })}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="ALTA">ALTA</option>
              <option value="MEDIA">MEDIA</option>
              <option value="BAJA">BAJA</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={actualizar.isPending}>Actualizar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Ver Detalle */}
      <Modal open={detailModalOpen} onClose={() => setDetailModalOpen(false)} title={`Detalle — ${selected?.codigo ?? ''}`}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="font-medium text-gray-600">Estado:</span> <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badgeEstado[selected.estado]}`}>{selected.estado}</span></div>
              <div><span className="font-medium text-gray-600">Prioridad:</span> <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badgePrioridad[selected.nivelPrioridad]}`}>{selected.nivelPrioridad}</span></div>
              <div><span className="font-medium text-gray-600">Proyecto:</span> {selected.proyecto?.nombre ?? '-'}</div>
              <div><span className="font-medium text-gray-600">Solicitante:</span> {selected.usuarioSolicitante?.nombre ?? '-'}</div>
              <div><span className="font-medium text-gray-600">Fecha:</span> {new Date(selected.fechaSolicitud).toLocaleString()}</div>
            </div>

            {selected.detalles && selected.detalles.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Materiales</h4>
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-3 py-2">Material</th>
                      <th className="text-right px-3 py-2">Cantidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.detalles.map((d, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{d.material?.nombre ?? `Material #${d.materialId}`}</td>
                        <td className="text-right px-3 py-2">{d.cantidadRequerida}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selected.cotizaciones && selected.cotizaciones.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Cotizaciones</h4>
                <table className="w-full text-sm border">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-3 py-2">Proveedor</th>
                      <th className="text-right px-3 py-2">Precio</th>
                      <th className="text-center px-3 py-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.cotizaciones.map((c, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{c.proveedor?.razon_social ?? `Proveedor #${c.proveedorId}`}</td>
                        <td className="text-right px-3 py-2">${Number(c.precioOfertadoTotal).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="text-center px-3 py-2">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badgeEstado[c.estado] ?? ''}`}>
                            {c.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(!selected.detalles || selected.detalles.length === 0) && (!selected.cotizaciones || selected.cotizaciones.length === 0) && (
              <p className="text-sm text-gray-400">Sin detalles ni cotizaciones asociadas.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
