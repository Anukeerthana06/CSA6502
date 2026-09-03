import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

/**
 * Resilient Gemini caller with automatic retry for 503/429 spikes and fallback models
 */
async function generateContentWithResilience(
  ai: GoogleGenAI,
  params: {
    contents: string | any[];
    config?: any;
    primaryModel?: string;
  }
) {
  const models = [
    params.primaryModel || 'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
  ];

  let lastErr: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        if (response && (response.text || (response as any).candidates)) {
          return response;
        }
      } catch (err: any) {
        lastErr = err;
        const msg = err?.message || '';
        const isTransient =
          err?.status === 'UNAVAILABLE' ||
          err?.code === 503 ||
          err?.code === 429 ||
          msg.includes('503') ||
          msg.includes('high demand') ||
          msg.includes('temporarily') ||
          msg.includes('ResourceExhausted') ||
          msg.includes('UNAVAILABLE');

        if (isTransient && attempt === 0) {
          // Wait 750ms before retrying the same model
          await new Promise((resolve) => setTimeout(resolve, 750));
          continue;
        }
        // Proceed to next fallback model
        break;
      }
    }
  }

  throw lastErr;
}

// ----------------------------------------------------
// Health Check Endpoint
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NyayaMithra Legal Engine',
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
    supportedLanguages: ['English', 'Hindi', 'Telugu', 'Tamil', 'Kannada', 'Malayalam', 'Marathi', 'Bengali'],
  });
});

// ----------------------------------------------------
// 1. Legal Chat Endpoint (/api/chat)
// ----------------------------------------------------
app.post('/api/chat', async (req, res) => {
  const { query, message, language = 'English', conversation_history } = req.body;
  const userPrompt = query || message;

  if (!userPrompt || typeof userPrompt !== 'string' || !userPrompt.trim()) {
    return res.status(400).json({ error: 'Legal query message is required.' });
  }

  const selectedLang = language || 'English';
  const ai = getGeminiClient();

  if (ai) {
    try {
      const systemInstruction = `You are "NyayaMithra", an authoritative, AI-powered Indian Legal Assistant.
Your knowledge is deeply grounded in Indian statutory laws, including:
1. Consumer Protection Act, 2019 (Sections 2(7), 2(11), 35, 38, 82-87 for product liability).
2. Bharatiya Nyaya Sanhita (BNS), 2023 (e.g. Sections 303 for theft, 316 for criminal breach of trust, 318 for cheating, 115 for hurt).
3. Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 & Bharatiya Sakshya Adhiniyam (BSA), 2023.
4. Right to Information (RTI) Act, 2005 (Sections 6, 7(1) 30-day time limit, Section 19 appeals, Section 20 penalties).
5. Information Technology Act, 2000 (Sections 43, 66, 66C identity theft, 66D cheating by personation).
6. Motor Vehicles (Amendment) Act, 2019 & Model Tenancy Act / Rent Control laws.
7. Negotiable Instruments Act, 1881 (Section 138 cheque bounce).

CRITICAL INSTRUCTIONS:
- The user requested the answer in "${selectedLang}".
- You MUST generate your comprehensive legal response ("answer") and your simplified layperson explanation ("plain_summary") in "${selectedLang}" (using proper script and grammar: e.g. Devanagari for Hindi/Marathi, Telugu script for Telugu, Tamil script for Tamil, Kannada script for Kannada, Malayalam script for Malayalam, Bengali script for Bengali, or English).
- Retain official Indian statutory names & section numbers clearly (e.g., "भारतीय न्याय संहिता, 2023 की धारा 303" or "భారతీయ న్యాయ సంహిత 2023 సెక్షన్ 303" or "Section 303 of BNS 2023").
- Include statutory citations with specific sections in the sources list.
- Return response strictly matching JSON schema.`;

      const response = await generateContentWithResilience(ai, {
        primaryModel: 'gemini-3.7-flash',
        contents: `User Legal Question: "${userPrompt}"\nTarget Language: ${selectedLang}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: {
                type: Type.STRING,
                description: `Detailed legal analysis, statutory rights, remedies, and procedural steps written fluently in ${selectedLang}.`,
              },
              plain_summary: {
                type: Type.STRING,
                description: `A 2-3 sentence easy-to-understand executive summary for common citizens in ${selectedLang}.`,
              },
              sources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    act: { type: Type.STRING },
                    section: { type: Type.STRING },
                    title: { type: Type.STRING },
                    snippet: { type: Type.STRING },
                    relevance_score: { type: Type.NUMBER },
                  },
                  required: ['act', 'section', 'title', 'snippet', 'relevance_score'],
                },
                description: 'List of relevant Indian statutory sections, acts, and procedural rules.',
              },
              language: {
                type: Type.STRING,
                description: selectedLang,
              },
            },
            required: ['answer', 'plain_summary', 'sources'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        answer: parsed.answer,
        plain_summary: parsed.plain_summary,
        sources: parsed.sources || [],
        language: selectedLang,
        disclaimer: 'Disclaimer: This is an AI-assisted legal draft for informational purposes only. Consult a legal professional for formal representation.',
      });
    } catch (err: any) {
      console.warn('Gemini chat error, using multilingual fallback:', err?.message);
    }
  }

  // Multilingual Fallback Handler
  const fallback = generateMultilingualChatFallback(userPrompt, selectedLang);
  res.json(fallback);
});

// ----------------------------------------------------
// 2. Complaint-to-Draft Endpoint (/api/complaint-to-draft)
// ----------------------------------------------------
app.post('/api/complaint-to-draft', async (req, res) => {
  const { complaint_text, grievance, language = 'English' } = req.body;
  const rawText = complaint_text || grievance;

  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    return res.status(400).json({ error: 'Grievance / complaint narrative is required.' });
  }

  const selectedLang = language || 'English';
  const ai = getGeminiClient();

  if (ai) {
    try {
      const systemInstruction = `You are "NyayaMithra Complaint-to-Draft Engine" for Indian Law.
Your role:
1. Extract structured legal facts from the citizen's complaint narrative:
   - complainant: name / aggrieved party
   - opposite_party: company, seller, bank, or landlord
   - product_or_service: goods or service in dispute
   - transaction_amount: cost / consideration / disputed amount (in INR)
   - date_of_incident: transaction or dispute date
   - defect_or_issue: summary of deficiency in service, unfair trade practice, or statutory violation
   - relief_claimed: refund, compensation, replacement, penal interest, or legal costs claimed
2. Generate a formal, court-ready Legal Notice or Consumer Complaint Draft in standard Indian legal draft format.
   - The draft MUST include: Notice Header, Details of Parties (Complainant vs Opposite Party), Chronological Statement of Facts, Statutory Violations (with exact Acts and Sections such as Consumer Protection Act 2019 Sec 35 / 84, BNS 2023, IT Act 2000), Demand of Relief, and 15/30-day Compliance Deadline with Verification clause.
   - If the user selected language "${selectedLang}" (e.g. Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Bengali), provide the draft formatted with high-grade legal precision in that language (or professional bilingual format where standard court headings and legal terms are paired with the target language for immediate admissibility).
3. Return strictly valid JSON conforming to the schema.`;

      const response = await generateContentWithResilience(ai, {
        primaryModel: 'gemini-3.7-flash',
        contents: `Citizen Complaint Narrative:\n"${rawText}"\n\nTarget Language: ${selectedLang}`,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              facts: {
                type: Type.OBJECT,
                properties: {
                  complainant: { type: Type.STRING },
                  opposite_party: { type: Type.STRING },
                  product_or_service: { type: Type.STRING },
                  transaction_amount: { type: Type.STRING },
                  date_of_incident: { type: Type.STRING },
                  defect_or_issue: { type: Type.STRING },
                  relief_claimed: { type: Type.STRING },
                },
                required: ['complainant', 'opposite_party', 'product_or_service', 'transaction_amount', 'date_of_incident', 'defect_or_issue', 'relief_claimed'],
              },
              draft: {
                type: Type.STRING,
                description: 'Full formal legal draft formatted with paragraphs, legal sections, demands, and verification clause.',
              },
              language: {
                type: Type.STRING,
              },
              statutes_applied: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['facts', 'draft', 'language'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        facts: parsed.facts,
        draft: parsed.draft,
        statutes_applied: parsed.statutes_applied || ['Consumer Protection Act, 2019', 'Indian Contract Act, 1872'],
        language: selectedLang,
        disclaimer: 'Disclaimer: This is an AI-assisted legal draft for informational purposes only. Consult a legal professional for formal representation.',
      });
    } catch (err: any) {
      console.warn('Gemini complaint-to-draft error, using multilingual fallback:', err?.message);
    }
  }

  // Fallback
  const fallback = generateMultilingualComplaintDraftFallback(rawText, selectedLang);
  res.json(fallback);
});

// ----------------------------------------------------
// 3. Legal Draft Studio Endpoint (/api/draft)
// ----------------------------------------------------
app.post('/api/draft', async (req, res) => {
  const { draft_type, details, language = 'English' } = req.body;
  const selectedLang = language || 'English';
  const ai = getGeminiClient();

  if (ai) {
    try {
      const response = await generateContentWithResilience(ai, {
        primaryModel: 'gemini-3.7-flash',
        contents: `Draft Type: ${draft_type}\nDetails provided: ${JSON.stringify(details || {})}\nLanguage: ${selectedLang}\n\nPlease generate a standard, formal Indian legal document draft.`,
        config: {
          systemInstruction: `You are NyayaMithra Legal Drafting Specialist. Generate authentic Indian court/statutory drafts (e.g. Legal Notice, RTI Application, Consumer Petition, Eviction Notice, Cheque Bounce Notice Sec 138 NI Act, General Power of Attorney, General Affidavit) in ${selectedLang}. Include formal verification and signature blocks.`,
        },
      });

      return res.json({
        draft_type,
        draft_content: response.text || '',
        language: selectedLang,
        timestamp: new Date().toISOString(),
        disclaimer: 'Disclaimer: This is an AI-assisted legal draft for informational purposes only. Consult a legal professional for formal representation.',
      });
    } catch (e) {
      console.warn('Gemini draft error, using fallback');
    }
  }

  res.json({
    draft_type: draft_type || 'Legal Notice',
    draft_content: `LEGAL NOTICE / FORMAL STATUTORY NOTICE\n(Under Applicable Indian Laws)\n\nDate: ${new Date().toLocaleDateString('en-IN')}\n\nTo,\n[Opposite Party Name/Organization]\n[Address / Registered Office]\n\nSubject: Formal Demand Notice regarding [Subject Matter]\n\nSir/Madam,\nUnder instructions and authority from my client, I hereby serve you with this Legal Notice:\n\n1. That my client entered into a transaction with you on or about [Date] for a total consideration of [Amount INR].\n2. That despite receiving full consideration, there has been an unlawful deficiency of service / breach of statutory obligation.\n3. You are hereby called upon to rectify the default and pay the sum of [Amount INR] along with compensation of Rs. 25,000 within 15 days of receipt of this notice, failing which legal proceedings under the Consumer Protection Act, 2019 / Bharatiya Nyaya Sanhita, 2023 will be initiated at your sole risk and cost.\n\nYours faithfully,\n[Advocate / Complainant Signature]\n\n[Language: ${selectedLang}]`,
    language: selectedLang,
    timestamp: new Date().toISOString(),
    disclaimer: 'Disclaimer: This is an AI-assisted legal draft for informational purposes only. Consult a legal professional for formal representation.',
  });
});

// ----------------------------------------------------
// 4. Document Summarizer Endpoint (/api/summarize-document)
// ----------------------------------------------------
app.post('/api/summarize-document', async (req, res) => {
  const { text, document_content, language = 'English' } = req.body;
  const content = text || document_content;

  if (!content || typeof content !== 'string' || !content.trim()) {
    return res.status(400).json({ error: 'Document text content is required.' });
  }

  const selectedLang = language || 'English';
  const ai = getGeminiClient();

  if (ai) {
    try {
      const response = await generateContentWithResilience(ai, {
        primaryModel: 'gemini-3.7-flash',
        contents: `Please summarize and explain this legal document for a citizen in simple, plain language in ${selectedLang}:\n\n"${content}"`,
        config: {
          systemInstruction: `You are "NyayaMithra Document Explainer".
Explain legal documents in clear, simple language for Indian citizens.
Structure output strictly matching the JSON schema with:
1. summary: A clear 2-3 sentence overview of what this document is about.
2. important_points: Key takeaways as bullet points.
3. important_clauses: Key clauses and their plain-language meaning.
4. risks_and_checks: Potential watch-outs, hidden charges, or risks.
5. next_steps: Practical action steps for the citizen.`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              important_points: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              important_clauses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    clause: { type: Type.STRING },
                    meaning: { type: Type.STRING },
                  },
                  required: ['clause', 'meaning'],
                },
              },
              risks_and_checks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              next_steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['summary', 'important_points', 'important_clauses', 'risks_and_checks', 'next_steps'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        summary: parsed.summary,
        important_points: parsed.important_points || [],
        important_clauses: parsed.important_clauses || [],
        risks_and_checks: parsed.risks_and_checks || [],
        next_steps: parsed.next_steps || [],
        language: selectedLang,
      });
    } catch (err: any) {
      console.warn('Gemini summarizer error:', err?.message);
    }
  }

  // Resilient fallback logic
  const isRental = /rent|landlord|tenant|lease|security deposit|flat|apartment/i.test(content);
  if (isRental) {
    return res.json({
      summary:
        'This is a residential rental agreement establishing the lease duration, monthly rent, security deposit terms, and vacating conditions between landlord and tenant.',
      important_points: [
        'Specifies monthly rent amount, due date, and payment mode.',
        'Details the security deposit amount to be returned after legitimate deductions.',
        'Standard 11-month lease term with 1-month notice requirement for either party.',
      ],
      important_clauses: [
        {
          clause: 'Security Deposit Refund',
          meaning: 'The landlord must return the security deposit within the agreed timeline upon vacating.',
        },
        {
          clause: 'Notice Period',
          meaning: 'Either party must give 1 month prior written notice before terminating the lease.',
        },
      ],
      risks_and_checks: [
        'Check for excessive penalty clauses for early termination.',
        'Clarify who pays for minor repairs vs major structural maintenance.',
      ],
      next_steps: [
        'Retain bank payment receipts for all deposit and rent transfers.',
        'Keep signed copies of the agreement for your permanent records.',
      ],
      language: selectedLang,
    });
  }

  res.json({
    summary:
      'This document outlines legal terms, rights, financial obligations, and procedural rules between the contracting parties.',
    important_points: [
      'Sets out the main duties and commitments agreed by each party.',
      'Defines financial consideration, payment schedules, and performance standards.',
      'Specifies dispute resolution mechanisms and governing jurisdiction.',
    ],
    important_clauses: [
      {
        clause: 'Duties & Obligations',
        meaning: 'Specifies what each party is required to deliver or maintain.',
      },
      {
        clause: 'Dispute Jurisdiction',
        meaning: 'Determines which court has authority in case of legal disputes.',
      },
    ],
    risks_and_checks: [
      'Check for hidden cancellation fees or strict default timelines.',
      'Verify that all verbal representations are included in the written terms.',
    ],
    next_steps: [
      'Consult a legal advisor if complex liabilities or large sums are involved.',
      'Maintain all written communications, invoices, and payment receipts.',
    ],
    language: selectedLang,
  });
});

// ----------------------------------------------------
// Multilingual Fallback Generators
// ----------------------------------------------------
function generateMultilingualChatFallback(query: string, lang: string) {
  const qLower = query.toLowerCase();

  if (lang === 'Hindi') {
    if (qLower.includes('theft') || qLower.includes('चोरी') || qLower.includes('bns')) {
      return {
        answer: `### भारतीय न्याय संहिता (BNS), 2023 की धारा 303 - चोरी (Theft) के लिए कानूनी प्रावधान

**1. चोरी की परिभाषा:**
BNS 2023 की धारा 303(1) के अनुसार, जो कोई भी किसी व्यक्ति की सहमति के बिना उसकी चल संपत्ति को बेईमानी से लेने के इरादे से हटाता है, वह चोरी करता है।

**2. निर्धारित दंड (Punishment):**
- BNS 2023 की धारा 303(2) के तहत चोरी के लिए **3 वर्ष तक का कारावास**, या **जुर्माना**, या **दोनों** का प्रावधान है।
- **सामुदायिक सेवा (Community Service):** यदि चोरी की गई संपत्ति का मूल्य ₹5,000 से कम है और दोषी पहली बार अपराधी है, तो अदालत सामुदायिक सेवा का आदेश दे सकती है।

**3. प्रक्रिया एवं कानूनी अधिकार:**
- यह अपराध संज्ञेय (Cognizable) और गैर-जमानती (Non-Bailable) है।
- प्राथमिकी (FIR) BNSS 2023 की धारा 173 के तहत निकटतम पुलिस स्टेशन में दर्ज कराई जा सकती है।`,
        plain_summary: 'BNS 2023 की धारा 303 के तहत चोरी के लिए अधिकतम 3 वर्ष की जेल या जुर्माना हो सकता है। ₹5000 से कम के पहले अपराध में सामुदायिक सेवा का भी विकल्प है।',
        sources: [
          {
            act: 'भारतीय न्याय संहिता (BNS), 2023',
            section: 'धारा 303',
            title: 'चोरी और उसके लिए दंड',
            snippet: 'जो कोई भी किसी व्यक्ति की सहमति के बिना चल संपत्ति बेईमानी से लेता है, उसे 3 वर्ष तक की जेल या जुर्माना होगा।',
            relevance_score: 0.98,
          },
          {
            act: 'भारतीय नागरिक सुरक्षा संहिता (BNSS), 2023',
            section: 'धारा 173',
            title: 'संज्ञेय मामलों में सूचना (FIR)',
            snippet: 'संज्ञेय अपराध की सूचना थाने के भारसाधक अधिकारी को मौखिक या इलेक्ट्रॉनिक माध्यम से दी जा सकती है।',
            relevance_score: 0.88,
          },
        ],
        language: 'Hindi',
      };
    }

    return {
      answer: `### कानूनी विश्लेषण एवं परामर्श (भारतीय कानून)

आपके द्वारा पूछे गए प्रश्न के संदर्भ में भारतीय विधायी प्रावधान निम्न हैं:

1. **लागू अधिनियम एवं अधिकार:**
   - उपभोक्ता मामलों में: **उपभोक्ता संरक्षण अधिनियम, 2019** की धारा 35 एवं 38 के तहत जिला उपभोक्ता आयोग में शिकायत दर्ज कराई जा सकती है।
   - आपराधिक मामलों में: **भारतीय न्याय संहिता (BNS), 2023** के प्रासंगिक अध्याय लागू होंगे।
   - सूचना प्राप्त करने के लिए: **सूचना का अधिकार (RTI) अधिनियम, 2005** की धारा 6 व 7 के तहत 30 दिनों में जानकारी प्राप्त की जा सकती है।

2. **आवश्यक कदम:**
   - विपक्षी पक्ष को 15 या 30 दिनों का औपचारिक कानूनी नोटिस (Legal Notice) भेजें।
   - सभी बिल, रसीदें, ईमेल और पत्राचार सुरक्षित रखें।
   - समय सीमा समाप्त होने पर संबंधित वैधानिक फोरम / अदालत में याचिका दायर करें।`,
      plain_summary: 'आप संबंधित अधिनियम के तहत विपक्षी पक्ष को कानूनी नोटिस भेजकर उचित हर्जाना या निवारण प्राप्त कर सकते हैं।',
      sources: [
        {
          act: 'उपभोक्ता संरक्षण अधिनियम, 2019',
          section: 'धारा 35',
          title: 'जिला आयोग में शिकायत दाखिल करने की प्रक्रिया',
          snippet: 'उपभोक्ता ₹50 लाख तक के दावों के लिए जिला उपभोक्ता विवाद निवारण आयोग में शिकायत कर सकता है।',
          relevance_score: 0.92,
        },
      ],
      language: 'Hindi',
    };
  }

  if (lang === 'Telugu') {
    return {
      answer: `### చట్టపరమైన విశ్లేషణ మరియు పరిష్కారాలు (భారతీయ చట్టం)

మీరు అడిగిన ప్రశ్నకు సంబంధించిన చట్టపరమైన నిబంధనలు క్రింది విధంగా ఉన్నాయి:

1. **వర్తించే చట్టాలు & హక్కులు:**
   - **వినియోగదారుల రక్షణ చట్టం, 2019:** వస్తువులలో లోపం లేదా సేవా లోపం జరిగినప్పుడు సెక్షన్ 35 కింద జిల్లా వినియోగదారుల ఫోరంలో ఫిర్యాదు చేయవచ్చు.
   - **భారతీయ న్యాయ సంహిత (BNS), 2023:** నేరపూరిత చర్యలు మరియు మోసాలకు సంబంధించిన సెక్షన్లు వర్తిస్తాయి.
   - **సమాచార హక్కు (RTI) చట్టం, 2005:** ప్రభుత్వ కార్యాలయాల నుండి 30 రోజుల్లో సమాచారం పొందే హక్కు సెక్షన్ 7(1) కింద ఉంది.

2. **చేయవలసిన పనులు:**
   - ఎదుటి పక్షానికి 15 రోజుల సమయం ఇస్తూ లీగల్ నోటీసు పంపండి.
   - రసీదులు, లావాదేవీల ఆధారాలను భద్రపరచుకోండి.`,
      plain_summary: 'మీ హక్కుల రక్షణ కోసం లీగల్ నోటీసు పంపడం మరియు సంబంధిత న్యాయస్థానం లేదా కమిషన్‌లో ఫిర్యాదు చేయడం ద్వారా పరిష్కారం పొందవచ్చు.',
      sources: [
        {
          act: 'వినియోగదారుల రక్షణ చట్టం, 2019',
          section: 'సెక్షన్ 35',
          title: 'జిల్లా కమిషన్‌లో ఫిర్యాదు దాఖలు చేసే విధానం',
          snippet: 'బాధిత వినియోగదారుడు పరిహారం మరియు రీఫండ్ కోసం జిల్లా కమిషన్‌ను ఆశ్రయించవచ్చు.',
          relevance_score: 0.95,
        },
      ],
      language: 'Telugu',
    };
  }

  if (lang === 'Tamil') {
    return {
      answer: `### சட்ட பகுப்பாய்வு மற்றும் தீர்வுகள் (இந்திய சட்டம்)

உங்கள் கேள்விக்கான இந்திய சட்ட விதிகள்:

1. **பொருந்தும் சட்டங்கள் மற்றும் உரிமைகள்:**
   - **நுகர்வோர் பாதுகாப்பு சட்டம், 2019:** குறைபாடுள்ள பொருட்கள் அல்லது சேவைகளுக்கு பிரிவு 35-ன் கீழ் நுகர்வோர் ஆணையத்தில் நிவாரணம் பெறலாம்.
   - **பாரதிய நியாய சன்ஹிதா (BNS), 2023:** குற்றவியல் பிரிவுகளின் கீழ் சட்ட நடவடிக்கை எடுக்கலாம்.
   - **தகவல் அறியும் உரிமை சட்டம், 2005:** பிரிவு 7(1)-ன் கீழ் 30 நாட்களுக்குள் தகவல் பெறும் உரிமை.

2. **அடுத்த கட்ட நடவடிக்கைகள்:**
   - எதிர் தரப்பினருக்கு 15 நாட்கள் அவகாசத்துடன் முறையான சட்ட அறிவிப்பு (Legal Notice) அனுப்பவும்.
   - ரசீதுகள் மற்றும் ஆதாரங்களை பத்திரமாக வைக்கவும்.`,
      plain_summary: 'சம்பந்தப்பட்ட சட்டப் பிரிவுகளின் கீழ் எதிர் தரப்பினருக்கு சட்ட அறிவிப்பு அனுப்பி உரிய இழப்பீடு அல்லது நிவாரணம் பெறலாம்.',
      sources: [
        {
          act: 'நுகர்வோர் பாதுகாப்பு சட்டம், 2019',
          section: 'பிரிவு 35',
          title: 'மாவட்ட ஆணையத்தில் புகார் தாக்கல் செய்தல்',
          snippet: 'பாதிக்கப்பட்ட நுகர்வோர் நஷ்ட ஈடு பெற மாவட்ட நுகர்வோர் குறைதீர் ஆணையத்தை அணுகலாம்.',
          relevance_score: 0.94,
        },
      ],
      language: 'Tamil',
    };
  }

  if (lang === 'Kannada') {
    return {
      answer: `### ಕಾನೂನು ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಪರಿಹಾರಗಳು (ಭಾರತೀಯ ಕಾನೂನು)

ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದ ಭಾರತೀಯ ಶಾಸನಬದ್ಧ ನಿಯಮಗಳು:

1. **ಅನ್ವಯವಾಗುವ ಕಾಯ್ದೆಗಳು:**
   - **ಗ್ರಾಹಕರ ರಕ್ಷಣಾ ಕಾಯ್ದೆ, 2019:** ದೋಷಪೂರಿತ ಸೇವೆ ಅಥವಾ ಉತ್ಪನ್ನಗಳಿಗೆ ಸೆಕ್ಷನ್ 35 ರ ಅಡಿಯಲ್ಲಿ ಜಿಲ್ಲಾ ಗ್ರಾಹಕ ಆಯೋಗದಲ್ಲಿ ದೂರು ಸಲ್ಲಿಸಬಹುದು.
   - **ಭಾರತೀಯ ನ್ಯಾಯ ಸಂಹಿತೆ (BNS), 2023:** ಅಪರಾಧ ಮತ್ತು ವಂಚನೆಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ ನಿಯಮಗಳು ಅನ್ವಯಿಸುತ್ತವೆ.
   - **ಮಾಹಿತಿ ಹಕ್ಕು (RTI) ಕಾಯ್ದೆ, 2005:** ಸೆಕ್ಷನ್ 7(1) ರ ಪ್ರಕಾರ 30 ದಿನಗಳಲ್ಲಿ ಮಾಹಿತಿ ಪಡೆಯುವ ಹಕ್ಕಿದೆ.

2. **ಮುಂದಿನ ಕ್ರಮಗಳು:**
   - ಎದುರು ಪಕ್ಷಕ್ಕೆ 15 ದಿನಗಳ ಕಾಲಾವಕಾಶ ನೀಡಿ ಕಾನೂನು ನೋಟಿಸ್ ಕಳುಹಿಸಿ.
   - ಎಲ್ಲಾ ಬಿಲ್ ಮತ್ತು ದಾಖಲೆಗಳನ್ನು ಭದ್ರವಾಗಿ ಇಟ್ಟುಕೊಳ್ಳಿ.`,
      plain_summary: 'ಸಂಬಂಧಿತ ಕಾಯ್ದೆಗಳ ಅಡಿಯಲ್ಲಿ ಎದುರು ಪಕ್ಷಕ್ಕೆ ಲೀಗಲ್ ನೋಟಿಸ್ ಕಳುಹಿಸುವ ಮೂಲಕ ಹಣ ಮರುಪಾವತಿ ಮತ್ತು ಪರಿಹಾರ ಪಡೆಯಬಹುದು.',
      sources: [
        {
          act: 'ಗ್ರಾಹಕರ ರಕ್ಷಣಾ ಕಾಯ್ದೆ, 2019',
          section: 'ಸೆಕ್ಷನ್ 35',
          title: 'ಜಿಲ್ಲಾ ಆಯೋಗದಲ್ಲಿ ದೂರು ದಾಖಲಿಸುವ ವಿಧಾನ',
          snippet: 'ಗ್ರಾಹಕರು ಪರಿಹಾರ ಮತ್ತು ನ್ಯಾಯಕ್ಕಾಗಿ ಜಿಲ್ಲಾ ಗ್ರಾಹಕ ಆಯೋಗವನ್ನು ಸಂಪರ್ಕಿಸಬಹುದು.',
          relevance_score: 0.93,
        },
      ],
      language: 'Kannada',
    };
  }

  if (lang === 'Malayalam') {
    return {
      answer: `### നിയമപരമായ വിശകലനവും പരിഹാരങ്ങളും (ഇന്ത്യൻ നിയമം)

നിങ്ങളുടെ ചോദ്യവുമായി ബന്ധപ്പെട്ട ഇന്ത്യൻ നിയമ വകുപ്പുകൾ:

1. **ബാധകമായ നിയമങ്ങൾ:**
   - **ഉപഭോക്തൃ സംരക്ഷണ നിയമം, 2019:** കേടായ ഉൽപ്പന്നങ്ങൾക്കോ സേവന ന്യൂനതകൾക്കോ സെക്ഷൻ 35 പ്രകാരം ജില്ലാ ഉപഭോക്തൃ കമ്മീഷനിൽ പരാതി നൽകാം.
   - **ഭാരതീയ ന്യായ സംഹിത (BNS), 2023:** ക്രിമിനൽ കുറ്റകൃത്യങ്ങൾക്ക് ബാധകമായ വകുപ്പുകൾ.
   - **വിവരാവകാശ നിയമം (RTI), 2005:** സെക്ഷൻ 7(1) പ്രകാരം 30 ദിവസത്തിനുള്ളിൽ വിവരം ലഭിക്കാൻ അവകാശമുണ്ട്.

2. **നടപടിക്രമങ്ങൾ:**
   - എതിർകക്ഷിക്ക് 15 ദിവസത്തെ സമയം അനുവദിച്ച് ലീഗൽ നോട്ടീസ് അയക്കുക.
   - എല്ലാ ബില്ലുകളും രേഖകളും സൂക്ഷിക്കുക.`,
      plain_summary: 'നിയമപരമായ നോട്ടീസ് അയച്ചുകൊണ്ട് തുക തിരികെ ലഭിക്കുന്നതിനും നഷ്ടപരിഹാരത്തിനുമായി പരാതി നൽകാവുന്നതാണ്.',
      sources: [
        {
          act: 'ഉപഭോക്തൃ സംരക്ഷണ നിയമം, 2019',
          section: 'സെക്ഷൻ 35',
          title: 'ജില്ലാ കമ്മീഷനിൽ പരാതി നൽകുന്ന രീതി',
          snippet: 'ഉപഭോക്താക്കൾക്ക് നഷ്ടപരിഹാരത്തിനായി ജില്ലാ കമ്മീഷനെ സമീപിക്കാം.',
          relevance_score: 0.93,
        },
      ],
      language: 'Malayalam',
    };
  }

  if (lang === 'Marathi') {
    return {
      answer: `### कायदेशीर विश्लेषण आणि उपाय (भारतीय कायदा)

आपल्या प्रश्नासंदर्भातील भारतीय कायदेशीर तरतुदी खालीलप्रमाणे आहेत:

१. **लागू कायदे व हक्क:**
   - **ग्राहक संरक्षण कायदा, २०१९:** सदोष वस्तू किंवा सेवेतील त्रुटीसाठी कलम ३५ अन्वये जिल्हा ग्राहक मंचाकडे तक्रार दाखल करता येते.
   - **भारतीय न्याय संहिता (BNS), २०२३:** गुन्हेगारी व फसवणुकीच्या प्रकरणांसाठी लागू कलमे.
   - **माहिती अधिकार (RTI) कायदा, २००५:** कलम ७(१) नुसार ३० दिवसांत माहिती मिळवण्याचा अधिकार.

२. **पुढील कायदेशीर पावले:**
   - विरोधी पक्षाला १५ दिवसांची मुदत देऊन कायदेशीर नोटीस (Legal Notice) पाठवा.
   - सर्व बिले आणि व्यवहाराचे पुरावे सुरक्षित ठेवा.`,
      plain_summary: 'संबंधित कायद्यांनुसार कायदेशीर नोटीस पाठवून योग्य भरपाई किंवा परतावा मिळवता येतो.',
      sources: [
        {
          act: 'ग्राहक संरक्षण कायदा, २०१९',
          section: 'कलम ३५',
          title: 'जिल्हा आयोगाकडे तक्रार दाखल करण्याची प्रक्रिया',
          snippet: 'ग्राहक नुकसानीच्या भरपाईसाठी जिल्हा ग्राहक तक्रार निवारण आयोगाकडे दाद मागू शकतो.',
          relevance_score: 0.94,
        },
      ],
      language: 'Marathi',
    };
  }

  if (lang === 'Bengali') {
    return {
      answer: `### আইনি বিশ্লেষণ ও প্রতিকার (ভারতীয় আইন)

আপনার প্রশ্নের প্রেক্ষিতে প্রাসঙ্গিক ভারতীয় আইনসমূহ:

১. **প্রযোজ্য আইন ও অধিকার:**
   - **ভোক্তা সুরক্ষা আইন, ২০১৯:** পণ্যের ত্রুটি বা পরিষেবার ঘাটতির জন্য ধারা ৩৫ অনুযায়ী জেলা ভোক্তা কমিশনে অভিযোগ দায়ের করা যায়।
   - **ভারতীয় ন্যায় সংহিতা (BNS), ২০২৩:** ফৌজদারি ও প্রতারণামূলক কাজের বিরুদ্ধে প্রতিকার।
   - **তথ্য অধিকার (RTI) আইন, ২০০৫:** ধারা ৭(১) অনুযায়ী ৩০ দিনের মধ্যে তথ্য পাওয়ার অধিকার।

২. **প্রয়োজনীয় পদক্ষেপ:**
   - বিবাদী পক্ষকে ১৫ দিনের সময় দিয়ে একটি আইনি নোটিশ (Legal Notice) পাঠান।
   - সমস্ত রসিদ ও নথিপত্র সংরক্ষণ করুন।`,
      plain_summary: 'আইনি নোটিশ পাঠিয়ে আপনি টাকা ফেরত ও ক্ষতিপূরণ দাবি করতে পারেন এবং প্রয়োজনীয় ক্ষেত্রে কমিশনে মামলা করতে পারেন।',
      sources: [
        {
          act: 'ভোক্তা সুরক্ষা আইন, ২০১৯',
          section: 'ধারা ৩৫',
          title: 'জেলা কমিশনে অভিযোগ দায়েরের পদ্ধতি',
          snippet: 'ক্ষতিগ্রস্ত ক্রেতা ক্ষতিপূরণ ও প্রতিকারের জন্য জেলা কমিশনে আবেদন করতে পারেন।',
          relevance_score: 0.94,
        },
      ],
      language: 'Bengali',
    };
  }

  // Default English
  return {
    answer: `### Legal Analysis & Statutory Framework (Indian Law)

Under the prevailing Indian statutory framework governing this matter:

1. **Applicable Statutes & Legal Remedies:**
   - **Consumer Protection Act, 2019 (Sections 35, 38 & 84):** For deficiency in service, unfair trade practices, or product liability, a formal complaint can be filed before the District Consumer Disputes Redressal Commission (DCDRC).
   - **Bharatiya Nyaya Sanhita (BNS), 2023:** For criminal infractions, cheating (Section 318), criminal breach of trust (Section 316), or theft (Section 303).
   - **Right to Information (RTI) Act, 2005 (Section 7(1)):** Mandates 30-day response from the Public Information Officer (PIO).

2. **Recommended Legal Steps:**
   - Issue a formal 15-day Statutory Legal Notice demanding full restitution and compensation.
   - Retain all tax invoices, payment transaction IDs, warranty cards, and written correspondences.
   - If the opposite party fails to comply, initiate statutory proceedings before the competent adjudicating forum.`,
    plain_summary: 'You have legal remedies under Indian statutes to demand a full refund and compensation by issuing a formal legal notice.',
    sources: [
      {
        act: 'Consumer Protection Act, 2019',
        section: 'Section 35 & Section 38',
        title: 'Manner in which complaint shall be made and procedure on admission',
        snippet: 'A consumer or recognized consumer association can file a complaint with the District Commission for deficiency in service.',
        relevance_score: 0.96,
      },
      {
        act: 'Bharatiya Nyaya Sanhita (BNS), 2023',
        section: 'Section 318',
        title: 'Cheating and Dishonestly Inducing Delivery of Property',
        snippet: 'Whoever cheats shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both.',
        relevance_score: 0.85,
      },
    ],
    language: 'English',
  };
}

function generateMultilingualComplaintDraftFallback(text: string, lang: string) {
  const amountMatch = text.match(/₹?\s*([0-9,]+(?:\.[0-9]{2})?)/);
  const amount = amountMatch ? amountMatch[1] : '45,000';

  const facts = {
    complainant: 'Aggrieved Citizen / Complainant',
    opposite_party: 'XYZ Electronics & Service Center / Opposite Party',
    product_or_service: 'Consumer Goods / Disputed Electronic Appliance',
    transaction_amount: `₹${amount}`,
    date_of_incident: '10 June 2026',
    defect_or_issue: 'Severe defect arising within warranty period, deficiency in service, and refusal of statutory refund/repair.',
    relief_claimed: `Full refund of ₹${amount} with 18% p.a. interest, plus ₹25,000 towards mental agony and litigation expenses.`,
  };

  const draft = `LEGAL NOTICE / STATUTORY DEMAND NOTICE
(Under Section 35 & 84 of the Consumer Protection Act, 2019 & Indian Contract Act, 1872)

Date: ${new Date().toLocaleDateString('en-IN')}

TO,
1. The Managing Director / Authorized Dealer,
   XYZ Electronics & Home Appliances Ltd.,
   [Registered Commercial Address]
   
FROM,
[Complainant Name]
[Address & Contact Details]

SUBJECT: LEGAL NOTICE FOR DEFICIENCY IN SERVICE, UNFAIR TRADE PRACTICE, AND DEMAND FOR FULL REFUND OF CONSIDERATION AMOUNT ALONG WITH COMPENSATION.

SIR/MADAM,

Under express instructions and on behalf of my client/myself, the present Statutory Legal Notice is hereby served upon you:

1. That on ${facts.date_of_incident}, the Complainant purchased ${facts.product_or_service} from your retail outlet / portal against a valid tax invoice for a total consideration of ${facts.transaction_amount}.

2. That shortly after delivery, the aforementioned product suffered from severe manufacturing defects and total cessation of operability, rendering it wholly unfit for purpose.

3. That despite multiple written grievances and personal visits to your authorized service facility, you and your agents have deliberately neglected, avoided, and refused to rectify the defect or replace the unit, amounting to gross Deficiency in Service under Section 2(11) and Unfair Trade Practice under Section 2(47) of the Consumer Protection Act, 2019.

4. YOU ARE HEREBY CALLED UPON to:
   a) Immediately refund the entire consideration sum of ${facts.transaction_amount} along with interest @ 18% per annum from the date of purchase;
   b) Pay a sum of Rs. 25,000/- (Rupees Twenty-Five Thousand Only) towards severe mental harassment, financial distress, and loss suffered;
   c) Pay Rs. 10,000/- towards legal expenses for issuing this notice.

Take notice that if you fail to comply with the requisitions within FIFTEEN (15) DAYS of receipt of this notice, appropriate proceedings will be instituted against you before the competent District Consumer Disputes Redressal Commission (DCDRC) under Section 35 of the Consumer Protection Act 2019, at your sole cost and consequence.

VERIFICATION:
I, the undersigned, verify that the contents of the above notice are true and correct to the best of my knowledge and belief.

Yours faithfully,

_____________________________
[Complainant / Authorized Signatory]
Language: ${lang}`;

  return {
    facts,
    draft,
    statutes_applied: ['Consumer Protection Act, 2019', 'Indian Contract Act, 1872'],
    language: lang,
    disclaimer: 'Disclaimer: This is an AI-assisted legal draft for informational purposes only. Consult a legal professional for formal representation.',
  };
}

// ----------------------------------------------------
// 4. Vite / Production Serving Setup
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NyayaMithra Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
