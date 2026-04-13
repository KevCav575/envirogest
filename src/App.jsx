import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Componentes
import { AdminHome } from './AdminHome';
import { AlertasCenter } from './AlertasCenter';
import { AuthScreen } from './AuthScreen';
import { ConsultantHome } from './ConsultantHome';
import { ConsultorPanel, ISO14001 } from './ConsultorPanel';
import { Cronograma } from './Cronograma';
import { Dashboard } from './Dashboard';
import { Questionnaire } from './Questionnaire';
import { Sidebar } from './Sidebar';
import { TramitesList, TramiteDetail } from './TramitesList';
import { fmtDate, today } from './utils';

const VALID_SCREENS = ['dashboard', 'cuestionario', 'tramites', 'cronograma', 'alertas', 'consultor', 'iso14001'];

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentUser, setCurrentUser] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [projectData, setProjectData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [wsScreen, setWsScreen] = useState('dashboard');
  const [selTramite, setSelTramite] = useState(null);
  const [wsError, setWsError] = useState(null);

  // 1. VERIFICAR SESIÓN (COOKIE) AL CARGAR LA APP
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/me', {
          credentials: 'include' // Manda la cookie automáticamente
        });
        const data = await res.json();

        if (data.user) {
          handleLoginSuccess(data.user);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLoginSuccess = async (userProfile) => {
    setCurrentUser(userProfile);

    // Si es cliente, buscar su proyecto vía backend (que tiene SERVICE_ROLE_KEY)
    if (userProfile.rol === 'cliente') {
      try {
        const res = await fetch('http://localhost:3000/api/mi-proyecto', {
          credentials: 'include'
        });
        const data = await res.json();
        if (data.projectId) setActiveProjectId(data.projectId);
      } catch (err) {
        console.error('Error buscando proyecto del cliente:', err);
      }
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/api/logout', { method: 'POST', credentials: 'include' });
      setCurrentUser(null);
      setActiveProjectId(null);
      setProjectData(null);
      navigate('/');
    } catch (err) {
      console.error("Error al cerrar sesión", err);
    }
  };

  // Carga de datos del proyecto activo vía backend
  useEffect(() => {
    if (!activeProjectId) {
      setProjectData(null);
      return;
    }

    const fetchProjectWorkspace = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/workspace/${activeProjectId}`, {
          credentials: 'include'
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Error del servidor');
        }

        const data = await res.json();
        setProjectData({
          ...data.proyecto,
          usuario: currentUser,
          tramites: data.tramites,
          alertas: data.alertas,
          iso14001: data.iso14001
        });
      } catch (err) {
        console.error("Error construyendo el workspace:", err);
        setWsError("No se pudo cargar el espacio de trabajo. Verifica la conexión o recarga la página.");
      }
    };

    fetchProjectWorkspace();
  }, [activeProjectId, currentUser]);

  // Sincronización de URL
  useEffect(() => {
    if (!activeProjectId) return;
    const parts = location.pathname.replace(/^\//, '').split('/');
    const screen = parts[0];
    if (VALID_SCREENS.includes(screen)) {
      setWsScreen(screen);
      if (screen !== 'tramites') setSelTramite(null);
    }
  }, [location.pathname, activeProjectId]);

  const updateProject = (partial) => {
    setProjectData(prev => ({ ...prev, ...partial }));
  };

  const goToScreen = (screen) => {
    setWsScreen(screen);
    setSelTramite(null);
    navigate('/' + screen);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium tracking-wide">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  /* ── AUTH ── */
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  /* ── ADMIN HOME ── */
  if (currentUser.rol === 'admin' && !activeProjectId) {
    return (
      <AdminHome
        currentUser={currentUser}
        onEnterProject={pid => {
          setActiveProjectId(pid);
          setSelTramite(null);
          navigate('/dashboard');
        }}
        onLogout={handleLogout}
      />
    );
  }

  /* ── CONSULTANT HOME ── */
  if (currentUser.rol === 'consultor' && !activeProjectId) {
    return (
      <ConsultantHome
        currentUser={currentUser}
        onEnterProject={pid => {
          setActiveProjectId(pid);
          setSelTramite(null);
          navigate('/dashboard');
        }}
        onLogout={handleLogout}
      />
    );
  }

  /* ── CLIENTE SIN PROYECTO ASIGNADO ── */
  if (currentUser.rol === 'cliente' && !activeProjectId) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 max-w-sm w-full mx-4 text-center">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-emerald-600 text-xl">📋</span>
          </div>
          <h3 className="text-slate-800 font-semibold text-base mb-2">Sin proyecto asignado</h3>
          <p className="text-slate-500 text-sm mb-5">Tu cuenta aún no tiene un proyecto activo. Contacta a tu consultor para que te asigne uno.</p>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-slate-600 text-sm transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  /* ── PROJECT WORKSPACE ── */
  if (wsError) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl border border-red-200 shadow-lg p-8 max-w-sm w-full mx-4 text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <h3 className="text-slate-800 font-semibold text-base mb-2">Error al cargar</h3>
          <p className="text-slate-500 text-sm mb-5">{wsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium tracking-wide">Cargando espacio de trabajo...</p>
        </div>
      </div>
    );
  }

  const unreadCount = (projectData.alertas || []).filter(a => !a.leido).length;
  const isConsultor = currentUser.rol === 'consultor' || currentUser.rol === 'admin';
  const isAdmin = currentUser.rol === 'admin';

  const handleSelectTramite = t => {
    setSelTramite(t);
    setWsScreen('tramite_detail');
    navigate(`/tramites/${t.id}`);
  };

  const renderWs = () => {
    if (wsScreen === 'tramite_detail' && selTramite)
      return <TramiteDetail tramite={selTramite} projectData={projectData} updateProject={updateProject} onBack={() => goToScreen('tramites')} />;
    switch (wsScreen) {
      case 'dashboard': return <Dashboard projectData={projectData} setScreen={goToScreen} />;
      case 'cuestionario': return <Questionnaire projectData={projectData} updateProject={updateProject} setScreen={goToScreen} />;
      case 'tramites': return <TramitesList projectData={projectData} onSelect={handleSelectTramite} />;
      case 'cronograma': return <Cronograma projectData={projectData} onSelect={handleSelectTramite} />;
      case 'alertas': return <AlertasCenter projectData={projectData} updateProject={updateProject} />;
      case 'consultor': return <ConsultorPanel projectData={projectData} updateProject={updateProject} />;
      case 'iso14001': return <ISO14001 projectData={projectData} updateProject={updateProject} />;
      default: return <Dashboard projectData={projectData} setScreen={goToScreen} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 selection:bg-emerald-100">
      <Sidebar
        screen={wsScreen}
        setScreen={goToScreen}
        clientUser={projectData.usuario}
        isConsultor={isConsultor}
        isAdmin={isAdmin}
        onBack={() => {
          setActiveProjectId(null);
          navigate(isAdmin ? '/admin' : '/inicio');
        }}
        onLogout={handleLogout}
        alertaCount={unreadCount}
      />
      <main className="flex-1 overflow-y-auto bg-slate-50 border-l border-slate-200">
        {renderWs()}
      </main>
    </div>
  );
}

export default App;