import React, { useState } from 'react';
import { supabase } from './supabaseClient'; // Conexión a la base de datos
import { Ic } from './constants';
import { uid, today, generateTramites } from './utils';
import { Q_STEPS } from './Dashboard'; // Importamos las preguntas maestras

export function Questionnaire({ projectData, updateProject, setScreen }) {
    const ex = projectData.cuestionario?.respondido ? projectData.cuestionario.respuestas : {};

    const [step, setStep] = useState(0);
    const [resp, setResp] = useState({
        giro: ex.giro || '',
        emisiones: ex.emisiones ?? null,
        agua: ex.agua ?? null,
        residuos_peligrosos: ex.residuos_peligrosos ?? false,
        residuos_especiales: ex.residuos_especiales ?? false,
        obras: ex.obras ?? null
    });

    const [done, setDone] = useState(projectData.cuestionario?.respondido);
    const [isSaving, setIsSaving] = useState(false);

    const cur = Q_STEPS[step];
    const canNext = cur.tipo === 'select' ? !!resp[cur.id] : cur.tipo === 'yesno' ? resp[cur.id] !== null : true;

    // 1. Seguridad: Guardar resultados en PostgreSQL
    const finish = async () => {
        setIsSaving(true);

        // Generar trámites basados en las reglas de negocio
        const tramitesGenerados = generateTramites(resp);

        // Preparar el formato para Supabase
        const tramitesToInsert = tramitesGenerados.map(t => ({
            ...t,
            proyecto_id: projectData.id // Vinculamos los trámites al proyecto actual
        }));

        const nuevaAlerta = {
            proyecto_id: projectData.id,
            tipo: 'info',
            mensaje: `Diagnóstico completado. Se identificaron ${tramitesGenerados.length} obligaciones ambientales.`,
            fecha: today(),
            leido: false
        };

        const newCuestionario = { respondido: true, respuestas: resp, fecha: today() };

        try {
            // A) Actualizar el estado del proyecto
            await supabase.from('proyectos').update({ cuestionario: newCuestionario }).eq('id', projectData.id);

            // B) Borrar trámites anteriores (por si está repitiendo el diagnóstico)
            await supabase.from('tramites').delete().eq('proyecto_id', projectData.id);

            // C) Insertar los nuevos trámites
            if (tramitesToInsert.length > 0) {
                await supabase.from('tramites').insert(tramitesToInsert);
            }

            // D) Insertar alerta
            await supabase.from('alertas').insert([nuevaAlerta]);

            // E) Optimistic Update local
            updateProject({
                cuestionario: newCuestionario,
                tramites: tramitesGenerados,
                alertas: [...projectData.alertas, nuevaAlerta]
            });

            setDone(true);
        } catch (err) {
            console.error("Error al guardar el diagnóstico:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // ── VISTA DE DIAGNÓSTICO COMPLETADO ──
    if (done) {
        return (
            <div className="p-8 fade-in min-h-[80vh] flex items-center justify-center bg-white selection:bg-emerald-300">
                <div className="w-full max-w-3xl bg-white border-4 border-black p-10 text-center shadow-[16px_16px_0px_rgba(0,0,0,1)]">
                    <div className="w-24 h-24 bg-emerald-400 border-4 border-black flex items-center justify-center mx-auto mb-8 shadow-[6px_6px_0px_rgba(0,0,0,1)] rotate-3">
                        <Ic n="checkCircle" s={48} c="#000" strokeWidth="3" />
                    </div>
                    <h2 className="text-4xl font-black text-black uppercase tracking-tighter mb-4">
                        Diagnóstico Terminado
                    </h2>
                    <p className="text-lg font-bold text-gray-700 uppercase mb-10 bg-yellow-100 p-4 border-4 border-black inline-block">
                        Se identificaron <span className="text-black font-black text-2xl mx-1">{projectData.tramites.length}</span> trámites aplicables a tu empresa.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button
                            onClick={() => setScreen('tramites')}
                            className="bg-black text-white hover:bg-gray-800 border-4 border-black px-8 py-4 font-black uppercase tracking-widest text-lg shadow-[6px_6px_0px_rgba(52,211,153,1)] transition-all hover:translate-x-1 hover:-translate-y-1"
                        >
                            Ver Mis Trámites
                        </button>
                        <button
                            onClick={() => { setDone(false); setStep(0); }}
                            className="bg-white text-black hover:bg-gray-100 border-4 border-black px-8 py-4 font-black uppercase tracking-widest text-lg shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:-translate-y-1"
                        >
                            Repetir Diagnóstico
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── VISTA DEL CUESTIONARIO ──
    return (
        <div className="p-8 fade-in max-w-4xl mx-auto bg-white min-h-screen selection:bg-emerald-300">

            {/* Header */}
            <div className="mb-10 border-b-4 border-black pb-6">
                <h1 className="text-4xl font-black text-black uppercase tracking-tighter">Diagnóstico Ambiental</h1>
                <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mt-2 bg-yellow-300 inline-block px-2 border-2 border-black">
                    Configuración basada en LGEEPA y Legislación NL
                </p>
            </div>

            {/* Progress Bar Brutalista */}
            <div className="flex gap-2 mb-10">
                {Q_STEPS.map((_, i) => (
                    <div
                        key={i}
                        className={`flex-1 h-5 border-4 border-black transition-colors duration-300 ${i <= step ? 'bg-emerald-400' : 'bg-gray-100'}`}
                    />
                ))}
            </div>

            <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_rgba(0,0,0,1)]">

                {/* Pregunta */}
                <div className="flex items-start gap-4 mb-8">
                    <div className="w-12 h-12 bg-black text-white font-black text-xl flex items-center justify-center shrink-0 border-4 border-black shadow-[4px_4px_0px_rgba(52,211,153,1)] rotate-[-2deg]">
                        {step + 1}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-black uppercase leading-tight">{cur.titulo}</h2>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2 bg-gray-100 inline-block px-2 border-2 border-black">
                            AYUDA: {cur.ayuda}
                        </p>
                    </div>
                </div>

                {/* Opciones (Tipo Select) */}
                {cur.tipo === 'select' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {cur.opciones.map(o => (
                            <button
                                key={o.value}
                                onClick={() => setResp(r => ({ ...r, [cur.id]: o.value }))}
                                className={`p-4 border-4 text-left font-black uppercase transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]
                  ${resp[cur.id] === o.value ? 'border-black bg-emerald-400 text-black' : 'border-black bg-white text-gray-700'}`}
                            >
                                {o.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Opciones (Tipo Sí/No) */}
                {cur.tipo === 'yesno' && (
                    <div className="flex gap-6">
                        {[{ v: true, l: 'SÍ' }, { v: false, l: 'NO' }].map(o => (
                            <button
                                key={String(o.v)}
                                onClick={() => setResp(r => ({ ...r, [cur.id]: o.v }))}
                                className={`flex-1 py-8 border-4 text-4xl font-black uppercase transition-all shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_rgba(0,0,0,1)]
                  ${resp[cur.id] === o.v ? 'border-black bg-emerald-400 text-black' : 'border-black bg-white text-gray-400'}`}
                            >
                                {o.l}
                            </button>
                        ))}
                    </div>
                )}

                {/* Opciones (Tipo Múltiple) */}
                {cur.tipo === 'multicheck' && (
                    <div className="space-y-4">
                        {cur.opciones.map(o => (
                            <label
                                key={o.id}
                                className={`flex items-center gap-4 p-5 border-4 cursor-pointer transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] group
                  ${resp[o.id] ? 'border-black bg-emerald-100' : 'border-black bg-white hover:bg-yellow-50'}`}
                            >
                                <div className={`w-8 h-8 border-4 flex items-center justify-center shrink-0 transition-colors ${resp[o.id] ? 'border-black bg-emerald-500' : 'border-black bg-white group-hover:bg-yellow-200'}`}>
                                    {resp[o.id] && <Ic n="check" s={20} c="#000" strokeWidth="4" />}
                                </div>
                                <span className={`font-black text-lg uppercase ${resp[o.id] ? 'text-black' : 'text-gray-600'}`}>{o.label}</span>
                            </label>
                        ))}
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-4">
                            Puedes seleccionar ninguna, una o ambas opciones.
                        </p>
                    </div>
                )}

                {/* Controles de Navegación */}
                <div className="flex justify-between mt-10 pt-8 border-t-4 border-black">
                    <button
                        className="bg-white text-black hover:bg-gray-100 border-4 border-black px-6 py-3 font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] disabled:opacity-30 disabled:shadow-none transition-all flex items-center gap-2"
                        onClick={() => setStep(s => s - 1)}
                        disabled={step === 0 || isSaving}
                    >
                        <Ic n="cl" s={16} strokeWidth="3" /> Atrás
                    </button>

                    {step < Q_STEPS.length - 1 ? (
                        <button
                            className="bg-black text-white hover:bg-gray-800 border-4 border-black px-8 py-3 font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] disabled:opacity-30 disabled:shadow-none transition-all flex items-center gap-2"
                            onClick={() => setStep(s => s + 1)}
                            disabled={!canNext || isSaving}
                        >
                            Siguiente <Ic n="cr" s={16} strokeWidth="3" />
                        </button>
                    ) : (
                        <button
                            className="bg-emerald-400 text-black hover:bg-emerald-500 border-4 border-black px-8 py-3 font-black uppercase tracking-widest text-sm shadow-[4px_4px_0px_rgba(0,0,0,1)] disabled:opacity-50 transition-all flex items-center gap-2"
                            onClick={finish}
                            disabled={!canNext || isSaving}
                        >
                            {isSaving ? 'Guardando...' : <><Ic n="checkCircle" s={16} strokeWidth="3" /> Finalizar</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Questionnaire;