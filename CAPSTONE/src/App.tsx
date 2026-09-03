import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NavTab } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { LegalChatPage } from './pages/LegalChatPage';
import { DocumentSummarizerPage } from './pages/DocumentSummarizerPage';
import { ComplaintToDraftPage } from './pages/ComplaintToDraftPage';
import { SpeechAssistantPage } from './pages/SpeechAssistantPage';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string>('');
  const [complaintInitialText, setComplaintInitialText] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigateToChatWithPrompt = (prompt: string) => {
    setChatInitialPrompt(prompt);
    setActiveTab('chat');
  };

  const handleNavigateToComplaintWithText = (text: string) => {
    setComplaintInitialText(text);
    setActiveTab('complaint-to-draft');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900 antialiased">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        selectedLanguage={selectedLanguage}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />

        {/* Scrollable Main View Stage */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="mx-auto w-full max-w-7xl">
            {activeTab === 'dashboard' && (
              <Dashboard
                onNavigate={setActiveTab}
                onSelectSampleChat={handleNavigateToChatWithPrompt}
                onSelectSampleComplaint={handleNavigateToComplaintWithText}
                selectedLanguage={selectedLanguage}
              />
            )}

            {activeTab === 'chat' && (
              <LegalChatPage
                initialPrompt={chatInitialPrompt}
                globalLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
              />
            )}

            {activeTab === 'summarizer' && (
              <DocumentSummarizerPage
                globalLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
              />
            )}

            {activeTab === 'complaint-to-draft' && (
              <ComplaintToDraftPage
                initialComplaint={complaintInitialText}
                globalLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
              />
            )}

            {activeTab === 'speech-assistant' && (
              <SpeechAssistantPage
                onSendToChat={handleNavigateToChatWithPrompt}
                onSendToComplaint={handleNavigateToComplaintWithText}
                onNavigate={setActiveTab}
                globalLanguage={selectedLanguage}
                onLanguageChange={setSelectedLanguage}
              />
            )}
          </div>
        </main>

        {/* Global Footer with Mandatory Legal Disclaimer */}
        <footer className="h-10 bg-slate-100 border-t border-slate-200 px-6 sm:px-8 flex items-center justify-between text-[11px] text-slate-500 font-medium shrink-0 select-none">
          <p className="truncate italic">
            Disclaimer: This is an AI-assisted legal draft for informational purposes only. Consult a legal professional for formal representation.
          </p>
          <div className="hidden sm:flex items-center gap-3 shrink-0 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            <span>NyayaMithra</span>
            <span>•</span>
            <span>Indian Legal Assistant</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
