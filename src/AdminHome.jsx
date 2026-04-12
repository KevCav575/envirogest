import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Ic, GIROS } from './constants';
import { Btn, Input, Select, Modal } from './ui';
import { hashPwd, uid, fmtDate, today, giroLabel, giroColor } from './utils';

export function AdminHome({ data, refreshData, currentUser, onEnterProject, onLogout }) {
    const [tab, setTab] = useState('clientes');
    const [showNewClient, setShowNewClient] = useState(false);
    const [showNewConsultor, setShowNewConsultor] = useState(false);
    const [confirmDel, setConfirmDel] = useState(null);
    const [tempCreds, setTempCreds] = useState(null);
    const [clientForm, setClientForm] = useState({ nombre: '', empresa: '', giro: '', email: '', pwd: '', consultor_id: '', notas: '' });
    const [consultorForm, setConsultorForm] = useState({ nombre: '', email: '', pwd: '' });
    const [formErr, setFormErr] = useState('');
    const [expandedConsultor, setExpandedConsultor] = useState(null);
    const [showMeeting, setShowMeeting] = useState(null);
    const [showInstr, setShowInstr] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [meetForm, setMeetForm] = useState({
        titulo: 'Reunión de seguimiento', fecha: '', hora: '10:00', duracion: '60', agenda: '', correo_extra: ''
    });

    const [instrForm, setInstrForm] = useState({ texto: '', urgente: false });
    const [meetLink, setMeetLink] = useState('');

    const setC = (k, v) => setClientForm(f => ({ ...f, [k]: v }));
    const setCo = (k, v) => setConsultorForm(f => ({ ...f, [k]: v }));

    const clientes = data.usuarios.filter(u => u.rol === 'cliente');
    const consultores = data.usuarios.filter(u => u.rol === 'consultor');

    const stats = {
        clientes: clientes.length,
        consultores: consultores.length,
        proyectos: data.proyectos.length,
        tramitesActivos: data.proyectos.reduce((a, p) => a + (p.tramites || []).filter(t => ['recopilando', 'ingresado', 'en_revision'].includes(t.estado)).length, 0),
        alertasSinLeer: data.proyectos.reduce((a, p) => a + (p.alertas || []).filter(al => !al.leido).length, 0),
    };

    const getProyectoByCliente = (clientId) => data.proyectos.find(p => p.cliente_id === clientId);

    const getPct = (p) => {
        const t = p?.tramites || [];
        if (!t.length) return null;
        return Math.round(t.filter(x => x.estado === 'cumplido').length / t.length * 100);
    };

    const TRAM_ESTADO = {
        no_aplica: ['No aplica', '#9CA3AF'],
        recopilando: ['Recopilando docs', '#F59E0B'],
        ingresado: ['Ingresado', '#3B82F6'],
        en_revision: ['En revisión', '#8B5CF6'],
        resolucion: ['Resolución', '#06B6D4'],
        cumplido: ['Cumplido', '#10B981'],
        vencido: ['VENCIDO', '#EF4444'],
    };

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

    const saveMeeting = async () => {
        if (!meetForm.titulo || !meetForm.fecha || isProcessing) return;
        setIsProcessing(true);

        const c = showMeeting;
        const link = makeGCalLink(meetForm.titulo, meetForm.fecha, meetForm.hora, meetForm.duracion, meetForm.agenda, c.email);
        setMeetLink(link);

        if (c.proyId) {
            const { error } = await supabase.from('reuniones').insert([{
                proyecto_id: c.proyId,
                titulo: meetForm.titulo,
                fecha: meetForm.fecha,
                hora: meetForm.hora,
                duracion: meetForm.duracion,
                agenda: meetForm.agenda,
                gcal_link: link,
                creado: today()
            }]);

            if (!error) await refreshData();
            else console.error("Error al agendar reunión:", error);
        }
        setIsProcessing(false);
    };

    const saveInstr = async () => {
        if (!instrForm.texto.trim() || isProcessing) return;
        setIsProcessing(true);

        const { error } = await supabase.from('instrucciones_admin').insert([{
            proyecto_id: showInstr.proyId,
            texto: instrForm.texto,
            urgente: instrForm.urgente,
            fecha: today(),
            leido: false
        }]);

        if (!error) {
            await refreshData();
            setInstrForm({ texto: '', urgente: false });
            setShowInstr(null);
        } else {
            console.error("Error guardando instrucción:", error);
        }
        setIsProcessing(false);
    };

    const assignConsultor = async (proyId, cid) => {
        const { error } = await supabase.from('proyectos')
            .update({ consultor_id: cid || null })
            .eq('id', proyId);

        if (!error) await refreshData();
    };

    const createClient = async () => {
        if (!clientForm.nombre || !clientForm.empresa || !clientForm.giro || !clientForm.email) {
            setFormErr('Completa nombre, empresa, giro y correo.'); return;
        }
        if (data.usuarios.find(u => u.email === clientForm.email)) {
            setFormErr('Ya existe una cuenta con ese correo.'); return;
        }

        setIsProcessing(true);
        const pwd = clientForm.pwd || Math.random().toString(36).slice(2, 10);

        const { data: newUser, error: userError } = await supabase.from('usuarios').insert([{
            nombre: clientForm.nombre,
            empresa: clientForm.empresa,
            giro: clientForm.giro,
            email: clientForm.email,
            pwd_hash: hashPwd(pwd),
            rol: 'cliente'
        }]).select().single();

        if (userError) {
            setFormErr('Error al crear el usuario en Supabase.');
            setIsProcessing(false);
            return;
        }

        const { error: projError } = await supabase.from('proyectos').insert([{
            cliente_id: newUser.id,
            consultor_id: clientForm.consultor_id || null,
            creado: today(),
            notas: clientForm.notas,
            cuestionario: { respondido: false, respuestas: {}, fecha: null },
            iso14001: { secciones: { '4': {}, '5': {}, '6': {}, '7': {}, '8': {}, '9': {}, '10': {} } }
        }]);

        if (projError) {
            setFormErr('Usuario creado, pero hubo un error con su proyecto.');
        } else {
            await refreshData();
            setTempCreds({ email: clientForm.email, pwd, tipo: 'cliente' });
            setClientForm({ nombre: '', empresa: '', giro: '', email: '', pwd: '', consultor_id: '', notas: '' });
            setFormErr('');
        }
        setIsProcessing(false);
    };

    const createConsultor = async () => {
        if (!consultorForm.nombre || !consultorForm.email || !consultorForm.pwd) {
            setFormErr('Completa todos los campos.'); return;
        }
        if (consultorForm.pwd.length < 6) {
            setFormErr('Contraseña mínimo 6 caracteres.'); return;
        }
        if (data.usuarios.find(u => u.email === consultorForm.email)) {
            setFormErr('Ya existe una cuenta con ese correo.'); return;
        }

        setIsProcessing(true);

        const { error } = await supabase.from('usuarios').insert([{
            nombre: consultorForm.nombre,
            empresa: 'BIOIMPACT',
            email: consultorForm.email,
            pwd_hash: hashPwd(consultorForm.pwd),
            rol: 'consultor'
        }]);

        if (error) {
            setFormErr('Error al crear el consultor.');
        } else {
            await refreshData();
            setTempCreds({ email: consultorForm.email, pwd: consultorForm.pwd, tipo: 'consultor' });
            setConsultorForm({ nombre: '', email: '', pwd: '' });
            setFormErr('');
        }
        setIsProcessing(false);
    };

    const deleteEntry = async (type, id) => {
        setIsProcessing(true);
        if (type === 'cliente') {
            await supabase.from('usuarios').delete().eq('id', id);
        } else {
            await supabase.from('proyectos').update({ consultor_id: null }).eq('consultor_id', id);
            await supabase.from('usuarios').delete().eq('id', id);
        }
        await refreshData();
        setConfirmDel(null);
        setIsProcessing(false);
    };

    return (
        <div className="min-h-screen" style={{ background: '#F0FDF4' }}>
            {/* Header */}
            <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0a1628 0%,#14532d 50%,#1e40af 100%)' }}>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }} />

                <div className="relative px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                                <Ic n="shield" s={22} c="white" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg">EnviroGest MX</p>
                                <p className="text-blue-200 text-xs">BIOIMPACT · Panel de Administración</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-white font-medium text-sm">{currentUser.nombre}</p>
                                <p className="text-blue-200 text-xs">Administrador</p>
                            </div>
                            <button onClick={onLogout} className="p-2 rounded-lg text-white/70 hover:text-white" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                <Ic n="logout" s={16} />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4 mt-6">
                        {[
                            { v: stats.clientes, l: 'Clientes', i: 'building' },
                            { v: stats.consultores, l: 'Consultores', i: 'users' },
                            { v: stats.proyectos, l: 'Proyectos', i: 'file' },
                            { v: stats.tramitesActivos, l: 'Trámites activos', i: 'list' },
                            { v: stats.alertasSinLeer, l: 'Alertas sin leer', i: 'bell' },
                        ].map(s => (
                            <div key={s.l} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Ic n={s.i} s={13} c="rgba(255,255,255,0.6)" />
                                    <span className="text-xs" style={{ color: 'rgba(219,234,254,0.8)' }}>{s.l}</span>
                                </div>
                                <p className="text-3xl font-bold text-white">{s.v}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-8 pt-6">
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
                    {[{ id: 'clientes', l: 'Clientes', i: 'building' }, { id: 'consultores', l: 'Consultores', i: 'users' }].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                            style={{
                                background: tab === t.id ? 'white' : 'transparent',
                                color: tab === t.id ? '#14532d' : '#6b7280',
                                boxShadow: tab === t.id ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
                            }}>
                            <Ic n={t.i} s={15} c={tab === t.id ? '#14532d' : '#9ca3af'} />{t.l}
                        </button>
                    ))}
                </div>

                {/* ── CLIENTES TAB ── */}
                {tab === 'clientes' && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Clientes registrados</h2>
                            <Btn onClick={() => { setShowNewClient(true); setTempCreds(null); setFormErr(''); }}>
                                <Ic n="plus" s={14} />Nuevo cliente
                            </Btn>
                        </div>

                        {clientes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                    <Ic n="building" s={28} c="#166534" />
                                </div>
                                <p className="text-lg font-semibold text-gray-600">Sin clientes registrados</p>
                                <p className="text-sm text-gray-400 mt-1">Crea el primer cliente para asignarle un proyecto</p>
                                <Btn className="mt-4" onClick={() => setShowNewClient(true)}><Ic n="plus" s={14} />Agregar cliente</Btn>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                                <table className="w-full">
                                    <thead>
                                        <tr style={{ background: '#f9fafb' }}>
                                            {['Empresa', 'Contacto', 'Giro', 'Consultor asignado', 'Cumplimiento', 'Acciones'].map(h => (
                                                <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clientes.map(u => {
                                            const proj = getProyectoByCliente(u.id);
                                            const pct = proj ? getPct(proj) : null;
                                            const gc = giroColor(u.giro);
                                            return (
                                                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: gc }}>
                                                                {u.empresa.slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900 text-sm">{u.empresa}</p>
                                                                <p className="text-xs text-gray-400">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-sm text-gray-700">{u.nombre}</td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: gc + '22', color: gc }}>
                                                            {giroLabel(u.giro)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        {proj ? (
                                                            <select
                                                                value={proj.consultor_id || ''}
                                                                onChange={e => assignConsultor(proj.id, e.target.value)}
                                                                disabled={isProcessing}
                                                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-700 bg-white">
                                                                <option value="">Sin asignar</option>
                                                                {consultores.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                                            </select>
                                                        ) : <span className="text-xs text-gray-400">Sin proyecto</span>}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        {pct !== null ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-20 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                                                                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? '#10B981' : pct > 50 ? '#3B82F6' : '#F59E0B' }} />
                                                                </div>
                                                                <span className="text-xs font-medium text-gray-600">{pct}%</span>
                                                            </div>
                                                        ) : <span className="text-xs text-gray-400">{proj ? 'Sin trámites' : '---'}</span>}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-1">
                                                            {proj && <button onClick={() => onEnterProject(proj.id)} className="p-1.5 hover:bg-green-50 rounded-lg text-green-700 text-xs font-medium flex items-center gap-1 transition-colors" title="Ver proyecto">
                                                                <Ic n="eye" s={14} c="#166534" />
                                                            </button>}
                                                            <button onClick={() => setConfirmDel({ type: 'cliente', id: u.id, name: u.empresa })} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                                                <Ic n="trash" s={14} c="#DC2626" />
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
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Consultores registrados</h2>
                            <Btn onClick={() => { setShowNewConsultor(true); setTempCreds(null); setFormErr(''); }}>
                                <Ic n="plus" s={14} />Nuevo consultor
                            </Btn>
                        </div>

                        {consultores.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                    <Ic n="users" s={28} c="#1e40af" />
                                </div>
                                <p className="text-lg font-semibold text-gray-600">Sin consultores registrados</p>
                                <p className="text-sm text-gray-400 mt-1">Agrega consultores para poder asignarles clientes</p>
                                <Btn className="mt-4" onClick={() => setShowNewConsultor(true)}><Ic n="plus" s={14} />Agregar consultor</Btn>
                            </div>
                        ) : (
                            <div className="space-y-3 mb-8">
                                {consultores.map(c => {
                                    const misProyectos = data.proyectos.filter(p => p.consultor_id === c.id);
                                    const tramActive = misProyectos.reduce((a, p) => a + (p.tramites || []).filter(t => ['recopilando', 'ingresado', 'en_revision'].includes(t.estado)).length, 0);
                                    const instrPend = misProyectos.reduce((a, p) => a + (p.instrucciones_admin || []).filter(i => !i.leido).length, 0);
                                    const isOpen = expandedConsultor === c.id;

                                    return (
                                        <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                            <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedConsultor(isOpen ? null : c.id)}>
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                    {c.nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900">{c.nombre}</p>
                                                    <p className="text-xs text-gray-400">{c.email}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                        <Ic n="users" s={11} c="#166534" />{misProyectos.length} clientes
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                        <Ic n="file" s={11} c="#1e40af" />{tramActive} activos
                                                    </span>
                                                    {instrPend > 0 && (
                                                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                                                            <Ic n="bell" s={11} c="#92400e" />{instrPend} instruc.
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            setShowMeeting({ consultorId: c.id, email: c.email, proyId: misProyectos[0]?.id || null });
                                                            setMeetLink('');
                                                            setMeetForm({ titulo: `Reunión con ${c.nombre}`, fecha: '', hora: '10:00', duracion: '60', agenda: '', correo_extra: '' });
                                                        }}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
                                                        style={{ background: 'linear-gradient(135deg,#1e40af,#3b82f6)' }}
                                                        title="Agendar reunión">
                                                        <Ic n="calendar" s={13} c="white" />Reunión
                                                    </button>
                                                    <button onClick={e => { e.stopPropagation(); setConfirmDel({ type: 'consultor', id: c.id, name: c.nombre }); }} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Ic n="trash" s={14} c="#DC2626" />
                                                    </button>
                                                    <Ic n={isOpen ? 'cd' : 'cr'} s={16} c="#9ca3af" />
                                                </div>
                                            </div>

                                            {isOpen && (
                                                <div className="expand-panel border-t border-gray-100">
                                                    {misProyectos.length === 0 ? (
                                                        <div className="px-6 py-8 text-center text-sm text-gray-400">Sin clientes asignados aún.</div>
                                                    ) : (
                                                        misProyectos.map(proj => {
                                                            const cliUser = data.usuarios.find(u => u.id === proj.cliente_id);
                                                            if (!cliUser) return null;
                                                            const gc = giroColor(cliUser.giro);
                                                            const tramites = proj.tramites || [];
                                                            const instrCount = (proj.instrucciones_admin || []).length;
                                                            const reunCount = (proj.reuniones || []).length;

                                                            return (
                                                                <div key={proj.id} className="border-b border-gray-50 last:border-0">
                                                                    <div className="flex items-center justify-between px-6 py-3" style={{ background: '#fafbff' }}>
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: gc }}>
                                                                                {cliUser.empresa.slice(0, 2).toUpperCase()}
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-semibold text-gray-800 text-sm">{cliUser.empresa}</p>
                                                                                <p className="text-[10px] text-gray-400">{giroLabel(cliUser.giro)} · {cliUser.email}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            {instrCount > 0 && <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{instrCount} instruc.</span>}
                                                                            {reunCount > 0 && <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">{reunCount} reunión(es)</span>}
                                                                            <button onClick={() => { setShowInstr({ proyId: proj.id, empresa: cliUser.empresa }); setInstrForm({ texto: '', urgente: false }); }}
                                                                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                                                                                <Ic n="send" s={11} c="#166534" />Instrucción
                                                                            </button>
                                                                            <button onClick={() => onEnterProject(proj.id)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                                                                                <Ic n="eye" s={11} c="#6b7280" />Ver proyecto
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    {tramites.length === 0 ? (
                                                                        <div className="px-6 py-3 text-xs text-gray-400 italic">Sin trámites generados - diagnóstico pendiente.</div>
                                                                    ) : (
                                                                        <div className="px-6 pb-3">
                                                                            <div className="rounded-xl overflow-hidden border border-gray-100 mt-2">
                                                                                {tramites.map((t, ti) => {
                                                                                    const [eLabel, eColor] = TRAM_ESTADO[t.estado] || ['---', '#9CA3AF'];
                                                                                    const daysLeft = t.fecha_limite ? Math.round((new Date(t.fecha_limite) - new Date()) / 864e5) : null;
                                                                                    return (
                                                                                        <div key={t._id || ti} className="tram-row flex items-center gap-4 px-4 py-2.5">
                                                                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: eColor }} />
                                                                                            <p className="text-xs font-medium text-gray-800 flex-1 truncate">{t.nombre}</p>
                                                                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: eColor + '22', color: eColor }}>{eLabel}</span>
                                                                                            {daysLeft !== null && t.estado !== 'cumplido' && t.estado !== 'no_aplica' && (
                                                                                                <span className={`text-[10px] flex-shrink-0 font-medium ${daysLeft < 0 ? 'text-red-500' : daysLeft < 8 ? 'text-amber-500' : 'text-gray-400'}`}>
                                                                                                    {daysLeft < 0 ? `Vencido (${Math.abs(daysLeft)}d)` : daysLeft === 0 ? 'Hoy' : `${daysLeft}d`}
                                                                                                </span>
                                                                                            )}
                                                                                            {t.fecha_limite && <span className="text-[10px] text-gray-300 flex-shrink-0">{fmtDate(t.fecha_limite)}</span>}
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })
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

            {/* ── NEW CLIENT MODAL ── */}
            <Modal open={showNewClient} onClose={() => setShowNewClient(false)} title="Registrar nuevo cliente" width="max-w-xl">
                {tempCreds && tempCreds.tipo === 'cliente' ? (
                    <div className="text-center py-4">
                        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                            <Ic n="checkCircle" s={28} c="#166534" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Cliente creado exitosamente</h3>
                        <p className="text-sm text-gray-500 mb-4">Comparte estas credenciales con el cliente:</p>
                        <div className="bg-gray-50 rounded-xl p-4 text-left mb-4">
                            <p className="text-xs text-gray-500 mb-1">Correo electrónico</p>
                            <p className="font-medium text-gray-800 text-sm mb-3">{tempCreds.email}</p>
                            <p className="text-xs text-gray-500 mb-1">Contraseña temporal</p>
                            <p className="font-mono font-bold text-green-800 text-xl">{tempCreds.pwd}</p>
                        </div>
                        <Btn onClick={() => { setShowNewClient(false); setTempCreds(null); }}>Cerrar</Btn>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {formErr && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{formErr}</div>}
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Nombre del responsable" value={clientForm.nombre} onChange={v => setC('nombre', v)} placeholder="Juan García" required />
                            <Input label="Empresa / Razón social" value={clientForm.empresa} onChange={v => setC('empresa', v)} placeholder="ACME S.A." required />
                        </div>
                        <Select label="Giro industrial" value={clientForm.giro} onChange={v => setC('giro', v)} options={GIROS.map(g => ({ value: g.id, label: g.label }))} required />
                        <Input label="Correo electrónico" value={clientForm.email} onChange={v => setC('email', v)} type="email" placeholder="cliente@empresa.com" required />
                        <Input label="Contraseña (dejar vacío = auto-generada)" value={clientForm.pwd} onChange={v => setC('pwd', v)} type="password" placeholder="Opcional - mínimo 6 caracteres" />
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-600">Asignar consultor</label>
                            <select value={clientForm.consultor_id} onChange={e => setC('consultor_id', e.target.value)} disabled={isProcessing} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 bg-white">
                                <option value="">Sin asignar (asignar después)</option>
                                {consultores.map(c => <option key={c.id} value={c.id}>{c.nombre} - {c.email}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-600">Notas del proyecto</label>
                            <textarea value={clientForm.notas} onChange={e => setC('notas', e.target.value)} rows={2} placeholder="Notas internas..." className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 resize-none" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Btn variant="secondary" onClick={() => setShowNewClient(false)}>Cancelar</Btn>
                            <Btn onClick={createClient} disabled={isProcessing}><Ic n="plus" s={14} />{isProcessing ? 'Creando...' : 'Crear cliente'}</Btn>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ── NEW CONSULTOR MODAL ── */}
            <Modal open={showNewConsultor} onClose={() => setShowNewConsultor(false)} title="Registrar nuevo consultor" width="max-w-md">
                {tempCreds && tempCreds.tipo === 'consultor' ? (
                    <div className="text-center py-4">
                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                            <Ic n="checkCircle" s={28} c="#1e40af" />
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">Consultor creado exitosamente</h3>
                        <p className="text-sm text-gray-500 mb-4">Credenciales de acceso:</p>
                        <div className="bg-gray-50 rounded-xl p-4 text-left mb-4">
                            <p className="text-xs text-gray-500 mb-1">Correo electrónico</p>
                            <p className="font-medium text-gray-800 text-sm mb-3">{tempCreds.email}</p>
                            <p className="text-xs text-gray-500 mb-1">Contraseña</p>
                            <p className="font-mono font-bold text-blue-800 text-xl">{tempCreds.pwd}</p>
                        </div>
                        <Btn onClick={() => { setShowNewConsultor(false); setTempCreds(null); }}>Cerrar</Btn>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {formErr && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{formErr}</div>}
                        <Input label="Nombre completo" value={consultorForm.nombre} onChange={v => setCo('nombre', v)} placeholder="Lic. Ana Martínez" required />
                        <Input label="Correo electrónico" value={consultorForm.email} onChange={v => setCo('email', v)} type="email" placeholder="consultor@bioimpact.com.mx" required />
                        <Input label="Contraseña" value={consultorForm.pwd} onChange={v => setCo('pwd', v)} type="password" placeholder="Mínimo 6 caracteres" required />
                        <div className="flex justify-end gap-2 pt-2">
                            <Btn variant="secondary" onClick={() => setShowNewConsultor(false)}>Cancelar</Btn>
                            <Btn onClick={createConsultor} disabled={isProcessing}><Ic n="plus" s={14} />{isProcessing ? 'Creando...' : 'Crear consultor'}</Btn>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ── CONFIRM DELETE ── */}
            <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="Confirmar eliminación" width="max-w-sm">
                <div className="text-center py-2">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                        <Ic n="trash" s={22} c="#DC2626" />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">¿Eliminar <strong>{confirmDel?.name}</strong>?</p>
                    <p className="text-xs text-gray-400 mb-4">{confirmDel?.type === 'cliente' ? 'Se eliminarán todos los datos del proyecto. Esta acción no se puede deshacer.' : 'El consultor perderá acceso. Sus clientes quedarán sin consultor asignado.'}</p>
                    <div className="flex gap-2 justify-center">
                        <Btn variant="secondary" onClick={() => setConfirmDel(null)}>Cancelar</Btn>
                        <Btn variant="danger" onClick={() => deleteEntry(confirmDel.type, confirmDel.id)} disabled={isProcessing}>{isProcessing ? 'Eliminando...' : 'Eliminar'}</Btn>
                    </div>
                </div>
            </Modal>

            {/* ── MEETING SCHEDULER MODAL ── */}
            <Modal open={!!showMeeting} onClose={() => { setShowMeeting(null); setMeetLink(''); }} title="Agendar reunión de seguimiento" width="max-w-lg">
                {meetLink ? (
                    <div className="py-2">
                        <div className="flex items-center justify-center mb-4">
                            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#1e40af,#3b82f6)' }}>
                                <Ic n="checkCircle" s={28} c="white" />
                            </div>
                        </div>
                        <p className="text-center font-semibold text-gray-900 mb-1">Reunión guardada en el proyecto</p>
                        <p className="text-center text-sm text-gray-500 mb-5">Haz clic en el botón para abrirla en Google Calendar y guardarla en tu agenda (el consultor también recibirá la invitación si tiene cuenta Google).</p>
                        <a href={meetLink} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-white mb-3 transition-opacity hover:opacity-90" style={{ background: 'linear-gradient(135deg,#1e40af,#4f46e5)' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" /></svg>
                            Abrir en Google Calendar →
                        </a>
                        <p className="text-center text-xs text-gray-400 mb-4">El link abre Google Calendar con todos los datos pre-llenados. Solo haz clic en "Guardar" dentro de Google Calendar para confirmar el evento.</p>
                        <Btn variant="secondary" onClick={() => { setShowMeeting(null); setMeetLink(''); }}>Cerrar</Btn>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-3 rounded-xl text-xs text-blue-700 flex items-start gap-2" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                            <Ic n="info" s={14} c="#1d4ed8" />
                            <span>Se generará un link de Google Calendar con todos los datos pre-llenados. Podrás invitar al consultor directamente desde Google Calendar.</span>
                        </div>
                        <Input label="Título de la reunión *" value={meetForm.titulo} onChange={v => setMeetForm(f => ({ ...f, titulo: v }))} placeholder="Reunión de seguimiento ambiental" />
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-1">
                                <Input label="Fecha *" value={meetForm.fecha} onChange={v => setMeetForm(f => ({ ...f, fecha: v }))} type="date" />
                            </div>
                            <div>
                                <Input label="Hora inicio" value={meetForm.hora} onChange={v => setMeetForm(f => ({ ...f, hora: v }))} type="time" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-medium text-gray-600">Duración</label>
                                <select value={meetForm.duracion} onChange={e => setMeetForm(f => ({ ...f, duracion: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 bg-white h-[38px]">
                                    <option value="30">30 min</option>
                                    <option value="60">1 hora</option>
                                    <option value="90">1.5 horas</option>
                                    <option value="120">2 horas</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-600">Agenda / descripción</label>
                            <textarea value={meetForm.agenda} onChange={e => setMeetForm(f => ({ ...f, agenda: e.target.value }))} rows={3} placeholder="Revisión de avances, pendientes de documentación, ajustes al cronograma..." className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 resize-none" />
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Consultor que recibirá la invitación:</p>
                            <p className="text-sm font-medium text-gray-800">{showMeeting?.email}</p>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                            <Btn variant="secondary" onClick={() => setShowMeeting(null)}>Cancelar</Btn>
                            <Btn onClick={saveMeeting} disabled={isProcessing} style={{ background: 'linear-gradient(135deg,#1e40af,#3b82f6)' }}>
                                <Ic n="calendar" s={14} />{isProcessing ? 'Guardando...' : 'Generar link Google Calendar'}
                            </Btn>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ── INSTRUCTIONS MODAL ── */}
            <Modal open={!!showInstr} onClose={() => setShowInstr(null)} title={`Instrucción para ${showInstr?.empresa || 'consultor'}`} width="max-w-md">
                <div className="space-y-4">
                    <div className="p-3 rounded-xl text-xs flex items-start gap-2" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534' }}>
                        <Ic n="info" s={14} c="#166534" />
                        <span>La instrucción quedará guardada en el proyecto y el consultor la verá en su Panel Consultor al entrar al proyecto.</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600">Instrucción / comentario *</label>
                        <textarea value={instrForm.texto} onChange={e => setInstrForm(f => ({ ...f, texto: e.target.value }))} rows={4} placeholder="Ej: Priorizar la gestión de la Cédula de Operación Anual antes del 30 de abril. Solicitar al cliente el inventario de residuos peligrosos actualizado..." className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 resize-none" />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-colors" style={{ background: instrForm.urgente ? '#fef2f2' : '#f9fafb', borderColor: instrForm.urgente ? '#fecaca' : '#e5e7eb' }}>
                        <input type="checkbox" checked={instrForm.urgente} onChange={e => setInstrForm(f => ({ ...f, urgente: e.target.checked }))} className="w-4 h-4 rounded accent-red-500" />
                        <div>
                            <p className="text-sm font-semibold" style={{ color: instrForm.urgente ? '#dc2626' : '#374151' }}>Marcar como urgente</p>
                            <p className="text-xs text-gray-400">Aparecerá destacada en rojo en el panel del consultor</p>
                        </div>
                    </label>
                    <div className="flex justify-end gap-2 pt-1">
                        <Btn variant="secondary" onClick={() => setShowInstr(null)}>Cancelar</Btn>
                        <Btn onClick={saveInstr} disabled={isProcessing}><Ic n="send" s={14} />{isProcessing ? 'Enviando...' : 'Enviar instrucción'}</Btn>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default AdminHome;