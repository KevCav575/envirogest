import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Cliente de BD
import { Ic, GIROS } from './constants';
import { Btn, Input, Select, Modal } from './ui';
import { fmtDate, today, giroLabel, giroColor } from './utils';

export function ConsultantHome({ currentUser, onEnterProject, onLogout }) {
    const [proyectos, setProyectos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [showNew, setShowNew] = useState(false);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ nombre: '', empresa: '', giro: GIROS[0]?.id || '', email: '', pwd: '', notas: '' });
    const [formError, setFormError] = useState('');
    const [tempPwd, setTempPwd] = useState('');
    const [confirmDel, setConfirmDel] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

    // 1. Arquitectura: Fetch de datos relacionales desde PostgreSQL
    const fetchProyectos = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('proyectos')
                .select(`
          *,
          cliente:cliente_id (*),
          tramites (*),
          alertas (*)
        `)
                .eq('consultor_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProyectos(data || []);
        } catch (err) {
            console.error("Error cargando proyectos:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProyectos();
    }, []);

    // Filtrado de búsqueda
    const proyectosFiltrados = proyectos.filter(p => {
        if (!search) return true;
        const term = search.toLowerCase();
        return (
            (p.cliente?.empresa || '').toLowerCase().includes(term) ||
            (p.cliente?.nombre || '').toLowerCase().includes(term)
        );
    });

    // Estadísticas dinámicas
    const stats = {
        clientes: proyectos.length,
        tramitesActivos: proyectos.reduce((a, p) => a + (p.tramites || []).filter(t => ['recopilando', 'ingresado', 'en_revision'].includes(t.estado)).length, 0),
        alertasSinLeer: proyectos.reduce((a, p) => a + (p.alertas || []).filter(al => !al.leido).length, 0),
        cumplidos: proyectos.reduce((a, p) => a + (p.tramites || []).filter(t => t.estado === 'cumplido').length, 0),
    };

    // 2. Seguridad: Creación conectada al backend
    const createClient = async () => {
        if (!form.nombre || !form.empresa || !form.giro || !form.email) {
            setFormError('Completa nombre, empresa, giro y email.');
            return;
        }

        const pwdToUse = form.pwd || Math.random().toString(36).slice(2, 10);
        setIsSubmitting(true);
        setFormError('');

        try {
            // NOTA: Para que esto funcione, debes agregar una ruta '/api/registro-consultor' 
            // en tu backend de Node.js que cree el usuario sin pedir confirmación de email (o mandando un email de bienvenida)
            const res = await fetch('http://localhost:3000/api/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: form.nombre,
                    empresa: form.empresa,
                    giro: form.giro,
                    email: form.email,
                    pwd: pwdToUse
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al crear cliente');

            // Obtenemos el ID del nuevo cliente (el backend debería devolverlo)
            // Si usas el endpoint de registro actual que no devuelve el ID, tendrías que buscarlo:
            const { data: newUser } = await supabase.from('usuarios').select('id').eq('email', form.email).single();

            if (newUser) {
                // Crear el proyecto vinculado en Supabase
                await supabase.from('proyectos').insert([{
                    cliente_id: newUser.id,
                    consultor_id: currentUser.id,
                    nombre: `Proyecto ${form.empresa}`,
                    iso14001: { secciones: { '4': {}, '5': {}, '6': {}, '7': {}, '8': {}, '9': {}, '10': {} } },
                    notas: form.notas
                }]);
            }

            setTempPwd(pwdToUse);
            fetchProyectos(); // Recargar la lista
        } catch (err) {
            setFormError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const deleteProject = async (pId) => {
        setIsSubmitting(true);
        try {
            // Gracias a "ON DELETE CASCADE" en SQL, esto borrará trámites y alertas automáticamente
            await supabase.from('proyectos').delete().eq('id', pId);
            setProyectos(prev => prev.filter(p => p.id !== pId));
        } catch (err) {
            console.error("Error eliminando proyecto:", err);
        } finally {
            setConfirmDel(null);
            setIsSubmitting(false);
        }
    };

    const getPctCompliance = (p) => {
        const t = p.tramites || [];
        if (!t.length) return null;
        return Math.round((t.filter(x => x.estado === 'cumplido').length / t.length) * 100);
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center font-black uppercase text-2xl">Cargando panel...</div>;
    }

    return (
        // 3. Diseño: Layout Principal Neo-Brutalista
        <div className="min-h-screen bg-white text-black font-sans">

            {/* ── HEADER ── */}
            <div className="bg-emerald-400 border-b-4 border-black px-8 py-8 relative overflow-hidden">
                {/* Decoraciones Memphis */}
                <div className="absolute top-4 right-20 w-16 h-16 bg-yellow-300 border-4 border-black rounded-full" />
                <div className="absolute -bottom-8 right-40 w-24 h-24 bg-blue-400 border-4 border-black rotate-12" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                <Ic n="leaf" s={28} c="#000" />
                            </div>
                            <div>
                                <p className="text-black font-black text-3xl uppercase tracking-tighter leading-none">EnviroGest MX</p>
                                <p className="text-black font-bold text-sm uppercase tracking-widest mt-1 bg-white inline-block px-2 border-2 border-black">
                                    Panel del Consultor
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                <p className="text-black font-black text-sm uppercase">{currentUser.nombre}</p>
                                <p className="text-gray-600 font-bold text-xs">{currentUser.email}</p>
                            </div>
                            <button
                                onClick={onLogout}
                                className="w-12 h-12 bg-red-400 hover:bg-red-500 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
                                title="Cerrar Sesión"
                            >
                                <Ic n="logout" s={20} c="#000" />
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-6 mt-10">
                        {[
                            { v: stats.clientes, l: 'Clientes activos', i: 'users', bg: 'bg-yellow-300' },
                            { v: stats.tramitesActivos, l: 'En proceso', i: 'file', bg: 'bg-white' },
                            { v: stats.cumplidos, l: 'Cumplidos', i: 'checkCircle', bg: 'bg-blue-300' },
                            { v: stats.alertasSinLeer, l: 'Alertas', i: 'bell', bg: 'bg-red-300' },
                        ].map(s => (
                            <div key={s.l} className={`${s.bg} border-4 border-black p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)]`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Ic n={s.i} s={16} c="#000" />
                                    <span className="text-black font-bold text-xs uppercase tracking-wider">{s.l}</span>
                                </div>
                                <p className="text-5xl font-black text-black leading-none">{s.v}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── CLIENT GRID ── */}
            <div className="px-8 py-10">
                <div className="flex items-center justify-between mb-8 border-b-4 border-black pb-4">
                    <h2 className="text-4xl font-black text-black uppercase tracking-tighter">Proyectos</h2>

                    <div className="flex gap-4">
                        <div className="relative">
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="BUSCAR CLIENTE..."
                                className="pl-10 pr-4 py-3 border-4 border-black text-sm font-bold uppercase focus:outline-none focus:bg-yellow-100 w-64 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-colors"
                            />
                            <Ic n="users" s={18} cls="absolute left-3 top-3.5 text-black" />
                        </div>

                        <button
                            onClick={() => { setShowNew(true); setTempPwd(''); setFormError(''); }}
                            className="bg-black text-white hover:bg-gray-800 border-4 border-black px-6 py-3 font-black uppercase text-sm flex items-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                        >
                            <Ic n="plus" s={16} /> Nuevo Cliente
                        </button>
                    </div>
                </div>

                {proyectosFiltrados.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-gray-300 bg-gray-50">
                        <Ic n="users" s={48} c="#9CA3AF" />
                        <p className="text-black font-black uppercase tracking-widest text-xl mt-4">Sin resultados</p>
                        <p className="text-gray-500 font-bold uppercase text-sm mt-1">No se encontraron clientes.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {proyectosFiltrados.map(p => {
                            const u = p.cliente;
                            if (!u) return null;

                            const pct = getPctCompliance(p);
                            const tramCount = (p.tramites || []).length;
                            const alertCount = (p.alertas || []).filter(a => !a.leido).length;
                            const gc = giroColor(u.giro); // Usamos la utilidad de color del giro

                            return (
                                <div
                                    key={p.id}
                                    className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex flex-col relative group"
                                    onClick={() => onEnterProject(p.id)}
                                >
                                    <div className="h-3 border-b-4 border-black w-full" style={{ background: gc }} />

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="font-black text-xl text-black leading-tight uppercase line-clamp-2">{u.empresa}</p>
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1 bg-gray-100 inline-block px-1 border border-black">{giroLabel(u.giro)}</p>
                                            </div>
                                            {alertCount > 0 && (
                                                <div className="bg-red-400 border-2 border-black w-10 h-10 flex items-center justify-center shadow-[2px_2px_0px_rgba(0,0,0,1)] rounded-full shrink-0">
                                                    <span className="font-black text-black text-sm">{alertCount}</span>
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
                                            <Ic n="user" s={14} /> {u.nombre}
                                        </p>

                                        <div className="flex gap-4 mb-6 mt-auto">
                                            <div className="flex-1 bg-gray-50 border-2 border-black p-2 text-center">
                                                <p className="text-2xl font-black text-black">{tramCount}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Trámites</p>
                                            </div>
                                            <div className="flex-1 bg-gray-50 border-2 border-black p-2 text-center">
                                                <p className={`text-2xl font-black ${alertCount > 0 ? 'text-red-600 animate-pulse' : 'text-black'}`}>{alertCount}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Alertas</p>
                                            </div>
                                        </div>

                                        {pct !== null && (
                                            <div className="mb-4 bg-gray-100 border-2 border-black p-2">
                                                <div className="flex justify-between text-xs font-black uppercase mb-2">
                                                    <span>Progreso ISO</span>
                                                    <span>{pct}%</span>
                                                </div>
                                                <div className="h-3 border-2 border-black bg-white w-full">
                                                    <div className="h-full bg-emerald-400" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Delete button (aparece en hover) */}
                                    <button
                                        onClick={e => { e.stopPropagation(); setConfirmDel(p.id); }}
                                        className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 w-8 h-8 bg-white hover:bg-red-500 hover:text-white border-2 border-black flex items-center justify-center transition-all"
                                        title="Eliminar cliente"
                                    >
                                        <Ic n="trash" s={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── MODALES ── */}
            {/* NOTA: Para que los modales coincidan con el diseño Neo-Brutalista, asegúrate de que 
        el componente `<Modal>` en `ui.jsx` tenga bordes negros gruesos y sombras sólidas.
      */}
            <Modal open={showNew} onClose={() => setShowNew(false)} title="NUEVO CLIENTE" width="max-w-xl">
                {tempPwd ? (
                    <div className="text-center py-6">
                        <div className="w-20 h-20 bg-emerald-400 border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0px_rgba(0,0,0,1)] rotate-3">
                            <Ic n="checkCircle" s={36} c="#000" />
                        </div>
                        <h3 className="font-black text-2xl uppercase text-black mb-2">Cliente Creado</h3>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Comparte estas credenciales:</p>

                        <div className="bg-yellow-100 border-4 border-black p-6 text-left mb-8 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                            <p className="text-xs font-black uppercase text-gray-500 mb-1">Email</p>
                            <p className="font-black text-black text-lg mb-4">{form.email}</p>

                            <p className="text-xs font-black uppercase text-gray-500 mb-1">Contraseña temporal</p>
                            <p className="font-mono font-black text-red-600 text-2xl bg-white border-2 border-black inline-block px-3 py-1">{tempPwd}</p>
                        </div>

                        <button
                            onClick={() => { setShowNew(false); setTempPwd(''); }}
                            className="bg-black text-white hover:bg-gray-800 border-4 border-black px-8 py-3 font-black uppercase text-sm shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                        >
                            Cerrar
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formError && (
                            <div className="p-3 bg-red-400 border-4 border-black text-black font-bold text-sm uppercase flex items-center gap-2">
                                <Ic n="alert" s={16} /> {formError}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-black">Responsable</label>
                                <input className="w-full border-4 border-black px-3 py-2 font-bold focus:bg-yellow-100 outline-none" value={form.nombre} onChange={e => setF('nombre', e.target.value)} required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase text-black">Empresa</label>
                                <input className="w-full border-4 border-black px-3 py-2 font-bold focus:bg-yellow-100 outline-none" value={form.empresa} onChange={e => setF('empresa', e.target.value)} required />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase text-black">Giro Industrial</label>
                            <select className="w-full border-4 border-black px-3 py-2 font-bold focus:bg-yellow-100 outline-none cursor-pointer bg-white" value={form.giro} onChange={e => setF('giro', e.target.value)} required>
                                {GIROS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase text-black">Correo</label>
                            <input type="email" className="w-full border-4 border-black px-3 py-2 font-bold focus:bg-yellow-100 outline-none" value={form.email} onChange={e => setF('email', e.target.value)} required />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase text-black">Contraseña (vacío = auto-generar)</label>
                            <input type="password" placeholder="Opcional" className="w-full border-4 border-black px-3 py-2 font-bold focus:bg-yellow-100 outline-none" value={form.pwd} onChange={e => setF('pwd', e.target.value)} />
                        </div>

                        <div className="flex justify-end gap-4 pt-4 mt-6 border-t-4 border-black">
                            <button
                                className="bg-white border-4 border-black px-6 py-2 font-black uppercase hover:bg-gray-100 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                                onClick={() => setShowNew(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={createClient}
                                disabled={isSubmitting}
                                className="bg-emerald-400 border-4 border-black px-6 py-2 font-black uppercase hover:bg-emerald-300 shadow-[4px_4px_0px_rgba(0,0,0,1)] disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting ? 'Creando...' : <><Ic n="plus" s={16} /> Confirmar</>}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="¡ADVERTENCIA!" width="max-w-sm">
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-red-400 border-4 border-black flex items-center justify-center mx-auto mb-4 shadow-[6px_6px_0px_rgba(0,0,0,1)]">
                        <Ic n="trash" s={28} c="#000" />
                    </div>
                    <p className="text-sm font-bold text-gray-800 uppercase mb-8 leading-relaxed">
                        ¿Estás seguro? Se borrará todo el historial del cliente. Esta acción es <span className="text-red-600 font-black">irreversible</span>.
                    </p>

                    <div className="flex gap-4 justify-center">
                        <button
                            className="bg-white border-4 border-black px-6 py-2 font-black uppercase hover:bg-gray-100 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                            onClick={() => setConfirmDel(null)}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => deleteProject(confirmDel)}
                            disabled={isSubmitting}
                            className="bg-red-500 text-white border-4 border-black px-6 py-2 font-black uppercase hover:bg-red-600 shadow-[4px_4px_0px_rgba(0,0,0,1)] disabled:opacity-50"
                        >
                            {isSubmitting ? 'Borrando...' : 'Destruir'}
                        </button>
                    </div>
                </div>
            </Modal>

        </div>
    );
}

export default ConsultantHome;