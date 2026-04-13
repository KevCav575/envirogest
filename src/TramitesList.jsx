import React, { useState } from 'react';
import { supabase } from './supabaseClient'; // Conexión a la BD
import { Ic, ESTADOS } from './constants';
import { uid, fmtDate, today } from './utils';

/* ── TRAMITES LIST ───────────────────────── */
export function TramitesList({ projectData, onSelect }) {
    const { tramites = [] } = projectData;
    const [filter, setFilter] = useState('todos');
    const [search, setSearch] = useState('');

    const filtered = tramites.filter(t =>
        (filter === 'todos' || t.nivel === filter) &&
        (!search || (t.nombre + t.autoridad).toLowerCase().includes(search.toLowerCase()))
    );

    if (!tramites.length) return (
        <div className="p-10 flex flex-col items-center justify-center min-h-[400px] border-4 border-dashed border-gray-300 bg-gray-50 m-8">
            <Ic n="clipboard" s={56} c="#9CA3AF" />
            <p className="text-2xl font-black text-black uppercase tracking-widest mt-6">Sin trámites identificados</p>
            <p className="text-sm font-bold text-gray-500 uppercase mt-2">Completa el diagnóstico primero en la pestaña de cuestionario.</p>
        </div>
    );

    return (
        <div className="p-8 max-w-6xl mx-auto font-sans bg-white selection:bg-emerald-300">

            {/* Header */}
            <div className="flex items-end justify-between mb-8 border-b-4 border-black pb-4">
                <div>
                    <h1 className="text-5xl font-black text-black uppercase tracking-tighter">Mis Trámites</h1>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mt-2 bg-yellow-300 inline-block px-2 border-2 border-black">
                        {tramites.length} Requisitos Identificados
                    </p>
                </div>
            </div>

            {/* Controles de Filtrado */}
            <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex bg-gray-100 border-4 border-black p-1 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    {['todos', 'federal', 'estatal', 'municipal'].map(n => (
                        <button
                            key={n}
                            onClick={() => setFilter(n)}
                            className={`px-6 py-2 text-xs font-black uppercase tracking-wider transition-colors border-2 flex-1
                ${filter === n
                                    ? 'bg-black text-white border-black'
                                    : 'bg-transparent text-gray-600 border-transparent hover:border-black'}`}
                        >
                            {n}
                        </button>
                    ))}
                </div>

                <div className="relative flex-1 min-w-[250px]">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="BUSCAR TRÁMITE O AUTORIDAD..."
                        className="w-full pl-12 pr-4 py-3 border-4 border-black text-sm font-bold uppercase focus:outline-none focus:bg-yellow-100 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-colors"
                    />
                    <Ic n="list" s={18} cls="absolute left-4 top-3.5 text-black" />
                </div>
            </div>

            {/* Grid de Tarjetas de Trámites */}
            <div className="grid gap-6">
                {filtered.map(t => {
                    const e = ESTADOS[t.estado] || ESTADOS.no_iniciado;
                    const tId = t.id || t._id;

                    return (
                        <div
                            key={tId}
                            className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-stretch gap-6 group"
                            onClick={() => onSelect(t)}
                        >
                            {/* Bloque de Color de Estado */}
                            <div
                                className="w-16 flex items-center justify-center shrink-0 border-4 border-black transition-colors"
                                style={{ background: e.bg }}
                            >
                                <Ic n="file" s={28} c={e.color === '#FFFFFF' ? '#000000' : e.color} strokeWidth="3" />
                            </div>

                            {/* Contenido Principal */}
                            <div className="flex-1 min-w-0 py-1">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div>
                                        <h3 className="font-black text-xl text-black uppercase leading-tight group-hover:text-blue-700 transition-colors">
                                            {t.nombre}
                                        </h3>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                                            {t.autoridad}
                                        </p>
                                    </div>

                                    {/* Badge de Estado */}
                                    <span
                                        className="text-xs font-black uppercase px-3 py-1 border-2 border-black shrink-0"
                                        style={{ background: e.bg, color: e.color === '#FFFFFF' ? '#000000' : e.color }}
                                    >
                                        {e.label}
                                    </span>
                                </div>

                                <p className="text-sm font-bold text-gray-600 line-clamp-2 mb-4 leading-relaxed bg-gray-50 p-2 border-l-4 border-gray-300">
                                    {t.descripcion}
                                </p>

                                {/* Footer del Trámite (Progreso y Etiquetas) */}
                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="flex-1 flex items-center gap-3 bg-gray-100 border-2 border-black p-1">
                                        <div className="flex-1 h-3 bg-white border-r-2 border-black overflow-hidden relative">
                                            <div className="h-full border-r-2 border-black" style={{ width: `${e.pct}%`, background: e.color === '#FFFFFF' ? '#000' : e.color }} />
                                        </div>
                                        <span className="text-xs font-black px-2">{e.pct}%</span>
                                    </div>

                                    {t.fecha_limite && (
                                        <span className="text-xs font-black uppercase text-red-600 bg-red-100 border-2 border-red-600 px-2 py-1 flex items-center gap-1">
                                            <Ic n="clock" s={12} strokeWidth="3" /> {fmtDate(t.fecha_limite)}
                                        </span>
                                    )}

                                    <span className={`text-xs font-black uppercase px-3 py-1 border-2 border-black
                    ${t.nivel === 'federal' ? 'bg-blue-300' : t.nivel === 'estatal' ? 'bg-purple-300' : 'bg-orange-300'}`}
                                    >
                                        {t.nivel}
                                    </span>
                                </div>
                            </div>

                            {/* Flecha indicadora */}
                            <div className="flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                <Ic n="cr" s={24} c="#000" strokeWidth="3" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ── TRAMITE DETAIL ──────────────────────── */
export function TramiteDetail({ tramite, projectData, updateProject, onBack }) {
    const [t, setT] = useState(tramite);
    const [newNota, setNewNota] = useState('');
    const [newHito, setNewHito] = useState({ nombre: '', fecha: '' });
    const [isSaving, setIsSaving] = useState(false);

    // 1. Backend Integration: Guardar en Supabase
    const save = async (updates) => {
        setIsSaving(true);
        const newT = { ...t, ...updates };
        const tId = t.id || t._id;

        // Optimistic Update local
        setT(newT);
        updateProject({ tramites: projectData.tramites.map(x => (x.id || x._id) === tId ? newT : x) });

        try {
            const { error } = await supabase
                .from('tramites')
                .update(updates)
                .eq('id', tId);

            if (error) throw error;
        } catch (err) {
            console.error("Error al actualizar trámite en BD:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const e = ESTADOS[t.estado] || ESTADOS.no_iniciado;

    const addNota = () => {
        if (!newNota.trim()) return;
        save({ notas2: [...(t.notas2 || []), { id: uid(), texto: newNota, fecha: today() }] });
        setNewNota('');
    };

    const addHito = () => {
        if (!newHito.nombre) return;
        save({ cronograma: { ...t.cronograma, hitos: [...(t.cronograma?.hitos || []), { id: uid(), ...newHito, completado: false }] } });
        setNewHito({ nombre: '', fecha: '' });
    };

    const toggleHito = hid => {
        save({ cronograma: { ...t.cronograma, hitos: (t.cronograma?.hitos || []).map(h => h.id === hid ? { ...h, completado: !h.completado } : h) } });
    };

    return (
        <div className="p-8 max-w-6xl mx-auto font-sans bg-white">

            {/* Botón Volver */}
            <button
                onClick={onBack}
                className="mb-8 flex items-center gap-2 text-black font-black uppercase text-sm border-b-4 border-transparent hover:border-black transition-colors"
            >
                <Ic n="cl" s={16} strokeWidth="3" /> Volver a mis trámites
            </button>

            {/* Header del Detalle */}
            <div className="flex items-start justify-between mb-8 border-b-4 border-black pb-6">
                <div>
                    <h1 className="text-4xl font-black text-black uppercase tracking-tighter leading-tight mb-2">{t.nombre}</h1>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-widest flex items-center gap-3">
                        {t.autoridad}
                        <span className="w-1.5 h-1.5 bg-black rounded-full" />
                        <span className={`px-2 py-0.5 border-2 border-black
              ${t.nivel === 'federal' ? 'bg-blue-300' : t.nivel === 'estatal' ? 'bg-purple-300' : 'bg-orange-300'}`}
                        >
                            {t.nivel}
                        </span>
                    </p>
                </div>

                <div className="text-center bg-white border-4 border-black p-3 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <p className="text-3xl font-black" style={{ color: e.color === '#FFFFFF' ? '#000' : e.color }}>{e.pct}%</p>
                    <p className="text-[10px] font-black uppercase text-gray-500">Avance</p>
                </div>
            </div>

            {/* Grid Principal Neo-Brutalista */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── COLUMNA IZQUIERDA (Info y Operación) ── */}
                <div className="lg:col-span-2 space-y-6">

                    <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-black text-black text-lg uppercase mb-3 flex items-center gap-2 bg-yellow-300 w-fit px-2 border-2 border-black">
                            <Ic n="file" s={18} strokeWidth="3" /> Fundamento Legal
                        </h3>
                        <p className="text-sm font-bold text-gray-700 uppercase leading-relaxed bg-gray-50 p-3 border-l-4 border-black">
                            {t.base_legal}
                        </p>
                    </div>

                    <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-black text-black text-lg uppercase mb-3 bg-blue-300 w-fit px-2 border-2 border-black">Descripción</h3>
                        <p className="text-sm font-bold text-gray-800 leading-relaxed">
                            {t.descripcion}
                        </p>
                    </div>

                    {/* Cronograma de Hitos */}
                    <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-black text-black text-lg uppercase mb-4 flex items-center gap-2">
                            <Ic n="clock" s={18} strokeWidth="3" /> Cronograma de Hitos
                        </h3>

                        {/* Lista de Hitos */}
                        <div className="space-y-3 mb-6">
                            {(t.cronograma?.hitos || []).length === 0 ? (
                                <p className="text-sm font-bold text-gray-400 uppercase bg-gray-100 p-3 border-2 border-dashed border-gray-300">Sin hitos registrados</p>
                            ) : (
                                (t.cronograma.hitos || []).map(h => (
                                    <div key={h.id} className={`flex items-center gap-4 p-3 border-4 transition-colors ${h.completado ? 'bg-emerald-100 border-emerald-500 opacity-70' : 'bg-white border-black'}`}>
                                        <button
                                            onClick={() => toggleHito(h.id)}
                                            className={`w-8 h-8 border-4 flex items-center justify-center shrink-0 transition-colors
                        ${h.completado ? 'border-emerald-600 bg-emerald-500' : 'border-black bg-white hover:bg-gray-200'}`}
                                        >
                                            {h.completado && <Ic n="check" s={16} c="#000" strokeWidth="4" />}
                                        </button>
                                        <span className={`flex-1 text-sm font-bold uppercase ${h.completado ? 'line-through text-emerald-900' : 'text-black'}`}>
                                            {h.nombre}
                                        </span>
                                        {h.fecha && (
                                            <span className="text-xs font-black uppercase px-2 py-1 bg-black text-white">{fmtDate(h.fecha)}</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Agregar Hito */}
                        <div className="flex flex-wrap gap-2 bg-gray-100 p-2 border-4 border-black">
                            <input
                                value={newHito.nombre} onChange={e => setNewHito(h => ({ ...h, nombre: e.target.value }))}
                                placeholder="NUEVO HITO..."
                                className="flex-1 border-4 border-black px-3 py-2 text-sm font-bold uppercase outline-none focus:bg-yellow-100"
                            />
                            <input
                                type="date"
                                value={newHito.fecha} onChange={e => setNewHito(h => ({ ...h, fecha: e.target.value }))}
                                className="border-4 border-black px-3 py-2 text-sm font-bold uppercase outline-none focus:bg-yellow-100 cursor-pointer"
                            />
                            <button onClick={addHito} className="bg-black text-white hover:bg-gray-800 border-4 border-black px-4 py-2 font-black uppercase text-sm flex items-center gap-1">
                                <Ic n="plus" s={14} /> Agregar
                            </button>
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                        <h3 className="font-black text-black text-lg uppercase mb-4">Registro de Notas</h3>

                        <div className="space-y-4 mb-6">
                            {(t.notas2 || []).length === 0 ? (
                                <p className="text-sm font-bold text-gray-400 uppercase bg-white p-3 border-2 border-dashed border-gray-300">Sin notas</p>
                            ) : (
                                (t.notas2 || []).map(n => (
                                    <div key={n.id} className="p-4 bg-yellow-200 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] -rotate-1 hover:rotate-0 transition-transform">
                                        <p className="text-sm font-bold text-black leading-relaxed">{n.texto}</p>
                                        <p className="text-[10px] font-black uppercase text-gray-600 mt-2 border-t-2 border-black/20 pt-2">{fmtDate(n.fecha)}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex gap-2">
                            <input
                                value={newNota} onChange={e => setNewNota(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addNota(); }}
                                placeholder="ESCRIBIR NOTA..."
                                className="flex-1 border-4 border-black px-4 py-3 text-sm font-bold uppercase outline-none focus:bg-yellow-100"
                            />
                            <button onClick={addNota} className="bg-blue-300 text-black hover:bg-blue-400 border-4 border-black px-6 py-3 font-black uppercase text-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                                Guardar
                            </button>
                        </div>
                    </div>

                </div>

                {/* ── COLUMNA DERECHA (Estado y Fechas) ── */}
                <div className="space-y-6">

                    <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-black text-black text-lg uppercase mb-4 border-b-4 border-black pb-2">Estado del Trámite</h3>

                        <div className="space-y-2">
                            {Object.entries(ESTADOS).map(([k, v]) => {
                                const isActive = t.estado === k;
                                return (
                                    <button
                                        key={k}
                                        onClick={() => save({ estado: k })}
                                        className={`w-full flex items-center justify-between p-4 border-4 transition-all group
                      ${isActive ? 'border-black' : 'border-gray-200 bg-gray-50 hover:border-black hover:bg-gray-100'}`}
                                        style={isActive ? { background: v.bg } : {}}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-4 h-4 border-2 border-black" style={{ background: v.color === '#FFFFFF' ? '#000' : v.color }} />
                                            <span
                                                className="text-sm font-black uppercase tracking-wider"
                                                style={isActive ? { color: v.color === '#FFFFFF' ? '#000' : v.color } : { color: '#000' }}
                                            >
                                                {v.label}
                                            </span>
                                        </div>
                                        {isActive && <Ic n="check" s={18} c={v.color === '#FFFFFF' ? '#000' : v.color} strokeWidth="3" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-black text-black text-lg uppercase mb-4 border-b-4 border-black pb-2">Fechas Clave</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black uppercase text-black block mb-1">Fecha de Inicio</label>
                                <input
                                    type="date" value={t.cronograma?.inicio || ''}
                                    onChange={e => save({ cronograma: { ...t.cronograma, inicio: e.target.value } })}
                                    className="w-full border-4 border-black px-3 py-2 text-sm font-bold uppercase focus:bg-yellow-100 outline-none cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase text-black block mb-1">Fecha Límite</label>
                                <input
                                    type="date" value={t.fecha_limite || ''}
                                    onChange={e => save({ fecha_limite: e.target.value })}
                                    className="w-full border-4 border-black px-3 py-2 text-sm font-bold uppercase focus:bg-yellow-100 outline-none cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase text-black block mb-1">Fecha de Resolución</label>
                                <input
                                    type="date" value={t.cronograma?.fin || ''}
                                    onChange={e => save({ cronograma: { ...t.cronograma, fin: e.target.value } })}
                                    className="w-full border-4 border-black px-3 py-2 text-sm font-bold uppercase focus:bg-yellow-100 outline-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Indicador de Guardado Flotante */}
            {isSaving && (
                <div className="fixed bottom-6 right-6 bg-yellow-300 border-4 border-black px-4 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center gap-2 z-50">
                    <span className="w-2 h-2 bg-black rounded-full animate-ping" />
                    Guardando...
                </div>
            )}

        </div>
    );
}

export default TramitesList;