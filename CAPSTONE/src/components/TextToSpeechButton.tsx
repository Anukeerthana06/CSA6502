import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface TextToSpeechButtonProps {
  text: string;
  language?: string;
}

export const TextToSpeechButton: React.FC<TextToSpeechButtonProps> = ({ text, language = 'English' }) => {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  const handleToggleSpeak = () => {
    if (!supported || !text) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[#*_`~>-]/g, ' ')
      .replace(/\[INSERT [^\]]+\]/g, 'insert required detail')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);

    const langMap: Record<string, string> = {
      English: 'en-IN',
      Hindi: 'hi-IN',
      Telugu: 'te-IN',
      Tamil: 'ta-IN',
      Kannada: 'kn-IN',
      Malayalam: 'ml-IN',
      Marathi: 'mr-IN',
      Bengali: 'bn-IN',
    };

    utterance.lang = langMap[language] || 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  if (!supported) return null;

  return (
    <button
      type="button"
      id="btn-text-to-speech"
      onClick={handleToggleSpeak}
      title={speaking ? 'Stop Speech' : 'Listen to Answer (Text-to-Speech)'}
      aria-label={speaking ? 'Stop voice reading' : 'Read legal answer aloud'}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
        speaking
          ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
      }`}
    >
      {speaking ? (
        <>
          <VolumeX className="h-3.5 w-3.5 text-blue-700" />
          <span>Stop Voice</span>
        </>
      ) : (
        <>
          <Volume2 className="h-3.5 w-3.5 text-slate-600" />
          <span>Read Aloud</span>
        </>
      )}
    </button>
  );
};
