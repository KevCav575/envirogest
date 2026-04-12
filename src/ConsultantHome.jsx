import React, { useState, useMemo } from 'react';
import { Ic, GIROS } from './constants';
import { Btn, Input, Select, Modal } from './ui';
import { hashPwd, uid, fmtDate, today, giroLabel, giroColor } from './utils';

export function
ConsultantHome({data,setData,currentUser,onEnterProject,onLogout}){

const [showNew,setShowNew]=useState(false);

const [search,setSearch]=useState('');

const
[form,setForm]=useState({nombre:'',empresa:'',giro:'',email:'',pwd:'',notas:''});

const [formError,setFormError]=useState('');

const [tempPwd,setTempPwd]=useState('');

const [confirmDel,setConfirmDel]=useState(null);

const setF=(k,v)=>setForm(f=>({...f,[k]:v}));

const
misProyectos=data.proyectos.filter(p=>p.consultor_id===currentUser.id);

const proyectos=misProyectos.filter(p=>{

if(!search)return true;

const u=data.usuarios.find(u=>u.id===p.cliente_id);

return
(u?.empresa||'').toLowerCase().includes(search.toLowerCase())||

(u?.nombre||'').toLowerCase().includes(search.toLowerCase());

});

const stats={

clientes:misProyectos.length,

tramitesActivos:misProyectos.reduce((a,p)=>a+(p.tramites||[]).filter(t=>['recopilando','ingresado','en_revision'].includes(t.estado)).length,0),

alertasSinLeer:misProyectos.reduce((a,p)=>a+(p.alertas||[]).filter(al=>!al.leido).length,0),

cumplidos:misProyectos.reduce((a,p)=>a+(p.tramites||[]).filter(t=>t.estado==='cumplido').length,0),

};

const createClient=()=>{

if(!form.nombre||!form.empresa||!form.giro||!form.email){setFormError('Completa
nombre, empresa, giro y email.');return;}

if(data.usuarios.find(u=>u.email===form.email)){setFormError('Ya
existe una cuenta con ese correo.');return;}

const pwd=form.pwd||Math.random().toString(36).slice(2,10);

const clientId=uid();const proyId=uid();

const
newU={id:clientId,nombre:form.nombre,empresa:form.empresa,giro:form.giro,email:form.email,

pwd_hash:hashPwd(pwd),rol:'cliente',proyecto_id:proyId};

const newP={id:proyId,cliente_id:clientId,consultor_id:currentUser.id,

cuestionario:{respondido:false,respuestas:{},fecha:null},tramites:[],alertas:[],

iso14001:{secciones:{'4':{},'5':{},'6':{},'7':{},'8':{},'9':{},'10':{}}},

creado:today(),notas:form.notas};

setData(d=>({...d,usuarios:[...d.usuarios,newU],proyectos:[...d.proyectos,newP]}));

setTempPwd(pwd);setForm({nombre:'',empresa:'',giro:'',email:'',pwd:'',notas:''});setFormError('');

};

const deleteProject=(pId)=>{

const p=data.proyectos.find(x=>x.id===pId);

if(!p)return;

setData(d=>({...d,

usuarios:d.usuarios.filter(u=>u.id!==p.cliente_id),

proyectos:d.proyectos.filter(x=>x.id!==pId),

}));

setConfirmDel(null);

};

const getClientUser=(pId)=>{

const p=data.proyectos.find(x=>x.id===pId);

return data.usuarios.find(u=>u.id===p?.cliente_id);

};

const getPctCompliance=(p)=>{

const t=p.tramites||[];

if(!t.length)return null;

return
Math.round(t.filter(x=>x.estado==='cumplido').length/t.length*100);

};

return(

<div className="min-h-screen" style={{background:'#F0FDF4'}}>

{/* Header */}

<div className="relative overflow-hidden"
style={{background:'linear-gradient(135deg,#14532d 0%,#166534
60%,#15803d 100%)'}}>

{/* BG pattern */}

<div className="absolute inset-0 opacity-10"
style={{backgroundImage:"url(\\"data:image/svg+xml,%3Csvg width='60'
height='60' viewBox='0 0 60 60'
xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'
fill-rule='evenodd'%3E%3Cg fill='%23ffffff'
fill-opacity='1'%3E%3Cpath d='M36
34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6
34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6
4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\\")"}}/>

<div className="relative px-8 py-6">

<div className="flex items-center justify-between">

<div className="flex items-center gap-4">

<div className="w-11 h-11 rounded-xl bg-white/20 flex items-center
justify-center">

<Ic n="leaf" s={22} c="white"/>

</div>

<div>

<p className="text-white font-bold text-lg">EnviroGest MX</p>

<p className="text-green-200 text-xs">BIOIMPACT · Panel del
Consultor</p>

</div>

</div>

<div className="flex items-center gap-3">

<div className="text-right">

<p className="text-white font-medium
text-sm">{currentUser.nombre}</p>

<p className="text-green-200 text-xs">{currentUser.email}</p>

</div>

<button onClick={onLogout} className="p-2 rounded-lg hover:bg-white/10
text-white/70 hover:text-white"><Ic n="logout" s={16}/></button>

</div>

</div>

{/* Stats */}

<div className="grid grid-cols-4 gap-4 mt-6">

{[

{v:stats.clientes,l:'Clientes activos',i:'users'},

{v:stats.tramitesActivos,l:'Trámites en proceso',i:'file'},

{v:stats.cumplidos,l:'Trámites cumplidos',i:'checkCircle'},

{v:stats.alertasSinLeer,l:'Alertas sin leer',i:'bell'},

].map(s=>(

<div key={s.l} className="rounded-xl p-4"
style={{background:'rgba(255,255,255,0.12)'}}>

<div className="flex items-center gap-2 mb-1">

<Ic n={s.i} s={14} c="rgba(255,255,255,0.7)"/>

<span className="text-green-200 text-xs">{s.l}</span>

</div>

<p className="text-3xl font-bold text-white">{s.v}</p>

</div>

))}

</div>

</div>

</div>

{/* Client grid */}

<div className="px-8 py-6">

<div className="flex items-center justify-between mb-5">

<h2 className="text-lg font-bold text-gray-900">Proyectos de
clientes</h2>

<div className="flex gap-3">

<div className="relative">

<input value={search} onChange={e=>setSearch(e.target.value)}
placeholder="Buscar cliente..."

className="pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm
bg-white focus:outline-none focus:ring-2 focus:ring-green-700 w-52"/>

<Ic n="users" s={14} cls="absolute left-2.5 top-2.5
text-gray-400"/>

</div>

<Btn
onClick={()=>{setShowNew(true);setTempPwd('');setFormError('');}}>

<Ic n="plus" s={14}/>Nuevo cliente

</Btn>

</div>

</div>

{proyectos.length===0?(

<div className="flex flex-col items-center justify-center py-20">

<div className="w-16 h-16 rounded-full bg-green-100 flex items-center
justify-center mb-4">

<Ic n="users" s={28} c="#166534"/>

</div>

<p className="text-lg font-semibold text-gray-600">Sin clientes
registrados</p>

<p className="text-sm text-gray-400 mt-1">Crea el primer proyecto de
cliente para comenzar</p>

<Btn className="mt-4" onClick={()=>setShowNew(true)}><Ic
n="plus" s={14}/>Crear primer cliente</Btn>

</div>

):(

<div className="grid grid-cols-3 gap-5">

{proyectos.map(p=>{

const u=getClientUser(p.id);

if(!u)return null;

const pct=getPctCompliance(p);

const tramCount=(p.tramites||[]).length;

const alertCount=(p.alertas||[]).filter(a=>!a.leido).length;

const gc=giroColor(u.giro);

return(

<div key={p.id} className="client-card bg-white rounded-2xl border
border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden
cursor-pointer group"

onClick={()=>onEnterProject(p.id)}>

{/* Color top bar */}

<div className="h-1.5 w-full"
style={{background:`linear-gradient(90deg,${gc},${gc}88)`}}/>

<div className="p-5">

<div className="flex items-start justify-between mb-3">

<div className="flex items-center gap-3">

<div className="w-10 h-10 rounded-xl flex items-center justify-center
font-bold text-white text-sm"

style={{background:gc}}>

{u.empresa.slice(0,2).toUpperCase()}

</div>

<div>

<p className="font-semibold text-gray-900 text-sm
leading-tight">{u.empresa}</p>

<p className="text-xs text-gray-400">{giroLabel(u.giro)}</p>

</div>

</div>

{alertCount>0&&(

<span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5
rounded-full">{alertCount}</span>

)}

</div>

<p className="text-xs text-gray-500 mb-3">{u.nombre} ·
{u.email}</p>

<div className="flex gap-3 mb-3">

<div className="text-center">

<p className="text-xl font-bold text-gray-800">{tramCount}</p>

<p className="text-[10px] text-gray-400">Trámites</p>

</div>

<div className="text-center">

<p className="text-xl font-bold"
style={{color:alertCount>0?'#DC2626':'#9CA3AF'}}>{alertCount}</p>

<p className="text-[10px] text-gray-400">Alertas</p>

</div>

<div className="text-center flex-1">

{p.cuestionario?.respondido?<p className="text-[10px] text-green-700
font-medium mt-1">✓ Diagnóstico listo</p>:<p
className="text-[10px] text-amber-600 font-medium mt-1">⚠
Diagnóstico pendiente</p>}

</div>

</div>

{pct!==null&&(

<div className="mb-3">

<div className="flex justify-between text-[10px] text-gray-400
mb-1">

<span>Cumplimiento</span><span
className="font-medium">{pct}%</span>

</div>

<div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">

<div className="h-full rounded-full transition-all"
style={{width:`${pct}%`,background:pct===100?'#10B981':pct>50?'#3B82F6':'#F59E0B'}}/>

</div>

</div>

)}

<div className="flex items-center justify-between mt-3 pt-3 border-t
border-gray-50">

<span className="text-[10px] text-gray-400">Creado
{fmtDate(p.creado)}</span>

<div className="flex items-center gap-1 text-green-700 text-xs
font-medium">

<span>Entrar</span>

<Ic n="cr" s={13} c="#166534" cls="client-arrow"/>

</div>

</div>

</div>

{/* Delete button */}

<button onClick={e=>{e.stopPropagation();setConfirmDel(p.id);}}

className="absolute top-3 right-3 opacity-0 group-hover:opacity-100
p-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-all"

title="Eliminar cliente">

<Ic n="trash" s={13} c="#DC2626"/>

</button>

</div>

);

})}

</div>

)}

</div>

{/* New client modal */}

<Modal open={showNew} onClose={()=>setShowNew(false)}
title="Registrar nuevo cliente" width="max-w-xl">

{tempPwd?(

<div className="text-center py-4">

<div className="w-14 h-14 rounded-full bg-green-100 flex items-center
justify-center mx-auto mb-3">

<Ic n="checkCircle" s={28} c="#166534"/>

</div>

<h3 className="font-semibold text-gray-900 mb-1">Cliente creado
exitosamente</h3>

<p className="text-sm text-gray-500 mb-4">Comparte estas
credenciales de acceso con tu cliente:</p>

<div className="bg-gray-50 rounded-xl p-4 text-left mb-4">

<p className="text-xs text-gray-500 mb-1">Email</p>

<p className="font-medium text-gray-800 text-sm
mb-3">{form.email||data.usuarios[data.usuarios.length-1]?.email}</p>

<p className="text-xs text-gray-500 mb-1">Contraseña temporal</p>

<div className="flex items-center gap-2">

<p className="font-mono font-bold text-green-800
text-lg">{tempPwd}</p>

</div>

</div>

<p className="text-xs text-gray-400 mb-4">Recuerda pedirle al
cliente que cambie su contraseña al ingresar.</p>

<Btn
onClick={()=>{setShowNew(false);setTempPwd('');}}>Cerrar</Btn>

</div>

):(

<div className="space-y-3">

{formError&&<div className="p-3 bg-red-50 border border-red-200
rounded-lg text-xs text-red-600">{formError}</div>}

<div className="grid grid-cols-2 gap-3">

<Input label="Nombre del responsable" value={form.nombre}
onChange={v=>setF('nombre',v)} placeholder="Juan García"
required/>

<Input label="Empresa / Razón social" value={form.empresa}
onChange={v=>setF('empresa',v)} placeholder="ACME S.A. de C.V."
required/>

</div>

<Select label="Giro industrial" value={form.giro}
onChange={v=>setF('giro',v)}
options={GIROS.map(g=>({value:g.id,label:g.label}))} required/>

<Input label="Correo electrónico del cliente" value={form.email}
onChange={v=>setF('email',v)} type="email"
placeholder="cliente@empresa.com" required/>

<Input label="Contraseña (dejar vacío = auto-generada)"
value={form.pwd} onChange={v=>setF('pwd',v)} type="password"
placeholder="Opcional --- mínimo 6 caracteres"/>

<div className="flex flex-col gap-1">

<label className="text-xs font-medium text-gray-600">Notas internas
del proyecto</label>

<textarea value={form.notas}
onChange={e=>setF('notas',e.target.value)} rows={2}
placeholder="Notas visibles solo para el consultor..."

className="border border-gray-200 rounded-lg px-3 py-2 text-sm
focus:outline-none focus:ring-2 focus:ring-green-700 resize-none"/>

</div>

<div className="flex justify-end gap-2 pt-2">

<Btn variant="secondary"
onClick={()=>setShowNew(false)}>Cancelar</Btn>

<Btn onClick={createClient}><Ic n="plus" s={14}/>Crear
cliente</Btn>

</div>

</div>

)}

</Modal>

{/* Confirm delete */}

<Modal open={!!confirmDel} onClose={()=>setConfirmDel(null)}
title="Eliminar cliente" width="max-w-sm">

<div className="text-center py-2">

<div className="w-12 h-12 rounded-full bg-red-100 flex items-center
justify-center mx-auto mb-3">

<Ic n="trash" s={22} c="#DC2626"/>

</div>

<p className="text-sm text-gray-600 mb-4">¿Estás seguro? Se
eliminarán todos los datos del proyecto del cliente. Esta acción no se
puede deshacer.</p>

<div className="flex gap-2 justify-center">

<Btn variant="secondary"
onClick={()=>setConfirmDel(null)}>Cancelar</Btn>

<Btn variant="danger"
onClick={()=>deleteProject(confirmDel)}>Eliminar</Btn>

</div>

</div>

</Modal>

</div>

);

}

/* ── SIDEBAR (workspace) ─────────────────── */

export default ConsultantHome;
