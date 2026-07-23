import React from 'react';
import { CheckCircle2, Clock, SplitSquareHorizontal, Package, AlertCircle } from 'lucide-react';
import type { RequirementStatus } from '../../types';

export interface TimelineEvent {
  id: string;
  fecha: string;
  titulo: string;
  descripcion: string;
  tipo: 'CREACION' | 'APROBACION' | 'SPLIT' | 'DESPACHO' | 'RECHAZO';
}

interface RequirementTimelineProps {
  eventos: TimelineEvent[];
  estadoActual: RequirementStatus;
}

const getEventConfig = (tipo: TimelineEvent['tipo']) => {
  switch (tipo) {
    case 'CREACION':
      return { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' };
    case 'APROBACION':
      return { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' };
    case 'SPLIT':
      return { icon: SplitSquareHorizontal, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' };
    case 'DESPACHO':
      return { icon: Package, color: 'text-info', bg: 'bg-info-bg', border: 'border-info/20' };
    case 'RECHAZO':
      return { icon: AlertCircle, color: 'text-danger', bg: 'bg-danger-bg', border: 'border-danger/20' };
    default:
      return { icon: Clock, color: 'text-text-muted', bg: 'bg-elevated', border: 'border-border-subtle' };
  }
};

export const RequirementTimeline: React.FC<RequirementTimelineProps> = ({ eventos }) => {
  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border-subtle before:to-transparent">
      {eventos.map((evento) => {
        const config = getEventConfig(evento.tipo);
        const Icon = config.icon;

        return (
          <div key={evento.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-base ${config.bg} ${config.color} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-lg z-10 transition-transform hover:scale-110`}>
              <Icon size={18} />
            </div>

            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border-subtle bg-surface shadow-xl hover:border-accent/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                <h3 className={`font-bold ${config.color}`}>{evento.titulo}</h3>
                <time className="text-xs font-mono text-text-muted bg-base px-2 py-0.5 rounded-md border border-border-subtle">
                  {new Date(evento.fecha).toLocaleString()}
                </time>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {evento.descripcion}
              </p>
            </div>

          </div>
        );
      })}
    </div>
  );
};
