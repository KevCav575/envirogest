import React, { useState } from 'react';
import { supabase } from './supabaseClient'; // Conexión a BD
import { Ic, ISO_DATA } from './constants';
import { Btn, Card, Input, Select } from './ui';
import { fmtDate, today } from './utils';

export function ConsultorPanel({ projectData, updateProject }) {
    const { tramites = [], alertas = [] } = projectData;
    const instrucciones = projectData.instrucciones_admin || [];
    const reuniones = (projectData.reuniones || []).sort((a, b) => a.fecha > b.fecha ? 1 : -1);

    const [tab, setTab] = useState('instrucciones');
    const [form, setForm] = useState({ tipo: 'solicitud', tramite_id: '', mensaje: '', fecha_visita: '', hora_visita: '', motivo: '', docs: '' });
    const [sent, setSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

    // 1. Seguridad: Inserción de Alerta en Supabase
    const sendAlert = async (tipo, msg) => {
        if (!msg) return;
        setIsLoading(true);

        const nuevaAlerta = {
            proyecto_id: projectData.id,
            tipo,
            mensaje: msg,
            fecha: today(),
            leido: false,
            tramite_id: form.tramite_id || null
        };

        try {
            const { data, error } = await supabase.from('alertas').insert([nuevaAlerta]).select().single();
            if (error) throw error;

            // Optimistic Update
            updateProject({ alertas: [...alertas, data] });

            setSent(true);
            setTimeout(() => setSent(false), 3000);
            setF('mensaje', '');
            setF('docs', '');
        } catch (error) {
            console.error("Error al enviar alerta:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Seguridad: Actualización de instrucción en Supabase
    const markInstrLeida = async (iid) => {
        try {
            // Optimistic Update
            updateProject({
                instrucciones_admin: instrucciones.map(i => i.id === iid ? { ...i, leido: true } : i)
            });

            const { error } = await supabase.from('instrucciones_admin').update({ leido: true }).eq('id', iid);
            if (error) throw error;
        } catch (error) {
            console.error("Error marcando como leída:", error);
        }
    };

    const instrPend = instrucciones.filter(i => !i.leido).length;
    const reunFutures = reuniones.filter(r => r.fecha >= today());

    return (
        // 3. Diseño: Estilos Brutalistas (Bordes gruesos, Sombras Duras, Mayúsculas)
        <div className="p-8 max-w-4xl mx-auto text-black font-sans bg-white selection:bg-emerald-300">

            <div className="mb-8 border-b-4 border-black pb-4">
                <h1 className="text-4xl font-black text-black uppercase tracking-tighter">Panel de Acción</h1>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">
                    Comunicaciones · Alertas · Instrucciones
                </p>
            </div>

            {/* Tab bar Brutalista */}
            <div className="flex flex-wrap gap-2 mb-8 bg-gray-100 p-2 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                {[
                    { id: 'instrucciones', l: 'Admin', badge: instrPend > 0 ? instrPend : null },
                    { id: 'reuniones', l: 'Reuniones', badge: reunFutures.length > 0 ? reunFutures.length : null },
                    { id: 'alerta', l: 'Alerta', badge: null },
                    { id: 'docs', l: 'Docs', badge: null },
                    { id: 'visita', l: 'Visita', badge: null },
                    { id: 'firma', l: 'Firma', badge: null },
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={`flex-1 py-2 px-2 text-xs font-black uppercase tracking-wider transition-all border-2 flex items-center justify-center gap-2
              ${tab === t.id
                                ? 'bg-black text-white border-black shadow-[2px_2px_0px_rgba(16,185,129,1)]'
                                : 'bg-white text-black border-black hover:bg-gray-200'}`}
                    >
                        {t.l}
                        {t.badge && (
                            <span className="w-5 h-5 rounded-full bg-red-500 text-white border-2 border-white text-[10px] flex items-center justify-center shadow-sm">
                                {t.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {sent && (
                <div className="mb-6 p-4 bg-emerald-400 border-4 border-black text-black font-black uppercase tracking-widest text-sm flex items-center gap-3 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <Ic n="checkCircle" s={20} c="#000" />
                    Acción ejecutada correctamente
                </div>
            )}

            {/* ── INSTRUCCIONES DEL ADMIN ── */}
            {tab === 'instrucciones' && (
                <div>
                    {instrucciones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-gray-300 bg-gray-50">
                            <Ic n="checkCircle" s={48} c="#9CA3AF" />
                            <p className="text-black font-black uppercase tracking-widest text-xl mt-4">Sin instrucciones</p>
                            <p className="text-gray-500 font-bold uppercase text-sm mt-1">El panel está limpio.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {instrucciones.slice().reverse().map(instr => (
                                <div
                                    key={instr.id}
                                    className={`border-4 p-5 flex gap-4 items-start transition-all
                    ${instr.urgente ? 'border-red-600 bg-red-100 shadow-[6px_6px_0px_rgba(220,38,38,1)]' : 'border-black bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)]'}
                    ${instr.leido ? 'opacity-50 shadow-none bg-gray-50' : ''}`}
                                >
                                    <div className={`w-12 h-12 flex items-center justify-center border-4 border-black shrink-0 ${instr.urgente ? 'bg-red-500' : 'bg-blue-300'}`}>
                                        <Ic n={instr.urgente ? 'alert' : 'info'} s={24} c="#000" />
                                    </div>

                                    <div className="flex-1">
                                        {instr.urgente && <span className="text-xs font-black text-red-600 uppercase tracking-widest mb-1 block">⚡ Urgente</span>}
                                        <p className="text-lg font-bold text-black leading-tight">{instr.texto}</p>
                                        <p className="text-xs font-bold text-gray-500 uppercase mt-2">
                                            De: ADMIN · {fmtDate(instr.fecha)}
                                        </p>
                                    </div>

                                    {!instr.leido && (
                                        <button
                                            onClick={() => markInstrLeida(instr.id)}
                                            className="bg-emerald-400 hover:bg-emerald-500 text-black border-4 border-black px-4 py-2 font-black uppercase text-xs transition-colors shrink-0 flex items-center gap-2"
                                        >
                                            <Ic n="check" s={14} /> Leer
                                        </button>
                                    )}
                                    {instr.leido && (
                                        <span className="text-xs font-black text-emerald-600 uppercase flex items-center gap-1 shrink-0 bg-emerald-100 px-2 py-1 border-2 border-emerald-600">
                                            <Ic n="checkCircle" s={14} /> Leída
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── REUNIONES ── */}
            {tab === 'reuniones' && (
                <div>
                    {reuniones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-gray-300 bg-gray-50">
                            <Ic n="calendar" s={48} c="#9CA3AF" />
                            <p className="text-black font-black uppercase tracking-widest text-xl mt-4">Sin reuniones</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reuniones.map(r => {
                                const isPast = r.fecha < today();
                                return (
                                    <div key={r.id} className={`border-4 border-black p-5 flex gap-5 items-start ${isPast ? 'bg-gray-100 opacity-60' : 'bg-white shadow-[6px_6px_0px_rgba(0,0,0,1)]'}`}>
                                        <div className="w-20 h-20 bg-blue-300 border-4 border-black flex flex-col items-center justify-center shrink-0">
                                            <span className="text-xs font-black uppercase text-black leading-none">{r.fecha ? new Date(r.fecha + 'T12:00').toLocaleString('es', { month: 'short' }) : ''}</span>
                                            <span className="text-3xl font-black text-black leading-none mt-1">{r.fecha ? r.fecha.split('-')[2] : ''}</span>
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-black text-xl text-black">{r.titulo}</p>
                                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                                                        {r.hora} · {r.duracion} MIN · {fmtDate(r.fecha)}
                                                    </p>
                                                    {r.agenda && <p className="text-sm font-bold text-gray-800 mt-2 line-clamp-2 border-l-4 border-yellow-400 pl-3">{r.agenda}</p>}
                                                </div>

                                                {r.gcal_link && !isPast && (
                                                    <a href={r.gcal_link} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white border-4 border-black px-4 py-2 font-black uppercase text-xs flex items-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-1 hover:-translate-y-1">
                                                        <Ic n="calendar" s={14} /> G-Cal
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ── FORMULARIOS (ALERTA / DOCS / VISITA / FIRMA) ── */}
            {['alerta', 'docs', 'visita', 'firma'].includes(tab) && (
                <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
                    <div className="mb-6 border-b-4 border-black pb-6">
                        <label className="text-xs font-black uppercase text-black block mb-2">Trámite Vinculado (Opcional)</label>
                        <select
                            className="w-full border-4 border-black px-4 py-3 font-bold text-sm bg-white cursor-pointer focus:bg-yellow-100 outline-none"
                            value={form.tramite_id} onChange={e => setF('tramite_id', e.target.value)}
                        >
                            <option value="">Selecciona un trámite...</option>
                            {tramites.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                        </select>
                    </div>

                    {tab === 'alerta' && (
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-black uppercase text-black block mb-2">Tipo de Alerta</label>
                                <select className="w-full border-4 border-black px-4 py-3 font-bold text-sm bg-white cursor-pointer focus:bg-yellow-100 outline-none" value={form.tipo} onChange={e => setF('tipo', e.target.value)}>
                                    <option value="vencimiento">Vencimiento</option>
                                    <option value="solicitud">Solicitud de info</option>
                                    <option value="estado">Cambio de estado</option>
                                    <option value="info">Informativa</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase text-black block mb-2">Mensaje *</label>
                                <textarea className="w-full border-4 border-black px-4 py-3 font-bold text-sm focus:bg-yellow-100 outline-none resize-none" rows="4" value={form.mensaje} onChange={e => setF('mensaje', e.target.value)} placeholder="ESCRIBE EL MENSAJE AQUÍ..."></textarea>
                            </div>
                            <button disabled={isLoading} onClick={() => sendAlert(form.tipo, form.mensaje)} className="w-full bg-black text-white hover:bg-gray-800 border-4 border-black py-4 font-black uppercase tracking-widest text-sm shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
                                {isLoading ? 'ENVIANDO...' : 'ENVIAR ALERTA'}
                            </button>
                        </div>
                    )}

                    {tab === 'docs' && (
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-black uppercase text-black block mb-2">Documentos Requeridos *</label>
                                <textarea className="w-full border-4 border-black px-4 py-3 font-bold text-sm focus:bg-yellow-100 outline-none resize-none" rows="4" value={form.docs} onChange={e => setF('docs', e.target.value)} placeholder="PLANO DE UBICACIÓN, ACTA..."></textarea>
                            </div>
                            <button disabled={isLoading} onClick={() => sendAlert('solicitud', `BIOIMPACT solicita: ${form.docs}`)} className="w-full bg-blue-300 text-black hover:bg-blue-400 border-4 border-black py-4 font-black uppercase tracking-widest text-sm shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
                                {isLoading ? 'ENVIANDO...' : 'SOLICITAR DOCUMENTOS'}
                            </button>
                        </div>
                    )}

                    {tab === 'visita' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-black uppercase text-black block mb-2">Fecha *</label><input type="date" className="w-full border-4 border-black px-4 py-3 font-bold text-sm focus:bg-yellow-100 outline-none" value={form.fecha_visita} onChange={e => setF('fecha_visita', e.target.value)} /></div>
                                <div><label className="text-xs font-black uppercase text-black block mb-2">Hora</label><input type="time" className="w-full border-4 border-black px-4 py-3 font-bold text-sm focus:bg-yellow-100 outline-none" value={form.hora_visita} onChange={e => setF('hora_visita', e.target.value)} /></div>
                            </div>
                            <div><label className="text-xs font-black uppercase text-black block mb-2">Motivo</label><input type="text" className="w-full border-4 border-black px-4 py-3 font-bold text-sm focus:bg-yellow-100 outline-none" value={form.motivo} onChange={e => setF('motivo', e.target.value)} placeholder="MOTIVO DE VISITA..." /></div>
                            <button disabled={isLoading} onClick={() => sendAlert('visita', `Visita: ${fmtDate(form.fecha_visita)} a las ${form.hora_visita || 'TBD'}. Motivo: ${form.motivo}.`)} className="w-full bg-yellow-300 text-black hover:bg-yellow-400 border-4 border-black py-4 font-black uppercase tracking-widest text-sm shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
                                {isLoading ? 'AGENDANDO...' : 'AGENDAR VISITA'}
                            </button>
                        </div>
                    )}

                    {tab === 'firma' && (
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-black uppercase text-black block mb-2">Documentos para firma *</label>
                                <textarea className="w-full border-4 border-black px-4 py-3 font-bold text-sm focus:bg-yellow-100 outline-none resize-none" rows="4" value={form.docs} onChange={e => setF('docs', e.target.value)} placeholder="DOCUMENTOS..."></textarea>
                            </div>
                            <button disabled={isLoading} onClick={() => sendAlert('firma', `Documentos para firma: ${form.docs}. Favor revisar.`)} className="w-full bg-emerald-400 text-black hover:bg-emerald-500 border-4 border-black py-4 font-black uppercase tracking-widest text-sm shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
                                {isLoading ? 'ENVIANDO...' : 'NOTIFICAR PARA FIRMA'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ── ISO 14001 (Refactorizado con Supabase y Estilos Brutalistas) ── */
export function ISO14001({ projectData, updateProject }) {
    const [openSec, setOpenSec] = useState('4');
    const [isSaving, setIsSaving] = useState(false);

    // Fallback si no hay datos de ISO
    const isoData = projectData.iso14001 || { secciones: {} };
    const secs = isoData.secciones || {};

    // Guardado en Supabase
    const toggle = async (sid, iid) => {
        setIsSaving(true);
        const s = secs[sid] || {};
        const newSecciones = { ...secs, [sid]: { ...s, [iid]: !s[iid] } };

        // Optimistic Update local
        updateProject({ iso14001: { ...isoData, secciones: newSecciones } });

        try {
            // Upsert a Supabase (PostgreSQL) usando el JSONB que configuramos
            const { error } = await supabase.from('iso14001_progreso').upsert({
                proyecto_id: projectData.id,
                secciones: newSecciones,
                updated_at: new Date()
            }, { onConflict: 'proyecto_id' });

            if (error) throw error;
        } catch (err) {
            console.error("Error guardando progreso ISO:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const secPct = sid => {
        const items = ISO_DATA[sid].items;
        const s = secs[sid] || {};
        return items.length ? Math.round(items.filter(i => s[i.id]).length / items.length * 100) : 0;
    };

    const totalItems = Object.values(ISO_DATA).flatMap(s => s.items).length;
    const totalDone = Object.entries(secs).reduce((a, [sid, s]) => a + (ISO_DATA[sid]?.items || []).filter(i => s[i.id]).length, 0);
    const totalPct = totalItems ? Math.round(totalDone / totalItems * 100) : 0;

    return (
        <div className="p-8 max-w-5xl mx-auto font-sans bg-white">

            {/* Header ISO Brutalista */}
            <div className="flex items-end justify-between mb-8 border-b-4 border-black pb-6">
                <div>
                    <h1 className="text-5xl font-black text-black uppercase tracking-tighter">ISO 14001</h1>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mt-2 bg-yellow-300 inline-block px-2 border-2 border-black">
                        Sistema de Gestión Ambiental
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-6xl font-black text-black leading-none">{totalPct}%</p>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Global</p>
                </div>
            </div>

            <div className="h-6 border-4 border-black bg-white w-full mb-10 shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="h-full bg-emerald-400 transition-all duration-500 relative" style={{ width: `${totalPct}%` }}>
                    {/* Textura de rayas en la barra */}
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)" }} />
                </div>
            </div>

            {/* Navegación de Capítulos */}
            <div className="flex flex-wrap gap-4 mb-8">
                {Object.entries(ISO_DATA).map(([sid]) => {
                    const p = secPct(sid);
                    return (
                        <button
                            key={sid}
                            onClick={() => setOpenSec(sid)}
                            className={`p-4 border-4 transition-all flex-1 min-w-[100px] flex flex-col items-center justify-center
                ${openSec === sid
                                    ? 'border-black bg-black text-white shadow-[4px_4px_0px_rgba(52,211,153,1)]'
                                    : 'border-black bg-white text-black hover:bg-gray-100 shadow-[4px_4px_0px_rgba(0,0,0,1)]'}`}
                        >
                            <p className={`text-2xl font-black ${openSec === sid ? 'text-emerald-400' : 'text-black'}`}>{p}%</p>
                            <p className="text-xs font-bold uppercase tracking-widest mt-1">CAP. {sid}</p>
                        </button>
                    );
                })}
            </div>

            {/* Contenido del Capítulo */}
            {Object.entries(ISO_DATA).map(([sid, sec]) => openSec !== sid ? null : (
                <div key={sid} className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_rgba(0,0,0,1)]">

                    <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-4">
                        <div>
                            <span className="text-xs font-black text-black bg-emerald-300 px-3 py-1 border-2 border-black uppercase tracking-widest">
                                Capítulo {sid}
                            </span>
                            <h3 className="text-2xl font-black text-black uppercase mt-3">{sec.nombre}</h3>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {sec.items.map(item => {
                            const checked = !!((secs[sid] || {})[item.id]);
                            return (
                                <label
                                    key={item.id}
                                    className={`flex items-start gap-4 p-4 border-4 transition-colors cursor-pointer group
                    ${checked ? 'border-emerald-500 bg-emerald-50' : 'border-black bg-white hover:bg-yellow-50'}`}
                                >
                                    <div
                                        onClick={(e) => { e.preventDefault(); toggle(sid, item.id); }}
                                        className={`w-8 h-8 border-4 flex items-center justify-center shrink-0 mt-0.5 transition-colors
                      ${checked ? 'border-emerald-600 bg-emerald-500 text-black' : 'border-black bg-white group-hover:bg-yellow-200'}`}
                                    >
                                        {checked && <Ic n="check" s={20} c="#000" strokeWidth="4" />}
                                    </div>
                                    <span className={`text-lg font-bold uppercase leading-tight pt-1 select-none ${checked ? 'text-emerald-900 line-through opacity-70' : 'text-black'}`}>
                                        {item.texto}
                                    </span>
                                </label>
                            );
                        })}
                    </div>

                    {/* Botones de Navegación */}
                    <div className="flex justify-between mt-10 pt-6 border-t-4 border-black">
                        {Number(sid) > 4 ? (
                            <button
                                onClick={() => setOpenSec(String(Number(sid) - 1))}
                                className="bg-white border-4 border-black px-6 py-3 font-black uppercase text-sm flex items-center gap-2 hover:bg-gray-100 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                            >
                                <Ic n="cl" s={16} /> Atrás
                            </button>
                        ) : <div />}

                        {Number(sid) < 10 && (
                            <button
                                onClick={() => setOpenSec(String(Number(sid) + 1))}
                                className="bg-black text-white border-4 border-black px-6 py-3 font-black uppercase text-sm flex items-center gap-2 hover:bg-gray-800 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                            >
                                Siguiente <Ic n="cr" s={16} />
                            </button>
                        )}
                    </div>
                </div>
            ))}

            {isSaving && (
                <div className="fixed bottom-6 right-6 bg-yellow-300 border-4 border-black px-4 py-2 font-black uppercase text-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                    <span className="w-2 h-2 bg-black rounded-full animate-ping" />
                    Guardando en BD...
                </div>
            )}
        </div>
    );
}

export default ConsultorPanel;