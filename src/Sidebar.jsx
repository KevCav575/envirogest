import React, { useState, useMemo } from 'react';
import { Ic } from './constants';
import { Card } from './ui';
import { giroLabel, giroColor } from './utils';

export const NAV=[

{id:'dashboard',label:'Dashboard',icon:'home'},

{id:'cuestionario',label:'Diagnóstico',icon:'clipboard'},

{id:'tramites',label:'Trámites',icon:'list'},

{id:'cronograma',label:'Cronograma',icon:'calendar'},

{id:'alertas',label:'Alertas',icon:'bell'},

{id:'consultor',label:'Panel Consultor',icon:'send'},

{id:'iso14001',label:'ISO 14001',icon:'shield'},

];

export function
Sidebar({screen,setScreen,clientUser,isConsultor,isAdmin,onBack,onLogout,alertaCount}){

return(

<div className="w-64 flex-shrink-0 flex flex-col h-screen sticky
top-0" style={{background:'#166534'}}>

{isConsultor?(

<button onClick={onBack} className="flex items-center gap-2 px-4 py-3
hover:bg-white/10 transition-colors text-left border-b
border-green-700">

<Ic n="cl" s={14} c="rgba(255,255,255,0.7)"/>

<span className="text-green-200 text-xs">{isAdmin?'Volver al panel
admin':'Volver a clientes'}</span>

</button>

):(

<div className="px-4 py-3 border-b border-green-700 flex items-center
gap-3">

<div className="w-8 h-8 rounded-lg bg-white/20 flex items-center
justify-center flex-shrink-0"><Ic n="leaf" s={16}
c="white"/></div>

<div><p className="text-white font-bold text-xs">EnviroGest
MX</p><p className="text-green-300
text-[10px]">BIOIMPACT</p></div>

</div>

)}

{clientUser&&(

<div className="px-4 py-2.5 bg-green-900/40 border-b
border-green-700">

<div className="flex items-center gap-2">

<div className="w-7 h-7 rounded-lg flex items-center justify-center
text-[10px] font-bold text-white flex-shrink-0"
style={{background:giroColor(clientUser.giro)}}>{clientUser.empresa.slice(0,2).toUpperCase()}</div>

<div className="min-w-0"><p className="text-white font-semibold
text-xs truncate">{clientUser.empresa}</p><p
className="text-green-300 text-[10px]
truncate">{giroLabel(clientUser.giro)}</p></div>

</div>

</div>

)}

<nav className="flex-1 p-3 overflow-y-auto">

{NAV.map(item=>{

if(item.id==='consultor'&&!isConsultor)return null;

const active=screen===item.id;

return(

<button key={item.id} onClick={()=>setScreen(item.id)}

className={`sidebar-item w-full flex items-center gap-3 px-3 py-2.5
rounded-lg mb-0.5 text-left ${active?'active':''}`}>

<div className="relative">

<Ic n={item.icon} s={16}
c={active?'white':'rgba(255,255,255,0.65)'}/>

{item.id==='alertas'&&alertaCount>0&&<span className="absolute
-top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full text-white
text-[8px] flex items-center justify-center
font-bold">{alertaCount>9?'9+':alertaCount}</span>}

</div>

<span className={`text-sm font-medium
${active?'text-white':'text-green-100'}`}>{item.label}</span>

</button>

);

})}

</nav>

<div className="p-3 border-t border-green-700">

<div className="flex items-center gap-2 px-2 py-1.5">

<div className="w-7 h-7 rounded-full bg-white/20 flex items-center
justify-center flex-shrink-0"><Ic n="user" s={13}
c="white"/></div>

<div className="flex-1 min-w-0"><p className="text-white text-xs
font-medium truncate">{clientUser?.nombre||'Usuario'}</p><p
className="text-green-300 text-[10px]
truncate">{clientUser?.email}</p></div>

<button onClick={onLogout} className="p-1 hover:bg-white/10
rounded-lg"><Ic n="logout" s={13}
c="rgba(255,255,255,0.6)"/></button>

</div>

</div>

</div>

);

}

/* ── CALENDAR WIDGET ─────────────────────── */

export function CalendarWidget({tramites,alertas}){

const [cur,setCur]=useState(new Date());

const [sel,setSel]=useState(null);

const year=cur.getFullYear(),month=cur.getMonth();

const firstDay=new Date(year,month,1).getDay();

const daysInMonth=new Date(year,month+1,0).getDate();

const todayD=new Date();

const events=useMemo(()=>{

const m={};

tramites.forEach(t=>{

(t.cronograma?.hitos||[]).forEach(h=>{if(h.fecha)(m[h.fecha]=m[h.fecha]||[]).push({type:'hito',done:h.completado});});

if(t.fecha_limite)(m[t.fecha_limite]=m[t.fecha_limite]||[]).push({type:'limit'});

});

alertas.forEach(a=>{const
d=a.fecha?.slice(0,10);if(d)(m[d]=m[d]||[]).push({type:'alert'});});

return m;

},[tramites,alertas]);

const
meses=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const
selStr=sel?`${year}-${String(month+1).padStart(2,'0')}-${String(sel).padStart(2,'0')}`:null;

return(

<Card className="p-4">

<div className="flex items-center justify-between mb-3">

<h3 className="font-semibold text-gray-800">{meses[month]}
{year}</h3>

<div className="flex gap-1">

<button onClick={()=>setCur(new Date(year,month-1,1))}
className="p-1.5 hover:bg-gray-100 rounded-lg"><Ic n="cl"
s={14}/></button>

<button onClick={()=>setCur(new Date(year,month+1,1))}
className="p-1.5 hover:bg-gray-100 rounded-lg"><Ic n="cr"
s={14}/></button>

</div>

</div>

<div className="grid grid-cols-7 mb-1">

{['D','L','M','X','J','V','S'].map(d=><div key={d}
className="text-center text-[10px] font-medium text-gray-400
py-1">{d}</div>)}

</div>

<div className="grid grid-cols-7 gap-0.5">

{Array(firstDay).fill(null).map((_,i)=><div key={'e'+i}/>)}

{Array.from({length:daysInMonth},(_,i)=>i+1).map(d=>{

const
ds=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

const ev=events[ds]||[];

const
isToday=todayD.getDate()===d&&todayD.getMonth()===month&&todayD.getFullYear()===year;

return(

<button key={d} onClick={()=>setSel(sel===d?null:d)}

className={`flex flex-col items-center p-1 rounded-lg text-xs
transition-all ${isToday?'bg-green-800 text-white
font-bold':sel===d?'bg-green-50 ring-1 ring-green-400
text-gray-700':'text-gray-600 hover:bg-gray-50'}`}>

<span>{d}</span>

{ev.length>0&&<div className="flex gap-0.5
mt-0.5">{ev.slice(0,3).map((e,i)=><span key={i} className="w-1 h-1
rounded-full"
style={{background:e.type==='alert'?'#DC2626':e.type==='limit'?'#F59E0B':e.done?'#10B981':'#F59E0B'}}/>)}</div>}

</button>

);

})}

</div>

{sel&&selStr&&(

<div className="mt-3 p-3 bg-gray-50 rounded-lg">

<p className="text-xs font-semibold text-gray-700
mb-1">{selStr}</p>

{(events[selStr]||[]).length===0?<p className="text-xs
text-gray-400">Sin actividades</p>:

(events[selStr]).map((e,i)=><div key={i} className="flex
items-center gap-2 text-xs text-gray-600 mb-1"><span className="w-2
h-2 rounded-full"
style={{background:e.type==='alert'?'#DC2626':e.type==='limit'?'#F59E0B':e.done?'#10B981':'#F59E0B'}}/><span>{e.type==='alert'?'Alerta':e.type==='limit'?'Fecha
límite':e.done?'Hito completado':'Hito
pendiente'}</span></div>)}

</div>

)}

<div className="flex gap-4 mt-3 pt-2 border-t border-gray-100">

{[{c:'#10B981',l:'Completado'},{c:'#F59E0B',l:'Pendiente'},{c:'#DC2626',l:'Alerta'}].map(x=><div
key={x.l} className="flex items-center gap-1"><span className="w-2
h-2 rounded-full" style={{background:x.c}}/><span
className="text-[10px] text-gray-400">{x.l}</span></div>)}

</div>

</Card>

);

}

/* ── DASHBOARD ───────────────────────────── */

export default CalendarWidget;
