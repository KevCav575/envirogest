import React, { useState } from 'react';
import { Ic, GIROS } from './constants';

export function AuthScreen({ onLoginSuccess }) {
    const [mode, setMode] = useState('login');

    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [nombre, setNombre] = useState('');
    const [empresa, setEmpresa] = useState('');
    const [giro, setGiro] = useState(GIROS[0]?.id || '');

    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // LOGIN CON BACKEND PROPIO
    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !pwd) { setError('Ingresa email y contraseña.'); return; }

        setIsLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // CRÍTICO: Permite recibir y guardar la Cookie HTTP-Only
                body: JSON.stringify({ email, pwd })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error al iniciar sesión');
            } else {
                // Login exitoso, pasamos el usuario a App.jsx
                onLoginSuccess(data.user);
            }
        } catch (err) {
            setError("Error de conexión con el servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    // REGISTRO CON BACKEND PROPIO
    const handleRegister = async (e) => {
        e.preventDefault();
        if (!nombre || !empresa || !email || !pwd || !giro) {
            setError('Completa todos los campos.'); return;
        }
        if (pwd.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.'); return;
        }

        setIsLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            const res = await fetch('http://localhost:3000/api/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, empresa, giro, email, pwd })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error al registrar.');
            } else {
                setSuccessMsg(data.message); // "Registro exitoso. Revisa tu correo."
                setMode('login'); // Cambiamos la vista a login
                setPwd(''); // Limpiamos la contraseña por seguridad
            }
        } catch (err) {
            setError("Error de conexión con el servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 selection:bg-emerald-100 font-sans">

            {/* ══ PANEL IZQUIERDO: Branding ══ */}
            <div className="flex-1 bg-gradient-to-br from-emerald-800 to-emerald-600 flex flex-col justify-center p-12 relative overflow-hidden">
                {/* Subtle geometric background elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-700 rounded-full opacity-30 translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-900 rounded-full opacity-20 -translate-x-1/3 translate-y-1/3" />
                <div className="absolute top-1/2 left-1/2 w-px h-full bg-white opacity-5 -translate-x-1/2" />

                <div className="relative z-10 max-w-lg">
                    <div className="inline-flex items-center gap-3 mb-10">
                        <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-lg">
                            <Ic n="leaf" s={22} c="#ffffff" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg leading-none tracking-tight">EnviroGest MX</p>
                            <p className="text-emerald-300 font-medium text-xs tracking-widest leading-none mt-1 uppercase">by BIOIMPACT</p>
                        </div>
                    </div>

                    <h1 className="text-white font-bold text-4xl md:text-5xl leading-tight tracking-tight mb-5">
                        Gestión ambiental<br />inteligente.
                    </h1>

                    <p className="text-emerald-100 font-normal text-base max-w-sm mb-10 leading-relaxed opacity-90">
                        Cumplimiento normativo, automatización y control ISO 14001:2015.
                    </p>

                    <div className="flex flex-col gap-3">
                        {[
                            { icon: 'checkCircle', text: 'Seguimiento de trámites ambientales' },
                            { icon: 'checkCircle', text: 'Alertas y vencimientos en tiempo real' },
                            { icon: 'checkCircle', text: 'Reportes de cumplimiento normativo' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                                <Ic n={item.icon} s={16} c="#6ee7b7" />
                                <span className="text-emerald-100 text-sm">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══ PANEL DERECHO: Formulario ══ */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-lg shadow-slate-200/60">

                    <div className="mb-7">
                        <h2 className="text-2xl font-bold text-slate-800 mb-1">
                            {mode === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
                        </h2>
                        <p className="text-slate-500 text-sm">
                            {mode === 'login' ? 'Ingresa tus credenciales para continuar.' : 'Completa el formulario para registrarte.'}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-slate-100 rounded-lg p-1 mb-7 gap-1">
                        <button
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${mode === 'login' ? 'bg-white text-slate-800 shadow-sm shadow-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${mode === 'register' ? 'bg-white text-slate-800 shadow-sm shadow-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                        >
                            Registro
                        </button>
                    </div>

                    {error && (
                        <div className="mb-5 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm flex items-start gap-2">
                            <Ic n="alert" s={16} c="#b91c1c" />
                            <span className="mt-0.5">{error}</span>
                        </div>
                    )}

                    {successMsg && (
                        <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-700 text-sm flex items-start gap-2">
                            <Ic n="checkCircle" s={16} c="#047857" />
                            <span className="mt-0.5">{successMsg}</span>
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={mode === 'login' ? handleLogin : handleRegister}>
                        {mode === 'register' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nombre completo</label>
                                    <input className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" value={nombre} onChange={e => setNombre(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Empresa</label>
                                    <input className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" value={empresa} onChange={e => setEmpresa(e.target.value)} required />
                                </div>
                                <div className="col-span-2 space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Giro Industrial</label>
                                    <select className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white cursor-pointer" value={giro} onChange={e => setGiro(e.target.value)} required>
                                        {GIROS.map(g => (
                                            <option key={g.id} value={g.id}>{g.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Correo electrónico</label>
                            <input type="email" placeholder="tu@empresa.com" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" value={email} onChange={e => setEmail(e.target.value)} required />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contraseña</label>
                            <input type="password" placeholder="••••••••" className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" value={pwd} onChange={e => setPwd(e.target.value)} required />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg py-2.5 font-semibold text-sm tracking-wide transition-colors disabled:opacity-50 mt-2"
                        >
                            {isLoading ? 'Procesando...' : (mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta')}
                        </button>
                    </form>

                    <p className="text-center text-xs text-slate-400 mt-6">
                        © 2025 BIOIMPACT · EnviroGest MX
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AuthScreen;