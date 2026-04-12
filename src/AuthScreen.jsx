import React, { useState } from 'react';
import { Ic, GIROS } from './constants';
import { Card, Input, Select } from './ui';
import { hashPwd, uid } from './utils';

export function AuthScreen({onAuth,data,setData}){

const [mode,setMode]=useState('login');

const [email,setEmail]=useState('');

const [pwd,setPwd]=useState('');

const [nombre,setNombre]=useState('');

const [empresa,setEmpresa]=useState('');

const [giro,setGiro]=useState('');

const [error,setError]=useState('');

const handleLogin=()=>{

if(!email||!pwd){setError('Ingresa email y contraseña.');return;}

const
u=data.usuarios.find(u=>u.email===email&&u.pwd_hash===hashPwd(pwd));

if(!u){setError('Credenciales incorrectas. Verifica tus datos o
contacta a BIOIMPACT.');return;}

onAuth(u);

};

const handleRegister=()=>{

if(!nombre||!empresa||!email||!pwd||!giro){setError('Completa
todos los campos.');return;}

if(pwd.length<6){setError('La contraseña debe tener al menos 6
caracteres.');return;}

if(data.usuarios.find(u=>u.email===email)){setError('Ya existe una
cuenta con ese correo.');return;}

const
newU={id:uid(),nombre,empresa,giro,email,pwd_hash:hashPwd(pwd),rol:'cliente'};

setData(d=>({...d,usuarios:[...d.usuarios,newU]}));

onAuth(newU);

};

return(

<div className="auth-bg"
style={{minHeight:'100vh',display:'flex',flexDirection:'row',position:'relative',overflow:'hidden'}}>

{/* ── Decorative glow orbs ── */}

<div
style={{position:'absolute',top:'-80px',left:'-80px',width:'320px',height:'320px',borderRadius:'9999px',background:'radial-gradient(circle,rgba(16,185,129,0.25)
0%,transparent 70%)',pointerEvents:'none'}}/>

<div
style={{position:'absolute',bottom:'-60px',left:'30%',width:'260px',height:'260px',borderRadius:'9999px',background:'radial-gradient(circle,rgba(5,150,105,0.2)
0%,transparent 70%)',pointerEvents:'none'}}/>

<div
style={{position:'absolute',top:'20%',right:'42%',width:'180px',height:'180px',borderRadius:'9999px',background:'radial-gradient(circle,rgba(110,231,183,0.12)
0%,transparent 70%)',pointerEvents:'none'}}/>

{/* ── SVG forest silhouette ── */}

<svg
style={{position:'absolute',bottom:0,left:0,width:'100%',height:'220px',opacity:0.18,pointerEvents:'none'}}
viewBox="0 0 1440 220" preserveAspectRatio="none">

<path d="M0,220 L0,130 L40,80 L80,130 L100,90 L140,40 L180,90 L200,60
L240,110 L270,70 L310,30 L350,70 L380,50 L420,100 L450,60 L490,110
L520,80 L560,40 L600,80 L630,55 L670,100 L700,65 L740,30 L780,65 L810,45
L850,90 L880,55 L920,100 L950,70 L990,120 L1020,85 L1060,50 L1100,85
L1130,60 L1170,105 L1200,75 L1240,130 L1280,90 L1320,140 L1360,100
L1400,150 L1440,120 L1440,220 Z" fill="white"/>

</svg>

{/* ── Floating leaf orbs (CSS classes, no dynamic vars) ── */}

<div className="leaf-orb-1"
style={{position:'absolute',top:'8%',left:'4%',width:64,height:64,pointerEvents:'none'}}>

<Ic n="leaf" s={28} c="rgba(255,255,255,0.35)"/>

</div>

<div className="leaf-orb-2"
style={{position:'absolute',top:'55%',left:'8%',width:48,height:48,pointerEvents:'none'}}>

<Ic n="leaf" s={20} c="rgba(255,255,255,0.3)"/>

</div>

<div className="leaf-orb-3"
style={{position:'absolute',top:'25%',left:'14%',width:36,height:36,pointerEvents:'none'}}>

<Ic n="leaf" s={15} c="rgba(255,255,255,0.25)"/>

</div>

{/* ══ LEFT PANEL ══ */}

<div
style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',padding:'56px
64px',position:'relative',zIndex:2,minWidth:0}}>

{/* Logo badge */}

<div
style={{display:'inline-flex',alignItems:'center',gap:'14px',marginBottom:'40px'}}>

<div
style={{width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,rgba(16,185,129,0.35),rgba(5,150,105,0.2))',border:'1px
solid
rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(8px)'}}>

<Ic n="leaf" s={26} c="#6ee7b7"/>

</div>

<div>

<p
style={{color:'white',fontWeight:800,fontSize:22,letterSpacing:'-0.3px',margin:0,lineHeight:1.1}}>EnviroGest
MX</p>

<p
style={{color:'#6ee7b7',fontSize:12,fontWeight:500,margin:0,letterSpacing:'0.5px'}}>by
BIOIMPACT</p>

</div>

</div>

<h1
style={{color:'white',fontWeight:800,fontSize:'clamp(28px,3.5vw,52px)',lineHeight:1.1,margin:'0
0 20px 0',letterSpacing:'-1px'}}>

Gestión ambiental<br/>

<span
style={{background:'linear-gradient(90deg,#6ee7b7,#34d399)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>inteligente</span><br/>

para Nuevo León

</h1>

<p
style={{color:'rgba(209,250,229,0.85)',fontSize:16,lineHeight:1.7,maxWidth:440,margin:'0
0 40px 0'}}>

Diagnóstico automatizado de obligaciones, seguimiento de trámites ante
<strong style={{color:'#a7f3d0'}}>SEMARNAT</strong> y autoridades
estatales, cronograma editable y cumplimiento <strong
style={{color:'#a7f3d0'}}>ISO 14001:2015</strong>.

</p>

{/* Stats row */}

<div style={{display:'flex',gap:32,flexWrap:'wrap'}}>

{[{n:'13',l:'Trámites
catalogados',ic:'clipboard'},{n:'ISO',l:'14001:2015
integrado',ic:'shield'},{n:'NL',l:'Leyes y NOMs
vigentes',ic:'check'}].map(x=>(

<div key={x.n}
style={{display:'flex',alignItems:'center',gap:12}}>

<div
style={{width:40,height:40,borderRadius:12,background:'rgba(255,255,255,0.1)',border:'1px
solid
rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>

<Ic n={x.ic} s={18} c="#6ee7b7"/>

</div>

<div>

<p
style={{color:'white',fontWeight:800,fontSize:20,margin:0,lineHeight:1}}>{x.n}</p>

<p
style={{color:'rgba(167,243,208,0.7)',fontSize:11,margin:0,marginTop:2}}>{x.l}</p>

</div>

</div>

))}

</div>

{/* Bottom credit */}

<p
style={{position:'absolute',bottom:32,left:64,color:'rgba(255,255,255,0.25)',fontSize:11,margin:0}}>©
2026 BIOIMPACT · Allende, Nuevo León</p>

</div>

{/* Vertical divider */}

<div style={{width:1,background:'linear-gradient(to
bottom,transparent,rgba(255,255,255,0.12),transparent)',alignSelf:'stretch',flexShrink:0,display:'flex'}}/>

{/* ══ RIGHT PANEL: login card ══ */}

<div
style={{display:'flex',alignItems:'center',justifyContent:'center',padding:'40px
48px',position:'relative',zIndex:2,flexShrink:0}}>

<div className="auth-card" style={{width:420,padding:'40px'}}>

{/* Card header */}

<div
style={{display:'flex',alignItems:'center',gap:12,marginBottom:6}}>

<div
style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#064e3b,#059669)',display:'flex',alignItems:'center',justifyContent:'center'}}>

<Ic n="leaf" s={18} c="white"/>

</div>

<span
style={{fontWeight:700,fontSize:15,color:'#111827'}}>EnviroGest
MX</span>

</div>

<h2 style={{fontSize:22,fontWeight:800,color:'#111827',margin:'0 0
4px 0'}}>

{mode==='login'?'Bienvenido de vuelta':'Crear cuenta'}

</h2>

<p style={{fontSize:13,color:'#6b7280',margin:'0 0 24px 0'}}>

{mode==='login'?'Ingresa tus credenciales para continuar':'Completa
tu perfil para comenzar'}

</p>

{/* Tabs */}

<div
style={{display:'flex',background:'#064e3b',borderRadius:12,padding:4,marginBottom:24,gap:4}}>

<button className={'auth-tab-btn'+(mode==='login'?' on':'')}
onClick={()=>{setMode('login');setError('');}}>

Iniciar sesión

</button>

<button className={'auth-tab-btn'+(mode==='register'?' on':'')}
onClick={()=>{setMode('register');setError('');}}>

Registrarse

</button>

</div>

{error&&(

<div style={{marginBottom:16,padding:'10px
14px',background:'#fef2f2',border:'1px solid
#fecaca',borderRadius:10,fontSize:12,color:'#dc2626',display:'flex',gap:8,alignItems:'flex-start'}}>

<Ic n="alert" s={14} c="#dc2626"/>{error}

</div>

)}

{mode==='login'?(

<div className="space-y-4">

<Input label="Correo electrónico" value={email} onChange={setEmail}
type="email" placeholder="tu@empresa.com"/>

<Input label="Contraseña" value={pwd} onChange={setPwd}
type="password" placeholder="••••••••"/>

<button className="auth-submit" onClick={handleLogin}>Iniciar sesión
→</button>

</div>

):(

<div className="space-y-3">

<div className="grid grid-cols-2 gap-3">

<Input label="Nombre completo" value={nombre} onChange={setNombre}
placeholder="Juan García" required/>

<Input label="Empresa" value={empresa} onChange={setEmpresa}
placeholder="ACME S.A." required/>

</div>

<Select label="Giro industrial" value={giro} onChange={setGiro}
options={GIROS.map(g=>({value:g.id,label:g.label}))} required/>

<Input label="Correo electrónico" value={email} onChange={setEmail}
type="email" placeholder="tu@empresa.com" required/>

<Input label="Contraseña" value={pwd} onChange={setPwd}
type="password" placeholder="Mínimo 6 caracteres" required/>

<button className="auth-submit" onClick={handleRegister}>Crear
cuenta →</button>

</div>

)}

<p
style={{textAlign:'center',fontSize:11,color:'#9ca3af',margin:'20px
0 0 0'}}>

Datos almacenados localmente · sin conexión requerida

</p>

</div>

</div>

</div>

);

}

/* ── ADMIN HOME ──────────────────────────── */

export default AuthScreen;
