import { GIROS, TRAMITES_CATALOG } from './constants';

// Genera un ID temporal rápido (Útil para mapear listas en React o UI Optimista)
export function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Formateador de fechas a formato corto (ej. "12 abr 2026")
export function fmtDate(s) {
    if (!s) return '---';
    return new Date(s + 'T00:00:00').toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

// Retorna la fecha de hoy estandarizada para inputs de HTML (YYYY-MM-DD)
export function today() {
    return new Date().toISOString().slice(0, 10);
}

// Motor de Reglas: Genera los trámites aplicables según el cuestionario
export function generateTramites(resp) {
    const ctx = { ...resp };

    return TRAMITES_CATALOG.filter(t => t.condicion(ctx)).map(t => ({
        // Copiamos la info del catálogo base
        ...t,
        id: uid(), // Estandarizado a 'id' para PostgreSQL
        estado: 'no_iniciado',
        fecha_limite: null,
        cronograma: { inicio: null, fin: null, hitos: [], notas: '', dependencias: [] },
        documentos: [],
        notas2: [],
    }));
}

// Utilidad para extraer la etiqueta legible del giro industrial
export function giroLabel(id) {
    return GIROS.find(g => g.id === id)?.label || id;
}

// Utilidad para extraer el color sólido asignado al giro industrial (usado en la UI Neo-Brutalista)
export function giroColor(id) {
    return GIROS.find(g => g.id === id)?.color || '#000000';
}