import React, { useState, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  FileCheck,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Languages,
  CheckCircle2,
  FileCode,
  Download,
  X,
} from 'lucide-react';
import { summarizeDocument, DocumentSummaryResponse } from '../api';
import { TextToSpeechButton } from '../components/TextToSpeechButton';
import { INDIAN_LANGUAGES } from '../data/mockKnowledge';
import { TRANSLATIONS, SupportedLanguage } from '../data/translations';

interface DocumentSummarizerPageProps {
  globalLanguage?: string;
  onLanguageChange?: (lang: string) => void;
}

export const DocumentSummarizerPage: React.FC<DocumentSummarizerPageProps> = ({
  globalLanguage = 'English',
  onLanguageChange,
}) => {
  const [inputText, setInputText] = useState(
    `THIS RENTAL AGREEMENT is made on this 1st day of April 2026 between Sri Rajesh Sharma (Landlord) and Sri Priya Patel (Tenant).
The Landlord hereby lets and the Tenant hereby takes the residential flat located at Flat 402, Green Valley Apartments, Bengaluru for a monthly rent of Rs. 28,000/-.
The Tenant has deposited an interest-free security deposit of Rs. 1,50,000/-.
1. The tenancy shall be for an initial duration of 11 months.
2. The Tenant shall not sublet or part with possession of the premises.
3. The Landlord shall refund the security deposit within 7 days of vacating after deducting any unpaid utility bills or damages.
4. Either party may terminate this agreement with 1 month prior written notice. If the Tenant vacates without notice, 1 month rent shall be forfeited.`
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(globalLanguage);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<DocumentSummaryResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (globalLanguage) {
      setSelectedLanguage(globalLanguage);
    }
  }, [globalLanguage]);

  const effectiveLang: SupportedLanguage = (
    selectedLanguage && selectedLanguage in TRANSLATIONS
      ? selectedLanguage
      : 'English'
  ) as SupportedLanguage;

  const t = TRANSLATIONS[effectiveLang]?.summarizer || TRANSLATIONS.English.summarizer;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrorMsg(null);
      // Read plain text if it is text/markdown
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) setInputText(content);
        };
        reader.readAsText(file);
      } else {
        // For PDF or DOCX, update prompt label
        setInputText(`[Document File Loaded: ${file.name} (${Math.round(file.size / 1024)} KB)]\n\n` + inputText);
      }
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim() || loading) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await summarizeDocument(inputText, selectedLanguage);
      if (response.error) {
        setErrorMsg(response.message || 'Unable to summarize the document. Please try again.');
      } else {
        setResult(response);
      }
    } catch (err: any) {
      setErrorMsg('Failed to process document summary. Please verify the text.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!result) return;
    const textToCopy = `DOCUMENT SUMMARY\n${result.summary}\n\nIMPORTANT POINTS:\n${result.important_points.map((p) => `• ${p}`).join('\n')}\n\nIMPORTANT CLAUSES:\n${result.important_clauses.map((c) => `• ${c.clause}: ${c.meaning}`).join('\n')}\n\nPOSSIBLE RISKS / CHECKS:\n${result.risks_and_checks.map((r) => `• ${r}`).join('\n')}\n\nWHAT TO DO NEXT:\n${result.next_steps.map((s) => `• ${s}`).join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSummary = () => {
    if (!result) return;
    const textToDownload = `NYAYAMITHRA - LEGAL DOCUMENT EXPLANATION\n\n1. DOCUMENT SUMMARY:\n${result.summary}\n\n2. IMPORTANT POINTS:\n${result.important_points.map((p) => `• ${p}`).join('\n')}\n\n3. IMPORTANT CLAUSES:\n${result.important_clauses.map((c) => `• ${c.clause}: ${c.meaning}`).join('\n')}\n\n4. POSSIBLE RISKS / CHECKS:\n${result.risks_and_checks.map((r) => `• ${r}`).join('\n')}\n\n5. WHAT TO DO NEXT:\n${result.next_steps.map((s) => `• ${s}`).join('\n')}\n\nDisclaimer: This is an AI-assisted legal summary for informational purposes only. Consult a legal professional for formal legal representation.`;

    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document_explanation_nyayamithra.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInputText('');
    setSelectedFile(null);
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div id="nyayamithra-document-summarizer-page" className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {t.title}
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {t.subtitle}
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-2xs">
            <Languages className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={selectedLanguage}
              onChange={(e) => {
                const lang = e.target.value;
                setSelectedLanguage(lang);
                if (onLanguageChange) onLanguageChange(lang);
              }}
              className="bg-transparent border-none font-semibold text-slate-800 focus:outline-hidden cursor-pointer text-xs"
            >
              {INDIAN_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        {/* Upload Drop Area */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-5 bg-slate-50/50 text-center transition cursor-pointer relative">
          <input
            type="file"
            id="file-upload-input"
            accept=".pdf,.docx,.doc,.txt,.md"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <UploadCloud className="h-7 w-7 text-slate-400 mb-1.5" />
          <p className="text-xs sm:text-sm font-semibold text-slate-800">
            {t.uploadTitle}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {t.uploadDesc}
          </p>
          {selectedFile && (
            <div className="mt-2.5 inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md text-xs font-semibold">
              <FileCheck className="h-3.5 w-3.5" />
              <span>{selectedFile.name}</span>
            </div>
          )}
        </div>

        {/* Text Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-700">
              {t.pasteLabel}
            </label>
            {inputText && (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-500 hover:text-slate-900 transition flex items-center gap-1 font-medium"
              >
                <X className="h-3 w-3" />
                <span>{t.clearBtn}</span>
              </button>
            )}
          </div>
          <textarea
            id="document-text-input"
            rows={6}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t.pastePlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/30 p-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-hidden leading-relaxed font-mono"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            id="btn-summarize-doc"
            onClick={handleSummarize}
            disabled={!inputText.trim() || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-40"
          >
            {loading ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>{t.summarizing}</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>{t.summarizeBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs sm:text-sm text-red-700 flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Structured Output */}
      {result && (
        <div id="document-summary-results" className="space-y-4 pt-2">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-600" />
              <span>{t.resultTitle}</span>
            </h2>
            <div className="flex items-center gap-2">
              <TextToSpeechButton
                text={`${result.summary}. Important Points: ${result.important_points.join('. ')}`}
                language={selectedLanguage}
              />
              <button
                type="button"
                onClick={handleCopySummary}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">{t.copiedBtn}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{t.copyBtn}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownloadSummary}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-2xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.downloadBtn}</span>
              </button>
            </div>
          </div>

          {/* 1. Document Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.summaryTitle}
            </h3>
            <p className="text-sm sm:text-base text-slate-900 leading-relaxed font-normal">
              {result.summary}
            </p>
          </div>

          {/* 2. Important Points */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.importantPointsTitle}
            </h3>
            <ul className="space-y-2">
              {result.important_points.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Important Clauses */}
          {result.important_clauses && result.important_clauses.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t.importantClausesTitle}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.important_clauses.map((clause, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1">
                    <p className="text-xs font-bold text-slate-900">{clause.clause}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{clause.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Possible Risks / Things to Check */}
          {result.risks_and_checks && result.risks_and_checks.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-amber-600" />
                <span>{t.risksTitle}</span>
              </h3>
              <ul className="space-y-2">
                {result.risks_and_checks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-amber-950">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                    <span className="leading-relaxed">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 5. What should I do next? */}
          {result.next_steps && result.next_steps.length > 0 && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                {t.nextStepsTitle}
              </h3>
              <ul className="space-y-2">
                {result.next_steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-blue-950">
                    <ArrowRight className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
