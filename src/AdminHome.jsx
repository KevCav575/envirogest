import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Ic, GIROS } from './constants';
import { Btn, Input, Select, Modal } from './ui';
import { today, giroLabel, giroColor } from './utils'; // Ya no importamos hashPwd ni uid

export function AdminHome({ currentUser, onEnterProject, onLogout }) {
    // Estados de datos
    const [usuarios, setUsuarios] = useState([]);
    const [proyectos, setProyectos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Estados de UI
    const [tab, setTab] = useState('clientes');
    const [showNewClient, setShowNewClient] = useState(false);
    const [showNewConsultor, setShowNewConsultor] = useState(false);
    const [confirmDel, setConfirmDel] = useState(null);
    const [tempCreds, setTempCreds] = useState(null);
    const [expandedConsultor, setExpandedConsultor] = useState(null);
    const [showMeeting, setShowMeeting] = useState(null);
    const [showInstr, setShowInstr] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [formErr, setFormErr] = useState('');
    const [meetLink, setMeetLink] = useState('');

    // Formularios
    const [clientForm, setClientForm] = useState({ nombre: '', empresa: '', giro: GIROS[0]?.id || '', email: '', pwd: '', consultor_id: '', notas: '' });
    const [consultorForm, setConsultorForm] = useState({ nombre: '', email: '', pwd: '' });
    const [meetForm, setMeetForm] = useState({ titulo: 'Reunión de seguimiento', fecha: '', hora: '10:00', duracion: '60', agenda: '', correo_extra: '' });
    const [instrForm, setInstrForm] = useState({ texto: '', urgente: false });

    const setC = (k, v) => setClientForm(f => ({ ...f, [k]: v }));
    const setCo = (k, v) => setConsultorForm(f => ({ ...f, [k]: v }));

    // 1. CARGA DE DATOS DESDE SUPABASE
    const refreshData = async () => {
        setIsLoading(true);
        try {
            const [usrRes, proyRes] = await Promise.all([
                supabase.from('usuarios').select('*'),
                supabase.from('proyectos').select('*, tramites(*), alertas(*), instrucciones_admin(*), reuniones(*)')
            ]);
            setUsuarios(usrRes.data || []);
            setProyectos(proyRes.data || []);
        } catch (err) {
            console.error("Error cargando datos de admin:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { refreshData(); }, []);

    // Derivados
    const clientes = usuarios.filter(u => u.rol === 'cliente');
    const consultores = usuarios.filter(u => u.rol === 'consultor');

    const stats = {
        clientes: clientes.length,
        consultores: consultores.length,
        proyectos: proyectos.length,
        tramitesActivos: proyectos.reduce((a, p) => a + (p.tramites || []).filter(t => ['recopilando', 'ingresado', 'en_revision'].includes(t.estado)).length, 0),
        alertasSinLeer: proyectos.reduce((a, p) => a + (p.alertas || []).filter(al => !al.leido).length, 0),
    };

    const getProyectoByCliente = (clientId) => proyectos.find(p => p.cliente_id === clientId);

    const getPct = (p) => {
        const t = p?.tramites || [];
        if (!t.length) return null;
        return Math.round(t.filter(x => x.estado === 'cumplido').length / t.length * 100);
    };

    const TRAM_ESTADO = {
        no_aplica: ['No aplica', '#000000'],
        recopilando: ['Recopilando', '#F59E0B'],
        ingresado: ['Ingresado', '#3B82F6'],
        en_revision: ['En revisión', '#8B5CF6'],
        resolucion: ['Resolución', '#06B6D4'],
        cumplido: ['Cumplido', '#10B981'],
        vencido: ['VENCIDO', '#EF4444'],
    };

    // GENERAR LINK GOOGLE CALENDAR
    const makeGCalLink = (titulo, fecha, hora, duracion, agenda, email) => {
        const pad = n => String(n).padStart(2, '0');
        const [y, m, d] = fecha.split('-');
        const [h, mi] = hora.split(':');
        const start = `${y}${m}${d}T${h}${mi}00`;
        const endMs = new Date(`${fecha}T${hora}:00`).getTime() + parseInt(duracion) * 60000;
        const ed = new Date(endMs);
        const end = `${ed.getFullYear()}${pad(ed.getMonth() + 1)}${pad(ed.getDate())}T${pad(ed.getHours())}${pad(ed.getMinutes())}00`;

        const p = new URLSearchParams({
            action: 'TEMPLATE', text: titulo, dates: `${start}/${end}`, details: agenda || 'Reunión de seguimiento ambiental · EnviroGest MX'
        });

        if (email) p.append('add', email);
        return `https://calendar.google.com/calendar/render?${p.toString()}`;
    };

    // 2. SEGURIDAD: CREACIÓN DE USUARIOS VÍA BACKEND
    const createClient = async () => {
        if (!clientForm.nombre || !clientForm.empresa || !clientForm.giro || !clientForm.email) {
            setFormErr('Completa nombre, empresa, giro y correo.'); return;
        }
        if (usuarios.find(u => u.email === clientForm.email)) {
            setFormErr('Ya existe una cuenta con ese correo.'); return;
        }

        setIsProcessing(true);
        setFormErr('');
        const pwd = clientForm.pwd || Math.random().toString(36).slice(2, 10);

        try {
            // Llamada al Backend para crear en Auth y en BD
            const res = await fetch('http://localhost:3000/api/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: clientForm.nombre, empresa: clientForm.empresa, giro: clientForm.giro, email: clientForm.email, pwd, rol: 'cliente' })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al crear cliente');

            // Buscar el ID del cliente recién creado
            const { data: newUser } = await supabase.from('usuarios').select('id').eq('email', clientForm.email).single();

            if (newUser) {
                // Crear el proyecto vinculado
                await supabase.from('proyectos').insert([{
                    cliente_id: newUser.id,
                    consultor_id: clientForm.consultor_id || null,
                    notas: clientForm.notas,
                    iso14001: { secciones: { '4': {}, '5': {}, '6': {}, '7': {}, '8': {}, '9': {}, '10': {} } }
                }]);
            }

            await refreshData();
            setTempCreds({ email: clientForm.email, pwd, tipo: 'cliente' });
            setClientForm({ nombre: '', empresa: '', giro: GIROS[0]?.id || '', email: '', pwd: '', consultor_id: '', notas: '' });
        } catch (err) {
            setFormErr(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const createConsultor = async () => {
        if (!consultorForm.nombre || !consultorForm.email || !consultorForm.pwd) {
            setFormErr('Completa todos los campos.'); return;
        }
        if (consultorForm.pwd.length < 6) {
            setFormErr('Contraseña mínimo 6 caracteres.'); return;
        }
        if (usuarios.find(u => u.email === consultorForm.email)) {
            setFormErr('Ya existe una cuenta con ese correo.'); return;
        }

        setIsProcessing(true);
        setFormErr('');

        try {
            // Llamada al Backend para crear Consultor (REQUIERE ACTUALIZAR req.body.rol EN server.js)
            const res = await fetch('http://localhost:3000/api/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: consultorForm.nombre, empresa: 'BIOIMPACT', giro: 'otro', email: consultorForm.email, pwd: consultorForm.pwd, rol: 'consultor' })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al crear consultor');

            await refreshData();
            setTempCreds({ email: consultorForm.email, pwd: consultorForm.pwd, tipo: 'consultor' });
            setConsultorForm({ nombre: '', email: '', pwd: '' });
        } catch (err) {
            setFormErr(err.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const deleteEntry = async (type, id) => {
        setIsProcessing(true);
        try {
            if (type === 'consultor') {
                await supabase.from('proyectos').update({ consultor_id: null }).eq('consultor_id', id);
            }
            await supabase.from('usuarios').delete().eq('id', id);
            await refreshData();
        } catch (err) {
            console.error("Error al eliminar:", err);
        } finally {
            setConfirmDel(null);
            setIsProcessing(false);
        }
    };

    const assignConsultor = async (proyId, cid) => {
        setIsProcessing(true);
        await supabase.from('proyectos').update({ consultor_id: cid || null }).eq('id', proyId);
        await refreshData();
        setIsProcessing(false);
    };

    const saveMeeting = async () => {
        if (!meetForm.titulo || !meetForm.fecha || isProcessing) return;
        setIsProcessing(true);

        const c = showMeeting;
        const link = makeGCalLink(meetForm.titulo, meetForm.fecha, meetForm.hora, meetForm.duracion, meetForm.agenda, c.email);
        setMeetLink(link);

        if (c.proyId) {
            await supabase.from('reuniones').insert([{
                proyecto_id: c.proyId, titulo: meetForm.titulo, fecha: meetForm.fecha, hora: meetForm.hora,
                duracion: parseInt(meetForm.duracion), agenda: meetForm.agenda, gcal_link: link
            }]);
            await refreshData();
        }
        setIsProcessing(false);
    };

    const saveInstr = async () => {
        if (!instrForm.texto.trim() || isProcessing) return;
        setIsProcessing(true);

        await supabase.from('instrucciones_admin').insert([{
            proyecto_id: showInstr.proyId, texto: instrForm.texto, urgente: instrForm.urgente, fecha: today(), leido: false
        }]);

        await refreshData();
        setInstrForm({ texto: '', urgente: false });
        setShowInstr(null);
        setIsProcessing(false);
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center font-black uppercase text-2xl bg-white">Cargando Admin...</div>;
    }

    return (
        // 3. DISEÑO NEO-BRUTALISTA APLICADO
        <div className="min-h-screen bg-white text-black font-sans selection:bg-blue-300 pb-20">

            {/* Header Admin */}
            <div className="bg-blue-600 border-b-4 border-black px-8 py-8 relative overflow-hidden">
                <div className="absolute top-4 right-20 w-16 h-16 bg-yellow-300 border-4 border-black rounded-full" />
                <div className="absolute -bottom-8 right-40 w-24 h-24 bg-emerald-400 border-4 border-black rotate-12" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                <Ic n="shield" s={28} c="#000" />
                            </div>
                            <div>
                                <p className="text-white font-black text-3xl uppercase tracking-tighter leading-none drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">EnviroGest MX</p>
                                <p className="text-black font-bold text-sm uppercase tracking-widest mt-1 bg-white inline-block px-2 border-2 border-black">
                                    Panel de Administración
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right bg-white border-4 border-black px-4 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                                <p className="text-black font-black text-sm uppercase">{currentUser.nombre}</p>
                                <p className="text-gray-600 font-bold text-xs uppercase tracking-widest">Administrador</p>
                            </div>
                            <button
                                onClick={onLogout}
                                className="w-12 h-12 bg-red-400 hover:bg-red-500 border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                <Ic n="logout" s={20} c="#000" />
                            </button>
                        </div>
                    </div>

                    {/* Stats Gigsntes */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-10">
                        {[
                            { v: stats.clientes, l: 'Clientes', bg: 'bg-yellow-300' },
                            { v: stats.consultores, l: 'Consultores', bg: 'bg-white' },
                            { v: stats.proyectos, l: 'Proyectos', bg: 'bg-emerald-300' },
                            { v: stats.tramitesActivos, l: 'Trám. Activos', bg: 'bg-pink-300' },
                            { v: stats.alertasSinLeer, l: 'Alertas', bg: 'bg-red-400' },
                        ].map(s => (
                            <div key={s.l} className={`${s.bg} border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]`}>
                                <p className="text-xs font-black uppercase tracking-widest text-black mb-1">{s.l}</p>
                                <p className="text-4xl font-black text-black leading-none">{s.v}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs y Contenido */}
            <div className="px-8 mt-10 max-w-7xl mx-auto">

                <div className="flex gap-2 mb-8 bg-gray-100 p-2 border-4 border-black w-fit shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    {[{ id: 'clientes', l: 'Clientes', i: 'building' }, { id: 'consultores', l: 'Consultores', i: 'users' }].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`px-6 py-2 text-sm font-black uppercase tracking-wider transition-all border-2 flex items-center gap-2
                                ${tab === t.id
                                    ? 'bg-black text-white border-black shadow-[2px_2px_0px_rgba(59,130,246,1)]'
                                    : 'bg-white text-black border-black hover:bg-gray-200'}`}
                        >
                            <Ic n={t.i} s={16} c={tab === t.id ? '#FFF' : '#000'} /> {t.l}
                        </button>
                    ))}
                </div>

                {/* ── CLIENTES TAB ── */}
                {tab === 'clientes' && (
                    <div className="fade-in">
                        <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-4">
                            <h2 className="text-4xl font-black text-black uppercase tracking-tighter">Directorio de Clientes</h2>
                            <Btn onClick={() => { setShowNewClient(true); setTempCreds(null); setFormErr(''); }}>
                                <Ic n="plus" s={16} /> Nuevo Cliente
                            </Btn>
                        </div>

                        {clientes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-gray-300 bg-gray-50">
                                <Ic n="building" s={48} c="#9CA3AF" />
                                <p className="text-black font-black uppercase tracking-widest text-xl mt-4">Sin clientes</p>
                            </div>
                        ) : (
                            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-yellow-300 border-b-4 border-black">
                                            {['Empresa', 'Contacto', 'Giro', 'Consultor Asignado', 'ISO', 'Acciones'].map(h => (
                                                <th key={h} className="p-4 font-black uppercase text-sm border-r-4 border-black last:border-0">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-4 divide-black">
                                        {clientes.map(u => {
                                            const proj = getProyectoByCliente(u.id);
                                            const pct = proj ? getPct(proj) : null;
                                            const gc = giroColor(u.giro);
                                            return (
                                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4 border-r-4 border-black">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 border-2 border-black flex items-center justify-center font-black text-sm" style={{ background: gc }}>
                                                                {u.empresa.slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-black uppercase text-black">{u.empresa}</p>
                                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 border-r-4 border-black font-bold uppercase text-sm">{u.nombre}</td>
                                                    <td className="p-4 border-r-4 border-black">
                                                        <span className="text-[10px] font-black uppercase px-2 py-1 border-2 border-black whitespace-nowrap" style={{ background: gc }}>
                                                            {giroLabel(u.giro)}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 border-r-4 border-black">
                                                        {proj ? (
                                                            <select
                                                                value={proj.consultor_id || ''}
                                                                onChange={e => assignConsultor(proj.id, e.target.value)}
                                                                disabled={isProcessing}
                                                                className="w-full text-xs font-bold uppercase border-2 border-black p-2 bg-white outline-none focus:bg-yellow-100 cursor-pointer"
                                                            >
                                                                <option value="">-- Sin Asignar --</option>
                                                                {consultores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                                            </select>
                                                        ) : <span className="text-xs font-bold text-red-500 uppercase">Sin proyecto</span>}
                                                    </td>
                                                    <td className="p-4 border-r-4 border-black text-center font-black text-lg">
                                                        {pct !== null ? `${pct}%` : '---'}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex gap-2">
                                                            {proj && (
                                                                <button onClick={() => onEnterProject(proj.id)} className="w-8 h-8 bg-blue-300 border-2 border-black flex items-center justify-center hover:bg-blue-400 transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none" title="Entrar">
                                                                    <Ic n="eye" s={14} />
                                                                </button>
                                                            )}
                                                            <button onClick={() => setConfirmDel({ type: 'cliente', id: u.id, name: u.empresa })} className="w-8 h-8 bg-white hover:bg-red-500 hover:text-white border-2 border-black flex items-center justify-center transition-colors shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none" title="Eliminar">
                                                                <Ic n="trash" s={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ── CONSULTORES TAB ── */}
                {tab === 'consultores' && (
                    <div className="fade-in">
                        <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-4">
                            <h2 className="text-4xl font-black text-black uppercase tracking-tighter">Equipo de Consultores</h2>
                            <Btn onClick={() => { setShowNewConsultor(true); setTempCreds(null); setFormErr(''); }}>
                                <Ic n="plus" s={16} /> Nuevo Consultor
                            </Btn>
                        </div>

                        {consultores.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 border-4 border-dashed border-gray-300 bg-gray-50">
                                <Ic n="users" s={48} c="#9CA3AF" />
                                <p className="text-black font-black uppercase tracking-widest text-xl mt-4">Sin consultores</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {consultores.map(c => {
                                    const misProyectos = proyectos.filter(p => p.consultor_id === c.id);
                                    const isOpen = expandedConsultor === c.id;

                                    return (
                                        <div key={c.id} className="bg-white border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
                                            {/* Cabecera del Consultor */}
                                            <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-yellow-50" onClick={() => setExpandedConsultor(isOpen ? null : c.id)}>
                                                <div className="w-12 h-12 border-4 border-black bg-blue-300 flex items-center justify-center font-black text-xl">
                                                    {c.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-black uppercase text-lg leading-tight">{c.nombre}</p>
                                                    <p className="text-xs font-bold text-gray-500 tracking-widest">{c.email}</p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs font-black uppercase border-2 border-black px-2 py-1 bg-emerald-200">
                                                        {misProyectos.length} Clientes
                                                    </span>
                                                    <button onClick={e => { e.stopPropagation(); setConfirmDel({ type: 'consultor', id: c.id, name: c.nombre }); }} className="w-8 h-8 bg-white hover:bg-red-500 hover:text-white border-2 border-black flex items-center justify-center transition-colors">
                                                        <Ic n="trash" s={14} />
                                                    </button>
                                                    <Ic n={isOpen ? 'cd' : 'cr'} s={20} strokeWidth="3" />
                                                </div>
                                            </div>

                                            {/* Panel Expandido (Clientes asignados) */}
                                            {isOpen && (
                                                <div className="border-t-4 border-black bg-gray-50 p-4">
                                                    {misProyectos.length === 0 ? (
                                                        <p className="text-sm font-bold uppercase text-gray-500 text-center py-4">Sin clientes asignados.</p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {misProyectos.map(proj => {
                                                                const cliUser = usuarios.find(u => u.id === proj.cliente_id);
                                                                if (!cliUser) return null;
                                                                return (
                                                                    <div key={proj.id} className="flex items-center justify-between p-3 border-2 border-black bg-white">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="w-3 h-3 border-2 border-black" style={{ background: giroColor(cliUser.giro) }} />
                                                                            <p className="font-black uppercase text-sm">{cliUser.empresa}</p>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <button onClick={() => { setShowInstr({ proyId: proj.id, empresa: cliUser.empresa }); setInstrForm({ texto: '', urgente: false }); }} className="bg-emerald-300 hover:bg-emerald-400 text-black border-2 border-black px-3 py-1 font-black uppercase text-[10px] flex items-center gap-1">
                                                                                <Ic n="send" s={12} /> Instrucción
                                                                            </button>
                                                                            <button onClick={() => { setShowMeeting({ consultorId: c.id, email: c.email, proyId: proj.id }); setMeetLink(''); setMeetForm({ titulo: `Reunión con ${c.nombre}`, fecha: '', hora: '10:00', duracion: '60', agenda: '', correo_extra: '' }); }} className="bg-blue-300 hover:bg-blue-400 text-black border-2 border-black px-3 py-1 font-black uppercase text-[10px] flex items-center gap-1">
                                                                                <Ic n="calendar" s={12} /> Reunión
                                                                            </button>
                                                                            <button onClick={() => onEnterProject(proj.id)} className="bg-gray-200 hover:bg-gray-300 text-black border-2 border-black px-3 py-1 font-black uppercase text-[10px] flex items-center gap-1">
                                                                                Entrar <Ic n="cr" s={12} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── MODALES ── */}
            <Modal open={showNewClient} onClose={() => setShowNewClient(false)} title="NUEVO CLIENTE" width="max-w-xl">
                {tempCreds && tempCreds.tipo === 'cliente' ? (
                    <div className="text-center py-6">
                        <div className="w-20 h-20 bg-emerald-400 border-4 border-black flex items-center justify-center mx-auto mb-6 rotate-3">
                            <Ic n="checkCircle" s={36} strokeWidth="3" />
                        </div>
                        <h3 className="font-black text-2xl uppercase mb-2">Cliente Creado</h3>
                        <div className="bg-yellow-100 border-4 border-black p-6 text-left mb-6">
                            <p className="text-xs font-black uppercase">Email</p>
                            <p className="font-black text-lg mb-4">{tempCreds.email}</p>
                            <p className="text-xs font-black uppercase">Contraseña Temporal</p>
                            <p className="font-mono font-black text-red-600 text-2xl bg-white border-2 border-black px-2 py-1 inline-block">{tempCreds.pwd}</p>
                        </div>
                        <Btn onClick={() => { setShowNewClient(false); setTempCreds(null); }}>Cerrar</Btn>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formErr && <div className="p-3 bg-red-400 border-4 border-black font-black uppercase text-sm">{formErr}</div>}
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Responsable" value={clientForm.nombre} onChange={v => setC('nombre', v)} placeholder="Nombre..." required />
                            <Input label="Empresa" value={clientForm.empresa} onChange={v => setC('empresa', v)} placeholder="ACME S.A." required />
                        </div>
                        <Select label="Giro industrial" value={clientForm.giro} onChange={v => setC('giro', v)} options={GIROS.map(g => ({ value: g.id, label: g.label }))} required />
                        <Input label="Correo" value={clientForm.email} onChange={v => setC('email', v)} type="email" required />
                        <Input label="Contraseña (vacío = autogenerar)" value={clientForm.pwd} onChange={v => setC('pwd', v)} type="password" />
                        <Select label="Asignar consultor" value={clientForm.consultor_id} onChange={v => setC('consultor_id', v)} options={consultores.map(c => ({ value: c.id, label: c.nombre }))} />
                        <div className="flex justify-end gap-2 pt-4 mt-6 border-t-4 border-black">
                            <Btn variant="secondary" onClick={() => setShowNewClient(false)}>Cancelar</Btn>
                            <Btn onClick={createClient} disabled={isProcessing}>{isProcessing ? 'Guardando...' : 'Confirmar'}</Btn>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal open={showNewConsultor} onClose={() => setShowNewConsultor(false)} title="NUEVO CONSULTOR" width="max-w-md">
                {tempCreds && tempCreds.tipo === 'consultor' ? (
                    <div className="text-center py-6">
                        <div className="w-20 h-20 bg-blue-400 border-4 border-black flex items-center justify-center mx-auto mb-6">
                            <Ic n="checkCircle" s={36} strokeWidth="3" />
                        </div>
                        <h3 className="font-black text-2xl uppercase mb-4">Consultor Listo</h3>
                        <div className="bg-yellow-100 border-4 border-black p-4 text-left mb-6">
                            <p className="font-black">{tempCreds.email}</p>
                            <p className="font-mono text-red-600 font-black text-xl">{tempCreds.pwd}</p>
                        </div>
                        <Btn onClick={() => { setShowNewConsultor(false); setTempCreds(null); }}>Cerrar</Btn>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formErr && <div className="p-3 bg-red-400 border-4 border-black font-black uppercase text-sm">{formErr}</div>}
                        <Input label="Nombre" value={consultorForm.nombre} onChange={v => setCo('nombre', v)} required />
                        <Input label="Correo" value={consultorForm.email} onChange={v => setCo('email', v)} type="email" required />
                        <Input label="Contraseña" value={consultorForm.pwd} onChange={v => setCo('pwd', v)} type="password" required />
                        <div className="flex justify-end gap-2 mt-6">
                            <Btn variant="secondary" onClick={() => setShowNewConsultor(false)}>Cancelar</Btn>
                            <Btn onClick={createConsultor} disabled={isProcessing}>{isProcessing ? 'Creando...' : 'Crear'}</Btn>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="¡ADVERTENCIA!" width="max-w-sm">
                <div className="text-center py-4">
                    <div className="w-20 h-20 bg-red-500 border-4 border-black flex items-center justify-center mx-auto mb-4">
                        <Ic n="trash" s={36} c="#000" strokeWidth="3" />
                    </div>
                    <p className="text-lg font-black uppercase mb-6 leading-tight">¿Eliminar {confirmDel?.name}?</p>
                    <div className="flex gap-4 justify-center">
                        <Btn variant="secondary" onClick={() => setConfirmDel(null)}>Cancelar</Btn>
                        <Btn variant="danger" onClick={() => deleteEntry(confirmDel.type, confirmDel.id)} disabled={isProcessing}>Eliminar</Btn>
                    </div>
                </div>
            </Modal>

            <Modal open={!!showInstr} onClose={() => setShowInstr(null)} title="ENVIAR INSTRUCCIÓN" width="max-w-md">
                <div className="space-y-6">
                    <div>
                        <label className="text-xs font-black uppercase text-black block mb-2">Mensaje *</label>
                        <textarea value={instrForm.texto} onChange={e => setInstrForm(f => ({ ...f, texto: e.target.value }))} rows={4} className="w-full border-4 border-black px-4 py-3 font-bold text-sm focus:outline-none focus:bg-yellow-100 resize-none" />
                    </div>
                    <label className={`flex items-center gap-4 p-4 border-4 cursor-pointer transition-colors ${instrForm.urgente ? 'border-red-600 bg-red-100' : 'border-black bg-white hover:bg-gray-100'}`}>
                        <input type="checkbox" checked={instrForm.urgente} onChange={e => setInstrForm(f => ({ ...f, urgente: e.target.checked }))} className="w-6 h-6" />
                        <span className="font-black uppercase text-lg">MARCAR COMO URGENTE</span>
                    </label>
                    <Btn onClick={saveInstr} disabled={isProcessing} className="w-full">Enviar Instrucción</Btn>
                </div>
            </Modal>

            <Modal open={!!showMeeting} onClose={() => { setShowMeeting(null); setMeetLink(''); }} title="AGENDAR REUNIÓN" width="max-w-lg">
                {meetLink ? (
                    <div className="text-center py-6">
                        <a href={meetLink} target="_blank" rel="noopener noreferrer" className="inline-flex bg-blue-600 text-white border-4 border-black px-8 py-4 font-black uppercase hover:bg-blue-700 shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all mb-4">
                            ABRIR GOOGLE CALENDAR →
                        </a>
                        <p className="text-xs font-bold uppercase text-gray-500 mt-4">Haz clic en Guardar en Google Calendar para confirmar.</p>
                        <div className="mt-8 border-t-4 border-black pt-6">
                            <Btn onClick={() => { setShowMeeting(null); setMeetLink(''); }} variant="secondary">Cerrar</Btn>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Input label="Título" value={meetForm.titulo} onChange={v => setMeetForm(f => ({ ...f, titulo: v }))} required />
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Fecha *" value={meetForm.fecha} onChange={v => setMeetForm(f => ({ ...f, fecha: v }))} type="date" required />
                            <Input label="Hora" value={meetForm.hora} onChange={v => setMeetForm(f => ({ ...f, hora: v }))} type="time" />
                        </div>
                        <Select label="Duración (Min)" value={meetForm.duracion} onChange={v => setMeetForm(f => ({ ...f, duracion: v }))} options={[{ value: '30', label: '30' }, { value: '60', label: '60' }, { value: '90', label: '90' }]} />
                        <Btn onClick={saveMeeting} disabled={isProcessing} className="w-full mt-4">Generar Link</Btn>
                    </div>
                )}
            </Modal>

        </div>
    );
}

export default AdminHome;