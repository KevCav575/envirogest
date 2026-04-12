import React, { useState, useMemo } from 'react';
import { Ic, ESTADOS } from './constants';
import { Btn, Card, Badge } from './ui';
import { uid, fmtDate, today } from './utils';

export function TramitesList({projectData,onSelect}){

const {tramites}=projectData;

const [filter,setFilter]=useState('todos');

const [search,setSearch]=useState('');

const
filtered=tramites.filter(t=>(filter==='todos'||t.nivel===filter)&&(!search||(t.nombre+t.autoridad).toLowerCase().includes(search.toLowerCase())));

if(!tramites.length)return(<div className="p-6 flex flex-col
items-center justify-center" style={{minHeight:400}}><Ic
n="clipboard" s={44} c="#D1D5DB"/><p className="text-lg
font-semibold text-gray-400 mt-4">Sin trámites identificados</p><p
className="text-sm text-gray-400">Completa el diagnóstico
primero.</p></div>);

return(

<div className="p-6 fade-in">

<div className="flex items-center justify-between mb-5"><div><h1
className="text-xl font-bold text-gray-900">Mis Trámites</h1><p
className="text-sm text-gray-500">{tramites.length} trámites
identificados</p></div></div>

<div className="flex gap-3 mb-5">

<div className="flex gap-1 bg-gray-100 p-1
rounded-lg">{['todos','federal','estatal','municipal'].map(n=><button
key={n} onClick={()=>setFilter(n)} className={`px-3 py-1.5 rounded-md
text-xs font-medium transition-all capitalize ${filter===n?'bg-white
shadow
text-gray-800':'text-gray-500'}`}>{n==='todos'?'Todos':n.charAt(0).toUpperCase()+n.slice(1)}</button>)}</div>

<div className="relative"><input value={search}
onChange={e=>setSearch(e.target.value)} placeholder="Buscar..."
className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm
focus:outline-none focus:ring-2 focus:ring-green-700 w-48"/><Ic
n="list" s={13} cls="absolute left-2.5 top-2.5
text-gray-400"/></div>

</div>

<div className="space-y-3">{filtered.map(t=>{const
e=ESTADOS[t.estado]||ESTADOS.no_iniciado;return(

<Card key={t._id} className="p-4 hover:shadow-md transition-shadow
cursor-pointer" onClick={()=>onSelect(t)}>

<div className="flex items-start gap-4">

<div className="w-9 h-9 rounded-xl flex items-center justify-center
flex-shrink-0" style={{background:e.bg}}><Ic n="file" s={17}
c={e.color}/></div>

<div className="flex-1 min-w-0">

<div className="flex items-start justify-between gap-2"><div><h3
className="font-semibold text-gray-800 text-sm">{t.nombre}</h3><p
className="text-xs text-gray-400">{t.autoridad}</p></div><Badge
label={e.label} color={e.color} bg={e.bg}/></div>

<p className="text-xs text-gray-500 mt-1.5
line-clamp-2">{t.descripcion}</p>

<div className="flex items-center gap-3 mt-2"><div
className="flex-1 h-1.5 rounded-full bg-gray-100
overflow-hidden"><div className="h-full rounded-full"
style={{width:`${e.pct}%`,background:e.color}}/></div><span
className="text-xs
text-gray-400">{e.pct}%</span>{t.fecha_limite&&<span
className="text-xs
text-gray-400">{fmtDate(t.fecha_limite)}</span>}<span
className={`text-xs px-2 py-0.5 rounded-full font-medium
${t.nivel==='federal'?'bg-blue-50
text-blue-700':t.nivel==='estatal'?'bg-purple-50
text-purple-700':'bg-orange-50
text-orange-700'}`}>{t.nivel}</span></div>

</div>

<Ic n="cr" s={15} c="#9CA3AF"/>

</div>

</Card>

);})}</div>

</div>

);

}

/* ── TRAMITE DETAIL ──────────────────────── */

export function TramiteDetail({tramite,projectData,updateProject,onBack}){

const [t,setT]=useState(tramite);

const [newNota,setNewNota]=useState('');

const [newHito,setNewHito]=useState({nombre:'',fecha:''});

const save=updates=>{const
u={...t,...updates};setT(u);updateProject({tramites:projectData.tramites.map(x=>x._id===t._id?u:x)});};

const e=ESTADOS[t.estado]||ESTADOS.no_iniciado;

const
addNota=()=>{if(!newNota.trim())return;save({notas2:[...(t.notas2||[]),{id:uid(),texto:newNota,fecha:today()}]});setNewNota('');};

const
addHito=()=>{if(!newHito.nombre)return;save({cronograma:{...t.cronograma,hitos:[...(t.cronograma?.hitos||[]),{id:uid(),...newHito,completado:false}]}});setNewHito({nombre:'',fecha:''});};

const
toggleHito=hid=>save({cronograma:{...t.cronograma,hitos:(t.cronograma?.hitos||[]).map(h=>h.id===hid?{...h,completado:!h.completado}:h)}});

return(

<div className="p-6 fade-in">

<button onClick={onBack} className="flex items-center gap-2 text-sm
text-gray-500 hover:text-gray-700 mb-4"><Ic n="cl" s={14}/>Volver
a trámites</button>

<div className="flex items-start justify-between mb-5"><div><h1
className="text-xl font-bold text-gray-900">{t.nombre}</h1><p
className="text-sm text-gray-500">{t.autoridad} · <span
className={`font-medium
${t.nivel==='federal'?'text-blue-600':t.nivel==='estatal'?'text-purple-600':'text-orange-600'}`}>{t.nivel}</span></p></div><Badge
label={e.label} color={e.color} bg={e.bg}/></div>

<div className="grid grid-cols-3 gap-5">

<div className="col-span-2 space-y-4">

<Card className="p-4"><h3 className="font-semibold text-gray-700
text-sm mb-2 flex items-center gap-2"><Ic n="file"
s={14}/>Fundamento Legal</h3><p className="text-xs text-gray-600
leading-relaxed">{t.base_legal}</p></Card>

<Card className="p-4"><h3 className="font-semibold text-gray-700
text-sm mb-2">Descripción</h3><p className="text-sm text-gray-600
leading-relaxed">{t.descripcion}</p></Card>

<Card className="p-4">

<h3 className="font-semibold text-gray-700 text-sm mb-3 flex
items-center gap-2"><Ic n="clock" s={14}/>Hitos</h3>

{(t.cronograma?.hitos||[]).length===0?<p className="text-xs
text-gray-400 mb-3">Sin hitos</p>:<div className="space-y-2
mb-3">{(t.cronograma.hitos||[]).map(h=><div key={h.id}
className="flex items-center gap-3 p-2 rounded-lg
bg-gray-50"><button onClick={()=>toggleHito(h.id)} className={`w-5
h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
${h.completado?'bg-green-600
border-green-600':'border-gray-300'}`}>{h.completado&&<Ic
n="check" s={10} c="white"/>}</button><span className={`flex-1
text-xs ${h.completado?'line-through
text-gray-400':'text-gray-700'}`}>{h.nombre}</span>{h.fecha&&<span
className="text-[10px]
text-gray-400">{fmtDate(h.fecha)}</span>}</div>)}</div>}

<div className="flex gap-2"><input value={newHito.nombre}
onChange={e=>setNewHito(h=>({...h,nombre:e.target.value}))}
placeholder="Nuevo hito..." className="flex-1 border border-gray-200
rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1
focus:ring-green-700"/><input type="date" value={newHito.fecha}
onChange={e=>setNewHito(h=>({...h,fecha:e.target.value}))}
className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs
focus:outline-none focus:ring-1 focus:ring-green-700"/><Btn
onClick={addHito} size="sm"><Ic n="plus"
s={12}/>Agregar</Btn></div>

</Card>

<Card className="p-4">

<h3 className="font-semibold text-gray-700 text-sm
mb-3">Notas</h3>

{(t.notas2||[]).length===0?<p className="text-xs text-gray-400
mb-3">Sin notas</p>:<div className="space-y-2
mb-3">{(t.notas2||[]).map(n=><div key={n.id} className="p-2.5
bg-yellow-50 rounded-lg border border-yellow-100"><p
className="text-xs text-gray-700">{n.texto}</p><p
className="text-[10px] text-gray-400
mt-1">{fmtDate(n.fecha)}</p></div>)}</div>}

<div className="flex gap-2"><input value={newNota}
onChange={e=>setNewNota(e.target.value)}
onKeyDown={e=>{if(e.key==='Enter')addNota();}} placeholder="Agregar
nota..." className="flex-1 border border-gray-200 rounded-lg px-3
py-1.5 text-xs focus:outline-none focus:ring-1
focus:ring-green-700"/><Btn onClick={addNota}
size="sm">Guardar</Btn></div>

</Card>

</div>

<div className="space-y-4">

<Card className="p-4">

<h3 className="font-semibold text-gray-700 text-sm
mb-3">Estado</h3>

<div
className="space-y-1.5">{Object.entries(ESTADOS).map(([k,v])=><button
key={k} onClick={()=>save({estado:k})} className={`w-full flex
items-center gap-3 p-2.5 rounded-lg border-2 text-left transition-all
${t.estado===k?'border-current':'border-transparent bg-gray-50
hover:bg-gray-100'}`}
style={t.estado===k?{borderColor:v.color,background:v.bg}:{}}><span
className="w-2.5 h-2.5 rounded-full flex-shrink-0"
style={{background:v.color}}/><span className="text-xs font-medium"
style={t.estado===k?{color:v.color}:{}}>{v.label}</span>{t.estado===k&&<Ic
n="check" s={12} c={v.color} cls="ml-auto"/>}</button>)}</div>

</Card>

<Card className="p-4">

<h3 className="font-semibold text-gray-700 text-sm
mb-3">Fechas</h3>

<div className="space-y-2">

<div><label className="text-xs text-gray-500 block
mb-0.5">Inicio</label><input type="date"
value={t.cronograma?.inicio||''}
onChange={e=>save({cronograma:{...t.cronograma,inicio:e.target.value}})}
className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs
focus:outline-none focus:ring-1 focus:ring-green-700"/></div>

<div><label className="text-xs text-gray-500 block mb-0.5">Fecha
límite</label><input type="date" value={t.fecha_limite||''}
onChange={e=>save({fecha_limite:e.target.value})} className="w-full
border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none
focus:ring-1 focus:ring-green-700"/></div>

<div><label className="text-xs text-gray-500 block mb-0.5">Fin /
Resolución</label><input type="date"
value={t.cronograma?.fin||''}
onChange={e=>save({cronograma:{...t.cronograma,fin:e.target.value}})}
className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs
focus:outline-none focus:ring-1 focus:ring-green-700"/></div>

</div>

</Card>

<Card className="p-4 text-center"><p className="text-3xl
font-bold" style={{color:e.color}}>{e.pct}%</p><div className="h-2
rounded-full bg-gray-100 overflow-hidden mt-2"><div
className="h-full rounded-full"
style={{width:`${e.pct}%`,background:e.color}}/></div><p
className="text-xs text-gray-400 mt-2">Avance</p></Card>

</div>

</div>

</div>

);

}

/* ── CRONOGRAMA ──────────────────────────── */

export default TramiteDetail;
