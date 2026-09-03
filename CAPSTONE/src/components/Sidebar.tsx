import React from 'react';
import {
  LayoutDashboard,
  MessageSquareText,
  FileText,
  FileSpreadsheet,
  Mic,
  ShieldCheck,
} from 'lucide-react';
import { NavTab } from './Navigation';
import { TRANSLATIONS, SupportedLanguage } from '../data/translations';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  selectedLanguage?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
  selectedLanguage = 'English',
}) => {
  const t = TRANSLATIONS[selectedLanguage as SupportedLanguage] || TRANSLATIONS.English;

  const navItems = [
    { id: 'dashboard' as NavTab, label: t.nav.dashboard || 'Dashboard', icon: LayoutDashboard },
    { id: 'chat' as NavTab, label: t.nav.chat || 'Legal Chat', icon: MessageSquareText },
    { id: 'summarizer' as NavTab, label: t.nav.summarizer || 'Document Summarizer', icon: FileText },
    { id: 'complaint-to-draft' as NavTab, label: t.nav.complaintToDraft || 'Complaint → Draft', icon: FileSpreadsheet },
    { id: 'speech-assistant' as NavTab, label: t.nav.speechAssistant || 'Speech Assistant', icon: Mic },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        id="nyayamithra-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-slate-100 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } border-r border-slate-800 flex-shrink-0 select-none`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md text-xs font-mono tracking-wider">
              NM
            </div>
            <div>
              <span className="text-xl font-bold text-slate-100 tracking-tight block">
                {t.appName}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 uppercase tracking-widest font-medium">
            {t.dashboard.badge}
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors text-left group ${
                  isActive
                    ? 'bg-slate-800 text-slate-100 font-semibold ring-1 ring-blue-500/50 shadow-xs'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-xs flex items-center justify-center transition ${
                    isActive
                      ? 'text-blue-400'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="flex-1 truncate">{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-xs" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Trust & Privacy Assurance */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-3.5 space-y-1.5 border border-slate-700/40">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0" />
              <span>{t.dashboard.trustStatutory}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {t.dashboard.trustStatutoryDesc}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
