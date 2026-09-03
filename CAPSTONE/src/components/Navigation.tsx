import React from 'react';
import {
  LayoutDashboard,
  MessageSquareText,
  FileText,
  FileSpreadsheet,
  Mic,
} from 'lucide-react';
import { TRANSLATIONS, SupportedLanguage } from '../data/translations';

export type NavTab =
  | 'dashboard'
  | 'chat'
  | 'summarizer'
  | 'complaint-to-draft'
  | 'speech-assistant';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  selectedLanguage?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  selectedLanguage = 'English',
}) => {
  const t = TRANSLATIONS[selectedLanguage as SupportedLanguage] || TRANSLATIONS.English;

  const tabs = [
    { id: 'dashboard' as NavTab, label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'chat' as NavTab, label: t.nav.chat, icon: MessageSquareText },
    { id: 'summarizer' as NavTab, label: t.nav.summarizer, icon: FileText },
    { id: 'complaint-to-draft' as NavTab, label: t.nav.complaintToDraft, icon: FileSpreadsheet },
    { id: 'speech-assistant' as NavTab, label: t.nav.speechAssistant, icon: Mic },
  ];

  return (
    <nav
      id="nyayamithra-main-navigation"
      aria-label="Main Navigation"
      className="border-b border-slate-200 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`nav-tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
