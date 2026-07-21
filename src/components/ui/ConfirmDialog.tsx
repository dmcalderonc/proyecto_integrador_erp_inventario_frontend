import { Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { AlertTriangle } from 'lucide-react';
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

const variantStyles: Record<ConfirmVariant, { bg: string; icon: string; btn: string }> = {
  danger:  { bg: 'bg-red-100',    icon: 'text-red-600',    btn: 'danger'  },
  success: { bg: 'bg-green-100',  icon: 'text-green-600',  btn: 'success' },
  warning: { bg: 'bg-amber-100',  icon: 'text-amber-600',  btn: 'danger'  },
};

export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading, confirmLabel = 'Eliminar', loadingLabel = 'Eliminando...', variant = 'danger' }: ConfirmDialogProps) {
  const v = variantStyles[variant];
  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`${v.bg} p-2 rounded-full`}>
                  <AlertTriangle className={v.icon} size={24} />
                </div>
                <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
              </div>
              <p className="text-sm text-gray-600 mb-6">{message}</p>
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose} disabled={loading}>
                  Cancelar
                </Button>
                <Button variant={v.btn as any} onClick={onConfirm} disabled={loading}>
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
