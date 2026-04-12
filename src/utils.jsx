import React from 'react';
import { STORAGE_KEY, GIROS, TRAMITES_CATALOG } from './constants';

export function hashPwd(s){let h=0;for(let
i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;}return
h.toString(36);}

export function uid(){return
Date.now().toString(36)+Math.random().toString(36).slice(2,6);}

export function fmtDate(s){if(!s)return'---';return new
Date(s+'T00:00:00').toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'});}

export function today(){return new Date().toISOString().slice(0,10);}

export const ADMIN_ID='bioimpact_admin_v1';

export const EMPTY_DATA={

usuarios:[{id:ADMIN_ID,nombre:'Raúl',empresa:'BIOIMPACT',email:'admin@bioimpact.com.mx',pwd_hash:hashPwd('bioimpact2026'),rol:'admin'}],

proyectos:[]

};

export function ensureAdmin(d){

if(!d.usuarios)d.usuarios=[];

if(!d.proyectos)d.proyectos=[];

if(!d.usuarios.find(u=>u.id===ADMIN_ID)){

d.usuarios.unshift({id:ADMIN_ID,nombre:'Raúl',empresa:'BIOIMPACT',email:'admin@bioimpact.com.mx',pwd_hash:hashPwd('bioimpact2026'),rol:'admin'});

}

return d;

}

export function loadData(){

try{

const raw=localStorage.getItem(STORAGE_KEY);

if(!raw)return JSON.parse(JSON.stringify(EMPTY_DATA));

const d=JSON.parse(raw);

return ensureAdmin(d);

}catch{return JSON.parse(JSON.stringify(EMPTY_DATA));}

}

export function
saveData(d){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(d));}catch{}}

export function generateTramites(resp){

const ctx={...resp};

return TRAMITES_CATALOG.filter(t=>t.condicion(ctx)).map(t=>({

...t,_id:uid(),estado:'no_iniciado',fecha_limite:null,

cronograma:{inicio:null,fin:null,hitos:[],notas:'',dependencias:[]},

documentos:[],notas2:[],

}));

}

export function giroLabel(id){return GIROS.find(g=>g.id===id)?.label||id;}

export function giroColor(id){return
GIROS.find(g=>g.id===id)?.color||'#9CA3AF';}

/* ── UI PRIMITIVES ───────────────────────── */

export default giroColor;
