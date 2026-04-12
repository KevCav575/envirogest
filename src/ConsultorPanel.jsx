import React, { useState, useMemo } from 'react';
import { Ic, ISO_DATA } from './constants';
import { Btn, Card, Input, Select } from './ui';
import { uid, fmtDate, today } from './utils';

export function ConsultorPanel({projectData,updateProject}){

const {tramites,alertas}=projectData;

const instrucciones=projectData.instrucciones_admin||[];

const
reuniones=(projectData.reuniones||[]).sort((a,b)=>a.fecha>b.fecha?1:-1);

const [tab,setTab]=useState('instrucciones');

const
[form,setForm]=useState({tipo:'solicitud',tramite_id:'',mensaje:'',fecha_visita:'',hora_visita:'',motivo:'',docs:''});

const [sent,setSent]=useState(false);

const setF=(k,v)=>setForm(f=>({...f,[k]:v}));

const
sendAlert=(tipo,msg)=>{if(!msg)return;updateProject({alertas:[...alertas,{id:uid(),tipo,mensaje:msg,fecha:today(),leido:false,tramite_id:form.tramite_id||null}]});setSent(true);setTimeout(()=>setSent(false),3000);setF('mensaje','');setF('docs','');};

const
markInstrLeida=(iid)=>{updateProject({instrucciones_admin:instrucciones.map(i=>i.id===iid?{...i,leido:true}:i)});};

const instrPend=instrucciones.filter(i=>!i.leido).length;

const reunFutures=reuniones.filter(r=>r.fecha>=today());

return(

<div className="p-6 fade-in max-w-3xl">

<div className="mb-5">

<h1 className="text-xl font-bold text-gray-900">Panel del
Consultor</h1>

<p className="text-sm text-gray-500">Herramientas BIOIMPACT ·
instrucciones y comunicación con el admin</p>

</div>

{/* Tab bar */}

<div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5">

{[

{id:'instrucciones',l:'Instrucciones del
admin',badge:instrPend>0?instrPend:null},

{id:'reuniones',l:'Reuniones',badge:reunFutures.length>0?reunFutures.length:null},

{id:'alerta',l:'Enviar alerta',badge:null},

{id:'docs',l:'Solicitar docs',badge:null},

{id:'visita',l:'Agendar visita',badge:null},

{id:'firma',l:'Para firma',badge:null},

].map(t=>(

<button key={t.id} onClick={()=>setTab(t.id)}

className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all
flex items-center justify-center gap-1 ${tab===t.id?'bg-white shadow
text-gray-800':'text-gray-500 hover:text-gray-700'}`}>

{t.l}

{t.badge&&<span className="w-4 h-4 rounded-full bg-red-500 text-white
text-[9px] flex items-center justify-center
font-bold">{t.badge}</span>}

</button>

))}

</div>

{sent&&<div className="mb-4 p-3 bg-green-50 border border-green-200
rounded-lg text-sm text-green-700 flex items-center gap-2"><Ic
n="checkCircle" s={15} c="#166534"/>Acción enviada
correctamente</div>}

{/* ── INSTRUCCIONES DEL ADMIN ── */}

{tab==='instrucciones'&&(

<div>

{instrucciones.length===0?(

<div className="flex flex-col items-center justify-center py-16
bg-white rounded-2xl border border-gray-100">

<div className="w-12 h-12 rounded-full bg-green-100 flex items-center
justify-center mb-3"><Ic n="checkCircle" s={24}
c="#166534"/></div>

<p className="text-gray-600 font-medium">Sin instrucciones
pendientes</p>

<p className="text-xs text-gray-400 mt-1">El administrador BIOIMPACT
aún no ha enviado instrucciones para este proyecto.</p>

</div>

):(

<div className="space-y-3">

{instrucciones.slice().reverse().map(instr=>(

<div key={instr.id} className={`bg-white rounded-xl border p-4
${instr.urgente?'instr-urgente':'instr-normal'}
${instr.leido?'opacity-60':''}`}>

<div className="flex items-start justify-between gap-3">

<div className="flex items-start gap-3 flex-1">

<div className={`w-8 h-8 rounded-lg flex items-center justify-center
flex-shrink-0 ${instr.urgente?'bg-red-100':'bg-blue-100'}`}>

<Ic n={instr.urgente?'alert':'info'} s={16}
c={instr.urgente?'#dc2626':'#1e40af'}/>

</div>

<div className="flex-1">

{instr.urgente&&<span className="text-[10px] font-bold text-red-600
uppercase tracking-wide">⚡ Urgente</span>}

<p className="text-sm text-gray-800 leading-relaxed
mt-0.5">{instr.texto}</p>

<p className="text-[10px] text-gray-400 mt-2">Enviado por
BIOIMPACT · {fmtDate(instr.fecha)}</p>

</div>

</div>

{!instr.leido&&(

<button onClick={()=>markInstrLeida(instr.id)}

className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100
text-gray-600 hover:bg-green-100 hover:text-green-700 text-xs
font-medium transition-colors flex-shrink-0">

<Ic n="check" s={12}/>Marcar leída

</button>

)}

{instr.leido&&<span className="text-[10px] text-green-600
font-medium flex-shrink-0 flex items-center gap-1"><Ic
n="checkCircle" s={11} c="#16a34a"/>Leída</span>}

</div>

</div>

))}

</div>

)}

</div>

)}

{/* ── REUNIONES ── */}

{tab==='reuniones'&&(

<div>

{reuniones.length===0?(

<div className="flex flex-col items-center justify-center py-16
bg-white rounded-2xl border border-gray-100">

<div className="w-12 h-12 rounded-full bg-blue-100 flex items-center
justify-center mb-3"><Ic n="calendar" s={24}
c="#1e40af"/></div>

<p className="text-gray-600 font-medium">Sin reuniones
programadas</p>

<p className="text-xs text-gray-400 mt-1">El administrador BIOIMPACT
puede agendar reuniones desde el panel de consultores.</p>

</div>

):(

<div className="space-y-3">

{reuniones.map(r=>{

const isPast=r.fecha<today();

return(

<div key={r.id} className={`bg-white rounded-xl border p-4
${isPast?'opacity-50':'border-blue-100'}`}>

<div className="flex items-start gap-4">

<div className={`w-12 h-12 rounded-xl flex flex-col items-center
justify-center flex-shrink-0
${isPast?'bg-gray-100':'bg-blue-50'}`}>

<span className="text-[10px] font-bold"
style={{color:isPast?'#9ca3af':'#1e40af'}}>{r.fecha?new
Date(r.fecha+'T12:00').toLocaleString('es',{month:'short'}).toUpperCase():''}</span>

<span className="text-lg font-black leading-none"
style={{color:isPast?'#9ca3af':'#1e3a8a'}}>{r.fecha?r.fecha.split('-')[2]:''}</span>

</div>

<div className="flex-1 min-w-0">

<div className="flex items-start justify-between gap-2">

<div>

<p className="font-semibold text-gray-900">{r.titulo}</p>

<p className="text-xs text-gray-500">{r.hora} · {r.duracion} min ·
{fmtDate(r.fecha)}</p>

{r.agenda&&<p className="text-xs text-gray-400 mt-1
line-clamp-2">{r.agenda}</p>}

</div>

{r.gcal_link&&!isPast&&(

<a href={r.gcal_link} target="_blank" rel="noopener noreferrer"

className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs
font-semibold text-white flex-shrink-0 transition-opacity
hover:opacity-90"

style={{background:'linear-gradient(135deg,#1e40af,#3b82f6)'}}>

<Ic n="calendar" s={12} c="white"/>Google Cal

</a>

)}

</div>

</div>

</div>

</div>

);

})}

</div>

)}

</div>

)}

{/* ── ALERTA / DOCS / VISITA / FIRMA (existing tabs) ── */}

{['alerta','docs','visita','firma'].includes(tab)&&(

<Card className="p-5">

<Select label="Trámite vinculado (opcional)" value={form.tramite_id}
onChange={v=>setF('tramite_id',v)}
options={tramites.map(t=>({value:t._id,label:t.nombre}))}
className="mb-4"/>

{tab==='alerta'&&<div className="space-y-4"><Select
label="Tipo" value={form.tipo} onChange={v=>setF('tipo',v)}
options={[{value:'vencimiento',label:'Vencimiento
próximo'},{value:'solicitud',label:'Solicitud
información'},{value:'estado',label:'Cambio de
estado'},{value:'info',label:'Informativa'}]}/><div
className="flex flex-col gap-1"><label className="text-xs
font-medium text-gray-600">Mensaje \*</label><textarea
value={form.mensaje} onChange={e=>setF('mensaje',e.target.value)}
rows={3} placeholder="Escribe el mensaje..." className="border
border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none
focus:ring-2 focus:ring-green-700 resize-none"/></div><Btn
onClick={()=>sendAlert(form.tipo,form.mensaje)}><Ic n="send"
s={14}/>Enviar alerta</Btn></div>}

{tab==='docs'&&<div className="space-y-4"><div className="flex
flex-col gap-1"><label className="text-xs font-medium
text-gray-600">Documentos requeridos \*</label><textarea
value={form.docs} onChange={e=>setF('docs',e.target.value)} rows={4}
placeholder="Plano de ubicación, Acta constitutiva, RFC..."
className="border border-gray-200 rounded-lg px-3 py-2 text-sm
focus:outline-none focus:ring-2 focus:ring-green-700
resize-none"/></div><Btn
onClick={()=>sendAlert('solicitud',`BIOIMPACT solicita:
${form.docs}${form.tramite_id?' (trámite:
'+tramites.find(t=>t._id===form.tramite_id)?.nombre+')':''}`)}><Ic
n="file" s={14}/>Solicitar documentos</Btn></div>}

{tab==='visita'&&<div className="space-y-4"><div className="grid
grid-cols-2 gap-3"><Input label="Fecha \*"
value={form.fecha_visita} onChange={v=>setF('fecha_visita',v)}
type="date"/><Input label="Hora" value={form.hora_visita}
onChange={v=>setF('hora_visita',v)} type="time"/></div><Input
label="Motivo" value={form.motivo} onChange={v=>setF('motivo',v)}
placeholder="Recolección de documentos firmados"/><Btn
onClick={()=>sendAlert('visita',`Visita:
${fmtDate(form.fecha_visita)} a las ${form.hora_visita||'hora
TBD'}. Motivo: ${form.motivo||'Recolección de
documentos'}.`)}><Ic n="calendar" s={14}/>Agendar
visita</Btn></div>}

{tab==='firma'&&<div className="space-y-4"><div className="flex
flex-col gap-1"><label className="text-xs font-medium
text-gray-600">Documentos para firma</label><textarea
value={form.docs} onChange={e=>setF('docs',e.target.value)} rows={3}
placeholder="Plan de Manejo RME, MIA Estatal..." className="border
border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none
focus:ring-2 focus:ring-green-700 resize-none"/></div><Btn
onClick={()=>sendAlert('firma',`Documentos para firma:
${form.docs}. Favor revisar y firmar.`)}><Ic n="edit"
s={14}/>Notificar para firma</Btn></div>}

</Card>

)}

<div className="mt-5 grid grid-cols-4 gap-4">

{[

{l:'Instrucciones pendientes',v:instrPend,c:'#1e40af'},

{l:'Reuniones próximas',v:reunFutures.length,c:'#8b5cf6'},

{l:'Alertas sin
leer',v:alertas.filter(a=>!a.leido).length,c:'#F59E0B'},

{l:'Trámites
activos',v:tramites.filter(t=>['recopilando','ingresado','en_revision'].includes(t.estado)).length,c:'#166534'},

].map(x=><Card key={x.l} className="p-3 text-center"><p
className="text-2xl font-bold" style={{color:x.c}}>{x.v}</p><p
className="text-xs text-gray-500 mt-0.5">{x.l}</p></Card>)}

</div>

</div>

);

}

/* ── ISO 14001 ───────────────────────────── */

export function ISO14001({projectData,updateProject}){

const [openSec,setOpenSec]=useState('4');

const secs=projectData.iso14001?.secciones||{};

const toggle=(sid,iid)=>{const
s=secs[sid]||{};updateProject({iso14001:{...projectData.iso14001,secciones:{...secs,[sid]:{...s,[iid]:!s[iid]}}}});};

const secPct=sid=>{const items=ISO_DATA[sid].items;const
s=secs[sid]||{};return
items.length?Math.round(items.filter(i=>s[i.id]).length/items.length*100):0;};

const totalItems=Object.values(ISO_DATA).flatMap(s=>s.items).length;

const
totalDone=Object.entries(secs).reduce((a,[sid,s])=>a+(ISO_DATA[sid]?.items||[]).filter(i=>s[i.id]).length,0);

const totalPct=totalItems?Math.round(totalDone/totalItems*100):0;

return(

<div className="p-6 fade-in">

<div className="flex items-center justify-between mb-4"><div><h1
className="text-xl font-bold text-gray-900">ISO 14001:2015</h1><p
className="text-sm text-gray-500">Checklist SGA · Ciclo PHVA (Caps.
4--10)</p></div><div className="text-right"><p
className="text-3xl font-bold text-green-800">{totalPct}%</p><p
className="text-xs text-gray-500">{totalDone}/{totalItems}
requisitos</p></div></div>

<div className="h-2.5 rounded-full bg-gray-100 overflow-hidden
mb-5"><div className="h-full rounded-full bg-green-700
transition-all" style={{width:`${totalPct}%`}}/></div>

<div className="grid grid-cols-7 gap-2
mb-5">{Object.entries(ISO_DATA).map(([sid])=>{const
p=secPct(sid);return(<button key={sid} onClick={()=>setOpenSec(sid)}
className={`p-3 rounded-xl border-2 text-center transition-all
${openSec===sid?'border-green-700 bg-green-50':'border-gray-100
bg-white hover:border-gray-200'}`}><p className="text-lg
font-bold"
style={{color:p===100?'#10B981':p>50?'#3B82F6':p>0?'#F59E0B':'#9CA3AF'}}>{p}%</p><p
className="text-[10px] text-gray-400 mt-0.5">Cap.
{sid}</p></button>);})}</div>

{Object.entries(ISO_DATA).map(([sid,sec])=>openSec!==sid?null:(

<Card key={sid} className="p-5">

<div className="flex items-center justify-between
mb-4"><div><span className="text-xs font-bold text-green-800
bg-green-100 px-2 py-0.5 rounded-full">Cap. {sid}</span><h3
className="font-semibold text-gray-800
mt-1">{sec.nombre}</h3></div><div className="text-right"><p
className="text-xl font-bold
text-green-800">{secPct(sid)}%</p><div className="w-16 h-1.5
rounded-full bg-gray-100 mt-1 ml-auto overflow-hidden"><div
className="h-full rounded-full bg-green-700"
style={{width:`${secPct(sid)}%`}}/></div></div></div>

<div className="space-y-2">{sec.items.map(item=>{const
checked=!!((secs[sid]||{})[item.id]);return(<label key={item.id}
className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer
transition-all ${checked?'bg-green-50 border
border-green-200':'bg-gray-50 border border-gray-100
hover:bg-gray-100'}`}><div onClick={()=>toggle(sid,item.id)}
className={`w-5 h-5 rounded flex items-center justify-center
flex-shrink-0 mt-0.5 border-2 ${checked?'bg-green-700
border-green-700':'border-gray-300'}`}>{checked&&<Ic n="check"
s={11} c="white"/>}</div><span className={`text-sm
leading-relaxed ${checked?'text-green-900':'text-gray-700'}`}
onClick={()=>toggle(sid,item.id)}>{item.texto}</span></label>);})}</div>

<div className="flex gap-2 mt-4 pt-4 border-t
border-gray-100">{Number(sid)>4&&<Btn variant="secondary"
size="sm" onClick={()=>setOpenSec(String(Number(sid)-1))}><Ic
n="cl" s={13}/>Anterior</Btn>}{Number(sid)<10&&<Btn size="sm"
onClick={()=>setOpenSec(String(Number(sid)+1))}>Siguiente<Ic n="cr"
s={13}/></Btn>}</div>

</Card>

))}

</div>

);

}

/* ── APP ROOT ────────────────────────────── */

export default ConsultorPanel;
