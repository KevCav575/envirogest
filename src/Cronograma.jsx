import React from 'react';
import { Ic, ESTADOS } from './constants';
import { fmtDate } from './utils';

export function Cronograma({ projectData, onSelect }) {
    const { tramites = [] } = projectData;

    // Extraer todas las fechas válidas para calcular el rango del gráfico
    const allD = [...tramites.flatMap(t => [t.cronograma?.inicio, t.cronograma?.fin, t.fecha_limite].filter(Boolean))];
    const hasAny = allD.length > 0;

    const minD = hasAny ? new Date(Math.min(...allD.map(d => new Date(d)))) : new Date();
    const maxD = hasAny ? new Date(Math.max(...allD.map(d => new Date(d)))) : new Date(Date.now() + 60 * 864e5);

    // Dar un margen de 1 semana antes y 2 semanas después
    const start = new Date(minD);
    start.setDate(start.getDate() - 7);
    const end = new Date(maxD);
    end.setDate(end.getDate() + 14);

    // Utilidades matemáticas para posicionamiento
    const pct = d => Math.max(0, Math.min(100, ((new Date(d) - start) / (end - start)) * 100));
    const wid = (s, e2) => Math.max(2, pct(e2) - pct(s)); // Mínimo 2% de ancho para ser visible

    // Generar etiquetas de meses
    const months = [];
    const tmp = new Date(start);
    while (tmp <= end) {
        const l = tmp.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });
        const p = pct(tmp.toISOString().slice(0, 10));
        if (!months.length || months[months.length - 1].label !== l) {
            months.push({ label: l, pct: p });
        }
        tmp.setDate(tmp.getDate() + 7);
    }

    if (!tramites.length) {
        return (
            <div className="p-10 flex flex-col items-center justify-center min-h-[400px] border-4 border-dashed border-gray-300 bg-gray-50 m-8">
                <Ic n="calendar" s={56} c="#9CA3AF" />
                <p className="text-2xl font-black text-black uppercase tracking-widest mt-6">Sin trámites</p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans bg-white selection:bg-emerald-300">

            {/* Header */}
            <div className="mb-8 border-b-4 border-black pb-4 flex justify-between items-end">
                <div>
                    <h1 className="text-5xl font-black text-black uppercase tracking-tighter">Cronograma</h1>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mt-2 bg-yellow-300 inline-block px-2 border-2 border-black">
                        Vista Gantt · Tiempos y Fechas Límite
                    </p>
                </div>
            </div>

            {/* Contenedor Principal Brutalista */}
            <div className="border-4 border-black bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden">

                {/* Fila de Meses (Regla Superior) */}
                <div className="border-b-4 border-black bg-emerald-400 px-0 py-3 relative">
                    <div className="relative h-6 ml-64 md:ml-80">
                        {months.map((m, i) => (
                            <span
                                key={i}
                                className="absolute text-xs font-black text-black uppercase tracking-widest border-l-4 border-black pl-2 leading-none"
                                style={{ left: `${m.pct}%` }}
                            >
                                {m.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Filas de Trámites */}
                <div className="divide-y-4 divide-black">
                    {tramites.map(t => {
                        const e = ESTADOS[t.estado] || ESTADOS.no_iniciado;
                        const hasS = t.cronograma?.inicio;
                        const hasE = t.cronograma?.fin || t.fecha_limite;
                        const tId = t.id || t._id;

                        return (
                            <div
                                key={tId}
                                className="flex items-stretch hover:bg-yellow-50 transition-colors group cursor-pointer"
                                onClick={() => onSelect(t)}
                            >

                                {/* 1. Info del Trámite (Columna Izquierda) */}
                                <div className="w-64 md:w-80 shrink-0 px-5 py-4 border-r-4 border-black bg-white group-hover:bg-yellow-100 flex flex-col justify-center relative">
                                    <p className="text-sm font-black text-black uppercase leading-tight line-clamp-2 mb-2 group-hover:underline decoration-2 underline-offset-2">
                                        {t.nombre}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-black" style={{ background: e.color === '#FFFFFF' ? '#000' : e.color }} />
                                        <span className="text-[10px] font-bold text-gray-600 uppercase">{e.label}</span>
                                    </div>
                                </div>

                                {/* 2. Área del Gráfico Gantt */}
                                <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-50 overflow-hidden">

                                    {/* Línea de Fecha Límite Vertical */}
                                    {t.fecha_limite && (
                                        <div
                                            className="absolute top-0 bottom-0 w-1 border-l-4 border-dashed border-red-500 z-0 opacity-50"
                                            style={{ left: `${pct(t.fecha_limite)}%` }}
                                            title="FECHA LÍMITE"
                                        />
                                    )}

                                    <div className="relative h-full flex items-center min-h-[70px]">

                                        {/* Barra de Duración */}
                                        {hasS && hasE && (
                                            <div
                                                className="absolute h-8 border-4 border-black flex items-center px-2 z-10 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform group-hover:scale-y-110"
                                                style={{
                                                    left: `${pct(t.cronograma.inicio)}%`,
                                                    width: `${wid(t.cronograma.inicio, t.cronograma.fin || t.fecha_limite)}%`,
                                                    background: e.color === '#FFFFFF' ? '#E5E7EB' : e.color
                                                }}
                                            >
                                                {wid(t.cronograma.inicio, t.cronograma.fin || t.fecha_limite) > 10 && (
                                                    <span className="text-[10px] text-white font-black mix-blend-difference pointer-events-none">
                                                        {e.pct}%
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Hitos (Rombos) */}
                                        {(t.cronograma?.hitos || []).filter(h => h.fecha).map(h => (
                                            <div
                                                key={h.id}
                                                className={`absolute w-5 h-5 border-4 border-black z-20 rotate-45 shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform hover:scale-125
                          ${h.completado ? 'bg-emerald-500' : 'bg-yellow-400 animate-pulse'}`}
                                                style={{ left: `calc(${pct(h.fecha)}% - 10px)` }}
                                                title={h.nombre}
                                            />
                                        ))}

                                        {/* Fallback si no hay fechas */}
                                        {!hasS && (
                                            <p className="text-xs font-black text-gray-500 uppercase tracking-widest ml-6 bg-white px-3 py-1 border-4 border-gray-300">
                                                SIN FECHAS ASIGNADAS
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* 3. Resumen de Fechas (Columna Derecha) */}
                                <div className="w-32 md:w-40 shrink-0 border-l-4 border-black px-4 py-4 bg-white group-hover:bg-yellow-100 flex flex-col justify-center items-end text-right">
                                    <p className="text-[10px] font-black uppercase text-gray-500 mb-1 leading-none">INICIO</p>
                                    <p className="text-xs font-bold text-black mb-3">
                                        {t.cronograma?.inicio ? fmtDate(t.cronograma.inicio) : '---'}
                                    </p>

                                    <p className="text-[10px] font-black uppercase text-gray-500 mb-1 leading-none">LÍMITE / FIN</p>
                                    <p className={`text-xs font-bold ${t.fecha_limite && !t.cronograma?.fin ? 'text-red-600' : 'text-black'}`}>
                                        {t.cronograma?.fin ? fmtDate(t.cronograma.fin) : t.fecha_limite ? fmtDate(t.fecha_limite) : '---'}
                                    </p>
                                </div>

                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Cronograma;