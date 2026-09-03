import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  Printer,
  RotateCcw,
  Languages,
  Mic,
  AlertCircle,
  FileCheck,
  Scale,
  Building,
  User,
  Calendar,
  IndianRupee,
  HelpCircle,
  Paperclip,
  CheckCircle2,
} from 'lucide-react';
import { convertComplaintToDraft } from '../api';
import { SpeechInput } from '../components/SpeechInput';
import { TextToSpeechButton } from '../components/TextToSpeechButton';
import { INDIAN_LANGUAGES } from '../data/mockKnowledge';

export type DraftType =
  | 'Legal Notice'
  | 'Consumer Complaint'
  | 'Police Complaint'
  | 'RTI Application'
  | 'General Application';

interface ComplaintToDraftPageProps {
  initialComplaint?: string;
  globalLanguage?: string;
  onLanguageChange?: (lang: string) => void;
}

export const ComplaintToDraftPage: React.FC<ComplaintToDraftPageProps> = ({
  initialComplaint = '',
  globalLanguage = 'English',
  onLanguageChange,
}) => {
  const [complaintText, setComplaintText] = useState(
    initialComplaint ||
      'My landlord has not returned my security deposit of ₹1,50,000 even though I left the house two months ago on 15 March 2026. The house was handed over in perfect condition and all bills were paid.'
  );

  const [selectedLang, setSelectedLang] = useState(globalLanguage);
  const [draftType, setDraftType] = useState<DraftType>('Legal Notice');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);

  // Structured Plain Form Details
  const [details, setDetails] = useState({
    yourName: 'Priya Patel',
    yourAddress: 'Flat 101, Palm Grove, Indiranagar, Bengaluru - 560038',
    oppositeParty: 'Rajesh Sharma (Landlord), #42 Green Valley Apartments, Bengaluru',
    incidentDate: '15/03/2026',
    whatHappened:
      'Vacated the rented flat after giving 1-month notice and clearing all bills. Landlord made excuses and withheld the security deposit without lawful justification.',
    amountInvolved: '₹1,50,000',
    desiredAction:
      'Immediate refund of the full security deposit along with interest and compensation for harassment.',
    supportingDocs: 'Rental Agreement, Bank Transfer Receipts, Move-out inspection photos, WhatsApp chat logs.',
  });

  const [generatedDraft, setGeneratedDraft] = useState<string>(`LEGAL NOTICE

To,
Rajesh Sharma,
#42 Green Valley Apartments,
Bengaluru, Karnataka.

Dated: May 20, 2026

SUBJECT: Formal Demand Notice for Immediate Refund of Security Deposit of ₹1,50,000/- with Interest and Damages.

Sir / Madam,

Under instructions from and on behalf of my client / the undersigned, Priya Patel, residing at Flat 101, Palm Grove, Indiranagar, Bengaluru - 560038, I hereby serve upon you this formal Legal Notice:

1. PARTIES & BACKGROUND
That the Complainant had entered into a tenancy agreement with you in respect of Flat 402, Green Valley Apartments, Bengaluru, and duly deposited an interest-free refundable security deposit of ₹1,50,000/-.

2. STATEMENT OF FACTS
That the Complainant vacated the premises on 15/03/2026 after serving the required 30 days' advance notice and after clearing all electricity and maintenance dues. The premises were handed over in clean, undamaged condition.

3. RELEVANT LEGAL PROVISIONS & GROUNDS
That retaining a tenant's security deposit without providing a documented breakdown of actual damages within the agreed timeframe violates basic contract terms, Section 73 of the Indian Contract Act, 1872, and standard Tenancy guidelines. Such unlawful retention constitutes civil breach and unfair withholding of lawful funds.

4. DEMAND & RELIEF
You are hereby called upon to refund the full security deposit amount of ₹1,50,000/- along with interest at 12% per annum within 15 (fifteen) days from the receipt of this notice, failing which appropriate legal proceedings before the competent Civil Court or Rent Authority will be initiated at your sole risk, cost, and consequence.

5. SUPPORTING DOCUMENTS
- Tenancy Agreement
- Bank Transfer Receipts for Deposit
- Handover Confirmation & Electricity Clearance Bills

Date: 20/05/2026
Place: Bengaluru

_____________________________
Priya Patel
(Complainant / Aggrieved Party)`);

  useEffect(() => {
    if (initialComplaint) {
      setComplaintText(initialComplaint);
    }
  }, [initialComplaint]);

  useEffect(() => {
    if (globalLanguage) {
      setSelectedLang(globalLanguage);
    }
  }, [globalLanguage]);

  const handleGenerateDraft = async () => {
    if (!complaintText.trim() || loading) return;
    setLoading(true);

    try {
      const res = await convertComplaintToDraft(complaintText, selectedLang);
      if (res && res.extracted_facts) {
        setDetails((prev) => ({
          ...prev,
          yourName: res.extracted_facts.complainant || prev.yourName,
          oppositeParty: res.extracted_facts.opposite_party || prev.oppositeParty,
          incidentDate: res.extracted_facts.incident_date || prev.incidentDate,
          whatHappened: res.extracted_facts.defect_issue || complaintText,
          amountInvolved: res.extracted_facts.amount || prev.amountInvolved,
          desiredAction: res.extracted_facts.requested_relief || prev.desiredAction,
        }));
      }

      if (res && res.draft && res.draft.full_draft) {
        setGeneratedDraft(res.draft.full_draft);
      } else {
        // Construct clean preliminary draft directly
        const draft = `${draftType.toUpperCase()}

1. TITLE & PARTIES
Complainant / Applicant: ${details.yourName || '[Your Name]'}
Address: ${details.yourAddress || '[Your Address]'}
Opposite Party / Respondent: ${details.oppositeParty || '[Opposite Party Name]'}

2. STATEMENT OF FACTS
Date of Incident / Agreement: ${details.incidentDate || '[Date]'}
Amount Involved: ${details.amountInvolved || '[Amount]'}
What happened:
${details.whatHappened || complaintText}

3. RELEVANT LEGAL PROVISIONS & GROUNDS
- Relevant Law: Provisions under Indian Law (Consumer Protection Act, 2019 / Indian Contract Act, 1872 / BNS, 2023 as applicable).
- Ground: The Opposite Party failed to honor legal duties, causing direct financial loss, mental harassment, and deficiency in service.

4. DEMAND & RELIEF SOUGHT
${details.desiredAction || 'Immediate resolution, refund/compensation, and compliance with statutory requirements.'}

5. SUPPORTING DOCUMENTS
${details.supportingDocs || 'Invoices, Receipts, Communication records, Photos/Screenshots.'}

Date: ${new Date().toLocaleDateString('en-IN')}
Place: ${details.yourAddress ? details.yourAddress.split(',')[1] || 'India' : 'India'}

__________________________________
Signature of Complainant / Applicant`;
        setGeneratedDraft(draft);
      }
    } catch (err) {
      console.warn('Error generating draft', err);
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

  const handleDownloadTxt = () => {
    if (!generatedDraft) return;
    const blob = new Blob([generatedDraft], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${draftType.toLowerCase().replace(/\s+/g, '_')}_nyayamithra.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="nyayamithra-complaint-to-draft-page" className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Complaint → Preliminary Legal Draft
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Describe your problem in plain words and generate a structured legal draft.
          </p>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-2xs">
          <Languages className="h-3.5 w-3.5 text-slate-500" />
          <select
            value={selectedLang}
            onChange={(e) => {
              const lang = e.target.value;
              setSelectedLang(lang);
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

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Everyday Grievance & Details Form (5 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* 1. Everyday Grievance Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Describe what happened in simple words
              </label>
              <button
                type="button"
                onClick={() => setShowVoiceInput(!showVoiceInput)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <Mic className="h-3.5 w-3.5" />
                <span>{showVoiceInput ? 'Close Voice' : 'Voice Input'}</span>
              </button>
            </div>

            {showVoiceInput && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <SpeechInput
                  currentValue={complaintText}
                  onTranscriptChange={(t) => setComplaintText(t)}
                  selectedLanguage={selectedLang}
                  onLanguageChange={(l) => {
                    setSelectedLang(l);
                    if (onLanguageChange) onLanguageChange(l);
                  }}
                />
              </div>
            )}

            <textarea
              id="citizen-grievance-textarea"
              rows={4}
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="E.g., I bought a phone on 10 April for ₹25,000. It stopped working on day 3, and the shop refused to replace or repair..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/40 p-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-hidden leading-relaxed"
            />

            {/* Draft Type Selection */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-700">
                Select Draft Type:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Legal Notice',
                  'Consumer Complaint',
                  'Police Complaint',
                  'RTI Application',
                  'General Application',
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDraftType(type as DraftType)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border text-left transition ${
                      draftType === type
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                id="btn-generate-draft"
                onClick={handleGenerateDraft}
                disabled={!complaintText.trim() || loading}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Preparing Draft...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-blue-400" />
                    <span>Generate Preliminary Draft</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. Structured Details Form (Citizen Labels) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Key Details (Edit anytime to refine draft)
            </h2>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Your Name</label>
                  <input
                    type="text"
                    value={details.yourName}
                    onChange={(e) => setDetails({ ...details, yourName: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Amount involved (₹)</label>
                  <input
                    type="text"
                    value={details.amountInvolved}
                    onChange={(e) => setDetails({ ...details, amountInvolved: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Your Address / City</label>
                <input
                  type="text"
                  value={details.yourAddress}
                  onChange={(e) => setDetails({ ...details, yourAddress: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Opposite Party (Company / Landlord / Person)
                </label>
                <input
                  type="text"
                  value={details.oppositeParty}
                  onChange={(e) => setDetails({ ...details, oppositeParty: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Date of Incident / Agreement</label>
                  <input
                    type="text"
                    value={details.incidentDate}
                    onChange={(e) => setDetails({ ...details, incidentDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Supporting Documents / Evidence</label>
                  <input
                    type="text"
                    value={details.supportingDocs}
                    onChange={(e) => setDetails({ ...details, supportingDocs: e.target.value })}
                    placeholder="Bills, receipts, photos..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  What do you want the other party to do?
                </label>
                <textarea
                  rows={2}
                  value={details.desiredAction}
                  onChange={(e) => setDetails({ ...details, desiredAction: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-slate-900 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Generated Preliminary Draft (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Preliminary Legal Draft
                </h2>
                <p className="text-[11px] text-slate-500">
                  Format: {draftType}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <TextToSpeechButton text={generatedDraft} language={selectedLang} />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                  title="Copy to clipboard"
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
                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                  title="Download text file"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                  title="Print draft"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Editable Draft Preview */}
            <div className="relative">
              <textarea
                id="generated-legal-draft-content"
                rows={18}
                value={generatedDraft}
                onChange={(e) => setGeneratedDraft(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs sm:text-sm font-mono text-slate-900 leading-relaxed focus:bg-white focus:border-slate-900 focus:outline-hidden"
              />
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-0.5">Note for Citizens:</span>
              This is a preliminary draft to help you organize facts and legal grounds. Always review details carefully before sending or submitting.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
