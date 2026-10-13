import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, AlertCircle, CheckCircle2, BookOpen, Mail, Globe, 
  Download, ExternalLink, HelpCircle, FileText, Sparkles, Send, Copy, Check, Users, MessageSquare, ShieldCheck, Laptop, Archive, ChevronDown, ChevronUp
} from 'lucide-react';

interface Evaluation {
  id: number;
  code: string;
  subject: string;
  evalType: string;
  description: string;
  dateStr: string; // YYYY-MM-DD
  week: string;
  advisor: string;
  email: string;
  tagClass: string;
}

// Evaluations relevant for TSU Higiene y Seguridad Industrial (281) including Asig 200
const EVALUATIONS: Evaluation[] = [
  {
    id: 1,
    code: "116",
    subject: "Introducción a la Informática",
    evalType: "Obj I.1",
    description: "Objetivo I.1 — Fundamentos de la ergonomía y postura",
    dateStr: "2026-07-25",
    week: "Pasado",
    advisor: "Ing. Danny Colmenares",
    email: "dcolmenaresuna@gmail.com",
    tagClass: "bg-blue-100 text-blue-900 border border-blue-300"
  },
  {
    id: 2,
    code: "116",
    subject: "Introducción a la Informática",
    evalType: "Obj I.2",
    description: "Objetivo I.2 — Términos de informática y computación (Tabla y Diapositivas)",
    dateStr: "2026-09-19",
    week: "Pasado",
    advisor: "Ing. Danny Colmenares",
    email: "dcolmenaresuna@gmail.com",
    tagClass: "bg-blue-100 text-blue-900 border border-blue-300"
  },
  {
    id: 3,
    code: "115",
    subject: "Lengua y Comunicación",
    evalType: "TP1",
    description: "Trabajo Práctico 1 — Objetivos I.1 a I.4 (Infografía, Cuadros y Análisis)",
    dateStr: "2026-10-03",
    week: "Sem. 40",
    advisor: "Prof. Samuel Jaimes",
    email: "profesorsamjaimesparra@gmail.com",
    tagClass: "bg-emerald-100 text-emerald-900 border border-emerald-300"
  },
  {
    id: 4,
    code: "116",
    subject: "Introducción a la Informática",
    evalType: "Obj I.3",
    description: "Objetivo I.3 — Uso de hoja de cálculo en línea y documento explicativo",
    dateStr: "2026-10-03",
    week: "Sem. 40",
    advisor: "Ing. Danny Colmenares",
    email: "dcolmenaresuna@gmail.com",
    tagClass: "bg-blue-100 text-blue-900 border border-blue-300"
  },
  {
    id: 5,
    code: "177",
    subject: "Matemática I",
    evalType: "TSP1",
    description: "Trabajo Sustitutivo de Prueba 1 — Operadores, Funciones y Límites",
    dateStr: "2026-10-10",
    week: "Sem. 41",
    advisor: "Prof. Guido Moreno",
    email: "aleguidox@gmail.com",
    tagClass: "bg-purple-100 text-purple-900 border border-purple-300"
  },
  {
    id: 6,
    code: "116",
    subject: "Introducción a la Informática",
    evalType: "Obj II.1",
    description: "Objetivo II.1 — Fuentes confiables de información en Internet y mapa mental",
    dateStr: "2026-10-17",
    week: "Sem. 42",
    advisor: "Ing. Danny Colmenares",
    email: "dcolmenaresuna@gmail.com",
    tagClass: "bg-blue-100 text-blue-900 border border-blue-300"
  },
  {
    id: 7,
    code: "117",
    subject: "Ambiente y Desarrollo Sostenible",
    evalType: "TP1",
    description: "Trabajo Práctico 1 — Ambiente y Desarrollo Sostenible en Venezuela",
    dateStr: "2026-10-17",
    week: "Sem. 42",
    advisor: "Prof. Rose Mary Núñez",
    email: "rosemarynunez@gmail.com",
    tagClass: "bg-orange-100 text-orange-900 border border-orange-300"
  },
  {
    id: 8,
    code: "200",
    subject: "Introducción a la Ingeniería Industrial",
    evalType: "TSP",
    description: "Trabajo Sustitutivo de Prueba (TSP) — Publicado por SDA (1 día de resolución)",
    dateStr: "2026-10-17",
    week: "Sem. 42",
    advisor: "Prof. Eduardo Roa",
    email: "eduardoroa1976@gmail.com",
    tagClass: "bg-rose-100 text-rose-900 border border-rose-300"
  },
  {
    id: 9,
    code: "116",
    subject: "Introducción a la Informática",
    evalType: "Obj II.2",
    description: "Objetivo II.2 — Redes sociales y plataformas educativas (Infografía digital)",
    dateStr: "2026-10-31",
    week: "Sem. 44",
    advisor: "Ing. Danny Colmenares",
    email: "dcolmenaresuna@gmail.com",
    tagClass: "bg-blue-100 text-blue-900 border border-blue-300"
  },
  {
    id: 10,
    code: "115",
    subject: "Lengua y Comunicación",
    evalType: "TP2",
    description: "Trabajo Práctico 2 — Comprensión Lectora y Redacción Académica",
    dateStr: "2026-11-07",
    week: "Sem. 45",
    advisor: "Prof. Samuel Jaimes",
    email: "profesorsamjaimesparra@gmail.com",
    tagClass: "bg-emerald-100 text-emerald-900 border border-emerald-300"
  },
  {
    id: 11,
    code: "116",
    subject: "Introducción a la Informática",
    evalType: "Obj II.3",
    description: "Objetivo II.3 — Edublog Colaborativo (Google Sites con los 6 objetivos)",
    dateStr: "2026-11-14",
    week: "Sem. 46",
    advisor: "Ing. Danny Colmenares",
    email: "dcolmenaresuna@gmail.com",
    tagClass: "bg-blue-100 text-blue-900 border border-blue-300"
  },
  {
    id: 12,
    code: "177",
    subject: "Matemática I",
    evalType: "TSP2",
    description: "Trabajo Sustitutivo de Prueba 2 — Derivadas e Integrales Aplicadas",
    dateStr: "2026-11-14",
    week: "Sem. 46",
    advisor: "Prof. Guido Moreno",
    email: "aleguidox@gmail.com",
    tagClass: "bg-purple-100 text-purple-900 border border-purple-300"
  },
  {
    id: 13,
    code: "200",
    subject: "Introducción a la Ingeniería Industrial",
    evalType: "TP",
    description: "Trabajo Práctico (TP) — Fabricación de Juguete Didáctico y Rústico",
    dateStr: "2026-11-21",
    week: "Sem. 47",
    advisor: "Prof. Eduardo Roa",
    email: "eduardoroa1976@gmail.com",
    tagClass: "bg-rose-100 text-rose-900 border border-rose-300"
  },
  {
    id: 14,
    code: "117",
    subject: "Ambiente y Desarrollo Sostenible",
    evalType: "TP2",
    description: "Trabajo Práctico 2 — Ecosistemas y Desarrollo Sustentable Regional",
    dateStr: "2026-11-21",
    week: "Sem. 47",
    advisor: "Prof. Rose Mary Núñez",
    email: "rosemarynunez@gmail.com",
    tagClass: "bg-orange-100 text-orange-900 border border-orange-300"
  }
];

const ADVISORS = [
  { code: "115", name: "Prof. Samuel Jaimes", subject: "Lengua y Comunicación", email: "profesorsamjaimesparra@gmail.com", color: "border-green-600" },
  { code: "116", name: "Ing. Danny Colmenares", subject: "Introducción a la Informática", email: "dcolmenaresuna@gmail.com", color: "border-blue-600", link: "https://sites.google.com/view/introduccionalainformatica116/inicio?authuser=0" },
  { code: "117", name: "Prof. Rose Mary Núñez", subject: "Ambiente y Desarrollo Sostenible", email: "rosemarynunez@gmail.com", color: "border-orange-500" },
  { code: "177", name: "Prof. Guido Moreno", subject: "Matemática I", email: "aleguidox@gmail.com", color: "border-purple-600" },
  { code: "200", name: "Prof. Eduardo Roa", subject: "Introducción a la Ingeniería Industrial", email: "eduardoroa1976@gmail.com", color: "border-red-600" },
  { code: "Unidad", name: "Jefatura de Unidad Académica", subject: "Centro Local Táchira", email: "sacademicacltachira@gmail.com", color: "border-indigo-600" }
];

const OFFICIAL_LINKS = [
  { title: "Pensum y Plan de Estudio", url: "https://tinyurl.com/Pensum-y-Plan-de-estudio" },
  { title: "Planes de Curso", url: "https://tinyurl.com/Plan-de-curso" },
  { title: "Trabajos Prácticos (TP)", url: "https://tinyurl.com/Trabajos-Practicos" },
  { title: "Trabajos Sustitutivos de Prueba (TSP)", url: "https://tinyurl.com/Trabajos-Sustitutivos" },
  { title: "Material Instruccional (Libros y Guías)", url: "https://tinyurl.com/Material-Instruccional" },
  { title: "Consultar Alumnos Validados", url: "https://tinyurl.com/Estudiantes-Validados" }
];

export default function App() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cronograma' | 'infografia116' | 'recursos' | 'asesores'>('cronograma');
  const [selectedObj116, setSelectedObj116] = useState<'I.1' | 'I.2' | 'I.3' | 'II.1' | 'II.2' | 'II.3'>('I.1');
  const [showPastEvals, setShowPastEvals] = useState<boolean>(false);

  // Floating notification toast state
  const [toast, setToast] = useState<{ title: string; subtitle: string; visible: boolean } | null>(null);

  const showToast = (title: string, subtitle: string) => {
    setToast({ title, subtitle, visible: true });
    setTimeout(() => {
      setToast(prev => prev ? { ...prev, visible: false } : null);
      setTimeout(() => setToast(null), 300); // Wait for transition
    }, 3000);
  };

  // Live real-time clock in Venezuela time (America/Caracas)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatVenezuelaTime = (date: Date) => {
    try {
      return new Intl.DateTimeFormat('es-VE', {
        timeZone: 'America/Caracas',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
      }).format(date);
    } catch {
      return date.toLocaleString();
    }
  };

  const getCaracasDateKey = (date: Date) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Caracas',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
      const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date);
      const year = parts.find(p => p.type === 'year')?.value || '2026';
      const month = parts.find(p => p.type === 'month')?.value || '10';
      const day = parts.find(p => p.type === 'day')?.value || '12';
      return `${year}-${month}-${day}`;
    } catch {
      return '2026-10-12';
    }
  };

  const todayStr = getCaracasDateKey(currentDate);

  const getEvalStatus = (evalDateStr: string) => {
    if (evalDateStr < todayStr) return { label: '⚠️ Pasado', class: 'bg-gray-600 text-white' };
    if (evalDateStr === todayStr) return { label: '🔴 HOY', class: 'bg-red-600 text-white animate-bounce shadow-lg ring-4 ring-red-300' };
    
    const evDate = new Date(evalDateStr + 'T00:00:00');
    const now = new Date(todayStr + 'T00:00:00');
    const diffDays = Math.ceil((evDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays <= 7) return { label: '🟠 Próximo', class: 'bg-amber-600 text-white' };
    return { label: '🔵 Futuro', class: 'bg-blue-600 text-white' };
  };

  const todayEvals = EVALUATIONS.filter(e => e.dateStr === todayStr);
  const upcomingEvals = EVALUATIONS.filter(e => e.dateStr >= todayStr).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  const pastEvals = EVALUATIONS.filter(e => e.dateStr < todayStr).sort((a, b) => b.dateStr.localeCompare(a.dateStr));

  const targetAlertDate = todayEvals.length > 0 ? todayStr : (upcomingEvals[0]?.dateStr || '');
  const alertEvals = EVALUATIONS.filter(e => e.dateStr === targetAlertDate);

  const getDaysRemainingText = (dateStr: string) => {
    const evDate = new Date(dateStr + 'T00:00:00');
    const now = new Date(todayStr + 'T00:00:00');
    const diffDays = Math.ceil((evDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (diffDays === 0) return 'HOY';
    if (diffDays === 1) return 'en 1 día';
    return `en ${diffDays} días`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    showToast("Correo copiado exitosamente", text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleTabChange = (tab: 'cronograma' | 'infografia116' | 'recursos' | 'asesores') => {
    setActiveTab(tab);
    const names = {
      cronograma: "CRONOGRAMA GENERAL",
      infografia116: "BLOG INFORMÁTICA 116",
      recursos: "ENLACES OFICIALES",
      asesores: "DIRECTORIO DE ASESORES"
    };
    showToast("Pestaña seleccionada", names[tab]);
  };

  const handleObj116Change = (obj: 'I.1' | 'I.2' | 'I.3' | 'II.1' | 'II.2' | 'II.3') => {
    setSelectedObj116(obj);
    showToast("Objetivo seleccionado", `OBJETIVO ${obj}`);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-[#222] font-sans antialiased overflow-x-hidden w-full max-w-full relative">
      
      {/* FLOATING TOP-RIGHT NOTIFICATION TOAST (Improved animation) */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] transition-all duration-300 transform ${toast.visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
          <div className="bg-[#082238] border border-blue-600/40 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3.5 max-w-sm">
            <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-full shrink-0 flex items-center justify-center animate-in zoom-in duration-300 delay-100">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-300 font-medium">{toast.title}</span>
              <span className="text-sm font-bold tracking-wide uppercase text-white">{toast.subtitle}</span>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-gradient-to-r from-[#0d47a1] to-[#1976d2] text-white py-6 md:py-8 px-3 sm:px-6 shadow-lg text-center w-full">
        <div className="text-3xl md:text-4xl mb-2">🎓</div>
        <h1 className="text-base sm:text-2xl md:text-3xl font-bold tracking-tight mb-2 px-1 leading-snug">
          CRONOGRAMA DE ENTREGAS — LAPSO 2026-2
        </h1>
        <h2 className="text-xs sm:text-base md:text-lg font-medium opacity-90 mb-1 px-1">
          Universidad Nacional Abierta — Centro Local Táchira
        </h2>
        <h3 className="text-[11px] sm:text-sm opacity-80 mb-3 px-1">
          TSU Higiene y Seguridad Industrial (Carrera 281)
        </h3>
        
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 mt-4 px-1">
          <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-400/30 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium tracking-wide">
            <Clock className="w-4 h-4 text-cyan-300 animate-spin shrink-0" style={{ animationDuration: '6s' }} />
            <strong className="text-cyan-200">{formatVenezuelaTime(currentDate)}</strong>
          </div>
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium text-amber-100 text-center">
            <span>⏱️ Horario de Atención: <strong>Viernes 1 a 5 PM | Sábados 8 AM a 12 PM</strong></span>
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-30 w-full">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 flex justify-start sm:justify-center space-x-1 sm:space-x-4 overflow-x-auto py-1 scrollbar-none w-full">
          <button
            onClick={() => handleTabChange('cronograma')}
            className={`py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm md:text-base border-b-2 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${activeTab === 'cronograma' ? 'border-[#0d47a1] text-[#0d47a1]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <Calendar className="w-4 h-4" /> Cronograma General
          </button>
          <button
            onClick={() => handleTabChange('infografia116')}
            className={`py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm md:text-base border-b-2 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${activeTab === 'infografia116' ? 'border-[#0d47a1] text-[#0d47a1]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <Laptop className="w-4 h-4" /> Blog Informática 116
          </button>
          <button
            onClick={() => handleTabChange('recursos')}
            className={`py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm md:text-base border-b-2 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${activeTab === 'recursos' ? 'border-[#0d47a1] text-[#0d47a1]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <BookOpen className="w-4 h-4" /> Enlaces Oficiales
          </button>
          <button
            onClick={() => handleTabChange('asesores')}
            className={`py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm md:text-base border-b-2 transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${activeTab === 'asesores' ? 'border-[#0d47a1] text-[#0d47a1]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
          >
            <Users className="w-4 h-4" /> Directorio Asesores
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 md:py-8 w-full box-border">
        
        {/* ALERT BANNER */}
        {alertEvals.length > 0 && (
          <div className={`p-4 sm:p-5 rounded-xl mb-6 md:mb-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white animate-pulse transition-all ${todayEvals.length > 0 ? 'bg-red-600 ring-4 ring-red-300 shadow-red-500/50' : 'bg-orange-600 ring-4 ring-orange-300'}`}>
            <div className="flex items-start md:items-center gap-3 w-full">
              <span className="text-2xl sm:text-3xl shrink-0">🚨</span>
              <div className="w-full">
                <h4 className="font-bold text-base sm:text-lg flex flex-wrap items-center gap-2">
                  <span>{todayEvals.length > 0 ? '¡ENTREGAS PROGRAMADAS PARA HOY!' : `PRÓXIMAS ENTREGAS — ${targetAlertDate.split('-').reverse().join('/')} · ${getDaysRemainingText(targetAlertDate)}`}</span>
                </h4>
                <div className="text-xs sm:text-sm opacity-95 flex flex-col sm:flex-row sm:flex-wrap gap-x-4 gap-y-1 mt-2 bg-black/15 p-3 rounded-lg border border-white/20">
                  {alertEvals.map((e, idx) => (
                    <span key={e.id} className="inline-flex items-center gap-1.5">
                      {idx > 0 && <span className="opacity-70 mr-1 hidden sm:inline">|</span>}
                      <strong className="bg-white/20 px-1.5 py-0.5 rounded text-white">Asig. {e.code} ({e.evalType}):</strong> <a href={`mailto:${e.email}`} className="underline font-mono break-all text-yellow-200">{e.email}</a>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cronograma' && (
          <>
            {/* QUICK BLOG LINKS BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 md:mb-8">
              <button 
                onClick={() => handleTabChange('infografia116')}
                className="bg-white p-3.5 sm:p-4 rounded-xl shadow-sm border border-blue-100 hover:border-blue-300 flex items-center justify-between transition group text-left w-full"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-blue-50 text-blue-600 p-2.5 sm:p-3 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
                    <Laptop className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="truncate">
                    <h5 className="font-bold text-xs sm:text-sm text-blue-900 truncate">Blog Informática 116</h5>
                    <p className="text-[11px] sm:text-xs text-gray-500 truncate">Ver Objetivos I.1 a II.3 de Ing. Danny Colmenares</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition shrink-0 ml-2" />
              </button>

              <a 
                href="https://matematicaunatachira.blogspot.com/#" 
                target="_blank" 
                rel="noreferrer"
                className="bg-white p-3.5 sm:p-4 rounded-xl shadow-sm border border-blue-100 hover:border-blue-300 flex items-center justify-between transition group w-full"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-indigo-50 text-indigo-600 p-2.5 sm:p-3 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition shrink-0">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="truncate">
                    <h5 className="font-bold text-xs sm:text-sm text-indigo-900 truncate">Blog de Matemática y Repositorio UNA</h5>
                    <p className="text-[11px] sm:text-xs text-gray-500 truncate">matematicaunatachira.blogspot.com</p>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition shrink-0 ml-2" />
              </a>
            </div>

            {/* CRONOGRAMA GENERAL TABLE */}
            <div className="text-xs sm:text-sm md:text-base font-bold text-[#0d47a1] border-l-4 border-[#0d47a1] pl-3 py-1.5 bg-blue-50 rounded-r-lg mb-4 flex items-center justify-between">
              <span>📅 Cronograma Activo de Evaluaciones (Lapso 2026-2)</span>
              <span className="text-xs bg-blue-600 text-white px-2.5 py-0.5 rounded-full shrink-0 ml-2">
                {upcomingEvals.length} pendientes
              </span>
            </div>

            {/* MOBILE CARD VIEW (< sm) */}
            <div className="block sm:hidden space-y-3 mb-6">
              {upcomingEvals.map((ev, index) => {
                const status = getEvalStatus(ev.dateStr);
                const isToday = ev.dateStr === todayStr;
                return (
                  <div key={ev.id} className={`bg-white rounded-xl p-4 shadow-sm border border-gray-200 relative w-full ${isToday ? 'border-l-4 border-l-red-600 bg-red-50 animate-bounce ring-2 ring-red-400' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-400">#{index + 1}</span>
                        <span className={`inline-block px-2.5 py-0.5 rounded font-bold text-xs shadow-xs ${ev.tagClass}`}>
                          {ev.code}
                        </span>
                        <span className="font-bold text-xs text-gray-900">{ev.evalType}</span>
                      </div>
                      <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${status.class}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-800 mb-3 leading-relaxed">{ev.description}</p>
                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100 flex-wrap gap-1">
                      <span>📅 <strong className="text-gray-700">{ev.dateStr.split('-').reverse().join('/')}</strong></span>
                      <span>📌 {ev.week}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TABLE VIEW (sm and up) */}
            <div className="hidden sm:block bg-white rounded-xl shadow-md overflow-hidden mb-6 border border-gray-100 w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-[#1565c0] text-white">
                      <th className="p-3">#</th>
                      <th className="p-3">Asignatura</th>
                      <th className="p-3">Eval.</th>
                      <th className="p-3">Descripción</th>
                      <th className="p-3">Fecha límite</th>
                      <th className="p-3">Semana</th>
                      <th className="p-3">Estado Actual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {upcomingEvals.map((ev, index) => {
                      const status = getEvalStatus(ev.dateStr);
                      const isToday = ev.dateStr === todayStr;
                      return (
                        <tr key={ev.id} className={`hover:bg-blue-50/60 transition ${isToday ? 'bg-red-50 border-l-4 border-red-600 font-semibold animate-pulse ring-2 ring-red-400' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                          <td className="p-3 text-gray-500">{index + 1}</td>
                          <td className="p-3">
                            <span className={`inline-block px-2.5 py-1 rounded font-bold text-xs shadow-xs ${ev.tagClass}`}>
                              {ev.code}
                            </span>
                          </td>
                          <td className="p-3 font-semibold">{ev.evalType}</td>
                          <td className="p-3 text-gray-800">{ev.description}</td>
                          <td className="p-3 font-mono text-xs font-bold text-gray-700">{ev.dateStr.split('-').reverse().join('/')}</td>
                          <td className="p-3 text-gray-600">{ev.week}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 ${status.class}`}>
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* COLLAPSIBLE PAST EVALUATIONS TOGGLE TAB */}
            <div className="mb-8 md:mb-10 w-full">
              <button
                onClick={() => setShowPastEvals(!showPastEvals)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl shadow-sm border border-gray-300 transition flex items-center justify-between text-xs sm:text-sm"
              >
                <div className="flex items-center gap-2">
                  <Archive className="w-5 h-5 text-gray-500 shrink-0" />
                  <span>Ver objetivos o entregas pasadas ({pastEvals.length})</span>
                </div>
                {showPastEvals ? <ChevronUp className="w-5 h-5 shrink-0" /> : <ChevronDown className="w-5 h-5 shrink-0" />}
              </button>

              {showPastEvals && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden mt-3 border border-gray-200 animate-fadeIn w-full">
                  <div className="p-3 bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Historial de Evaluaciones Finalizadas / Pasadas
                  </div>
                  
                  {/* MOBILE PAST CARDS */}
                  <div className="block sm:hidden p-3 space-y-2.5 w-full">
                    {pastEvals.map((ev) => (
                      <div key={ev.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 opacity-80 text-xs w-full">
                        <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] ${ev.tagClass}`}>
                              {ev.code}
                            </span>
                            <span className="font-bold">{ev.evalType}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-500 text-white">
                            ⚠ Pasado
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{ev.description}</p>
                        <div className="text-[10px] text-gray-500">Fecha: {ev.dateStr.split('-').reverse().join('/')}</div>
                      </div>
                    ))}
                  </div>

                  {/* DESKTOP PAST TABLE */}
                  <div className="hidden sm:block overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse text-xs md:text-sm">
                      <thead>
                        <tr className="bg-gray-700 text-white">
                          <th className="p-3">Asignatura</th>
                          <th className="p-3">Eval.</th>
                          <th className="p-3">Descripción</th>
                          <th className="p-3">Fecha límite</th>
                          <th className="p-3">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pastEvals.map((ev) => (
                          <tr key={ev.id} className="hover:bg-gray-50 opacity-75">
                            <td className="p-3">
                              <span className={`inline-block px-2.5 py-1 rounded font-bold text-xs ${ev.tagClass}`}>
                                {ev.code}
                              </span>
                            </td>
                            <td className="p-3 font-semibold">{ev.evalType}</td>
                            <td className="p-3 text-gray-700">{ev.description}</td>
                            <td className="p-3 font-mono text-xs">{ev.dateStr.split('-').reverse().join('/')}</td>
                            <td className="p-3">
                              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0 bg-gray-500 text-white">
                                ⚠ Pasado
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* UPCOMING PRIORITIES */}
            <div className="text-xs sm:text-sm md:text-base font-bold text-[#0d47a1] border-l-4 border-[#0d47a1] pl-3 py-1.5 bg-blue-50 rounded-r-lg mb-4">
              ⚡ Próximas Prioridades Académicas (Ordenadas Automáticamente)
            </div>

            {/* MOBILE PRIORITIES CARDS */}
            <div className="block sm:hidden space-y-3 mb-10 w-full">
              {upcomingEvals.map((item, index) => {
                const evDate = new Date(item.dateStr + 'T00:00:00');
                const now = new Date(todayStr + 'T00:00:00');
                const diffDays = Math.ceil((evDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
                
                let badgeColor = "bg-blue-100 text-blue-800";
                let timeText = `${diffDays} días restantes`;
                if (diffDays < 0) {
                  badgeColor = "bg-gray-100 text-gray-600";
                  timeText = "Finalizado";
                } else if (diffDays === 0) {
                  badgeColor = "bg-red-100 text-red-700 font-bold animate-pulse";
                  timeText = "¡HOY!";
                } else if (diffDays <= 7) {
                  badgeColor = "bg-amber-100 text-amber-800 font-bold";
                  timeText = `${diffDays} días (¡Pronto!)`;
                }

                return (
                  <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 w-full">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-400">{index + 1}°</span>
                        <span className={`inline-block px-2.5 py-0.5 rounded font-bold text-xs ${item.tagClass}`}>
                          {item.code}
                        </span>
                        <span className="font-bold text-xs">{item.subject}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badgeColor} whitespace-nowrap`}>
                        {timeText}
                      </span>
                    </div>
                    <div className="text-xs text-gray-700 mb-2">
                      <strong>Evaluación:</strong> {item.evalType} ({item.dateStr.split('-').reverse().join('/')})
                    </div>
                    <div className="text-xs text-gray-600 pt-2 border-t border-gray-100 flex flex-col gap-0.5">
                      <span>👨‍🏫 {item.advisor}</span>
                      <a href={`mailto:${item.email}`} className="font-mono text-blue-600 underline break-all">{item.email}</a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TABLE VIEW FOR PRIORITIES */}
            <div className="hidden sm:block bg-white rounded-xl shadow-md overflow-hidden mb-10 border border-gray-100 w-full">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-[#1565c0] text-white">
                      <th className="p-3">Prioridad</th>
                      <th className="p-3">Asignatura</th>
                      <th className="p-3">Evaluación</th>
                      <th className="p-3">Fecha límite</th>
                      <th className="p-3">Días / Estado</th>
                      <th className="p-3">Asesor / Correo de Contacto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {upcomingEvals.map((item, index) => {
                      const evDate = new Date(item.dateStr + 'T00:00:00');
                      const now = new Date(todayStr + 'T00:00:00');
                      const diffDays = Math.ceil((evDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
                      
                      let badgeColor = "bg-blue-100 text-blue-800";
                      let timeText = `${diffDays} días restantes`;
                      if (diffDays < 0) {
                        badgeColor = "bg-gray-100 text-gray-600";
                        timeText = "Finalizado";
                      } else if (diffDays === 0) {
                        badgeColor = "bg-red-100 text-red-700 font-bold animate-pulse";
                        timeText = "¡HOY!";
                      } else if (diffDays <= 7) {
                        badgeColor = "bg-amber-100 text-amber-800 font-bold";
                        timeText = `${diffDays} días (¡Pronto!)`;
                      }

                      return (
                        <tr key={item.id} className="hover:bg-blue-50/50 transition">
                          <td className="p-3 font-bold text-gray-700">{index + 1}°</td>
                          <td className="p-3">
                            <span className={`inline-block px-2.5 py-1 rounded font-bold text-xs shadow-xs ${item.tagClass}`}>
                              {item.code} – {item.subject}
                            </span>
                          </td>
                          <td className="p-3 font-semibold">{item.evalType}</td>
                          <td className="p-3 font-mono text-xs">{item.dateStr.split('-').reverse().join('/')}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs ${badgeColor} whitespace-nowrap`}>
                              {timeText}
                            </span>
                          </td>
                          <td className="p-3 text-xs">
                            <span className="font-semibold text-gray-800">{item.advisor}</span><br />
                            <span className="font-mono text-blue-600 select-all break-all">{item.email}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'infografia116' && (
          <div className="space-y-6 mb-10 w-full">
            <div className="bg-gradient-to-r from-blue-900 to-[#1565c0] text-white p-5 sm:p-6 rounded-2xl shadow-lg w-full">
              <h3 className="text-lg sm:text-xl font-bold mb-1">💻 Asignatura 116: Introducción a la Informática</h3>
              <p className="text-xs sm:text-sm opacity-90 mb-4">
                Asesor Académico: <strong>Ing. Danny Colmenares P.</strong> — Centro Local Táchira (Cronograma Independiente / Propio del Asesor)
              </p>
              
              {/* OBJECTIVE SELECTOR BUTTONS */}
              <div className="flex flex-wrap gap-2 pt-2">
                {(['I.1', 'I.2', 'I.3', 'II.1', 'II.2', 'II.3'] as const).map(obj => (
                  <button
                    key={obj}
                    onClick={() => handleObj116Change(obj)}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition ${selectedObj116 === obj ? 'bg-white text-blue-900 shadow' : 'bg-blue-800/60 text-white hover:bg-blue-800'}`}
                  >
                    Objetivo {obj}
                  </button>
                ))}
              </div>
            </div>

            {/* OBJECTIVE CONTENT CARD */}
            <div className="bg-white rounded-2xl shadow-md p-5 sm:p-6 md:p-8 border border-gray-200 w-full">
              {selectedObj116 === 'I.1' && (
                <div className="space-y-4">
                  <div className="inline-block bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-xs">
                    Fecha límite: 25/07/2026 (Ponderación: 1) — ⚠ Pasado
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900">Objetivo I.1: Fundamentos de la ergonomía</h4>
                  <p className="italic text-gray-600 text-xs sm:text-sm border-l-4 border-blue-500 pl-4 py-1">
                    “Las raíces de la educación son amargas, pero los frutos son dulces.”
                  </p>
                  <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <p><strong>Objetivo Específico:</strong> Describir, conscientemente, los aspectos básicos de la higiene del usuario: postura y sesiones de trabajo.</p>
                    <div className="bg-gray-50 p-4 rounded-xl border">
                      <h5 className="font-bold text-gray-900 mb-2">Actividades previas (Reflexión):</h5>
                      <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                        <li>¿Cuánto tiempo es el máximo que has utilizado una computadora?</li>
                        <li>¿Te ha dolido la espalda, cuello o muñeca luego de alguna sesión con el computador?</li>
                        <li>Normalmente ¿qué tipo de asiento usas al trabajar con equipos informáticos?</li>
                        <li>¿Sueles utilizar tu equipo sentado o acostado en la cama?</li>
                      </ul>
                    </div>
                    <p><strong>Contenidos:</strong> Uso de procesadores de texto (tipo de fuente, resaltado, alineación, tablas de contenido, inserción de imágenes). Definición, aspectos básicos e importancia de la ergonomía en el uso del computador.</p>
                    <p><strong>Asignación:</strong> Crear un informe escrito con el procesador de texto en línea (Google Docs, Zoho Writer) describiendo ergonomía, postura, sesiones de trabajo, autoevaluación y reflexión. Estructura requerida: Portada, Introducción, Cuerpo del trabajo, Conclusiones y Referencias (Normas APA/UPEL).</p>
                  </div>
                </div>
              )}

              {selectedObj116 === 'I.2' && (
                <div className="space-y-4">
                  <div className="inline-block bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-xs">
                    Fecha límite: 19/09/2026 (Ponderación: 2) — ⚠ Pasado
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900">Objetivo I.2: Términos de informática y computación</h4>
                  <p className="italic text-gray-600 text-xs sm:text-sm border-l-4 border-blue-500 pl-4 py-1">
                    “No te rindas, las cosas que verdaderamente valen la pena llevan tiempo.”
                  </p>
                  <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <p><strong>Objetivo Específico:</strong> Discriminar con claridad los diferentes términos informáticos, así como los componentes de los equipos de computación.</p>
                    <div className="bg-gray-50 p-4 rounded-xl border">
                      <h5 className="font-bold text-gray-900 mb-2">Pasos para la actividad:</h5>
                      <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm">
                        <li>Crear un documento en línea denominado <em>apuntes objetivo I.2</em>.</li>
                        <li>Agregar una tabla de 5 columnas: <code>Término</code> | <code>Evolución histórica</code> | <code>Términos básicos</code> | <code>Componentes hardware</code> | <code>Software</code>.</li>
                        <li>Ubicar las definiciones encontradas en una página nueva y guardar fuentes para las referencias.</li>
                        <li>Elegir un rubro y realizar una presentación de diapositivas en línea (Google Sheets / Zoho Show) de forma creativa y dinámica con imágenes, enlaces y elementos multimedia.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {selectedObj116 === 'I.3' && (
                <div className="space-y-4">
                  <div className="inline-block bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-xs">
                    Fecha límite: 03/10/2026 (Ponderación: 2) — ⚠ Pasado
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900">Objetivo I.3: Uso de la hoja de cálculo en línea</h4>
                  <p className="italic text-gray-600 text-xs sm:text-sm border-l-4 border-blue-500 pl-4 py-1">
                    “La vida no trata en esperar a que pase la tormenta, sino de aprender a bailar bajo la lluvia.”
                  </p>
                  <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <p><strong>Objetivo Específico:</strong> Aplicar creativamente procesador de texto, hoja de cálculo y presentación de diapositivas para la exposición de información haciendo uso de Internet.</p>
                    <div className="bg-gray-50 p-4 rounded-xl border">
                      <h5 className="font-bold text-gray-900 mb-2">Instrucciones principales:</h5>
                      <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                        <li>Contestar las preguntas previas de exploración de conocimientos.</li>
                        <li>Desarrollar un informe en procesador de texto (Google Docs / Zoho Writer) con Introducción, Índice, Contenido, Conclusiones y Referencias.</li>
                        <li>Desarrollar un cuadro comparativo de aplicaciones ofimáticas.</li>
                        <li>Crear una hoja de cálculo en línea (Google Sheets / Zoho Sheet) resolviendo un problema real o ficticio relacionado con tu carrera (inventario, finanzas, presupuesto, cronograma o dashboard).</li>
                        <li>Entregar el informe explicativo de la hoja de cálculo desarrollada.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {selectedObj116 === 'II.1' && (
                <div className="space-y-4">
                  <div className="inline-block bg-amber-100 text-amber-800 font-bold px-3 py-1 rounded-full text-xs">
                    Fecha límite: 17/10/2026 (Ponderación: 1) — 🟠 Próximo
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900">Objetivo II.1: Fuentes confiables de información en Internet</h4>
                  <p className="italic text-gray-600 text-xs sm:text-sm border-l-4 border-blue-500 pl-4 py-1">
                    “La disciplina es el puente que construyes entre los objetivos que te planteas y los resultados que obtienes.”
                  </p>
                  <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <p><strong>Objetivo Específico:</strong> Describir, de forma interpretativa, las diferentes herramientas para la recopilación de información utilizando para ello las TIC.</p>
                    <div className="bg-gray-50 p-4 rounded-xl border">
                      <h5 className="font-bold text-gray-900 mb-2">Instrucciones:</h5>
                      <p className="text-xs sm:text-sm mb-2">Utiliza los buscadores académicos (Google Académico, SciELO, Redalyc, Dialnet, etc.), bibliotecas virtuales y repositorios para investigar sobre fuentes confiables. Con los apuntes recopilados, crea un <strong>mapa mental</strong> (usando Genially, Lucidchart, Mindmeister o Goconqr) sobre la definición de los términos investigados, sus características básicas y ejemplos.</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedObj116 === 'II.2' && (
                <div className="space-y-4">
                  <div className="inline-block bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-xs">
                    Fecha límite: 31/10/2026 (Ponderación: 2) — 🔵 Futuro
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900">Objetivo II.2: Redes sociales y plataformas educativas</h4>
                  <p className="italic text-gray-600 text-xs sm:text-sm border-l-4 border-blue-500 pl-4 py-1">
                    “El éxito es la suma de pequeños esfuerzos repetidos día tras día.”
                  </p>
                  <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <p><strong>Objetivo Específico:</strong> Caracterizar críticamente aplicaciones y herramientas de aprendizaje de la Web 3.0, para el desarrollo de actividades académicas y/o profesionales.</p>
                    <div className="bg-gray-50 p-4 rounded-xl border">
                      <h5 className="font-bold text-gray-900 mb-2">Instrucciones:</h5>
                      <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                        <li>Crear un documento de texto con la definición de aplicación, procesador de texto, hoja de cálculo, base de datos y presentaciones, indicando sus usos académicos y profesionales.</li>
                        <li>Incluir las redes sociales y plataformas educativas de mayor uso.</li>
                        <li>Crear una <strong>infografía digital</strong> (usando Genially o Infogram) enfocada en nombrar y describir las aplicaciones, redes sociales y plataformas educativas y su valor en las actividades académicas.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {selectedObj116 === 'II.3' && (
                <div className="space-y-4">
                  <div className="inline-block bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full text-xs">
                    Fecha límite: 14/11/2026 (Ponderación: 3) — 🔵 Futuro
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900">Objetivo II.3: Aprendizaje colaborativo (Edublog)</h4>
                  <p className="italic text-gray-600 text-xs sm:text-sm border-l-4 border-blue-500 pl-4 py-1">
                    “Ninguno de nosotros es tan bueno como todos nosotros juntos.”
                  </p>
                  <div className="space-y-3 text-xs sm:text-sm text-gray-700 leading-relaxed">
                    <p><strong>Objetivo Específico:</strong> Emplear una aplicación o herramienta de aprendizaje de la Web 3.0 para el desarrollo de una actividad académica colaborativa.</p>
                    <div className="bg-gray-50 p-4 rounded-xl border">
                      <h5 className="font-bold text-gray-900 mb-2">Estructura del Edublog (Google Sites en equipo de 3):</h5>
                      <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm">
                        <li><strong>Primera página:</strong> Título, información de contacto y propósito.</li>
                        <li><strong>Segunda página:</strong> Definición de ergonomía, importancia y efectos.</li>
                        <li><strong>Tercera página:</strong> Términos básicos de computación y hardware/software.</li>
                        <li><strong>Cuarta página:</strong> Procesadores, hojas de cálculo, presentaciones y correo electrónico.</li>
                        <li><strong>Quinta página:</strong> Web, navegadores, buscadores y fuentes confiables.</li>
                        <li><strong>Sexta página:</strong> Software de aplicación, redes sociales y plataformas educativas.</li>
                        <li><strong>Séptima página:</strong> Concepto y beneficios del aprendizaje colaborativo.</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'recursos' && (
          <div className="space-y-8 mb-10 w-full">
            {/* OFFICIAL LINKS & REPOSITORIES */}
            <div>
              <div className="text-base font-bold text-[#0d47a1] border-l-4 border-[#0d47a1] pl-3 py-1 bg-blue-50 rounded-r-lg mb-4">
                📂 Enlaces Oficiales (Pensum, Planes de Curso, TP y TSP)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {OFFICIAL_LINKS.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 hover:shadow-md transition flex items-center justify-between group w-full"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm text-gray-800 group-hover:text-blue-900 truncate">{link.title}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'asesores' && (
          <div className="mb-10 w-full">
            <div className="text-base font-bold text-[#0d47a1] border-l-4 border-[#0d47a1] pl-3 py-1 bg-blue-50 rounded-r-lg mb-4">
              👨‍🏫 Directorio Oficial de Asesores y Correos UNA Táchira (TSU Higiene y Seguridad Industrial - 281)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {ADVISORS.map((adv, idx) => (
                <div key={idx} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${adv.color} hover:shadow-md transition w-full`}>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                    {adv.code === "Unidad" ? "Contacto Institucional" : `Asignatura ${adv.code}`}
                  </div>
                  <div className="font-bold text-gray-900 text-base mb-0.5">{adv.name}</div>
                  <div className="text-xs text-gray-600 mb-3">{adv.subject}</div>
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200 w-full">
                    <span className="font-mono text-xs text-blue-700 truncate select-all mr-2">{adv.email}</span>
                    <button 
                      onClick={() => copyToClipboard(adv.email)}
                      className="text-gray-500 hover:text-blue-600 p-1 rounded transition shrink-0"
                      title="Copiar correo"
                    >
                      {copiedEmail === adv.email ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {adv.link && (
                    <div className="mt-2 text-xs">
                      <a href={adv.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Ver sitio web del asesor
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="text-center text-xs text-gray-500 py-6 border-t border-gray-200 space-y-2 px-2 w-full">
          <p>📌 Correo académico oficial de la sede: <strong className="text-blue-700 select-all">sacademicacltachira@gmail.com</strong></p>
          <p>📌 Blog del asesor de Informática 116: <a href="https://sites.google.com/view/introduccionalainformatica116/inicio?authuser=0" target="_blank" rel="noreferrer" className="text-blue-600 underline">sites.google.com/view/introduccionalainformatica116/</a></p>
          <p className="mt-2 text-gray-600 font-medium">Portal Estudiantil UNA Centro Local Táchira — TSU Higiene y Seguridad Industrial (281) — Lapso 2026-2</p>
        </footer>

      </div>
    </div>
  );
}
