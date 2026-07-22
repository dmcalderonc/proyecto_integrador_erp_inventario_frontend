import { Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { AlertTriangle, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './Button';

type ConfirmVariant = 'danger' | 'success' | 'warning';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
  confirmLabel?: string;
  loadingLabel?: string;
  variant?: ConfirmVariant;
}

const variantConfig: Record<ConfirmVariant, { icon: React.ElementType; iconBg: string; iconColor: string; btnVariant: 'danger' | 'primary' }> = {
  danger:  { icon: Trash2, iconBg: 'bg-danger-bg', iconColor: 'text-danger', btnVariant: 'danger' },
  success: { icon: CheckCircle, iconBg: 'bg-success-bg', iconColor: 'text-success', btnVariant: 'primary' },
  warning: { icon: AlertCircle, iconBg: 'bg-warning-bg', iconColor: 'text-warning', btnVariant: 'danger' },
};

export function ConfirmDialog({
  open, onClose, onConfirm, title, message, loading,
  confirmLabel = 'Eliminar', loadingLabel = 'Procesando...', variant = 'danger',
}: ConfirmDialogProps) {
  const v = variantConfig[variant];
  const Icon = v.icon;

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-100" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <DialogPanel className="bg-overlay border border-border-subtle rounded-2xl shadow-2xl max-w-sm w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`${v.iconBg} p-2.5 rounded-xl`}>
                  <Icon className={v.iconColor} size={22} />
                </div>
                <DialogTitle className="text-lg font-bold text-text-primary">{title}</DialogTitle>
              </div>
              <p className="text-sm text-text-secondary mb-6 pl-[52px]">{message}</p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose} disabled={loading}>Cancelar</Button>
                <Button variant={v.btnVariant} onClick={onConfirm} loading={loading}>
                  {loading ? loadingLabel : confirmLabel}
                </Button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
