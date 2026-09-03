import React from 'react';
import {
  Menu,
  Languages,
} from 'lucide-react';
import { NavTab } from './Navigation';
import { SUPPORTED_LANGUAGES, TRANSLATIONS, SupportedLanguage } from '../data/translations';

interface HeaderProps {
  activeTab: NavTab;
  onToggleMobileMenu?: () => void;
  selectedLanguage?: string;
  onLanguageChange?: (lang: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onToggleMobileMenu,
  selectedLanguage = 'English',
  onLanguageChange,
}) => {
  const t = TRANSLATIONS[selectedLanguage as SupportedLanguage] || TRANSLATIONS.English;

  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: t.nav.dashboard,
          desc: t.tagline,
        };
      case 'chat':
        return {
          title: t.chat.title,
          desc: t.chat.subtitle,
        };
      case 'summarizer':
        return {
          title: t.summarizer.title,
          desc: t.summarizer.subtitle,
        };
      case 'complaint-to-draft':
        return {
          title: t.complaintToDraft.title,
          desc: t.complaintToDraft.subtitle,
        };
      case 'speech-assistant':
        return {
          title: t.speech.title,
          desc: t.speech.subtitle,
        };
      default:
        return {
          title: t.appName,
          desc: t.tagline,
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <header
      id="nyayamithra-header"
      className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shadow-xs shrink-0 z-30"
    >
      {/* Left: Mobile Toggle & Page Info */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-tight">
            {pageInfo.title}
          </h2>
          <p className="hidden md:block text-xs text-slate-500 leading-tight">
            {pageInfo.desc}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Selector */}
        {onLanguageChange && (
          <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
            <Languages className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeLabel}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </header>
  );
};

