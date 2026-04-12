import React, { useState } from 'react';
import { Ic } from './constants';
import { Btn, Card } from './ui';
import { uid, today, generateTramites } from './utils';
import { Q_STEPS } from './Dashboard';

export function Questionnaire({projectData,updateProject,setScreen}){

const
ex=projectData.cuestionario?.respondido?projectData.cuestionario.respuestas:{};

const [step,setStep]=useState(0);

const
[resp,setResp]=useState({giro:ex.giro||'',emisiones:ex.emisiones??null,agua:ex.agua??null,residuos_peligrosos:ex.residuos_peligrosos??false,residuos_especiales:ex.residuos_especiales??false,obras:ex.obras??null});

const [done,setDone]=useState(projectData.cuestionario?.respondido);

const cur=Q_STEPS[step];

const
canNext=cur.tipo==='select'?!!resp[cur.id]:cur.tipo==='yesno'?resp[cur.id]!==null:true;

const finish=()=>{

const tramites=generateTramites(resp);

const
alertas=[...projectData.alertas,{id:uid(),tipo:'info',mensaje:`Diagnóstico
completado. Se identificaron ${tramites.length} trámites
aplicables.`,fecha:today(),leido:false,tramite_id:null}];

updateProject({cuestionario:{respondido:true,respuestas:resp,fecha:today()},tramites,alertas});

setDone(true);

};

if(done){

return(

<div className="p-6 fade-in max-w-2xl mx-auto">

<Card className="p-8 text-center">

<div className="w-14 h-14 rounded-full bg-green-100 flex items-center
justify-center mx-auto mb-4"><Ic n="checkCircle" s={28}
c="#166534"/></div>

<h2 className="text-xl font-bold text-gray-900 mb-2">Diagnóstico
completado</h2>

<p className="text-gray-500 mb-5">Se identificaron
<strong>{projectData.tramites.length} trámites ambientales
aplicables</strong>.</p>

<div className="flex gap-3 justify-center"><Btn
onClick={()=>setScreen('tramites')}>Ver trámites</Btn><Btn
variant="secondary"
onClick={()=>{setDone(false);setStep(0);}}>Repetir
diagnóstico</Btn></div>

</Card>

</div>

);

}

return(

<div className="p-6 fade-in max-w-2xl mx-auto">

<div className="mb-5"><h1 className="text-xl font-bold
text-gray-900">Diagnóstico de Obligaciones Ambientales</h1><p
className="text-sm text-gray-500">5 preguntas estratégicas · LGEEPA,
LGPGIR, Ley Ambiental NL</p></div>

<div className="flex gap-1.5 mb-5">{Q_STEPS.map((_,i)=><div
key={i} className={`flex-1 h-1.5 rounded-full
${i<=step?'bg-green-700':'bg-gray-200'}`}/>)}</div>

<Card className="p-6">

<div className="flex items-start gap-3 mb-5">

<span className="w-7 h-7 rounded-full bg-green-800 text-white text-sm
font-bold flex items-center justify-center
flex-shrink-0">{step+1}</span>

<div><h2 className="font-semibold
text-gray-800">{cur.titulo}</h2><p className="text-xs
text-gray-500 mt-1">{cur.ayuda}</p></div>

</div>

{cur.tipo==='select'&&<div className="grid grid-cols-2
gap-2">{cur.opciones.map(o=><button key={o.value}
onClick={()=>setResp(r=>({...r,[cur.id]:o.value}))}
className={`p-3 rounded-xl border-2 text-sm text-left transition-all
${resp[cur.id]===o.value?'border-green-700 bg-green-50
text-green-900 font-medium':'border-gray-200 text-gray-700
hover:border-gray-300'}`}>{o.label}</button>)}</div>}

{cur.tipo==='yesno'&&<div className="flex
gap-4">{[{v:true,l:'Sí'},{v:false,l:'No'}].map(o=><button
key={String(o.v)} onClick={()=>setResp(r=>({...r,[cur.id]:o.v}))}
className={`flex-1 py-4 rounded-xl border-2 font-semibold text-lg
transition-all ${resp[cur.id]===o.v?'border-green-700 bg-green-50
text-green-900':'border-gray-200 text-gray-500
hover:border-gray-300'}`}>{o.l}</button>)}</div>}

{cur.tipo==='multicheck'&&<div
className="space-y-3">{cur.opciones.map(o=><label key={o.id}
className="flex items-center gap-3 p-3 rounded-xl border-2
cursor-pointer"
style={resp[o.id]?{borderColor:'#166534',background:'#f0fdf4'}:{borderColor:'#e5e7eb'}}><input
type="checkbox" checked={!!resp[o.id]}
onChange={e=>setResp(r=>({...r,[o.id]:e.target.checked}))}
className="w-4 h-4 accent-green-700"/><span className="text-sm
text-gray-700">{o.label}</span></label>)}<p className="text-xs
text-gray-400">Puedes seleccionar ninguna, una o ambas.</p></div>}

<div className="flex justify-between mt-5 pt-4 border-t
border-gray-100">

<Btn variant="secondary" onClick={()=>setStep(s=>s-1)}
disabled={step===0}><Ic n="cl" s={14}/>Anterior</Btn>

{step<Q_STEPS.length-1?<Btn onClick={()=>setStep(s=>s+1)}
disabled={!canNext}>Siguiente<Ic n="cr" s={14}/></Btn>:<Btn
onClick={finish} disabled={!canNext}><Ic n="checkCircle"
s={14}/>Finalizar</Btn>}

</div>

</Card>

</div>

);

}

/* ── TRAMITES LIST ───────────────────────── */

export default Questionnaire;
