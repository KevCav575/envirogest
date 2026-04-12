import React from 'react';
import { Ic } from './constants';

export const
Btn=({onClick,children,variant='primary',size='md',disabled=false,className=''})=>{

const v={primary:'bg-green-800 hover:bg-green-900
text-white',secondary:'bg-white hover:bg-gray-50 text-gray-700 border
border-gray-200',danger:'bg-red-600 hover:bg-red-700
text-white',ghost:'bg-transparent hover:bg-gray-100
text-gray-600',outline:'bg-transparent border border-green-700
text-green-700 hover:bg-green-50'};

const sz={sm:'px-3 py-1.5 text-xs',md:'px-4 py-2 text-sm',lg:'px-5
py-2.5 text-base'};

return<button onClick={onClick} disabled={disabled}
className={`inline-flex items-center gap-2 font-medium rounded-lg
transition-all cursor-pointer border-0 outline-none ${v[variant]}
${sz[size]} ${disabled?'opacity-50 cursor-not-allowed':''}
${className}`}>{children}</button>;

};

export const Card=({children,className=''})=><div className={`bg-white
rounded-xl shadow-sm border border-gray-100
${className}`}>{children}</div>;

export const Badge=({label,color,bg})=><span className="inline-flex
items-center px-2 py-0.5 rounded-full text-xs font-medium"
style={{color,background:bg}}>{label}</span>;

export const
Input=({label,value,onChange,type='text',placeholder='',required=false,className=''})=>(

<div className={`flex flex-col gap-1 ${className}`}>

{label&&<label className="text-xs font-medium
text-gray-600">{label}{required&&<span className="text-red-500
ml-0.5">\*</span>}</label>}

<input type={type} value={value}
onChange={e=>onChange(e.target.value)} placeholder={placeholder}

className="border border-gray-200 rounded-lg px-3 py-2 text-sm
focus:outline-none focus:ring-2 focus:ring-green-700
focus:border-transparent"/>

</div>

);

export const
Select=({label,value,onChange,options,required=false,className=''})=>(

<div className={`flex flex-col gap-1 ${className}`}>

{label&&<label className="text-xs font-medium
text-gray-600">{label}{required&&<span className="text-red-500
ml-0.5">\*</span>}</label>}

<select value={value} onChange={e=>onChange(e.target.value)}
className="border border-gray-200 rounded-lg px-3 py-2 text-sm
focus:outline-none focus:ring-2 focus:ring-green-700 bg-white">

<option value="">Seleccionar...</option>

{options.map(o=><option key={o.value||o}
value={o.value||o}>{o.label||o}</option>)}

</select>

</div>

);

export const Modal=({open,onClose,title,children,width='max-w-lg'})=>{

if(!open)return null;

return<div className="fixed inset-0 z-50 flex items-center
justify-center p-4" style={{background:'rgba(0,0,0,0.45)'}}>

<div className={`bg-white rounded-2xl shadow-2xl w-full ${width}
max-h-[90vh] overflow-y-auto`}>

<div className="flex items-center justify-between p-5 border-b
border-gray-100">

<h3 className="font-semibold text-gray-800">{title}</h3>

<button onClick={onClose} className="p-1 rounded-lg
hover:bg-gray-100"><Ic n="x" s={16}/></button>

</div>

<div className="p-5">{children}</div>

</div>

</div>;

};

/* ── AUTH SCREEN ─────────────────────────── */

export default Modal;
