import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FaXmark,
  FaCompass,
  FaArrowRightFromBracket,
  FaUserGear,
  FaChartPie,
  FaInbox,
  FaChartLine,
  FaFileLines,
  FaHeartPulse,
  FaChartSimple,
  FaCircleQuestion,
  FaCommentDots,
  FaBoxesStacked,
  FaSliders,
  FaComments,
  FaWandMagicSparkles,
  FaBrain,
} from 'react-icons/fa6';
import { isMatch } from 'src/lib/utils/navMatch';
import type { MobileMenuDrawerProps } from './ui.types';

export default function MobileMenuDrawer({
  isOpen,
  onClose,
  enterprise,
  onSignOut,
}: MobileMenuDrawerProps) {
  const { pathname } = useLocation();
  const [rendered, setRendered] = useState(isOpen);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      const timer = setTimeout(() => {
        setVisible(true);
      }, 20);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        setRendered(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!rendered) return null;

  return createPortal(
    <div
      id="mobile-navigation-drawer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-navigation-drawer-title"
      className="fixed inset-0 z-[60] flex flex-col justify-end md:hidden"
    >
      {/* Overlay Backdrop com Animação de Opacidade */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel Sliding Up taking ~75% screen height */}
      <div
        className={`relative z-50 flex h-[75vh] max-h-[85vh] w-full flex-col rounded-t-3xl border-t border-(--quaternary-color)/20 bg-(--bg-secondary) p-5 shadow-2xl transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1) text-(--text-primary) ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        {/* Drag Pill */}
        <div className="mx-auto mb-2 h-1.5 w-12 shrink-0 rounded-full bg-(--quaternary-color)/30" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--quaternary-color)/12 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--primary-color)/15 text-(--primary-color) ring-1 ring-(--primary-color)/30">
              <FaCompass className="h-5 w-5" />
            </div>
            <div>
              <h2 id="mobile-navigation-drawer-title" className="text-base font-bold text-(--text-primary)">
                Mapa de Navegação
              </h2>
              <p className="text-xs text-(--text-tertiary) truncate max-w-52.5">
                {enterprise?.full_name || 'Selecione a página desejada'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar menu"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-(--seventh-color) text-(--text-secondary) hover:text-(--text-primary) active:scale-90 transition-all"
          >
            <FaXmark className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-4 space-y-5 pr-1">
          {/* Section 1: Dashboard Principal */}
          <div>
            <NavLink
              to="/user/dashboard"
              onClick={onClose}
              data-tour="nav-dashboard"
              className={`group flex items-center gap-3 rounded-2xl border p-3.5 transition-all duration-150 active:scale-98 ${
                isMatch('/user/dashboard', pathname)
                  ? 'border-(--primary-color) bg-(--primary-color)/15 text-(--primary-color) font-bold shadow-xs'
                  : 'border-(--quaternary-color)/12 bg-(--seventh-color)/40 text-(--text-secondary) hover:bg-(--seventh-color)'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--primary-color)/15 text-(--primary-color)">
                <FaChartPie className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-(--text-primary)">Visão Geral</span>
            </NavLink>
          </div>

          {/* Section 2: Gestão de Feedbacks */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--text-tertiary) px-1">
              <FaComments className="h-3.5 w-3.5 text-(--primary-color)" />
              <span>Gestão de Feedbacks</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <NavLink
                to="/user/feedbacks/all"
                onClick={onClose}
                className={`flex items-center gap-3 rounded-2xl border p-3 transition-all duration-150 active:scale-95 ${
                  isMatch('/user/feedbacks/all', pathname)
                    ? 'border-(--primary-color) bg-(--primary-color)/15 text-(--primary-color) font-bold'
                    : 'border-(--quaternary-color)/12 bg-(--seventh-color)/40 text-(--text-secondary) hover:bg-(--seventh-color)'
                }`}
              >
                <FaInbox className="h-5 w-5 shrink-0 text-(--primary-color)" />
                <span className="text-xs font-bold text-(--text-primary)">Recebidos</span>
              </NavLink>

              <NavLink
                to="/user/feedbacks/analytics/all"
                onClick={onClose}
                className={`flex items-center gap-3 rounded-2xl border p-3 transition-all duration-150 active:scale-95 ${
                  isMatch('/user/feedbacks/analytics/all', pathname)
                    ? 'border-(--primary-color) bg-(--primary-color)/15 text-(--primary-color) font-bold'
                    : 'border-(--quaternary-color)/12 bg-(--seventh-color)/40 text-(--text-secondary) hover:bg-(--seventh-color)'
                }`}
              >
                <FaChartLine className="h-5 w-5 shrink-0 text-cyan-400" />
                <span className="text-xs font-bold text-(--text-primary)">Analisados</span>
              </NavLink>
            </div>
          </div>

          {/* Section 3: Insights & Estatísticas */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--text-tertiary) px-1">
              <FaWandMagicSparkles className="h-3.5 w-3.5 text-(--primary-color)" />
              <span>Insights & Análises</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <NavLink
                to="/user/insights/reports"
                onClick={onClose}
                data-tour="nav-insights"
                className={`flex items-center gap-3 rounded-2xl border p-3 transition-all duration-150 active:scale-95 ${
                  isMatch('/user/insights/reports', pathname)
                    ? 'border-(--primary-color) bg-(--primary-color)/15 text-(--primary-color) font-bold'
                    : 'border-(--quaternary-color)/12 bg-(--seventh-color)/40 text-(--text-secondary) hover:bg-(--seventh-color)'
                }`}
              >
                <FaFileLines className="h-5 w-5 shrink-0 text-emerald-400" />
                <span className="text-xs font-bold text-(--text-primary)">Relatórios</span>
              </NavLink>

              <NavLink
                to="/user/insights/emotional"
                onClick={onClose}
                className={`flex items-center gap-3 rounded-2xl border p-3 transition-all duration-150 active:scale-95 ${
                  isMatch('/user/insights/emotional', pathname)
                    ? 'border-(--primary-color) bg-(--primary-color)/15 text-(--primary-color) font-bold'
                    : 'border-(--quaternary-color)/12 bg-(--seventh-color)/40 text-(--text-secondary) hover:bg-(--seventh-color)'
                }`}
              >
                <FaHeartPulse className="h-5 w-5 shrink-0 text-rose-400" />
                <span className="text-xs font-bold text-(--text-primary)">Emocional</span>
              </NavLink>

              <NavLink
                to="/user/insights/statistics"
                onClick={onClose}
                className={`flex items-center gap-3 rounded-2xl border p-3 transition-all duration-150 active:scale-95 ${
                  isMatch('/user/insights/statistics', pathname)
                    ? 'border-(--primary-color) bg-(--primary-color)/15 text-(--primary-color) font-bold'
                    : 'border-(--quaternary-color)/12 bg-(--seventh-color)/40 text-(--text-secondary) hover:bg-(--seventh-color)'
                }`}
              >
                <FaChartSimple className="h-5 w-5 shrink-0 text-purple-400" />
                <span className="text-xs font-bold text-(--text-primary)">Estatísticas</span>
              </NavLink>

              <NavLink
                to="/user/insights/questions"
                onClick={onClose}
                className={`flex items-center gap-3 rounded-2xl border p-3 transition-all duration-150 active:scale-95 ${
                  isMatch('/user/insights/questions', pathname)
                    ? 'border-(--primary-color) bg-(--primary-color)/15 text-(--primary-color) font-bold'
                    : 'border-(--quaternary-color)/12 bg-(--seventh-color)/40 text-(--text-secondary) hover:bg-(--seventh-color)'
                }`}
              >
                <FaCircleQuestion className="h-5 w-5 shrink-0 text-amber-400" />
                <span className="text-xs font-bold text-(--text-primary)">Perguntas</span>
              </NavLink>
            </div>
          </div>

          {/* Section 4: Configuração da Coleta */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--text-tertiary) px-1">
              <FaSliders className="h-3.5 w-3.5 text-(--primary-color)" />
              <span>Configuração da Coleta</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <NavLink
                to="/user/edit/feedback-general"
                onClick={onClose}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center transition-all duration-150 active:scale-95 ${
                  isMatch('/user/edit/feedback-general', pathname)
                    ? 'border-(--primary-color) bg-(--primary-color)/15 text-(--primary-color) font-bold'
                    : 'border-(--quaternary-color)/12 bg-(--seventh-color)/40 text-(--text-secondary) hover:bg-(--seventh-color)'
                }`}
              >
                <FaCommentDots className="h-5 w-5 text-cyan-400" />
                <span className="text-xs font-bold truncate w-full">Feedback</span>
              </NavLink>

              <NavLink
                to="/user/edit/types-feedback"
                onClick={onClose}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center transition-all duration-150 active:scale-95 ${
                  isMatch('/user/edit/types-feedback', pathname)
                    ? 'border-(--primary-color) bg-(--primary-color)/15 text-(--primary-color) font-bold'
                    : 'border-(--quaternary-color)/12 bg-(--seventh-color)/40 text-(--text-secondary) hover:bg-(--seventh-color)'
                }`}
              >
                <FaBoxesStacked className="h-5 w-5 text-teal-400" />
                <span className="text-xs font-bold truncate w-full">Catálogo</span>
              </NavLink>

              <NavLink
                to="/user/edit/ia-settings"
                onClick={onClose}
                data-tour="mobile-nav-ia-settings"
                className={`col-span-2 flex items-center justify-center gap-2 rounded-2xl border p-3 text-center transition-all duration-150 active:scale-95 ${
                  isMatch('/user/edit/ia-settings', pathname)
                    ? 'border-(--primary-color) bg-(--primary-color)/15 text-(--primary-color) font-bold'
                    : 'border-(--quaternary-color)/12 bg-(--seventh-color)/40 text-(--text-secondary) hover:bg-(--seventh-color)'
                }`}
              >
                <FaBrain className="h-5 w-5 text-violet-400" />
                <span className="text-xs font-bold">Configuração de IA</span>
              </NavLink>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-(--quaternary-color)/15 grid grid-cols-2 gap-3 shrink-0">
          <NavLink
            to="/user/profile"
            onClick={onClose}
            data-tour="mobile-nav-profile"
            className="flex items-center justify-center gap-2 rounded-2xl border border-(--quaternary-color)/15 bg-(--seventh-color)/50 p-2.5 text-xs font-bold text-(--text-primary) hover:bg-(--seventh-color) active:scale-95 transition-all"
          >
            <FaUserGear className="h-4 w-4 text-(--primary-color)" />
            <span>Meu Perfil</span>
          </NavLink>

          {onSignOut && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignOut();
              }}
              className="flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
            >
              <FaArrowRightFromBracket className="h-4 w-4 text-red-400" />
              <span>Sair</span>
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
