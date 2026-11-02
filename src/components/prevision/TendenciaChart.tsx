import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { PrevisionMaterial } from '../../types/prevision.types';
import { ordenarPorUrgencia } from '../../pages/private/PrevisionPage.logic';

const COLORES = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981'];

interface Props {
  materiales: PrevisionMaterial[];
  cantidad?: number;
  alto?: number;
}

/** Serie semanal de consumo de los materiales más urgentes. */
export function TendenciaChart({ materiales, cantidad = 3, alto = 260 }: Props) {
  const series = useMemo(
    () => ordenarPorUrgencia(materiales).slice(0, cantidad),
    [materiales, cantidad],
  );

  const datos = useMemo(() => {
    const semanas = series[0]?.serieSemanal.map(p => p.semana) ?? [];
    return semanas.map((semana, i) => {
      const punto: Record<string, string | number> = { semana };
      series.forEach((m, idx) => {
        punto[`m${idx}`] = m.serieSemanal[i]?.consumo ?? 0;
      });
      return punto;
    });
  }, [series]);

  if (series.length === 0 || datos.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-text-muted">
        Sin datos suficientes para mostrar la tendencia.
      </div>
    );
  }

  return (
    <div style={{ height: alto }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="semana"
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(valor, clave) => {
              const idx = Number(String(clave).replace('m', ''));
              const material = series[idx];
              return [`${valor} ${material?.unidad ?? ''}`.trim(), material?.nombre ?? String(clave)];
            }}
            labelFormatter={label => `Semana del ${label}`}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {series.map((m, idx) => (
            <Line
              key={m.materialId}
              type="monotone"
              dataKey={`m${idx}`}
              name={m.nombre}
              stroke={COLORES[idx % COLORES.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
