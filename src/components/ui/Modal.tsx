import { useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);

  return (
    <dialog ref={ref} onClose={onClose} className="rounded-2xl shadow-2xl backdrop:bg-black/60 p-0 w-full max-w-lg m-auto bg-card border border-border max-h-[90vh] overflow-y-auto">
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-card-foreground dark:text-[#303357]" style={{ fontFamily: "var(--font-heading)" }}>{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-card-foreground dark:hover:text-[#303357] transition-colors">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
