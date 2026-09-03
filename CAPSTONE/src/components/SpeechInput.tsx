import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, RotateCcw, AlertCircle, Sparkles } from 'lucide-react';
import { INDIAN_LANGUAGES } from '../data/mockKnowledge';

interface SpeechInputProps {
  onTranscriptChange: (text: string) => void;
  currentValue?: string;
  placeholder?: string;
  selectedLanguage?: string;
  onLanguageChange?: (lang: string) => void;
  onSubmitPrompt?: (text: string) => void;
  showSendButton?: boolean;
}

export const SpeechInput: React.FC<SpeechInputProps> = ({
  onTranscriptChange,
  currentValue = '',
  placeholder = 'Speak or type your legal question...',
  selectedLanguage = 'English',
  onLanguageChange,
  onSubmitPrompt,
  showSendButton = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const [speechLanguage, setSpeechLanguage] = useState(selectedLanguage);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setSpeechLanguage(selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      const currentLangObj = INDIAN_LANGUAGES.find((l) => l.code === speechLanguage);
      recognition.lang = currentLangObj ? currentLangObj.speechCode : 'en-IN';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          const updated = (currentValue + ' ' + finalTranscript).trim();
          onTranscriptChange(updated);
        }
        setInterimText(interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
    } catch (e) {
      setSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [speechLanguage, currentValue, onTranscriptChange]);

  const toggleListening = () => {
    if (!supported || !recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        const currentLangObj = INDIAN_LANGUAGES.find((l) => l.code === speechLanguage);
        recognitionRef.current.lang = currentLangObj ? currentLangObj.speechCode : 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleClear = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    setInterimText('');
    onTranscriptChange('');
  };

  const handleLangSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setSpeechLanguage(lang);
    if (onLanguageChange) onLanguageChange(lang);
  };

  return (
    <div id="nyayamithra-speech-input" className="w-full space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <label htmlFor="speech-lang-select" className="font-bold text-slate-700">
            Voice Dialect:
          </label>
          <select
            id="speech-lang-select"
            value={speechLanguage}
            onChange={handleLangSelect}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-500 focus:outline-hidden"
          >
            {INDIAN_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {supported ? (
            <button
              type="button"
              id="btn-toggle-speech"
              onClick={toggleListening}
              aria-label={isListening ? 'Stop recording voice' : 'Start recording voice'}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition shadow-xs ${
                isListening
                  ? 'bg-rose-600 text-white hover:bg-rose-700 animate-pulse'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="h-3.5 w-3.5" />
                  <span>Stop Recording</span>
                </>
              ) : (
                <>
                  <Mic className="h-3.5 w-3.5" />
                  <span>Start Recording</span>
                </>
              )}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-slate-500 text-xs italic">
              <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
              Speech recognition not supported in this browser
            </span>
          )}

          {currentValue && (
            <button
              type="button"
              id="btn-clear-transcript"
              onClick={handleClear}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
              title="Clear transcript"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {isListening && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 animate-pulse">
          <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping"></span>
          <span>Listening in <strong>{speechLanguage}</strong>... Speak clearly into your microphone.</span>
          {interimText && <span className="italic text-rose-950 font-medium">"{interimText}"</span>}
        </div>
      )}

      {showSendButton && onSubmitPrompt && currentValue.trim() && (
        <div className="flex justify-end">
          <button
            type="button"
            id="btn-submit-voice-prompt"
            onClick={() => onSubmitPrompt(currentValue)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-200" />
            Send to Legal Chat
          </button>
        </div>
      )}
    </div>
  );
};
