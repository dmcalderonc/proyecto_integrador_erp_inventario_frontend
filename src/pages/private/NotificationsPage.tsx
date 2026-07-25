import { useNotifications } from '../../hooks/useNotifications';
import { Button } from '../../components/ui/Button';
import { Bell, CheckCheck, ShoppingCart, Package, AlertTriangle, FileText } from 'lucide-react';
import type { Notification } from '../../types/notification.types';

const tipoIcon: Record<string, React.ReactNode> = {
  REQUERIMIENTO_EN_COMPRAS: <ShoppingCart size={16} className="text-info" />,
  ITEM_RECHAZADO: <AlertTriangle size={16} className="text-danger" />,
  OC_APROBADA: <FileText size={16} className="text-success" />,
  OC_RECIBIDA: <Package size={16} className="text-success" />,
};

export default function NotificationsPage() {
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Notificaciones</h1>
          <p className="text-sm text-text-secondary mt-1">
            {unreadCount > 0 ? `Tienes ${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer` : 'No tienes notificaciones sin leer'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={() => markAllAsRead.mutate()} loading={markAllAsRead.isPending} className="gap-1.5">
            <CheckCheck size={16} /> Marcar todo como leído
          </Button>
        )}
      </div>

      <div className="bg-surface rounded-xl border border-border-subtle">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto" />
            <p className="text-text-muted mt-3 text-sm">Cargando notificaciones...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell size={48} className="text-text-muted/30 mx-auto mb-3" />
            <p className="text-text-muted text-sm">No hay notificaciones</p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {notifications.map((notif: Notification) => (
              <div
                key={notif._id}
                className={`flex items-start gap-4 p-4 transition-colors ${
                  notif.leida ? 'bg-transparent' : 'bg-accent/5 hover:bg-accent/10'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {tipoIcon[notif.tipo] || <Bell size={16} className="text-text-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${notif.leida ? 'text-text-secondary' : 'text-text-primary'}`}>
                      {notif.titulo}
                    </p>
                    {!notif.leida && (
                      <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mt-1 leading-relaxed">{notif.mensaje}</p>
                  <p className="text-xs text-text-muted mt-2">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.leida && (
                  <button
                    onClick={() => markAsRead.mutate(notif._id)}
                    className="shrink-0 text-text-muted hover:text-accent text-xs font-medium transition-colors cursor-pointer"
                  >
                    Marcar leído
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
