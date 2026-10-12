import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Trash2,
  Shield,
  Download,
  Languages,
  Sun,
  Moon,
  Monitor,
  X,
} from 'lucide-react';
import { AppSettings, ChatSession } from '../types';
import { translations } from '../utils/translations';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onClearAllSessions: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onExportBackup: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onClearAllSessions,
  settings,
  onUpdateSettings,
  onExportBackup,
  isOpen,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[settings.language];

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 bottom-0 z-50 w-72 bg-slate-900/95 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Action Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onNewSession();
              onCloseMobile();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-lg shadow-md shadow-cyan-950 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.newChat}</span>
          </button>
          <button
            onClick={onCloseMobile}
            className="p-2 text-slate-400 hover:text-white rounded-lg md:hidden"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchChats}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 px-4">
              {t.noChatsFound}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onCloseMobile();
                  }}
                  className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white font-medium shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageSquare
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-cyan-400' : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate">{session.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                    title={t.deleteChat}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Security & Controls Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-3">
          {/* Encryption Indicator */}
          <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-slate-950/60 rounded-lg border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Shield
                className={`w-3.5 h-3.5 ${
                  settings.isEncrypted ? 'text-emerald-400' : 'text-cyan-400'
                }`}
              />
              <span className="text-[11px]">
                {settings.isEncrypted ? 'AES-256 Lock' : 'Client Storage'}
              </span>
            </div>
            <button
              onClick={onExportBackup}
              title={t.backupEncrypted}
              className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Language & Theme Bar */}
          <div className="flex items-center justify-between gap-2 pt-1 text-xs text-slate-400">
            {/* Language Toggle */}
            <button
              onClick={() =>
                onUpdateSettings({
                  language: settings.language === 'bn' ? 'en' : 'bn',
                })
              }
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <Languages className="w-3.5 h-3.5 text-cyan-400" />
              <span>{settings.language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Theme Toggle */}
            <div className="flex items-center bg-slate-800/80 rounded p-0.5">
              <button
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={`p-1 rounded ${
                  settings.theme === 'dark' ? 'bg-slate-700 text-cyan-400' : 'text-slate-400'
                }`}
                title={t.dark}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: 'oled' })}
                className={`p-1 rounded ${
                  settings.theme === 'oled' ? 'bg-slate-700 text-indigo-400' : 'text-slate-400'
                }`}
                title={t.oled}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={`p-1 rounded ${
                  settings.theme === 'light' ? 'bg-slate-700 text-amber-400' : 'text-slate-400'
                }`}
                title={t.light}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
