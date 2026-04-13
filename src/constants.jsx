import React from 'react';

// 1. ICONOS (SVG Paths)
export const IP = {
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    checkCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
    cr: '<polyline points="9 18 15 12 9 6"/>',
    cl: '<polyline points="15 18 9 12 15 6"/>',
    cd: '<polyline points="6 9 12 15 18 9"/>',
    alert: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
    trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    leaf: '<path d="M2 22c0-7.5 7.5-13 15-8"/><path d="M2 22c0-7.5 7.5-13 15-8 0-7.5-7.5-13-15-8z"/>',
    send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22V12h6v10"/><path d="M8 7h.01M16 7h.01M8 12h.01M16 12h.01"/>',
    key: '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
};

// 2. COMPONENTE DE ICONO (Más grueso para estilo Neo-Brutalista)
export const Ic = ({ n, s = 20, c = "currentColor", cls = "" }) => (
    <svg
        width={s}
        height={s}
        viewBox="0 0 24 24"
        fill="none"
        stroke={c}
        strokeWidth="2.5" // Aumentado para mayor presencia
        strokeLinecap="square" // Bordes cuadrados para estética brutalista
        strokeLinejoin="miter"
        className={cls}
        dangerouslySetInnerHTML={{ __html: IP[n] || '' }}
    />
);

// 3. CATÁLOGOS (Paleta Neo-Brutalista vibrante)
export const GIROS = [
    { id: 'manufactura', label: 'Manufactura metálica / Automotriz', art28: true, color: '#3B82F6' },
    { id: 'quimica', label: 'Química / Petroquímica', art28: true, color: '#8B5CF6' },
    { id: 'alimentos', label: 'Alimentos y bebidas', art28: false, color: '#F59E0B' },
    { id: 'construccion', label: 'Construcción', art28: false, color: '#EF4444' },
    { id: 'mineria', label: 'Minería / Extracción', art28: true, color: '#78716C' },
    { id: 'plasticos', label: 'Plásticos / Hule', art28: false, color: '#06B6D4' },
    { id: 'logistica', label: 'Logística / Transporte', art28: false, color: '#10B981' },
    { id: 'textil', label: 'Textil / Confección', art28: false, color: '#EC4899' },
    { id: 'electronica', label: 'Electrónica / Manufactura ligera', art28: false, color: '#6366F1' },
    { id: 'otro', label: 'Otro giro industrial', art28: false, color: '#000000' }, // Cambiado a negro
];

export const ESTADOS = {
    no_iniciado: { label: 'No iniciado', color: '#000000', bg: '#FFFFFF', pct: 0 },
    recopilando: { label: 'Recopilando info', color: '#000000', bg: '#FDE047', pct: 25 }, // Amarillo brillante
    ingresado: { label: 'Trámite ingresado', color: '#000000', bg: '#93C5FD', pct: 50 }, // Azul vibrante
    en_revision: { label: 'En revisión (Aut.)', color: '#000000', bg: '#D8B4FE', pct: 75 }, // Morado vibrante
    cumplido: { label: 'Cumplido / Vigente', color: '#000000', bg: '#34D399', pct: 100 }, // Esmeralda vibrante
    vencido: { label: 'Vencido', color: '#FFFFFF', bg: '#EF4444', pct: 0 },   // Rojo brillante, texto blanco
};

// 4. TRÁMITES Y CONDICIONES
export const TRAMITES_CATALOG = [
    {
        id: 'mia_federal',
        nombre: 'MIA Federal (Modalidad Particular)',
        autoridad: 'SEMARNAT',
        nivel: 'federal',
        base_legal: 'Art. 28 y 30 LGEEPA; Arts. 5,9,10,11,12,13 Rgto. LGEEPA MEIA; NOM-059-SEMARNAT-2010',
        descripcion: 'Obligatoria para obras/actividades del Art. 28 LGEEPA: industria química, petroquímica, siderurgia, cemento, minería, hidrocarburos y otras actividades de competencia federal.',
        condicion: ({ giro, obras }) => {
            const g = GIROS.find(x => x.id === giro);
            return !!(g?.art28 && obras);
        }
    },
    {
        id: 'mia_estatal',
        nombre: 'MIA Estatal (Modalidad Industrial)',
        autoridad: 'Secretaría de Medio Ambiente NL',
        nivel: 'estatal',
        base_legal: 'Ley Ambiental del Estado de NL (Decreto 252), Art. 1 fracc. V; Guías MIA 2025',
        descripcion: 'Obligatoria para obras o actividades que no son de competencia federal. Aplica cuando la empresa realiza obras, ampliaciones o modificaciones de instalaciones en NL.',
        condicion: ({ obras }) => !!obras
    },
    {
        id: 'licencia_ff',
        nombre: 'Licencia de Funcionamiento — Fuentes Fijas',
        autoridad: 'Secretaría de Medio Ambiente NL',
        nivel: 'estatal',
        base_legal: 'Ley Ambiental NL Art. 1 fracc. VIII; Rgto. Ley Ambiental NL; NOM-043-SEMARNAT-1993; NOM-085-SEMARNAT-2011',
        descripcion: 'Licencia para fuentes fijas que emiten contaminantes a la atmósfera. Aplica con chimeneas, ductos o procesos de combustión. Renovación anual.',
        condicion: ({ emisiones }) => !!emisiones
    },
    {
        id: 'coa',
        nombre: 'COA — Cédula de Operación Anual',
        autoridad: 'SEMARNAT',
        nivel: 'federal',
        base_legal: 'Art. 109 BIS LGEEPA; Art. 10 Rgto. LGEEPA MPCCA; Acuerdo DOF 2014',
        descripcion: 'Reporte anual de emisiones a la atmósfera y transferencia de contaminantes. Fecha límite: 31 de mayo de cada año. Aplica a establecimientos de competencia federal.',
        condicion: ({ giro, emisiones }) => {
            const g = GIROS.find(x => x.id === giro);
            return !!(g?.art28 && emisiones);
        }
    },
    {
        id: 'gei',
        nombre: 'Inventario de GEI (RENE)',
        autoridad: 'SEMARNAT / RENE',
        nivel: 'federal',
        base_legal: 'Art. 87 LGCC; Reglamento RENE; Acuerdo SEMARNAT 2014',
        descripcion: 'Cálculo y reporte anual de Gases de Efecto Invernadero. Aplica a establecimientos que emitan 25,000+ tCO2e/año. Reporte en septiembre.',
        condicion: ({ emisiones }) => !!emisiones
    },
    {
        id: 'registro_rp',
        nombre: 'Registro Generador de RP (SEMARNAT-07-017)',
        autoridad: 'SEMARNAT',
        nivel: 'federal',
        base_legal: 'Arts. 46-48 LGPGIR; Art. 72 Rgto. LGPGIR; NOM-052-SEMARNAT-2005; FF-SEMARNAT-090',
        descripcion: 'Registro ante SEMARNAT como generador de residuos peligrosos. Trámite tipo aviso, sin costo. Se obtiene NRA (Número de Registro Ambiental).',
        condicion: ({ residuos_peligrosos }) => !!residuos_peligrosos
    },
    {
        id: 'plan_rp',
        nombre: 'Plan de Manejo de Residuos Peligrosos',
        autoridad: 'SEMARNAT',
        nivel: 'federal',
        base_legal: 'Arts. 29-32 LGPGIR; Art. 7 fracc. II y Art. 13 Rgto. LGPGIR; FF-SEMARNAT-034',
        descripcion: 'Obligatorio para grandes generadores. Incluye identificación de residuos, cantidades, estrategias de minimización, valoración y destino final.',
        condicion: ({ residuos_peligrosos }) => !!residuos_peligrosos
    },
    {
        id: 'registro_rme',
        nombre: 'Registro Generador de RME',
        autoridad: 'PMA Nuevo León',
        nivel: 'estatal',
        base_legal: 'Ley Ambiental NL; NOM-161-SEMARNAT-2011; Arts. 7 fracc. V, 19 y 20 LGPGIR',
        descripcion: 'Registro ante la Procuraduría de Medio Ambiente de NL como generador de Residuos de Manejo Especial.',
        condicion: ({ residuos_especiales }) => !!residuos_especiales
    },
    {
        id: 'plan_rme',
        nombre: 'Plan de Manejo de RME',
        autoridad: 'PMA Nuevo León',
        nivel: 'estatal',
        base_legal: 'Arts. 7 fracc. V, 19, 20, 28 fracc. III, 30, 32 LGPGIR; NOM-161-SEMARNAT-2011',
        descripcion: 'Documento con acciones para el manejo de RME: identificación, almacenamiento, transporte, valoración y disposición final.',
        condicion: ({ residuos_especiales }) => !!residuos_especiales
    },
    {
        id: 'descarga_agua',
        nombre: 'Registro Descarga de Aguas Residuales',
        autoridad: 'CONAGUA / Municipio / SADM',
        nivel: 'municipal',
        base_legal: 'LAN y Rgto.; NOM-001-SEMARNAT-2021; NOM-002-SEMARNAT-1996; Ley Ambiental NL Art. 3 fracc. XXII',
        descripcion: 'Registro de descarga a cuerpo federal (CONAGUA) o a alcantarillado (Municipio/SADM). Cumplir parámetros fisicoquímicos de las NOMs.',
        condicion: ({ agua }) => !!agua
    },
    {
        id: 'estudio_riesgo',
        nombre: 'Estudio de Riesgo Ambiental',
        autoridad: 'Secretaría de Medio Ambiente NL',
        nivel: 'estatal',
        base_legal: 'LGEEPA Arts. 145-149; Ley Ambiental NL; Listados AAR (DOF); Guía ERA 2025',
        descripcion: 'Obligatorio si la empresa maneja sustancias del Listado de Actividades Altamente Riesgosas. Aplica principalmente a industria química y petroquímica.',
        condicion: ({ giro }) => giro === 'quimica'
    },
    {
        id: 'plan_minero',
        nombre: 'Plan de Manejo Residuos Minero-Metalúrgicos',
        autoridad: 'SEMARNAT',
        nivel: 'federal',
        base_legal: 'Arts. 2,7,17,27,32 LGPGIR; Arts. 33,34,40 Rgto. LGPGIR; NOM-157-SEMARNAT-2009',
        descripcion: 'Para empresas de minería y procesamiento de minerales. Caracterización química y volumétrica, acciones de minimización y manejo integral.',
        condicion: ({ giro }) => giro === 'mineria'
    }
];

// 5. ESTRUCTURA ISO 14001:2015
export const ISO_DATA = {
    '4': {
        nombre: 'Contexto de la organización',
        items: [
            { id: '4.1', texto: '4.1 Comprensión del contexto interno y externo de la organización' },
            { id: '4.2', texto: '4.2 Necesidades y expectativas de las partes interesadas' },
            { id: '4.3', texto: '4.3 Alcance del SGA determinado y documentado' },
            { id: '4.4', texto: '4.4 SGA establecido, implementado y mantenido' },
        ]
    },
    '5': {
        nombre: 'Liderazgo',
        items: [
            { id: '5.1', texto: '5.1 Liderazgo y compromiso de la alta dirección' },
            { id: '5.2', texto: '5.2 Política ambiental documentada y comunicada' },
            { id: '5.3', texto: '5.3 Roles, responsabilidades y autoridades asignados' },
        ]
    },
    '6': {
        nombre: 'Planificación',
        items: [
            { id: '6.1.1', texto: '6.1.1 Riesgos y oportunidades identificados' },
            { id: '6.1.2', texto: '6.1.2 Aspectos ambientales significativos determinados' },
            { id: '6.1.3', texto: '6.1.3 Requisitos legales identificados y evaluados' },
            { id: '6.1.4', texto: '6.1.4 Acciones planificadas para cumplir requisitos' },
            { id: '6.2', texto: '6.2 Objetivos ambientales con planes de acción' },
        ]
    },
    '7': {
        nombre: 'Apoyo',
        items: [
            { id: '7.1', texto: '7.1 Recursos necesarios determinados y proporcionados' },
            { id: '7.2', texto: '7.2 Competencia del personal determinada y documentada' },
            { id: '7.3', texto: '7.3 Toma de conciencia sobre política y aspectos ambientales' },
            { id: '7.4', texto: '7.4 Comunicación interna y externa establecida' },
            { id: '7.5', texto: '7.5 Información documentada controlada' },
        ]
    },
    '8': {
        nombre: 'Operación',
        items: [
            { id: '8.1', texto: '8.1 Planificación y control operacional implementados' },
            { id: '8.2', texto: '8.2 Preparación y respuesta ante emergencias' },
        ]
    },
    '9': {
        nombre: 'Evaluación del desempeño',
        items: [
            { id: '9.1.1', texto: '9.1.1 Seguimiento, medición y análisis definidos' },
            { id: '9.1.2', texto: '9.1.2 Evaluación del cumplimiento legal' },
            { id: '9.2', texto: '9.2 Auditoría interna programada y ejecutada' },
            { id: '9.3', texto: '9.3 Revisión por la dirección documentada' },
        ]
    },
    '10': {
        nombre: 'Mejora',
        items: [
            { id: '10.1', texto: '10.1 Mejora continua implementada' },
            { id: '10.2', texto: '10.2 No conformidades y acciones correctivas gestionadas' },
            { id: '10.3', texto: '10.3 Mejora del desempeño ambiental demostrada' },
        ]
    }
};

export default ISO_DATA;