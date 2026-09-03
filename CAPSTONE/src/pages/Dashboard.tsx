import React from 'react';
import {
  MessageSquareText,
  FileText,
  FileSpreadsheet,
  Mic,
  ArrowRight,
  HelpCircle,
  BookOpen,
  FileCheck2,
} from 'lucide-react';
import { NavTab } from '../components/Navigation';
import { TRANSLATIONS, SupportedLanguage } from '../data/translations';

interface DashboardProps {
  onNavigate: (tab: NavTab) => void;
  onSelectSampleChat?: (query: string) => void;
  onSelectSampleComplaint?: (complaint: string) => void;
  selectedLanguage?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onSelectSampleChat,
  onSelectSampleComplaint,
  selectedLanguage = 'English',
}) => {
  const t = TRANSLATIONS[selectedLanguage as SupportedLanguage] || TRANSLATIONS.English;

  return (
    <div id="nyayamithra-dashboard" className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8 px-2 sm:px-4">
      {/* Welcome Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Welcome to NyayaMithra
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          Understand your legal problem in simple language.
        </p>
      </div>

      {/* Action Choice Prompt */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-center text-sm sm:text-base font-semibold text-slate-700">
          What would you like to do?
        </h2>

        {/* 4 Main Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <button
            type="button"
            id="dashboard-action-ask-question"
            onClick={() => onNavigate('chat')}
            className="flex items-center justify-between p-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm sm:text-base transition shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/30 text-blue-300 flex items-center justify-center">
                <MessageSquareText className="w-5 h-5" />
              </div>
              <span className="font-semibold text-slate-100">Ask a Legal Question</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition" />
          </button>

          <button
            type="button"
            id="dashboard-action-summarize-doc"
            onClick={() => onNavigate('summarizer')}
            className="flex items-center justify-between p-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-white hover:border-slate-400 text-slate-900 font-medium text-sm sm:text-base transition shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <span className="font-semibold text-slate-900">Summarize a Document</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition" />
          </button>

          <button
            type="button"
            id="dashboard-action-create-complaint"
            onClick={() => onNavigate('complaint-to-draft')}
            className="flex items-center justify-between p-4 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-50 text-blue-950 font-medium text-sm sm:text-base transition shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="font-semibold text-blue-950">Create a Complaint / Legal Draft</span>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition" />
          </button>

          <button
            type="button"
            id="dashboard-action-use-voice"
            onClick={() => onNavigate('speech-assistant')}
            className="flex items-center justify-between p-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-white hover:border-slate-400 text-slate-900 font-medium text-sm sm:text-base transition shadow-xs group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <span className="font-semibold text-slate-900">Use Voice</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition" />
          </button>
        </div>
      </div>

      {/* 3 Small Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div
          id="feature-card-ask"
          onClick={() => onNavigate('chat')}
          className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-xs cursor-pointer space-y-1.5"
        >
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Ask</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Get simple explanations of Indian laws.
          </p>
        </div>

        <div
          id="feature-card-understand"
          onClick={() => onNavigate('summarizer')}
          className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-xs cursor-pointer space-y-1.5"
        >
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Understand</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Upload a legal document and understand it easily.
          </p>
        </div>

        <div
          id="feature-card-draft"
          onClick={() => onNavigate('complaint-to-draft')}
          className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 hover:shadow-xs cursor-pointer space-y-1.5"
        >
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>Draft</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Turn your complaint into a preliminary legal draft.
          </p>
        </div>
      </div>
    </div>
  );
};
