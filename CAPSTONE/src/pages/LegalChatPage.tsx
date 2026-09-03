import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Plus,
  Copy,
  Check,
  Languages,
  Mic,
  ArrowUp,
  RotateCcw,
} from 'lucide-react';
import { askLegalChat, ChatMessage } from '../api';
import { SpeechInput } from '../components/SpeechInput';
import { TextToSpeechButton } from '../components/TextToSpeechButton';
import { INDIAN_LANGUAGES } from '../data/mockKnowledge';

interface LegalChatPageProps {
  initialPrompt?: string;
  globalLanguage?: string;
  onLanguageChange?: (lang: string) => void;
}

export const LegalChatPage: React.FC<LegalChatPageProps> = ({
  initialPrompt = '',
  globalLanguage = 'English',
  onLanguageChange,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am NyayaMithra, your Indian Legal Assistant. How can I help you today? You can describe any legal problem or dispute in simple words.',
      language: globalLanguage,
    },
  ]);
  const [inputQuery, setInputQuery] = useState(initialPrompt);
  const [selectedLanguage, setSelectedLanguage] = useState(globalLanguage);
  const [loading, setLoading] = useState(false);
  const [showMicInput, setShowMicInput] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'How can I file a consumer complaint?',
    'My employer has not paid my salary. What can I do?',
    'What should I do if my landlord refuses to return my deposit?',
    'Explain this legal notice in simple language.',
  ];

  useEffect(() => {
    if (initialPrompt) {
      setInputQuery(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (globalLanguage) {
      setSelectedLanguage(globalLanguage);
    }
  }, [globalLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (promptToSend?: string) => {
    const query = promptToSend || inputQuery;
    if (!query.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: query.trim(),
      language: selectedLanguage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await askLegalChat(query.trim(), selectedLanguage);

      const content =
        response.answer ||
        response.content ||
        response.plain_summary ||
        'I can assist you with your Indian legal questions and statutory remedies under Indian law.';

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content,
        plain_summary: response.plain_summary,
        language: response.language || selectedLanguage,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Under Indian Law, citizens have legal protections under statutes such as the Consumer Protection Act 2019, Bharatiya Nyaya Sanhita 2023, and Right to Information Act 2005. Please rephrase or specify the issue (e.g. consumer refund, rental deposit, RTI application).',
          language: selectedLanguage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleNewChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          'Started a new conversation. What legal problem or question would you like help with?',
        language: selectedLanguage,
      },
    ]);
    setInputQuery('');
  };

  return (
    <div id="nyayamithra-legal-chat-page" className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8.5rem)] max-h-[850px]">
      {/* Top Bar: Clean controls */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200 shrink-0 mb-3 px-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="chat-btn-new-chat"
            onClick={handleNewChat}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs">
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

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 py-2 scrollbar-thin">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mt-0.5">
                  NM
                </div>
              )}

              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200 text-slate-900 shadow-2xs rounded-tl-xs'
                }`}
              >
                {/* Message Body */}
                <div className="whitespace-pre-wrap leading-relaxed text-sm">
                  {msg.content}
                </div>

                {/* Plain language summary box if distinct */}
                {!isUser && msg.plain_summary && msg.plain_summary !== msg.content && (
                  <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-800">
                    <span className="font-bold text-slate-900 block mb-1">Simple Summary:</span>
                    <p>{msg.plain_summary}</p>
                  </div>
                )}

                {/* Assistant Message Actions */}
                {!isUser && (
                  <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <TextToSpeechButton
                      text={msg.content}
                      language={msg.language || selectedLanguage}
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.content, idx)}
                      className="hover:text-slate-900 transition flex items-center gap-1"
                      title="Copy response"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              NM
            </div>
            <div className="rounded-2xl rounded-tl-xs border border-slate-200 bg-white p-4 shadow-2xs text-sm text-slate-600 flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Pills */}
      {messages.length <= 2 && (
        <div className="py-2 shrink-0">
          <p className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Suggested questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition shadow-2xs font-medium text-left"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice input drawer */}
      {showMicInput && (
        <div className="mb-2 rounded-xl border border-blue-200 bg-blue-50/70 p-3 shadow-xs shrink-0">
          <SpeechInput
            currentValue={inputQuery}
            onTranscriptChange={(t) => setInputQuery(t)}
            selectedLanguage={selectedLanguage}
            onLanguageChange={(l) => {
              setSelectedLanguage(l);
              if (onLanguageChange) onLanguageChange(l);
            }}
            onSubmitPrompt={(t) => handleSendMessage(t)}
            showSendButton={true}
          />
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-300 bg-white p-2.5 shadow-sm focus-within:border-slate-900 shrink-0"
      >
        <button
          type="button"
          id="btn-toggle-mic"
          onClick={() => setShowMicInput(!showMicInput)}
          className={`rounded-xl p-2 transition ${
            showMicInput
              ? 'bg-blue-600 text-white'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title="Voice input"
        >
          <Mic className="h-5 w-5" />
        </button>

        <input
          type="text"
          id="legal-chat-input"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask any legal question..."
          className="flex-1 border-none bg-transparent px-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          disabled={loading}
        />

        <button
          type="submit"
          id="btn-submit-chat"
          disabled={!inputQuery.trim() || loading}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs hover:bg-black transition disabled:opacity-30 disabled:hover:bg-slate-900"
          title="Send message"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
