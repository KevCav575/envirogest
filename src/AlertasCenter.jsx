import React, { useState } from 'react';
import { Ic } from './constants';
import { Btn } from './ui';
import { fmtDate } from './utils';
import { supabase } from './supabaseClient.js';

const ALERT_TYPES = {
    vencimiento: { text: 'text-red-900', bg: 'bg-red-400', icon: 'alert' },
    solicitud: { text: 'text-amber-900', bg: 'bg-amber-400', icon: 'file' },
    firma: { text: 'text-blue-900', bg: 'bg-blue-400', icon: 'edit' },
    visita: { text: 'text-purple-900', bg: 'bg-purple-400', icon: 'calendar' },
    estado: { text: 'text-emerald-900', bg: 'bg-emerald-400', icon: 'checkCircle' },
    info: { text: 'text-gray-900', bg: 'bg-gray-300', icon: 'info' }
};

export function AlertasCenter({ projectData, updateProject }) {
    const { alertas = [], tramites = [] } = projectData;
    const [filter, setFilter] = useState('todas');
    const [isLoading, setIsLoading] = useState(false);

    // 2. Seguridad: Preparado para mutación segura en backend con Optimistic UI
    const handleMarkRead = async (id) => {
        setIsLoading(true);
        try {
            updateProject({
                alertas: alertas.map(a => a.id === id ? { ...a, leido: true } : a)
            });
        } catch (error) {
            console.error("Error al actualizar la alerta:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelAlerta = async (id) => {
        setIsLoading(true);
        try {
            updateProject({
                alertas: alertas.filter(a => a.id !== id)
            });
        } catch (error) {
            console.error("Error al eliminar la alerta:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        setIsLoading(true);
        try {
            // const { error } = await supabase.from('alertas').update({ leido: true }).in('id', alertas.map(a => a.id));

            updateProject({
                alertas: alertas.map(a => ({ ...a, leido: true }))
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAlertas = alertas.filter(a =>
        filter === 'todas' ||
        (filter === 'no_leidas' && !a.leido) ||
        (filter === 'leidas' && a.leido)
    );

    const unreadCount = alertas.filter(a => !a.leido).length;

    return (
        <div className="p-8 fade-in max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">
                        Centro de Alertas
                    </h1>
                    <p className="text-sm font-bold text-gray-500 mt-1">
                        {unreadCount} SIN LEER
                    </p>
                </div>

                {unreadCount > 0 && (
                    <Btn
                        variant="secondary"
                        onClick={handleMarkAllRead}
                        disabled={isLoading}
                        className="border-2 border-black font-bold uppercase text-xs"
                    >
                        Marcar todas leídas
                    </Btn>
                )}
            </div>

            {/* 3. Diseño: Pestañas de filtrado de alto contraste */}
            <div className="flex gap-2 mb-8 border-b-2 border-black pb-4">
                {[
                    { id: 'todas', label: 'Todas' },
                    { id: 'no_leidas', label: 'No leídas' },
                    { id: 'leidas', label: 'Leídas' }
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id)}
                        className={`px-5 py-2 text-xs font-black uppercase transition-all border-2 
              ${filter === f.id
                                ? 'bg-black text-white border-black shadow-[3px_3px_0px_rgba(16,185,129,1)]'
                                : 'bg-white text-gray-600 border-transparent hover:border-black'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Lista de alertas */}
            {filteredAlertas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-300 bg-gray-50">
                    <Ic n="bell" s={48} c="#9CA3AF" />
                    <p className="text-gray-500 mt-4 font-bold uppercase tracking-widest text-sm">Sin alertas</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAlertas.map(alerta => {
                        const config = ALERT_TYPES[alerta.tipo] || ALERT_TYPES.info;
                        const tramite = tramites.find(t => t._id === alerta.tramite_id);

                        // 3. Diseño: Estilos Neo-Brutalistas / Minimalistas para tarjetas no leídas
                        const cardStyles = alerta.leido
                            ? 'bg-gray-50 border-gray-200 text-gray-500 opacity-70'
                            : 'bg-white border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]';

                        return (
                            <div
                                key={alerta.id}
                                className={`border-2 p-5 flex gap-5 items-start transition-all ${cardStyles}`}
                            >
                                {/* Icono */}
                                <div className={`w-12 h-12 flex items-center justify-center flex-shrink-0 border-2 border-black ${config.bg} ${alerta.leido ? 'grayscale opacity-50' : ''}`}>
                                    <Ic n={config.icon} s={20} c="#000000" />
                                </div>

                                {/* Contenido */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-base ${alerta.leido ? 'font-medium' : 'font-bold text-black'}`}>
                                        {alerta.mensaje}
                                    </p>

                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="text-xs font-bold uppercase bg-gray-200 px-2 py-1 border border-black">
                                            {fmtDate(alerta.fecha)}
                                        </span>

                                        {tramite && (
                                            <span className="text-xs font-bold uppercase text-blue-800 truncate">
                                                {tramite.nombre}
                                            </span>
                                        )}

                                        {!alerta.leido && (
                                            <span className="text-xs font-black text-red-600 uppercase flex items-center gap-1">
                                                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                                                Nueva
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex gap-2 border-l-2 border-gray-200 pl-4 ml-2">
                                    {!alerta.leido && (
                                        <button
                                            onClick={() => handleMarkRead(alerta.id)}
                                            disabled={isLoading}
                                            className="p-2 hover:bg-black hover:text-white border-2 border-transparent hover:border-black transition-colors flex items-center justify-center"
                                            title="Marcar como leída"
                                        >
                                            <Ic n="eye" s={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelAlerta(alerta.id)}
                                        disabled={isLoading}
                                        className="p-2 hover:bg-red-500 hover:text-white text-gray-400 border-2 border-transparent hover:border-black transition-colors flex items-center justify-center"
                                        title="Eliminar alerta"
                                    >
                                        <Ic n="trash" s={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default AlertasCenter;