import React from 'react';
import { Ic } from './constants';

export const Btn = ({ onClick, children, variant = 'primary', size = 'md', disabled = false, className = '' }) => {
    // Base Neo-Brutalista: Bordes gruesos, mayúsculas, fuente pesada y transiciones mecánicas
    const base = "inline-flex items-center justify-center gap-2 font-black uppercase tracking-widest transition-all cursor-pointer border-4 border-black disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[4px_4px_0px_rgba(0,0,0,1)]";

    const v = {
        primary: 'bg-emerald-400 text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
        secondary: 'bg-white text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-gray-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
        danger: 'bg-red-500 text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-red-600 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
        ghost: 'bg-transparent text-black border-transparent hover:border-black hover:bg-yellow-100 shadow-none',
        outline: 'bg-transparent text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-yellow-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
    };

    const sz = {
        sm: 'px-4 py-2 text-xs',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${v[variant]} ${sz[size]} ${className}`}
        >
            {children}
        </button>
    );
};

export const Card = ({ children, className = '' }) => (
    <div className={`bg-white border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] ${className}`}>
        {children}
    </div>
);

export const Badge = ({ label, color, bg }) => (
    <span
        className="inline-flex items-center px-3 py-1 border-2 border-black text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
        style={{ color: color === '#FFFFFF' ? '#000' : color, background: bg }}
    >
        {label}
    </span>
);

export const Input = ({ label, value, onChange, type = 'text', placeholder = '', required = false, className = '' }) => (
    <div className={`flex flex-col gap-2 ${className}`}>
        {label && (
            <label className="text-xs font-black uppercase text-black tracking-widest">
                {label} {required && <span className="text-red-600 text-base leading-none ml-1">*</span>}
            </label>
        )}
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="border-4 border-black px-4 py-3 font-bold text-sm text-black focus:outline-none focus:bg-yellow-100 transition-colors placeholder:text-gray-400 placeholder:font-bold placeholder:uppercase"
        />
    </div>
);

export const Select = ({ label, value, onChange, options, required = false, className = '' }) => (
    <div className={`flex flex-col gap-2 ${className}`}>
        {label && (
            <label className="text-xs font-black uppercase text-black tracking-widest">
                {label} {required && <span className="text-red-600 text-base leading-none ml-1">*</span>}
            </label>
        )}
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="border-4 border-black px-4 py-3 font-bold text-sm text-black bg-white cursor-pointer focus:outline-none focus:bg-yellow-100 transition-colors appearance-none"
        >
            <option value="" className="font-bold uppercase">Seleccionar...</option>
            {options.map(o => (
                <option key={o.value || o} value={o.value || o} className="font-bold uppercase">
                    {o.label || o}
                </option>
            ))}
        </select>
    </div>
);

export const Modal = ({ open, onClose, title, children, width = 'max-w-xl' }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className={`bg-white border-4 border-black shadow-[12px_12px_0px_rgba(52,211,153,1)] w-full ${width} max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200`}>

                {/* Header del Modal - Estilo Precaución */}
                <div className="flex items-center justify-between p-5 border-b-4 border-black bg-yellow-300">
                    <h3 className="font-black text-black text-xl uppercase tracking-tighter">{title}</h3>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-white border-4 border-black flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                        title="Cerrar"
                    >
                        <Ic n="x" s={20} strokeWidth="3" />
                    </button>
                </div>

                {/* Contenido del Modal con textura sutil */}
                <div className="p-8 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                    {children}
                </div>

            </div>
        </div>
    );
};

export default Modal;