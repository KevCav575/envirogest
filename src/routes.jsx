// routes.jsx — centralized route definitions for EnviroGest MX
// The App component uses internal state (screen/wsScreen) to determine
// what to render in the workspace. This file provides the route constants
// and a helper to map URL paths to screen IDs for deep-linking support.
//
// Usage: import { ROUTES, screenFromPath } from './routes';

export const ROUTES = {
  LOGIN:          '/login',
  DASHBOARD:      '/dashboard',
  TRAMITES:       '/tramites',
  TRAMITE_DETAIL: '/tramites/:id',
  CRONOGRAMA:     '/cronograma',
  ALERTAS:        '/alertas',
  CONSULTOR:      '/consultor',
  DIAGNOSTICO:    '/diagnostico',
  ADMIN:          '/admin',
  INICIO:         '/inicio',
};

// Maps URL path segment → internal wsScreen state used by App
export const PATH_TO_SCREEN = {
  dashboard:   'dashboard',
  tramites:    'tramites',
  cronograma:  'cronograma',
  alertas:     'alertas',
  consultor:   'consultor',
  diagnostico: 'diagnostico',
  admin:       'admin',
  inicio:      'inicio',
};

export function screenFromPath(pathname) {
  const segment = pathname.replace('/', '').split('/')[0];
  return PATH_TO_SCREEN[segment] || 'dashboard';
}
