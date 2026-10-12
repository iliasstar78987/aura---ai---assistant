import React from 'react';
import { ShieldCheck, Settings, Sparkles, Brain, Link2, SlidersHorizontal } from 'lucide-react';
import { AppSettings, Language } from '../types';
import { translations } from '../utils/translations';

interface HeaderProps {
  settings: AppSettings;
  onOpenSettings: () => void;
  onOpenImageStudio: () => void;
  onOpenMemory: () => void;
  onOpenLinkModal: () => void;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenSettings,
  onOpenImageStudio,
  onOpenMemory,
  onOpenLinkModal,
  toggleSidebar,
  isSidebarOpen,
}) => {
  const t = translations[settings.language];

  return (
    <header className="flex items-center justify-between gap-8 px-4 lg:px-6 py-3 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors md:hidden"
          aria-label="Toggle menu"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-sm tracking-wider">
            A
          </div>
          <a
            href="/"
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-cyan-400 transition-colors"
          >
            Aura AI
          </a>
        </div>
      </div>

      {/* Zone 2: 4 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={onOpenImageStudio}
          className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{settings.language === 'bn' ? 'ইমেজ স্টুডিও' : 'Image Studio'}</span>
        </button>
        <button
          onClick={onOpenMemory}
          className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
        >
          <Brain className="w-4 h-4 text-indigo-400" />
          <span>{settings.language === 'bn' ? 'স্মৃতি ও মেমোরি' : 'Memory Vault'}</span>
        </button>
        <button
          onClick={onOpenLinkModal}
          className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
        >
          <Link2 className="w-4 h-4 text-emerald-400" />
          <span>{settings.language === 'bn' ? 'ওয়েব লিংক' : 'Web Insights'}</span>
        </button>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 whitespace-nowrap shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{settings.isEncrypted ? 'AES-256 Lock' : 'Local Guard'}</span>
        </div>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 rounded-lg transition-all shadow-sm whitespace-nowrap shrink-0"
        >
          <Settings className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t.settings}</span>
        </button>
      </div>
    </header>
  );
};
