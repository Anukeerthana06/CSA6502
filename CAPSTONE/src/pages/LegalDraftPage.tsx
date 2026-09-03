import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  Printer,
  ChevronRight,
  BookOpen,
  Send,
  Languages,
} from 'lucide-react';
import { generateLegalDraft, getDraftTemplates } from '../api';
import { TextToSpeechButton } from '../components/TextToSpeechButton';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { OfflineNotice } from '../components/OfflineNotice';
import { SUPPORTED_LANGUAGES, TRANSLATIONS, SupportedLanguage } from '../data/translations';

interface LegalDraftPageProps {
  globalLanguage?: string;
  onLanguageChange?: (lang: string) => void;
}

export const LegalDraftPage: React.FC<LegalDraftPageProps> = ({
  globalLanguage = 'English',
  onLanguageChange,
}) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>('consumer_complaint');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [selectedLanguage, setSelectedLanguage] = useState(globalLanguage);
  const [loading, setLoading] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [backendOffline, setBackendOffline] = useState(false);

  useEffect(() => {
    async function loadTemplates() {
      const res = await getDraftTemplates();
      if (res && res.categories) {
        setCategories(res.categories);
        if (res.categories.length > 0) {
          const firstCat = res.categories[0];
          setSelectedCatId(firstCat.id);
          initFormData(firstCat);
        }
      }
    }
    loadTemplates();
  }, []);

  useEffect(() => {
    if (globalLanguage) {
      setSelectedLanguage(globalLanguage);
    }
  }, [globalLanguage]);

  const initFormData = (category: any) => {
    const initial: Record<string, string> = {};
    if (category.fields) {
      category.fields.forEach((f: any) => {
        initial[f.id] = f.default || '';
      });
    }
    setFormData(initial);
  };

  const handleSelectCategory = (cat: any) => {
    setSelectedCatId(cat.id);
    initFormData(cat);
  };

  const handleInputChange = (id: string, val: string) => {
    setFormData((prev) => ({ ...prev, [id]: val }));
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setBackendOffline(false);

    try {
      const res = await generateLegalDraft(selectedCatId, formData, selectedLanguage);
      if (res.error) {
        if (res.backendOffline) {
          setBackendOffline(true);
        }
        alert(res.message || 'Failed to generate draft.');
      } else {
        setGeneratedDraft(res.draft?.full_draft || '');
      }
    } catch (err) {
      setBackendOffline(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!generatedDraft) return;
    const blob = new Blob([generatedDraft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedCatId}_legal_draft.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentCat = categories.find((c) => c.id === selectedCatId) || categories[0];

  return (
    <div id="nyayamithra-legal-draft-page" className="space-y-6 pb-8">
      {/* Category Pills Selector */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Select Legal Document Format (10 Standard Formats)
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Languages className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={selectedLanguage}
              onChange={(e) => {
                const lang = e.target.value;
                setSelectedLanguage(lang);
                if (onLanguageChange) onLanguageChange(lang);
              }}
              className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-800 focus:outline-hidden"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.nativeLabel}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {categories.map((cat) => {
            const isSelected = cat.id === selectedCatId;
            return (
              <button
                key={cat.id}
                type="button"
                id={`btn-draft-cat-${cat.id}`}
                onClick={() => handleSelectCategory(cat)}
                className={`p-2.5 rounded-lg text-left transition border text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-1 ring-blue-500/50'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span className="font-bold block truncate">{cat.title}</span>
                <span className={`text-[10px] truncate mt-1 ${isSelected ? 'text-blue-300' : 'text-slate-500'}`}>
                  {cat.act}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {backendOffline && (
        <OfflineNotice
          onRetry={() => handleGenerate()}
          message="FastAPI backend is offline. Local deterministic drafting templates active."
        />
      )}

      {/* 2-Column Drafting Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Inputs (Left: 5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-slate-900">{currentCat?.title}</h4>
            <p className="text-xs text-slate-500">{currentCat?.description}</p>
            <div className="mt-1 text-[11px] font-medium text-blue-700">
              Governing Law: {currentCat?.act}
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-3.5">
            {currentCat?.fields?.map((f: any) => (
              <div key={f.id} className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {f.label}
                </label>
                {f.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={formData[f.id] || ''}
                    onChange={(e) => handleInputChange(f.id, e.target.value)}
                    placeholder={f.placeholder || ''}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[f.id] || ''}
                    onChange={(e) => handleInputChange(f.id, e.target.value)}
                    placeholder={f.placeholder || ''}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-hidden"
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              id="btn-generate-draft"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>{loading ? 'Drafting Court Petition...' : `Generate ${currentCat?.title || 'Draft'}`}</span>
            </button>
          </form>
        </div>

        {/* Draft Preview Box (Right: 7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-md border-t-4 border-t-blue-600 border-x border-b border-slate-200 flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Legal Draft Document Preview
            </span>

            <div className="flex items-center gap-2">
              {generatedDraft && (
                <>
                  <TextToSpeechButton text={generatedDraft} language={selectedLanguage} />
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-medium px-2 py-1 rounded hover:bg-slate-100 transition"
                    title="Copy Draft"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-medium px-2 py-1 rounded hover:bg-slate-100 transition"
                    title="Download Draft"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 text-xs font-medium px-2 py-1 rounded hover:bg-slate-100 transition"
                    title="Print Draft"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6 sm:p-8 overflow-y-auto max-h-[560px] font-serif text-[13px] sm:text-sm leading-6 text-slate-800 bg-white shadow-inner whitespace-pre-wrap selection:bg-blue-100">
            {generatedDraft ? (
              generatedDraft
            ) : (
              <div className="py-16 text-center text-slate-400 italic">
                Fill the case particulars on the left and click "Generate" to construct your court-ready legal draft.
              </div>
            )}
          </div>
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
};
