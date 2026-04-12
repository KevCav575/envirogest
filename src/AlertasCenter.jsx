import React, { useState, useMemo } from 'react';
import { Ic } from './constants';
import { Btn } from './ui';
import { fmtDate } from './utils';

export function AlertasCenter({projectData,updateProject}){

const {alertas,tramites}=projectData;

const [filter,setFilter]=useState('todas');

const
markRead=id=>updateProject({alertas:alertas.map(a=>a.id===id?{...a,leido:true}:a)});

const
delAlerta=id=>updateProject({alertas:alertas.filter(a=>a.id!==id)});

const
filtered=alertas.filter(a=>filter==='todas'||(filter==='no_leidas'&&!a.leido)||(filter==='leidas'&&a.leido));

const
tipos={vencimiento:{c:'#DC2626',bg:'#FEF2F2',i:'alert'},solicitud:{c:'#F59E0B',bg:'#FFFBEB',i:'file'},firma:{c:'#3B82F6',bg:'#EFF6FF',i:'edit'},visita:{c:'#8B5CF6',bg:'#F5F3FF',i:'calendar'},estado:{c:'#10B981',bg:'#ECFDF5',i:'checkCircle'},info:{c:'#6B7280',bg:'#F9FAFB',i:'info'}};

return(

<div className="p-6 fade-in">

<div className="flex items-center justify-between mb-5"><div><h1
className="text-xl font-bold text-gray-900">Centro de
Alertas</h1><p className="text-sm
text-gray-500">{alertas.filter(a=>!a.leido).length} sin
leer</p></div>{alertas.some(a=>!a.leido)&&<Btn
variant="secondary" size="sm"
onClick={()=>updateProject({alertas:alertas.map(a=>({...a,leido:true}))})}>Marcar
todas leídas</Btn>}</div>

<div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit
mb-5">{[{id:'todas',l:'Todas'},{id:'no_leidas',l:'No
leídas'},{id:'leidas',l:'Leídas'}].map(f=><button key={f.id}
onClick={()=>setFilter(f.id)} className={`px-4 py-1.5 rounded-md
text-xs font-medium transition-all ${filter===f.id?'bg-white shadow
text-gray-800':'text-gray-500'}`}>{f.l}</button>)}</div>

{filtered.length===0?<div className="flex flex-col items-center
py-16"><Ic n="bell" s={40} c="#D1D5DB"/><p
className="text-gray-400 mt-3">Sin alertas</p></div>:

<div className="space-y-2">{filtered.map(a=>{const
ti=tipos[a.tipo]||tipos.info;const
tr=tramites.find(t=>t._id===a.tramite_id);return(

<div key={a.id} className={`rounded-xl border p-4 flex gap-4
${a.leido?'bg-white border-gray-100':'border-amber-200
bg-amber-50'}`}>

<div className="w-9 h-9 rounded-xl flex items-center justify-center
flex-shrink-0" style={{background:ti.bg}}><Ic n={ti.i} s={16}
c={ti.c}/></div>

<div className="flex-1 min-w-0"><p className={`text-sm
${a.leido?'text-gray-600':'text-gray-800
font-medium'}`}>{a.mensaje}</p><div className="flex items-center
gap-3 mt-1"><span className="text-[10px]
text-gray-400">{fmtDate(a.fecha)}</span>{tr&&<span
className="text-[10px] text-blue-600
truncate">{tr.nombre}</span>}{!a.leido&&<span
className="text-[10px] font-medium text-amber-600">●
Nueva</span>}</div></div>

<div className="flex gap-1">{!a.leido&&<button
onClick={()=>markRead(a.id)} className="p-1.5 hover:bg-white
rounded-lg"><Ic n="eye" s={14} c="#6B7280"/></button>}<button
onClick={()=>delAlerta(a.id)} className="p-1.5 hover:bg-white
rounded-lg"><Ic n="trash" s={14}
c="#9CA3AF"/></button></div>

</div>

);})}</div>}

</div>

);

}

/* ── CONSULTOR PANEL ─────────────────────── */

export default AlertasCenter;
