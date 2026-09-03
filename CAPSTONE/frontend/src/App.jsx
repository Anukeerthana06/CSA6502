import React, { useState, useEffect, useCallback } from 'react';
import {
  Scale,
  MessageSquareText,
  FileText,
  FileSpreadsheet,
  FolderArchive,
  Mic,
  Activity,
  Server,
  Cpu,
  Database,
  RefreshCw,
  Settings,
  ArrowRight,
  Sparkles,
  Lock,
  Volume2,
  VolumeX,
  MicOff,
  RotateCcw,
  Copy,
  Check,
  Download,
  Printer,
  ShieldAlert,
  BookOpen,
  Info,
} from 'lucide-react';
import {
  checkSystemHealth,
  checkOllamaHealth,
  checkChromaHealth,
  getDocumentsCount,
  sendLegalChat,
  generateLegalDraft,
  convertComplaintToDraft,
  getDocumentsList,
  triggerIngest,
  uploadDocumentFile,
  getApiBaseUrl,
  setApiBaseUrl,
} from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [systemStatus, setSystemStatus] = useState({
    backendOnline: false,
    ollamaOnline: false,
    model: 'llama3.2:3b',
    chromaReady: false,
    chunksCount: 0,
    docsCount: 7,
  });

  const refreshStatus = useCallback(async () => {
    try {
      const [h, o, c, d] = await Promise.all([
        checkSystemHealth(),
        checkOllamaHealth(),
        checkChromaHealth(),
        getDocumentsCount(),
      ]);
      setSystemStatus({
        backendOnline: !!(h && !h.error && h.status === 'ok'),
        ollamaOnline: !!(o && !o.error && o.status === 'online'),
        model: o && o.model ? o.model : 'llama3.2:3b',
        chromaReady: !!(c && !c.error && c.status === 'ready'),
        chunksCount: c && typeof c.total_chunks === 'number' ? c.total_chunks : 0,
        docsCount: d && typeof d.total_documents === 'number' ? d.total_documents : 7,
      });
    } catch (e) {
      console.warn('Status probe error:', e);
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-amber-400">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-bold tracking-tight text-slate-950">
                NYAYAMITHRA
              </h1>
              <p className="text-xs text-slate-500">AI-Powered Indian Legal Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${systemStatus.backendOnline ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>
              API: {systemStatus.backendOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </header>

      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex space-x-2 py-2 overflow-x-auto">
          {['dashboard', 'chat', 'drafts', 'complaint-to-draft', 'documents', 'speech-assistant', 'status'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider capitalize ${activeTab === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {tab.replace(/-/g, ' ')}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 capitalize mb-2">
            {activeTab.replace(/-/g, ' ')} Module
          </h2>
          <p className="text-xs text-slate-600">
            NyayaMithra provides local AI legal assistance powered by ChromaDB RAG and local Ollama model.
          </p>
        </div>
      </main>
    </div>
  );
}
