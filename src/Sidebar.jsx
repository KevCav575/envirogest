import React, { useState, useMemo } from 'react';
import { Ic } from './constants';
import { giroLabel, giroColor } from './utils';

export const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'cuestionario', label: 'Diagnóstico', icon: 'clipboard' },
    { id: 'tramites', label: 'Trámites', icon: 'list' },
    { id: 'cronograma', label: 'Cronograma', icon: 'calendar' },
    { id: 'alertas', label: 'Alertas', icon: 'bell' },
    { id: 'consultor', label: 'Panel Consultor', icon: 'send' },
    { id: 'iso14001', label: 'ISO 14001', icon: 'shield' },
];

export function Sidebar({ screen, setScreen, clientUser, isConsultor, isAdmin, onBack, onLogout, alertaCount }) {
    return (
        // 1. Diseño Brutalista: Fondo negro, borde derecho amarillo de precaución
        <div className="w-72 flex-shrink-0 flex flex-col h-screen sticky top-0 bg-black border-r-8 border-yellow-400 font-sans selection:bg-emerald-300">

            {/* Botón Volver (Solo Consultor/Admin) */}
            {isConsultor ? (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-6 py-4 bg-emerald-400 hover:bg-emerald-500 transition-colors text-black font-black uppercase text-xs border-b-4 border-black"
                >
                    <Ic n="cl" s={16} strokeWidth="3" />
                    <span>{isAdmin ? 'Volver al panel admin' : 'Volver a clientes'}</span>
                </button>
            ) : (
                <div className="px-6 py-6 border-b-4 border-emerald-500 flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-400 border-2 border-emerald-500 flex items-center justify-center shrink-0">
                        <Ic n="leaf" s={24} c="#000" />
                    </div>
                    <div>
                        <p className="text-emerald-400 font-black text-xl uppercase tracking-tighter leading-none">EnviroGest MX</p>
                        <p className="text-white font-bold text-[10px] uppercase tracking-widest mt-1">by BIOIMPACT</p>
                    </div>
                </div>
            )}

            {/* Info del Cliente */}
            {clientUser && (
                <div className="px-6 py-4 bg-white border-b-4 border-yellow-400 shadow-[inset_0px_-4px_0px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 border-2 border-black flex items-center justify-center text-sm font-black text-black shrink-0"
                            style={{ background: giroColor(clientUser.giro) }}
                        >
                            {clientUser.empresa.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-black font-black text-sm uppercase truncate leading-tight">{clientUser.empresa}</p>
                            <p className="text-gray-600 font-bold text-[10px] uppercase tracking-widest truncate">{giroLabel(clientUser.giro)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navegación */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-2">
                {NAV.map(item => {
                    if (item.id === 'consultor' && !isConsultor) return null;
                    const active = screen === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => setScreen(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3 border-2 transition-all group
                ${active
                                    ? 'bg-white border-white text-black shadow-[4px_4px_0px_rgba(52,211,153,1)] translate-x-1'
                                    : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:border-gray-800 hover:bg-gray-900'}`}
                        >
                            <div className="relative shrink-0">
                                <Ic n={item.icon} s={20} c={active ? '#000' : 'currentColor'} strokeWidth="2.5" />
                                {item.id === 'alertas' && alertaCount > 0 && (
                                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 border-2 border-black text-white text-[10px] flex items-center justify-center font-black animate-pulse">
                                        {alertaCount > 9 ? '9+' : alertaCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-sm font-black uppercase tracking-widest">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* Footer del Usuario */}
            <div className="p-4 border-t-4 border-yellow-400 bg-black">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-10 h-10 border-2 border-emerald-400 flex items-center justify-center shrink-0">
                        <Ic n="user" s={20} c="#34D399" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-black uppercase tracking-widest truncate">
                            {clientUser?.nombre || 'Usuario'}
                        </p>
                        <p className="text-emerald-400 font-bold text-[10px] uppercase truncate">
                            {clientUser?.email}
                        </p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-10 h-10 bg-red-500 hover:bg-red-600 border-2 border-black flex items-center justify-center transition-colors shrink-0"
                        title="Cerrar Sesión"
                    >
                        <Ic n="logout" s={16} c="#FFF" />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── CALENDAR WIDGET ─────────────────────── */
export function CalendarWidget({ tramites, alertas }) {
    const [cur, setCur] = useState(new Date());
    const [sel, setSel] = useState(null);

    const year = cur.getFullYear();
    const month = cur.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayD = new Date();

    const events = useMemo(() => {
        const m = {};
        tramites.forEach(t => {
            (t.cronograma?.hitos || []).forEach(h => {
                if (h.fecha) (m[h.fecha] = m[h.fecha] || []).push({ type: 'hito', done: h.completado });
            });
            if (t.fecha_limite) (m[t.fecha_limite] = m[t.fecha_limite] || []).push({ type: 'limit' });
        });
        alertas.forEach(a => {
            const d = a.fecha?.slice(0, 10);
            if (d) (m[d] = m[d] || []).push({ type: 'alert' });
        });
        return m;
    }, [tramites, alertas]);

    const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    const selStr = sel ? `${year}-${String(month + 1).padStart(2, '0')}-${String(sel).padStart(2, '0')}` : null;

    return (
        <div className="p-6 bg-white font-sans h-full flex flex-col">

            {/* Header Calendario */}
            <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-4">
                <h3 className="font-black text-black text-xl uppercase tracking-tighter">
                    {meses[month]} <span className="text-gray-400">{year}</span>
                </h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCur(new Date(year, month - 1, 1))}
                        className="w-8 h-8 border-2 border-black bg-white hover:bg-yellow-300 flex items-center justify-center transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                    >
                        <Ic n="cl" s={14} strokeWidth="3" />
                    </button>
                    <button
                        onClick={() => setCur(new Date(year, month + 1, 1))}
                        className="w-8 h-8 border-2 border-black bg-white hover:bg-yellow-300 flex items-center justify-center transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                    >
                        <Ic n="cr" s={14} strokeWidth="3" />
                    </button>
                </div>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 mb-2 border-b-2 border-black pb-2">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, idx) => (
                    <div key={idx} className="text-center text-xs font-black text-black uppercase">{d}</div>
                ))}
            </div>

            {/* Cuadrícula de días */}
            <div className="grid grid-cols-7 gap-2 flex-1 content-start">
                {Array(firstDay).fill(null).map((_, i) => <div key={'e' + i} />)}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                    const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const ev = events[ds] || [];
                    const isToday = todayD.getDate() === d && todayD.getMonth() === month && todayD.getFullYear() === year;
                    const isSel = sel === d;

                    return (
                        <button
                            key={d}
                            onClick={() => setSel(isSel ? null : d)}
                            className={`relative flex flex-col items-center justify-center aspect-square border-2 transition-all 
                ${isToday ? 'bg-emerald-400 border-black text-black shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                                    : isSel ? 'bg-black text-white border-black'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-black hover:bg-yellow-100'}`}
                        >
                            <span className={`text-sm font-black ${isToday ? 'text-black' : isSel ? 'text-white' : 'text-black'}`}>{d}</span>

                            {ev.length > 0 && (
                                <div className="absolute bottom-1 flex gap-1">
                                    {ev.slice(0, 3).map((e, i) => (
                                        <span
                                            key={i}
                                            className="w-1.5 h-1.5 border border-black"
                                            style={{ background: e.type === 'alert' ? '#DC2626' : e.type === 'limit' ? '#F59E0B' : e.done ? '#10B981' : '#F59E0B' }}
                                        />
                                    ))}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Eventos del día seleccionado */}
            {sel && selStr && (
                <div className="mt-6 bg-yellow-100 border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <p className="text-xs font-black text-black bg-white inline-block px-2 border-2 border-black mb-3">
                        {selStr}
                    </p>
                    {(events[selStr] || []).length === 0 ? (
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Día despejado.</p>
                    ) : (
                        <div className="space-y-2">
                            {(events[selStr]).map((e, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white border-2 border-black p-2">
                                    <span className="w-3 h-3 border-2 border-black shrink-0" style={{ background: e.type === 'alert' ? '#DC2626' : e.type === 'limit' ? '#F59E0B' : e.done ? '#10B981' : '#FCD34D' }} />
                                    <span className="text-xs font-black uppercase text-black">
                                        {e.type === 'alert' ? 'Alerta' : e.type === 'limit' ? 'Fecha Límite' : e.done ? 'Hito Completado' : 'Hito Pendiente'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Leyenda Footer */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t-4 border-black">
                {[
                    { c: '#10B981', l: 'OK' },
                    { c: '#F59E0B', l: 'LÍMITE' },
                    { c: '#DC2626', l: 'ALERTA' }
                ].map(x => (
                    <div key={x.l} className="flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-black" style={{ background: x.c }} />
                        <span className="text-[10px] font-black uppercase text-gray-600">{x.l}</span>
                    </div>
                ))}
            </div>

        </div>
    );
}

export default Sidebar;