import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { fmtDate, today, loadData, saveData } from './utils';

const VALID_SCREENS = ['dashboard', 'cuestionario', 'tramites', 'cronograma', 'alertas', 'consultor', 'iso14001'];

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(() => loadData());
  const [currentUser, setCurrentUser] = useState(null);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [wsScreen, setWsScreen] = useState('dashboard');
  const [selTramite, setSelTramite] = useState(null);

  useEffect(() => saveData(data), [data]);

  // Sync URL → wsScreen (handles browser back/forward buttons)
  useEffect(() => {
    if (!activeProjectId) return;
    const parts = location.pathname.replace(/^\//, '').split('/');
    const screen = parts[0];
    if (VALID_SCREENS.includes(screen)) {
      setWsScreen(screen);
      if (screen !== 'tramites') setSelTramite(null);
    }
  }, [location.pathname, activeProjectId]);

  // Auto-generate deadline alerts
  useEffect(() => {
    if (!activeProjectId) return;
    const proj = data.proyectos.find(p => p.id === activeProjectId);
    if (!proj?.tramites?.length) return;
    const todayD = new Date(today());
    const newAlerts = [];
    proj.tramites.forEach(t => {
      if (!t.fecha_limite || t.estado === 'cumplido') return;
      const diff = Math.round((new Date(t.fecha_limite) - todayD) / 864e5);
      [7, 3, 1].forEach(d => {
        if (diff === d) {
          const key = `auto_${t._id}_${d}`;
          if (!proj.alertas.some(a => a.id === key))
            newAlerts.push({
              id: key,
              tipo: 'vencimiento',
              mensaje: `"${t.nombre}" vence en ${d} día${d === 1 ? '' : 's'} (${fmtDate(t.fecha_limite)}).`,
              fecha: today(),
              leido: false,
              tramite_id: t._id,
            });
        }
      });
      if (diff < 0 && diff > -3) {
        const key = `auto_venc_${t._id}`;
        if (!proj.alertas.some(a => a.id === key))
          newAlerts.push({
            id: key,
            tipo: 'vencimiento',
            mensaje: `ALERTA: "${t.nombre}" venció el ${fmtDate(t.fecha_limite)}.`,
            fecha: today(),
            leido: false,
            tramite_id: t._id,
          });
      }
    });
    if (newAlerts.length)
      setData(d => ({
        ...d,
        proyectos: d.proyectos.map(p =>
          p.id === activeProjectId ? { ...p, alertas: [...p.alertas, ...newAlerts] } : p
        ),
      }));
  }, [activeProjectId]);

  const updateProject = partial =>
    setData(d => ({
      ...d,
      proyectos: d.proyectos.map(p => p.id === activeProjectId ? { ...p, ...partial } : p),
    }));

  // Navigate to a workspace screen — updates URL and state together
  const goToScreen = screen => {
    setWsScreen(screen);
    setSelTramite(null);
    navigate('/' + screen);
  };

  /* ── AUTH ── */
  if (!currentUser) {
    return (
      <AuthScreen
        onAuth={u => {
          setCurrentUser(u);
          if (u.rol === 'cliente') {
            const proj = data.proyectos.find(p => p.cliente_id === u.id || p.id === u.proyecto_id);
            if (proj) setActiveProjectId(proj.id);
          }
        }}
        data={data}
        setData={setData}
      />
    );
  }

  /* ── ADMIN HOME ── */
  if (currentUser.rol === 'admin' && !activeProjectId) {
    return (
      <AdminHome
        data={data}
        setData={setData}
        currentUser={currentUser}
        onEnterProject={pid => {
          setActiveProjectId(pid);
          setSelTramite(null);
          navigate('/dashboard');
        }}
        onLogout={() => { setCurrentUser(null); setActiveProjectId(null); }}
      />
    );
  }

  /* ── CONSULTANT HOME ── */
  if (currentUser.rol === 'consultor' && !activeProjectId) {
    return (
      <ConsultantHome
        data={data}
        setData={setData}
        currentUser={currentUser}
        onEnterProject={pid => {
          setActiveProjectId(pid);
          setSelTramite(null);
          navigate('/dashboard');
        }}
        onLogout={() => { setCurrentUser(null); setActiveProjectId(null); }}
      />
    );
  }

  /* ── PROJECT WORKSPACE ── */
  const activeProj = data.proyectos.find(p => p.id === activeProjectId);
  if (!activeProj) return <div className="p-8 text-gray-500">Proyecto no encontrado.</div>;

  const clientUser = data.usuarios.find(u => u.id === activeProj.cliente_id) || currentUser;
  const projectData = {
    ...activeProj,
    usuario: clientUser,
    tramites: activeProj.tramites || [],
    alertas: activeProj.alertas || [],
    iso14001: activeProj.iso14001 || { secciones: {} },
  };
  const unreadCount = (activeProj.alertas || []).filter(a => !a.leido).length;
  const isConsultor = currentUser.rol === 'consultor' || currentUser.rol === 'admin';
  const isAdmin = currentUser.rol === 'admin';

  const handleSelectTramite = t => {
    setSelTramite(t);
    setWsScreen('tramite_detail');
    navigate(`/tramites/${t._id}`);
  };

  const renderWs = () => {
    if (wsScreen === 'tramite_detail' && selTramite)
      return (
        <TramiteDetail
          tramite={selTramite}
          projectData={projectData}
          updateProject={updateProject}
          onBack={() => goToScreen('tramites')}
        />
      );
    switch (wsScreen) {
      case 'dashboard':    return <Dashboard projectData={projectData} setScreen={goToScreen} />;
      case 'cuestionario': return <Questionnaire projectData={projectData} updateProject={updateProject} setScreen={goToScreen} />;
      case 'tramites':     return <TramitesList projectData={projectData} onSelect={handleSelectTramite} />;
      case 'cronograma':   return <Cronograma projectData={projectData} onSelect={handleSelectTramite} />;
      case 'alertas':      return <AlertasCenter projectData={projectData} updateProject={updateProject} />;
      case 'consultor':    return <ConsultorPanel projectData={projectData} updateProject={updateProject} />;
      case 'iso14001':     return <ISO14001 projectData={projectData} updateProject={updateProject} />;
      default:             return <Dashboard projectData={projectData} setScreen={goToScreen} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        screen={wsScreen}
        setScreen={goToScreen}
        clientUser={clientUser}
        isConsultor={isConsultor}
        isAdmin={isAdmin}
        onBack={() => {
          setActiveProjectId(null);
          navigate(isAdmin ? '/admin' : '/inicio');
        }}
        onLogout={() => { setCurrentUser(null); setActiveProjectId(null); }}
        alertaCount={unreadCount}
      />
      <main className="flex-1 overflow-y-auto bg-gray-50">{renderWs()}</main>
    </div>
  );
}

export default App;
