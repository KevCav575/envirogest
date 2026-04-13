import React from 'react';
import { CalendarWidget } from './Sidebar';
import { Ic, GIROS, ESTADOS, ISO_DATA } from './constants';

export function Dashboard({ projectData, setScreen }) {
    const { tramites = [], alertas = [], usuario } = projectData;

    const unread = alertas.filter(a => !a.leido).length;

    const kpis = [
        { l: 'Trámites', v: tramites.length, c: 'bg-white', txt: 'text-black' },
        { l: 'Cumplidos', v: tramites.filter(t => t.estado === 'cumplido').length, c: 'bg-emerald-400', txt: 'text-black' },
        { l: 'En Proceso', v: tramites.filter(t => ['recopilando', 'ingresado', 'en_revision'].includes(t.estado)).length, c: 'bg-blue-300', txt: 'text-black' },
        { l: 'Vencidos', v: tramites.filter(t => t.estado === 'vencido').length, c: 'bg-red-500', txt: 'text-white' }
    ];

    const isoAll = Object.values(ISO_DATA).flatMap(s => s.items);
    const isoDone = Object.values(projectData.iso14001?.secciones || {}).reduce((a, s) => a + Object.values(s).filter(Boolean).length, 0);
    const isoPct = isoAll.length ? Math.round((isoDone / isoAll.length) * 100) : 0;

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans bg-white selection:bg-emerald-300">

            {/* ── HEADER DE BIENVENIDA ── */}
            <div className="flex items-end justify-between mb-8 border-b-4 border-black pb-4">
                <div>
                    <h1 className="text-5xl font-black text-black uppercase tracking-tighter leading-none">
                        {usuario?.nombre?.split(' ')[0] || 'Usuario'}
                    </h1>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mt-2 bg-yellow-300 inline-block px-2 border-2 border-black">
                        Panel Principal
                    </p>
                </div>
                <div className="text-right bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <p className="text-xs font-black uppercase text-gray-500 mb-1">FECHA DE HOY</p>
                    <p className="text-sm font-bold text-black uppercase">
                        {new Date().toLocaleDateString('es-MX', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* ── CALL TO ACTION (Diagnóstico Pendiente) ── */}
            {!projectData.cuestionario?.respondido && (
                <div className="mb-10 p-6 bg-black border-4 border-black flex items-center justify-between shadow-[8px_8px_0px_rgba(52,211,153,1)] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_rgba(52,211,153,1)] transition-all">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-emerald-400 border-4 border-black flex items-center justify-center shrink-0">
                            <Ic n="clipboard" s={32} c="#000" strokeWidth="3" />
                        </div>
                        <div>
                            <p className="font-black text-emerald-400 text-2xl uppercase tracking-widest leading-tight">Inicia el Diagnóstico</p>
                            <p className="text-sm font-bold text-gray-400 uppercase mt-1">Configura tus obligaciones ambientales en 5 pasos.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setScreen('cuestionario')}
                        className="bg-emerald-400 text-black hover:bg-emerald-300 border-4 border-black px-8 py-4 font-black uppercase text-lg shadow-[4px_4px_0px_rgba(255,255,255,1)]"
                    >
                        Iniciar Ahora
                    </button>
                </div>
            )}

            {/* ── KPIs GIGANTES ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {kpis.map(k => (
                    <div key={k.l} className={`${k.c} border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-col justify-between`}>
                        <p className={`text-sm font-black uppercase tracking-widest ${k.txt} opacity-80 mb-2`}>{k.l}</p>
                        <p className={`text-7xl font-black ${k.txt} leading-none tracking-tighter`}>{k.v}</p>
                    </div>
                ))}
            </div>

            {/* ── SECCIÓN MEDIA (Calendario + Alertas/ISO) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Calendario Widget */}
                <div className="lg:col-span-2">
                    {/* NOTA: Asegúrate de que el componente CalendarWidget (en Sidebar.jsx) también adopte los bordes gruesos y sombras negras. */}
                    <div className="border-4 border-black bg-white shadow-[8px_8px_0px_rgba(0,0,0,1)] p-1 h-full">
                        <CalendarWidget tramites={tramites} alertas={alertas} />
                    </div>
                </div>

                {/* Panel lateral derecho (Alertas + ISO) */}
                <div className="space-y-8 flex flex-col justify-between">

                    {/* Tarjeta ISO 14001 */}
                    <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                        {/* Textura de fondo sutil */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-emerald-400 border-2 border-black p-2">
                                    <Ic n="shield" s={20} c="#000" strokeWidth="3" />
                                </div>
                                <h3 className="font-black text-black text-xl uppercase">ISO 14001</h3>
                            </div>

                            <div className="flex items-end justify-between mb-2">
                                <p className="text-6xl font-black text-black leading-none">{isoPct}%</p>
                                <p className="text-[10px] font-black uppercase text-gray-500 mb-2">Progreso</p>
                            </div>

                            <div className="h-4 border-2 border-black bg-gray-100 overflow-hidden mb-6">
                                <div className="h-full bg-emerald-400 border-r-2 border-black transition-all duration-1000" style={{ width: `${isoPct}%` }} />
                            </div>

                            <button
                                onClick={() => setScreen('iso14001')}
                                className="w-full bg-black text-white hover:bg-gray-800 border-2 border-black py-3 font-black uppercase text-sm flex items-center justify-center gap-2 transition-colors"
                            >
                                Abrir Checklist <Ic n="cr" s={14} />
                            </button>
                        </div>
                    </div>

                    {/* Tarjeta Alertas */}
                    <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex-1 flex flex-col">
                        <div className="flex items-start justify-between mb-6">
                            <h3 className="font-black text-black text-xl uppercase">Alertas</h3>
                            {unread > 0 && (
                                <span className="bg-red-500 text-white border-2 border-black text-xs font-black px-2 py-1 uppercase tracking-widest animate-pulse">
                                    {unread} Nuevas
                                </span>
                            )}
                        </div>

                        {alertas.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">El panel está limpio</p>
                            </div>
                        ) : (
                            <div className="space-y-3 flex-1">
                                {alertas.slice(0, 4).map(a => (
                                    <div key={a.id} className={`flex gap-3 p-3 border-2 transition-colors ${a.leido ? 'border-gray-200 bg-gray-50' : 'border-black bg-yellow-100'}`}>
                                        <Ic n="bell" s={16} c={a.leido ? '#9CA3AF' : '#000'} strokeWidth="3" cls="shrink-0 mt-0.5" />
                                        <p className={`text-xs font-bold uppercase leading-tight line-clamp-2 ${a.leido ? 'text-gray-500' : 'text-black'}`}>
                                            {a.mensaje}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {alertas.length > 0 && (
                            <button
                                onClick={() => setScreen('alertas')}
                                className="w-full mt-4 bg-yellow-300 text-black hover:bg-yellow-400 border-2 border-black py-2 font-black uppercase text-xs flex items-center justify-center gap-2 transition-colors"
                            >
                                Ver Todas <Ic n="cr" s={12} />
                            </button>
                        )}
                    </div>

                </div>
            </div>

            {/* ── MATRIZ DE CUMPLIMIENTO ── */}
            {tramites.length > 0 && (
                <div className="mt-10 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="bg-black text-white px-6 py-4 flex items-center justify-between border-b-4 border-black">
                        <h3 className="font-black text-xl uppercase tracking-widest">Matriz de Cumplimiento</h3>
                        <span className="text-xs font-bold text-gray-400 uppercase bg-gray-800 px-2 py-1">Vista Rápida</span>
                    </div>

                    <div className="divide-y-4 divide-black">
                        {tramites.map(t => {
                            const e = ESTADOS[t.estado] || ESTADOS.no_iniciado;
                            const tId = t.id || t._id;

                            return (
                                <div key={tId} className="flex items-center gap-6 px-6 py-4 hover:bg-yellow-50 transition-colors cursor-pointer group" onClick={() => setScreen('tramites')}>

                                    {/* Info Trámite */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-black uppercase truncate group-hover:underline decoration-2 underline-offset-2">
                                            {t.nombre}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                                            {t.autoridad}
                                        </p>
                                    </div>

                                    {/* Barra de Progreso */}
                                    <div className="w-32 md:w-48 hidden md:block">
                                        <div className="h-4 border-2 border-black bg-gray-100 overflow-hidden relative">
                                            <div className="h-full border-r-2 border-black" style={{ width: `${e.pct}%`, background: e.color === '#FFFFFF' ? '#000' : e.color }} />
                                        </div>
                                    </div>

                                    {/* Etiqueta de Estado */}
                                    <div className="w-32 text-right shrink-0">
                                        <span
                                            className="text-[10px] font-black uppercase tracking-widest px-2 py-1 border-2 border-black bg-white inline-block w-full text-center"
                                            style={{ color: e.color === '#FFFFFF' ? '#000' : e.color, borderColor: e.color === '#FFFFFF' ? '#000' : e.color }}
                                        >
                                            {e.label.split(' ')[0]}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

        </div>
    );
}

// Exportamos Q_STEPS intacto (Se usa en Questionnaire.jsx)
export const Q_STEPS = [
    { id: 'giro', titulo: '¿Cuál es el giro industrial principal de tu empresa?', ayuda: 'Determina competencia federal (SEMARNAT) o estatal (PMA NL) y si aplica COA.', tipo: 'select', opciones: GIROS.map(g => ({ value: g.id, label: g.label })) },
    { id: 'emisiones', titulo: '¿Tu proceso genera emisiones a la atmósfera o utiliza combustibles fósiles?', ayuda: 'Gas natural, diésel, LP. Chimeneas, ductos, procesos de combustión.', tipo: 'yesno' },
    { id: 'agua', titulo: '¿Tu proceso utiliza agua industrial y/o genera aguas residuales?', ayuda: 'Descargas a cuerpos de agua o a alcantarillado municipal.', tipo: 'yesno' },
    { id: 'residuos', titulo: '¿Tu proceso genera residuos peligrosos (RP) y/o de manejo especial (RME)?', ayuda: 'RP: solventes, aceites, baterías. RME: residuos no municipales ni peligrosos.', tipo: 'multicheck', opciones: [{ id: 'residuos_peligrosos', label: 'Sí, genera Residuos Peligrosos (RP)' }, { id: 'residuos_especiales', label: 'Sí, genera Residuos de Manejo Especial (RME)' }] },
    { id: 'obras', titulo: '¿Tu empresa realiza o planea obras de construcción, ampliación o modificación de instalaciones?', ayuda: 'Incluye cambio de uso de suelo. Determina si requieres MIA federal o estatal.', tipo: 'yesno' },
];

export default Dashboard;