import React, { useState, useEffect } from 'react';
import {
  Mic,
  Volume2,
  Copy,
  Check,
  RotateCcw,
  Languages,
  ArrowRight,
  Sparkles,
  Square,
  VolumeX,
} from 'lucide-react';
import { SpeechInput } from '../components/SpeechInput';
import { TextToSpeechButton } from '../components/TextToSpeechButton';
import { askLegalChat } from '../api';
import { INDIAN_LANGUAGES } from '../data/mockKnowledge';
import { NavTab } from '../components/Navigation';

interface SpeechAssistantPageProps {
  onSendToChat: (text: string) => void;
  onSendToComplaint: (text: string) => void;
  onNavigate: (tab: NavTab) => void;
  globalLanguage?: string;
  onLanguageChange?: (lang: string) => void;
}

export const SpeechAssistantPage: React.FC<SpeechAssistantPageProps> = ({
  onSendToChat,
  onSendToComplaint,
  onNavigate,
  globalLanguage = 'English',
  onLanguageChange,
}) => {
  const [transcript, setTranscript] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(globalLanguage);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  useEffect(() => {
    if (globalLanguage) {
      setSelectedLanguage(globalLanguage);
    }
  }, [globalLanguage]);

  const handleAskNyayaMithra = async () => {
    if (!transcript.trim() || loading) return;
    setLoading(true);
    setAnswer(null);

    try {
      const response = await askLegalChat(transcript.trim(), selectedLanguage);
      setAnswer(
        response.answer ||
        response.plain_summary ||
        response.content ||
        'Under Indian Law, citizens are entitled to statutory remedies under the Consumer Protection Act 2019, Bharatiya Nyaya Sanhita 2023, and Right to Information Act 2005.'
      );
    } catch (err) {
      setAnswer(
        'Under Indian Law, citizens have legal rights and remedies. You can submit a 15-day formal legal notice or file a complaint with the appropriate authority or consumer commission.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAnswer = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setTranscript('');
    setAnswer(null);
  };

  return (
    <div id="nyayamithra-speech-assistant-page" className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Speech Assistant
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Speak your legal question in your preferred language.
          </p>
        </div>

        {/* Language selector */}
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

      {/* Voice Recording Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-5">
        <SpeechInput
          currentValue={transcript}
          onTranscriptChange={(t) => setTranscript(t)}
          selectedLanguage={selectedLanguage}
          onLanguageChange={(l) => {
            setSelectedLanguage(l);
            if (onLanguageChange) onLanguageChange(l);
          }}
          onSubmitPrompt={() => handleAskNyayaMithra()}
        />

        {/* Live Transcript Box */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-700">
              Your speech:
            </label>
            {transcript && (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-slate-700 transition"
              >
                Clear
              </button>
            )}
          </div>
          <textarea
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your spoken words will appear here as you speak..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-hidden leading-relaxed"
          />
        </div>

        {/* Ask NyayaMithra Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            {transcript && (
              <button
                type="button"
                onClick={() => {
                  onSendToComplaint(transcript);
                  onNavigate('complaint-to-draft');
                }}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline"
              >
                Or use in Complaint Draft
              </button>
            )}
          </div>

          <button
            type="button"
            id="btn-ask-speech-assistant"
            onClick={handleAskNyayaMithra}
            disabled={!transcript.trim() || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-40"
          >
            {loading ? (
              <>
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span>Ask NyayaMithra</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Spoken Answer Display */}
      {answer && (
        <div id="speech-assistant-answer-box" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Answer from NyayaMithra
            </h3>
            <div className="flex items-center gap-2">
              <TextToSpeechButton text={answer} language={selectedLanguage} />
              <button
                type="button"
                onClick={handleCopyAnswer}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
};
