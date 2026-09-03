export type SupportedLanguage =
  | 'English'
  | 'Hindi'
  | 'Telugu'
  | 'Tamil'
  | 'Kannada'
  | 'Malayalam'
  | 'Marathi'
  | 'Bengali';

export interface LanguageMeta {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  speechCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'English', label: 'English', nativeLabel: 'English', speechCode: 'en-IN' },
  { code: 'Hindi', label: 'Hindi', nativeLabel: 'हिन्दी (Hindi)', speechCode: 'hi-IN' },
  { code: 'Telugu', label: 'Telugu', nativeLabel: 'తెలుగు (Telugu)', speechCode: 'te-IN' },
  { code: 'Tamil', label: 'Tamil', nativeLabel: 'தமிழ் (Tamil)', speechCode: 'ta-IN' },
  { code: 'Kannada', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ (Kannada)', speechCode: 'kn-IN' },
  { code: 'Malayalam', label: 'Malayalam', nativeLabel: 'മലയാളം (Malayalam)', speechCode: 'ml-IN' },
  { code: 'Marathi', label: 'Marathi', nativeLabel: 'मराठी (Marathi)', speechCode: 'mr-IN' },
  { code: 'Bengali', label: 'Bengali', nativeLabel: 'বাংলা (Bengali)', speechCode: 'bn-IN' },
];

export interface TranslationStrings {
  appName: string;
  tagline: string;
  disclaimer: string;
  disclaimerDetail: string;
  nav: {
    dashboard: string;
    complaintToDraft: string;
    chat: string;
    summarizer: string;
    drafts: string;
    documents: string;
    speechAssistant: string;
  };
  header: {
    language: string;
    exportDoc: string;
  };
  dashboard: {
    badge: string;
    heroTitle: string;
    heroDesc: string;
    draftComplaintBtn: string;
    askQuestionBtn: string;
    modulesTitle: string;
    modulesSubtitle: string;
    sampleQuestionsTitle: string;
    sampleComplaintsTitle: string;
    trustStatutory: string;
    trustStatutoryDesc: string;
    trustCourtFormat: string;
    trustCourtFormatDesc: string;
    trustConfidential: string;
    trustConfidentialDesc: string;
  };
  chat: {
    title: string;
    subtitle: string;
    greeting: string;
    placeholder: string;
    sendBtn: string;
    clearBtn: string;
    voiceBtn: string;
    sourcesTitle: string;
    plainSummaryTitle: string;
    samplePromptLabel: string;
    answeringIn: string;
  };
  complaintToDraft: {
    title: string;
    subtitle: string;
    inputLabel: string;
    inputPlaceholder: string;
    generateBtn: string;
    generating: string;
    sampleTitle: string;
    factsTitle: string;
    draftTitle: string;
    copyDraft: string;
    downloadDraft: string;
    complainant: string;
    oppositeParty: string;
    productService: string;
    amount: string;
    incidentDate: string;
    defectIssue: string;
    reliefClaimed: string;
  };
  summarizer: {
    title: string;
    subtitle: string;
    uploadTitle: string;
    uploadDesc: string;
    pasteLabel: string;
    pastePlaceholder: string;
    clearBtn: string;
    summarizeBtn: string;
    summarizing: string;
    resultTitle: string;
    summaryTitle: string;
    importantPointsTitle: string;
    importantClausesTitle: string;
    risksTitle: string;
    nextStepsTitle: string;
    copyBtn: string;
    copiedBtn: string;
    downloadBtn: string;
  };
  speech: {
    title: string;
    subtitle: string;
    sttTitle: string;
    ttsTitle: string;
    startRecord: string;
    stopRecord: string;
    listeningIn: string;
    speakClear: string;
    previewLabel: string;
    sendToChat: string;
    sendToDraft: string;
    readAloud: string;
    stopVoice: string;
    wordsCount: string;
  };
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationStrings> = {
  English: {
    appName: 'NyayaMithra',
    tagline: 'AI-Powered Indian Legal Assistant & Drafting System',
    disclaimer: 'Disclaimer: This is an AI-assisted legal draft for informational purposes only. Consult a legal professional for formal representation.',
    disclaimerDetail: 'Statutory citations and templates are generated based on Indian Laws including Consumer Protection Act 2019, Bharatiya Nyaya Sanhita 2023, and RTI Act 2005.',
    nav: {
      dashboard: 'Dashboard',
      complaintToDraft: 'Complaint → Draft',
      chat: 'Legal Chat',
      summarizer: 'Document Summarizer',
      drafts: 'Legal Drafts',
      documents: 'Documents',
      speechAssistant: 'Speech Assistant',
    },
    header: {
      language: 'Language',
      exportDoc: 'Export Document',
    },
    dashboard: {
      badge: 'AI-Powered Indian Legal Assistant',
      heroTitle: 'NyayaMithra Legal Information & Drafting',
      heroDesc: 'Understand Indian legal rights, prepare court-ready legal drafts, and research statutory provisions under Consumer Protection Act 2019, Bharatiya Nyaya Sanhita (BNS) 2023, RTI Act 2005, and more.',
      draftComplaintBtn: 'Draft a Complaint',
      askQuestionBtn: 'Ask Legal Question',
      modulesTitle: 'Legal Assistance Modules',
      modulesSubtitle: 'Select a tool to begin',
      sampleQuestionsTitle: 'Frequently Asked Legal Questions',
      sampleComplaintsTitle: 'Sample Citizen Grievances',
      trustStatutory: 'Authoritative Indian Law',
      trustStatutoryDesc: 'Grounded in the latest Consumer Protection Act, Bharatiya Nyaya Sanhita, RTI Act & IT Act.',
      trustCourtFormat: 'Standard Court Formats',
      trustCourtFormatDesc: 'Generates formal legal notices, affidavits, consumer petitions, and RTI queries.',
      trustConfidential: 'Confidential & Secure',
      trustConfidentialDesc: 'Your legal inquiries and personal grievance details are handled securely.',
    },
    chat: {
      title: 'Legal Chat Assistant',
      subtitle: 'Ask questions regarding Indian statutory provisions, criminal codes, consumer rights, and procedural rules.',
      greeting: 'Namaste! I am NyayaMithra, your AI legal assistant grounded in Indian statutory laws including the Consumer Protection Act 2019, Bharatiya Nyaya Sanhita (BNS) 2023, IT Act 2000, and RTI Act 2005. How may I assist you with your legal question today?',
      placeholder: 'Ask your Indian legal question (e.g., What is the punishment for theft under BNS 2023?)...',
      sendBtn: 'Send',
      clearBtn: 'Reset Chat',
      voiceBtn: 'Voice Input',
      sourcesTitle: 'Statutory Citations & Legal Sources',
      plainSummaryTitle: 'Plain Language Summary',
      samplePromptLabel: 'Quick Legal Inquiries:',
      answeringIn: 'Answering in',
    },
    complaintToDraft: {
      title: 'Complaint → Legal Draft Generator',
      subtitle: 'Describe your dispute or grievance in plain words. NyayaMithra extracts the legal facts and drafts a court-ready notice or complaint.',
      inputLabel: 'Describe Your Grievance / Dispute Details:',
      inputPlaceholder: 'E.g., I purchased a refrigerator for ₹45,000 from XYZ Electronics on 10 June 2026. The unit stopped working after 12 days and the seller refused repair or refund...',
      generateBtn: 'Extract Facts & Generate Draft',
      generating: 'Analyzing Grievance & Generating Draft...',
      sampleTitle: 'Click to Load Sample Grievances:',
      factsTitle: 'Extracted Legal Facts & Entities',
      draftTitle: 'Generated Statutory Legal Draft',
      copyDraft: 'Copy Draft',
      downloadDraft: 'Download Text',
      complainant: 'Complainant / Aggrieved Party',
      oppositeParty: 'Opposite Party / Respondent',
      productService: 'Product / Service in Dispute',
      amount: 'Transaction / Consideration Amount',
      incidentDate: 'Date of Incident / Purchase',
      defectIssue: 'Core Defect / Deficiency',
      reliefClaimed: 'Relief / Remedies Claimed',
    },
    summarizer: {
      title: 'Document Summarizer & Explainer',
      subtitle: 'Upload a legal document and NyayaMithra will explain clauses, risks, and next steps in simple language.',
      uploadTitle: 'Click to upload or drag and drop a legal document',
      uploadDesc: 'Supported formats: PDF, DOCX, TXT',
      pasteLabel: 'Or paste the document text below:',
      pastePlaceholder: 'Paste rental agreement, employment contract, legal notice, loan document, or terms here...',
      clearBtn: 'Clear',
      summarizeBtn: 'Summarize Document',
      summarizing: 'Explaining document in simple language...',
      resultTitle: 'Document Explanation',
      summaryTitle: 'Document Summary',
      importantPointsTitle: 'Important Points',
      importantClausesTitle: 'Important Clauses',
      risksTitle: 'Possible Risks / Things to Check',
      nextStepsTitle: 'What should I do next?',
      copyBtn: 'Copy Summary',
      copiedBtn: 'Copied',
      downloadBtn: 'Download',
    },
    speech: {
      title: 'Multilingual Voice & Speech Assistant',
      subtitle: 'Speak your legal question or dispute narrative in Indian languages using speech recognition and audio readout.',
      sttTitle: 'Microphone Speech-to-Text Studio',
      ttsTitle: 'Text-to-Speech Output Tester',
      startRecord: 'Start Recording',
      stopRecord: 'Stop Recording',
      listeningIn: 'Listening in',
      speakClear: 'Speak clearly into your microphone.',
      previewLabel: 'Recognized Speech Live Preview:',
      sendToChat: 'Send to Legal Chat',
      sendToDraft: 'Send to Complaint Draft',
      readAloud: 'Read Aloud',
      stopVoice: 'Stop Voice',
      wordsCount: 'words recognized',
    },
  },
  Hindi: {
    appName: 'न्यायमित्र',
    tagline: 'भारतीय कानूनी सहायता एवं ड्राफ्टिंग प्रणाली',
    disclaimer: 'अस्वीकरण: यह केवल सूचनात्मक उद्देश्यों के लिए AI-सहायता प्राप्त कानूनी मसौदा है। औपचारिक प्रतिनिधित्व के लिए एक कानूनी पेशेवर से परामर्श लें।',
    disclaimerDetail: 'उपभोक्ता संरक्षण अधिनियम 2019, भारतीय न्याय संहिता 2023, और आरटीआई अधिनियम 2005 सहित भारतीय कानूनों पर आधारित।',
    nav: {
      dashboard: 'डैशबोर्ड',
      complaintToDraft: 'शिकायत → ड्राफ्ट',
      chat: 'कानूनी चैट',
      summarizer: 'दस्तावेज़ सारांश',
      drafts: 'कानूनी मसौदे',
      documents: 'दस्तावेज़',
      speechAssistant: 'ध्वनि सहायक',
    },
    header: {
      language: 'भाषा',
      exportDoc: 'दस्तावेज़ निर्यात करें',
    },
    dashboard: {
      badge: 'AI भारतीय कानूनी सहायक',
      heroTitle: 'न्यायमित्र कानूनी सूचना एवं ड्राफ्टिंग',
      heroDesc: 'भारतीय कानूनी अधिकारों को समझें, न्यायालय-तैयार कानूनी मसौदे तैयार करें, और उपभोक्ता संरक्षण अधिनियम 2019, भारतीय न्याय संहिता (BNS) 2023, आरटीआई अधिनियम 2005 आदि के प्रावधानों को जानें।',
      draftComplaintBtn: 'शिकायत का मसौदा बनाएं',
      askQuestionBtn: 'कानूनी प्रश्न पूछें',
      modulesTitle: 'कानूनी सहायता मॉड्यूल',
      modulesSubtitle: 'आरंभ करने के लिए एक उपकरण चुनें',
      sampleQuestionsTitle: 'अक्सर पूछे जाने वाले कानूनी प्रश्न',
      sampleComplaintsTitle: 'नागरिक शिकायतों के उदाहरण',
      trustStatutory: 'प्रामाणिक भारतीय कानून',
      trustStatutoryDesc: 'उपभोक्ता संरक्षण अधिनियम, भारतीय न्याय संहिता, आरटीआई अधिनियम और आईटी अधिनियम पर आधारित।',
      trustCourtFormat: 'मानक न्यायालय प्रारूप',
      trustCourtFormatDesc: 'औपचारिक कानूनी नोटिस, हलफनामे, उपभोक्ता याचिकाएं और आरटीआई आवेदन तैयार करता है।',
      trustConfidential: 'गोपनीय एवं सुरक्षित',
      trustConfidentialDesc: 'आपकी कानूनी पूछताछ और शिकायत विवरण सुरक्षित रूप से संभाले जाते हैं।',
    },
    chat: {
      title: 'कानूनी चैट सहायक',
      subtitle: 'भारतीय कानूनों, आपराधिक संहिताओं, उपभोक्ता अधिकारों और प्रक्रियात्मक नियमों के बारे में प्रश्न पूछें।',
      greeting: 'नमस्ते! मैं न्यायमित्र हूँ, आपका AI कानूनी सहायक। मैं उपभोक्ता संरक्षण अधिनियम 2019, भारतीय न्याय संहिता 2023, आईटी अधिनियम 2000 और आरटीआई अधिनियम 2005 के अनुसार आपकी सहायता कर सकता हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?',
      placeholder: 'अपना भारतीय कानूनी प्रश्न पूछें (उदा. BNS 2023 के तहत चोरी की सजा क्या है?)...',
      sendBtn: 'भेजें',
      clearBtn: 'चैट रीसेट करें',
      voiceBtn: 'आवाज इनपुट',
      sourcesTitle: 'वैधानिक उद्धरण एवं कानूनी स्रोत',
      plainSummaryTitle: 'सरल भाषा में सारांश',
      samplePromptLabel: 'त्वरित कानूनी प्रश्न:',
      answeringIn: 'उत्तर भाषा:',
    },
    complaintToDraft: {
      title: 'शिकायत → कानूनी ड्राफ्ट जनरेटर',
      subtitle: 'अपनी शिकायत को सरल शब्दों में लिखें। न्यायमित्र कानूनी तथ्यों को निकालकर न्यायालय-तैयार नोटिस या शिकायत तैयार करेगा।',
      inputLabel: 'अपनी शिकायत / विवाद का विवरण दर्ज करें:',
      inputPlaceholder: 'उदा. मैंने 10 जून 2026 को XYZ इलेक्ट्रॉनिक्स से ₹45,000 में एक फ्रिज खरीदा। 12 दिनों बाद फ्रिज ने काम करना बंद कर दिया और विक्रेता ने मरम्मत या धनवापसी से इनकार कर दिया...',
      generateBtn: 'तथ्य निकालें और ड्राफ्ट बनाएं',
      generating: 'शिकायत का विश्लेषण और ड्राफ्ट तैयार हो रहा है...',
      sampleTitle: 'नमूना शिकायत लोड करने के लिए क्लिक करें:',
      factsTitle: 'निकाले गए कानूनी तथ्य और पक्ष',
      draftTitle: 'तैयार किया गया कानूनी मसौदा',
      copyDraft: 'ड्राफ्ट कॉपी करें',
      downloadDraft: 'टेक्स्ट डाउनलोड करें',
      complainant: 'शिकायतकर्ता / पीड़ित पक्ष',
      oppositeParty: 'विपक्षी पक्ष / विक्रेता',
      productService: 'विवादित उत्पाद / सेवा',
      amount: 'लेनदेन / भुगतान की राशि',
      incidentDate: 'घटना / खरीद की तारीख',
      defectIssue: 'मुख्य खराबी / सेवा में कमी',
      reliefClaimed: 'मांगी गई राहत / मुआवजा',
    },
    summarizer: {
      title: 'दस्तावेज़ सारांश एवं व्याख्या',
      subtitle: 'कानूनी दस्तावेज़ अपलोड करें और न्यायमित्र सरल भाषा में शर्तों, जोखिमों और अगले कदमों की व्याख्या करेगा।',
      uploadTitle: 'कानूनी दस्तावेज़ अपलोड करने के लिए क्लिक करें या खींचें',
      uploadDesc: 'समर्थित प्रारूप: PDF, DOCX, TXT',
      pasteLabel: 'या नीचे दस्तावेज़ का पाठ चिपकाएं:',
      pastePlaceholder: 'किराया समझौता, रोजगार अनुबंध, कानूनी नोटिस, ऋण दस्तावेज़ या शर्तें यहाँ चिपकाएँ...',
      clearBtn: 'साफ़ करें',
      summarizeBtn: 'दस्तावेज़ का सारांश बनाएं',
      summarizing: 'सरल भाषा में दस्तावेज़ की व्याख्या की जा रही है...',
      resultTitle: 'दस्तावेज़ की व्याख्या',
      summaryTitle: 'दस्तावेज़ सारांश',
      importantPointsTitle: 'महत्वपूर्ण बिंदु',
      importantClausesTitle: 'महत्वपूर्ण धाराएं व शर्तें',
      risksTitle: 'संभावित जोखिम / जांचने योग्य बातें',
      nextStepsTitle: 'आगे क्या कदम उठाना चाहिए?',
      copyBtn: 'सारांश कॉपी करें',
      copiedBtn: 'कॉपी हो गया',
      downloadBtn: 'डाउनलोड करें',
    },
    speech: {
      title: 'बहुभाषी आवाज और भाषण सहायक',
      subtitle: 'भारतीय भाषाओं में बोलकर अपने कानूनी प्रश्न पूछें और आवाज में उत्तर सुनें।',
      sttTitle: 'माइक्रोफोन स्पीच-टू-टेक्स्ट स्टूडियो',
      ttsTitle: 'टेक्स्ट-टू-स्पीच परीक्षण',
      startRecord: 'रिकॉर्डिंग शुरू करें',
      stopRecord: 'रिकॉर्डिंग रोकें',
      listeningIn: 'सुन रहा है:',
      speakClear: 'माइक्रोफोन में स्पष्ट बोलें।',
      previewLabel: 'पहचाने गए भाषण का लाइव पूर्वावलोकन:',
      sendToChat: 'कानूनी चैट में भेजें',
      sendToDraft: 'शिकायत ड्राफ्ट में भेजें',
      readAloud: 'बोलकर सुनाएं',
      stopVoice: 'आवाज रोकें',
      wordsCount: 'शब्द पहचाने गए',
    },
  },
  Telugu: {
    appName: 'న్యాయమిత్ర',
    tagline: 'భారతీయ న్యాయ సహాయం & డ్రాఫ్టింగ్ సిస్టమ్',
    disclaimer: 'నిరాకరణ: ఇది కేవలం సమాచార ప్రయోజనాల కోసం రూపొందించబడిన AI-సహాయక చట్టపరమైన డ్రాఫ్ట్. అధికారిక ప్రాతినిధ్యం కోసం న్యాయవాదిని సంప్రదించండి.',
    disclaimerDetail: 'వినియోగదారుల రక్షణ చట్టం 2019, భారతీయ న్యాయ సంహిత 2023, మరియు RTI చట్టం 2005 ఆధారంగా రూపొందించబడింది.',
    nav: {
      dashboard: 'డ్యాష్‌బోర్డ్',
      complaintToDraft: 'ఫిర్యాదు → డ్రాఫ్ట్',
      chat: 'లీగల్ చాట్',
      summarizer: 'పత్రం సారాంశం',
      drafts: 'లీగల్ డ్రాఫ్ట్‌లు',
      documents: 'పత్రాలు',
      speechAssistant: 'వాయిస్ అసిస్టెంట్',
    },
    header: {
      language: 'భాష',
      exportDoc: 'పత్రం ఎగుమతి',
    },
    dashboard: {
      badge: 'AI ఆధారిత భారతీయ లీగల్ అసిస్టెంట్',
      heroTitle: 'న్యాయమిత్ర లీగల్ సమాచారం & డ్రాఫ్టింగ్',
      heroDesc: 'భారతీయ చట్టపరమైన హక్కులను అర్థం చేసుకోండి, కోర్టుకు సమర్పించే లీగల్ డ్రాఫ్ట్‌లను సిద్ధం చేయండి మరియు వినియోగదారుల రక్షణ చట్టం 2019, భారతీయ న్యాయ సంహిత (BNS) 2023, RTI చట్టం 2005 గురించి తెలుసుకోండి.',
      draftComplaintBtn: 'ఫిర్యాదు డ్రాఫ్ట్ చేయండి',
      askQuestionBtn: 'లీగల్ ప్రశ్న అడగండి',
      modulesTitle: 'లీగల్ సహాయ మాడ్యూల్స్',
      modulesSubtitle: 'ప్రారంభించడానికి ఒక సాధనాన్ని ఎంచుకోండి',
      sampleQuestionsTitle: 'తరచుగా అడిగే చట్టపరమైన ప్రశ్నలు',
      sampleComplaintsTitle: 'నమూనా పౌర ఫిర్యాదులు',
      trustStatutory: 'ప్రామాణిక భారతీయ చట్టం',
      trustStatutoryDesc: 'వినియోగదారుల రక్షణ, భారతీయ న్యాయ సంహిత, RTI మరియు IT చట్టాల ఆధారంగా.',
      trustCourtFormat: 'ప్రామాణిక కోర్టు ఫార్మాట్లు',
      trustCourtFormatDesc: 'లీగల్ నోటీసులు, అఫిడవిట్‌లు, వినియోగదారుల పిటిషన్లు మరియు RTI దరఖాస్తులను రూపొందిస్తుంది.',
      trustConfidential: 'గోప్యమైనది & సురక్షితమైనది',
      trustConfidentialDesc: 'మీ చట్టపరమైన విచారణలు మరియు ఫిర్యాదుల వివరాలు సురక్షితంగా ఉంటాయి.',
    },
    chat: {
      title: 'లీగల్ చాట్ అసిస్టెంట్',
      subtitle: 'భారతీయ చట్టాలు, క్రిమినల్ కోడ్‌లు, వినియోగదారుల హక్కులు మరియు నియమాల గురించి ప్రశ్నలు అడగండి.',
      greeting: 'నమస్కారం! నేను న్యాయమిత్ర, మీ AI లీగల్ అసిస్టెంట్. వినియోగదారుల రక్షణ చట్టం 2019, భారతీయ న్యాయ సంహిత 2023, IT చట్టం 2000 మరియు RTI చట్టం 2005 ప్రకారం మీకు సహాయం చేయగలను. నేను ఈరోజు మీకు ఎలా సహాయపడగలను?',
      placeholder: 'మీ భారతీయ చట్టపరమైన ప్రశ్నను అడగండి (ఉదా. BNS 2023 ప్రకారం దొంగతనానికి శిక్ష ఏమిటి?)...',
      sendBtn: 'పంపండి',
      clearBtn: 'రీసెట్ చేయండి',
      voiceBtn: 'వాయిస్ ఇన్‌పుట్',
      sourcesTitle: 'చట్టపరమైన మూలాలు & సెక్షన్లు',
      plainSummaryTitle: 'సులభమైన భాషలో సారాంశం',
      samplePromptLabel: 'త్వరిత ప్రశ్నలు:',
      answeringIn: 'సమాధానం ఇచ్చే భాష:',
    },
    complaintToDraft: {
      title: 'ఫిర్యాదు → లీగల్ డ్రాఫ్ట్ జనరేటర్',
      subtitle: 'మీ ఫిర్యాదును సరళమైన మాటల్లో రాయండి. న్యాయమిత్ర లీగల్ వివరాలను సంగ్రహించి కోర్టు నోటీసు లేదా ఫిర్యాదును తయారు చేస్తుంది.',
      inputLabel: 'మీ ఫిర్యాదు / వివాద వివరాలను నమోదు చేయండి:',
      inputPlaceholder: 'ఉదా. నేను 10 జూన్ 2026న XYZ ఎలక్ట్రానిక్స్ నుండి ₹45,000కు రిఫ్రిజిరేటర్ కొన్నాను. 12 రోజుల తర్వాత అది పాడైపోయింది, వారు రిపేర్ లేదా రీఫండ్ ఇవ్వడానికి నిరాకరించారు...',
      generateBtn: 'వివరాలు సేకరించి డ్రాఫ్ట్ రూపొందించండి',
      generating: 'ఫిర్యాదును విశ్లేషించి డ్రాఫ్ట్ రూపొందిస్తోంది...',
      sampleTitle: 'నమూనా ఫిర్యాదును లోడ్ చేయడానికి క్లిక్ చేయండి:',
      factsTitle: 'సేకరించబడిన చట్టపరమైన వివరాలు',
      draftTitle: 'రూపొందించబడిన లీగల్ డ్రాఫ్ట్',
      copyDraft: 'డ్రాఫ్ట్ కాపీ చేయండి',
      downloadDraft: 'టెక్స్ట్ డౌన్‌లోడ్ చేయండి',
      complainant: 'ఫిర్యాదుదారు / బాధితుడు',
      oppositeParty: 'ఎదుటి పక్షం / వ్యాపారి',
      productService: 'వివాదాస్పద ఉత్పత్తి / సేవ',
      amount: 'లావాదేవీ మొత్తం',
      incidentDate: 'ఘటన / కొనుగోలు తేదీ',
      defectIssue: 'ప్రధాన లోపం / సేవా లోపం',
      reliefClaimed: 'కోరిన ఉపశమనం / పరిహారం',
    },
    summarizer: {
      title: 'పత్రం సారాంశం & వివరణ',
      subtitle: 'చట్టపరమైన పత్రాన్ని అప్‌లోడ్ చేయండి, న్యాయమిత్ర నిబంధనలు, నష్టాలు మరియు తదుపరి చర్యలను సరళమైన భాషలో వివరిస్తుంది.',
      uploadTitle: 'లీగల్ పత్రాన్ని అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి లేదా ఇక్కడ వేయండి',
      uploadDesc: 'మద్దతు ఉన్న ఫార్మాట్లు: PDF, DOCX, TXT',
      pasteLabel: 'లేదా పత్రం యొక్క వచనాన్ని క్రింద పేస్ట్ చేయండి:',
      pastePlaceholder: 'అద్దె ఒప్పందం, ఉద్యోగ ఒప్పందం, లీగల్ నోటీసు, లోన్ పత్రం లేదా నిబంధనలను ఇక్కడ పేస్ట్ చేయండి...',
      clearBtn: 'క్లియర్',
      summarizeBtn: 'పత్రం సారాంశం రూపొందించండి',
      summarizing: 'సరళమైన భాషలో పత్రాన్ని వివరిస్తోంది...',
      resultTitle: 'పత్రం వివరణ',
      summaryTitle: 'పత్రం సారాంశం',
      importantPointsTitle: 'ముఖ్యమైన అంశాలు',
      importantClausesTitle: 'ముఖ్యమైన నిబంధనలు',
      risksTitle: 'సంభావ్య నష్టాలు / తనిఖీ చేయవలసిన అంశాలు',
      nextStepsTitle: 'తరువాత నేను ఏమి చేయాలి?',
      copyBtn: 'సారాంశం కాపీ చేయండి',
      copiedBtn: 'కాపీ చేయబడింది',
      downloadBtn: 'డౌన్‌లోడ్',
    },
    speech: {
      title: 'బహుభాషా వాయిస్ & స్పీచ్ అసిస్టెంట్',
      subtitle: 'భారతీయ భాషల్లో మాట్లాడి మీ చట్టపరమైన ప్రశ్నలను అడగండి మరియు ఆడియో సమాధానాలను వినండి.',
      sttTitle: 'మైక్రోఫోన్ స్పీచ్-టు-టెక్స్ట్ స్టూడియో',
      ttsTitle: 'టెక్స్ట్-టు-స్పీచ్ పరీక్ష',
      startRecord: 'రికార్డింగ్ ప్రారంభించండి',
      stopRecord: 'రికార్డింగ్ ఆపండి',
      listeningIn: 'వింటోంది:',
      speakClear: 'మైక్రోఫోన్‌లో స్పష్టంగా మాట్లాడండి.',
      previewLabel: 'గుర్తించబడిన వాయిస్ ప్రివ్యూ:',
      sendToChat: 'లీగల్ చాట్‌కు పంపండి',
      sendToDraft: 'ఫిర్యాదు డ్రాఫ్ట్‌కు పంపండి',
      readAloud: 'చదివి వినిపించండి',
      stopVoice: 'వాయిస్ ఆపండి',
      wordsCount: 'పదాలు గుర్తించబడ్డాయి',
    },
  },
  Tamil: {
    appName: 'நியாயமித்ரா',
    tagline: 'இந்திய சட்ட உதவி மற்றும் வரைவு அமைப்பு',
    disclaimer: 'மறுப்பு: இது தகவல் நோக்கங்களுக்காக மட்டுமே AI-உதவி சட்ட வரைவு ஆகும். முறையான பிரதிநிதித்துவத்திற்கு ஒரு வழக்கறிஞரை அணுகவும்.',
    disclaimerDetail: 'நுகர்வோர் பாதுகாப்பு சட்டம் 2019, பாரதிய நியாய சன்ஹிதா 2023, மற்றும் தகவல் அறியும் உரிமை சட்டம் 2005 அடிப்படையிலானது.',
    nav: {
      dashboard: 'டாஷ்போர்டு',
      complaintToDraft: 'புகார் → வரைவு',
      chat: 'சட்ட அரட்டை',
      summarizer: 'ஆவண சுருக்கம்',
      drafts: 'சட்ட வரைவுகள்',
      documents: 'ஆவணங்கள்',
      speechAssistant: 'குரல் உதவியாளர்',
    },
    header: {
      language: 'மொழி',
      exportDoc: 'ஆவணத்தை ஏற்றுமதி செய்',
    },
    dashboard: {
      badge: 'AI இந்திய சட்ட உதவியாளர்',
      heroTitle: 'நியாயமித்ரா சட்ட தகவல் மற்றும் வரைவு',
      heroDesc: 'இந்திய சட்ட உரிமைகளைப் புரிந்து கொள்ளுங்கள், நீதிமன்றத்திற்கு தயாரான சட்ட வரைவுகளை உருவாக்குங்கள், மற்றும் நுகர்வோர் பாதுகாப்பு சட்டம் 2019, BNS 2023, RTI சட்டம் பற்றி அறியுங்கள்.',
      draftComplaintBtn: 'புகார் வரைவு செய்',
      askQuestionBtn: 'சட்ட கேள்வி கேள்',
      modulesTitle: 'சட்ட உதவி தொகுதிகள்',
      modulesSubtitle: 'தொடங்குவதற்கு ஒரு கருவியைத் தேர்வுசெய்க',
      sampleQuestionsTitle: 'அடிக்கடி கேட்கப்படும் சட்ட கேள்விகள்',
      sampleComplaintsTitle: 'மாதிரி குடிமக்கள் புகார்கள்',
      trustStatutory: 'அங்கீகரிக்கப்பட்ட இந்திய சட்டம்',
      trustStatutoryDesc: 'நுகர்வோர் பாதுகாப்பு, பாரதிய நியாய சன்ஹிதா, RTI மற்றும் IT சட்டங்களின் அடிப்படையில்.',
      trustCourtFormat: 'நிலையான நீதிமன்ற வடிவங்கள்',
      trustCourtFormatDesc: 'சட்ட அறிவிப்புகள், வாக்குமூலங்கள், நுகர்வோர் மனுக்கள் மற்றும் RTI விண்ணப்பங்களை உருவாக்குகிறது.',
      trustConfidential: 'ரகசியமானது மற்றும் பாதுகாப்பானது',
      trustConfidentialDesc: 'உங்கள் சட்ட விசாரணைகள் மற்றும் புகார் விவரங்கள் பாதுகாப்பாக கையாளப்படுகின்றன.',
    },
    chat: {
      title: 'சட்ட அரட்டை உதவியாளர்',
      subtitle: 'இந்திய சட்டங்கள், குற்றவியல் பிரிவுகள், நுகர்வோர் உரிமைகள் குறித்து கேள்விகளைக் கேளுங்கள்.',
      greeting: 'வணக்கம்! நான் நியாயமித்ரா, உங்கள் AI சட்ட உதவியாளர். நுகர்வோர் பாதுகாப்பு சட்டம் 2019, பாரதிய நியாய சன்ஹிதா 2023, மற்றும் RTI சட்டம் 2005 ஆகியவற்றின் கீழ் உங்களுக்கு உதவ முடியும். இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?',
      placeholder: 'உங்கள் சட்ட கேள்வியைக் கேளுங்கள் (எ.கா. BNS 2023-ன் கீழ் திருட்டுக்கான தண்டனை என்ன?)...',
      sendBtn: 'அனுப்பு',
      clearBtn: 'மீட்டமைக்க',
      voiceBtn: 'குரல் உள்ளீடு',
      sourcesTitle: 'சட்ட ஆதாரங்கள் மற்றும் பிரிவுகள்',
      plainSummaryTitle: 'எளிய மொழி சுருக்கம்',
      samplePromptLabel: 'விரைவான சட்ட கேள்விகள்:',
      answeringIn: 'பதில் மொழி:',
    },
    complaintToDraft: {
      title: 'புகார் → சட்ட வரைவு இயற்றி',
      subtitle: 'உங்கள் புகாரை எளிய சொற்களில் விவரிக்கவும். நியாயமித்ரா சட்ட உண்மைகளை பிரித்தெடுத்து நீதிமன்ற அறிவிப்பை உருவாக்கும்.',
      inputLabel: 'உங்கள் புகார் விவரங்களை உள்ளிடவும்:',
      inputPlaceholder: 'எ.கா. நான் ஜூன் 10, 2026 அன்று XYZ எலக்ட்ரானிக்ஸிலிருந்து ₹45,000-க்கு குளிர்சாதனப் பெட்டியை வாங்கினேன். 12 நாட்களுக்குப் பிறகு அது பழுதடைந்தது, அவர்கள் பழுதுபார்க்க அல்லது பணத்தைத் திரும்பப் பெற மறுத்துவிட்டனர்...',
      generateBtn: 'உண்மைகளைப் பிரித்தெடுத்து வரைவு செய்',
      generating: 'புகாரை பகுப்பாய்வு செய்து வரைவு உருவாக்குகிறது...',
      sampleTitle: 'மாதிரி புகாரை ஏற்ற கிளிக் செய்க:',
      factsTitle: 'பிரித்தெடுக்கப்பட்ட சட்ட உண்மைகள்',
      draftTitle: 'உருவாக்கப்பட்ட சட்ட வரைவு',
      copyDraft: 'வரைவை நகலெடு',
      downloadDraft: 'பதிவிறக்கம்',
      complainant: 'புகார்தாரர் / பாதிக்கப்பட்ட நபர்',
      oppositeParty: 'எதிர் தரப்பு / விற்பனையாளர்',
      productService: 'சர்ச்சைக்குரிய தயாரிப்பு / சேவை',
      amount: 'பரிவர்த்தனை தொகை',
      incidentDate: 'சம்பவம் / வாங்கிய தேதி',
      defectIssue: 'முக்கிய குறைபாடு / சேவைக் குறைபாடு',
      reliefClaimed: 'கோரப்பட்ட நிவாரணம் / இழப்பீடு',
    },
    summarizer: {
      title: 'ஆவண சுருக்கம் & விளக்கம்',
      subtitle: 'சட்ட ஆவணத்தை பதிவேற்றவும், நியாயமித்ரா விதிகள், அபாயங்கள் மற்றும் அடுத்த படிகளை எளிய மொழியில் விளக்கும்.',
      uploadTitle: 'சட்ட ஆவணத்தை பதிவேற்ற கிளிக் செய்க அல்லது இழுத்து விடவும்',
      uploadDesc: 'ஆதரிக்கப்படும் வடிவங்கள்: PDF, DOCX, TXT',
      pasteLabel: 'அல்லது ஆவண உரையை கீழே ஒட்டவும்:',
      pastePlaceholder: 'வாடகை ஒப்பந்தம், வேலைவாய்ப்பு ஒப்பந்தம், சட்ட அறிவிப்பு, கடன் ஆவணத்தை இங்கே ஒட்டவும்...',
      clearBtn: 'அழி',
      summarizeBtn: 'ஆவணத்தை சுருக்கவும்',
      summarizing: 'எளிய மொழியில் ஆவணத்தை விளக்குகிறது...',
      resultTitle: 'ஆவண விளக்கம்',
      summaryTitle: 'ஆவண சுருக்கம்',
      importantPointsTitle: 'முக்கிய புள்ளிகள்',
      importantClausesTitle: 'முக்கிய விதிகள்',
      risksTitle: 'சாத்தியமான அபாயங்கள் / சரிபார்க்க வேண்டியவை',
      nextStepsTitle: 'அடுத்து நான் என்ன செய்ய வேண்டும்?',
      copyBtn: 'சுருக்கத்தை நகலெடு',
      copiedBtn: 'நகலெடுக்கப்பட்டது',
      downloadBtn: 'பதிவிறக்கம்',
    },
    speech: {
      title: 'பன்மொழி குரல் & பேச்சு உதவியாளர்',
      subtitle: 'இந்திய மொழிகளில் பேசி உங்கள் சட்ட கேள்விகளைக் கேட்டு ஆடியோ பதில்களைப் பெறுங்கள்.',
      sttTitle: 'மைக்ரோஃபோன் பேச்சு-க்கு-உரை அரங்கம்',
      ttsTitle: 'உரை-க்கு-பேச்சு சோதனை',
      startRecord: 'பதிவைத் தொடங்கு',
      stopRecord: 'பதிவை நிறுத்து',
      listeningIn: 'கேட்கிறது:',
      speakClear: 'மைக்ரோஃபோனில் தெளிவாகப் பேசுங்கள்.',
      previewLabel: 'அடையாளம் காணப்பட்ட பேச்சு நேரடி முன்னோட்டம்:',
      sendToChat: 'சட்ட அரட்டைக்கு அனுப்பு',
      sendToDraft: 'புகார் வரைவுக்கு அனுப்பு',
      readAloud: 'படித்துக் காட்டு',
      stopVoice: 'குரலை நிறுத்து',
      wordsCount: 'சொற்கள் அடையாளம் காணப்பட்டன',
    },
  },
  Kannada: {
    appName: 'ನ್ಯಾಯಮಿತ್ರ',
    tagline: 'ಭಾರತೀಯ ಕಾನೂನು ನೆರವು ಮತ್ತು ಡ್ರಾಫ್ಟಿಂಗ್ ವ್ಯವಸ್ಥೆ',
    disclaimer: 'ಹಕ್ಕುತ್ಯಾಗ: ಇದು ಕೇವಲ ಮಾಹಿತಿಯ ಉದ್ದೇಶಗಳಿಗಾಗಿ AI-ಸಹಾಯದ ಕಾನೂನು ಕರಡು ಆಗಿದೆ. ಅಧಿಕೃತ ಪ್ರಾತಿನಿಧ್ಯಕ್ಕಾಗಿ ವಕೀಲರನ್ನು ಸಂಪರ್ಕಿಸಿ.',
    disclaimerDetail: 'ಗ್ರಾಹಕರ ರಕ್ಷಣಾ ಕಾಯ್ದೆ 2019, ಭಾರತೀಯ ನ್ಯಾಯ ಸಂಹಿತೆ 2023, ಮತ್ತು RTI ಕಾಯ್ದೆ 2005 ರ ಆಧಾರದ ಮೇಲೆ.',
    nav: {
      dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
      complaintToDraft: 'ದೂರು → ಕರಡು',
      chat: 'ಕಾನೂನು ಚಾಟ್',
      summarizer: 'ದಾಖಲೆ ಸಾರಾಂಶ',
      drafts: 'ಕಾನೂನು ಕರಡುಗಳು',
      documents: 'ದಾಖಲೆಗಳು',
      speechAssistant: 'ಧ್ವನಿ ಸಹಾಯಕ',
    },
    header: {
      language: 'ಭಾಷೆ',
      exportDoc: 'ದಾಖಲೆ ರಫ್ತು ಮಾಡಿ',
    },
    dashboard: {
      badge: 'AI ಆಧಾರಿತ ಭಾರತೀಯ ಕಾನೂನು ಸಹಾಯಕ',
      heroTitle: 'ನ್ಯಾಯಮಿತ್ರ ಕಾನೂನು ಮಾಹಿತಿ ಮತ್ತು ಡ್ರಾಫ್ಟಿಂಗ್',
      heroDesc: 'ಭಾರತೀಯ ಕಾನೂನು ಹಕ್ಕುಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ, ನ್ಯಾಯಾಲಯಕ್ಕೆ ಸಿದ್ಧವಾದ ಕರಡುಗಳನ್ನು ರಚಿಸಿ, ಮತ್ತು ಗ್ರಾಹಕ ರಕ್ಷಣೆ ಕಾಯ್ದೆ 2019, BNS 2023, RTI ಕಾಯ್ದೆ ಬಗ್ಗೆ ತಿಳಿಯಿರಿ.',
      draftComplaintBtn: 'ದೂರು ಕರಡು ರಚಿಸಿ',
      askQuestionBtn: 'ಕಾನೂನು ಪ್ರಶ್ನೆ ಕೇಳಿ',
      modulesTitle: 'ಕಾನೂನು ನೆರವು ಮಾಡ್ಯೂಲ್‌ಗಳು',
      modulesSubtitle: 'ಪ್ರಾರಂಭಿಸಲು ಉಪಕರಣವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      sampleQuestionsTitle: 'ಸಾಮಾನ್ಯವಾಗಿ ಕೇಳಲಾಗುವ ಕಾನೂನು ಪ್ರಶ್ನೆಗಳು',
      sampleComplaintsTitle: 'ಮಾದರಿ ನಾಗರಿಕ ದೂರುಗಳು',
      trustStatutory: 'ಪ್ರಾಮಾಣಿಕ ಭಾರತೀಯ ಕಾನೂನು',
      trustStatutoryDesc: 'ಗ್ರಾಹಕ ಸಂರಕ್ಷಣೆ, ಭಾರತೀಯ ನ್ಯಾಯ ಸಂಹಿತೆ, RTI ಮತ್ತು IT ಕಾಯ್ದೆಗಳ ಆಧಾರದ ಮೇಲೆ.',
      trustCourtFormat: 'ಪ್ರಮಾಣಿತ ನ್ಯಾಯಾಲಯ ಮಾದರಿಗಳು',
      trustCourtFormatDesc: 'ಕಾನೂನು ನೋಟಿಸ್‌ಗಳು, ಅಫಿಡವಿಟ್‌ಗಳು, ಗ್ರಾಹಕ ಅರ್ಜಿಗಳು ಮತ್ತು RTI ಅರ್ಜಿಗಳನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತದೆ.',
      trustConfidential: 'ಗೌಪ್ಯ ಮತ್ತು ಸುರಕ್ಷಿತ',
      trustConfidentialDesc: 'ನಿಮ್ಮ ಕಾನೂನು ವಿಚಾರಣೆಗಳು ಮತ್ತು ದೂರು ವಿವರಗಳು ಸುರಕ್ಷಿತವಾಗಿರುತ್ತವೆ.',
    },
    chat: {
      title: 'ಕಾನೂನು ಚಾಟ್ ಸಹಾಯಕ',
      subtitle: 'ಭಾರತೀಯ ಕಾನೂನುಗಳು, ಅಪರಾಧ ಸಂಹಿತೆಗಳು, ಗ್ರಾಹಕ ಹಕ್ಕುಗಳ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.',
      greeting: 'ನಮಸ್ಕಾರ! ನಾನು ನ್ಯಾಯಮಿತ್ರ, ನಿಮ್ಮ AI ಕಾನೂನು ಸಹಾಯಕ. ಗ್ರಾಹಕರ ರಕ್ಷಣಾ ಕಾಯ್ದೆ 2019, ಭಾರತೀಯ ನ್ಯಾಯ ಸಂಹಿತೆ 2023, ಮತ್ತು RTI ಕಾಯ್ದೆ 2005 ರ ಅಡಿಯಲ್ಲಿ ನಿಮಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
      placeholder: 'ನಿಮ್ಮ ಕಾನೂನು ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ (ಉದಾ. BNS 2023 ರ ಅಡಿಯಲ್ಲಿ ಕಳ್ಳತನಕ್ಕೆ ಶಿಕ್ಷೆ ಏನು?)...',
      sendBtn: 'ಕಳುಹಿಸಿ',
      clearBtn: 'ಮರುಹೊಂದಿಸಿ',
      voiceBtn: 'ಧ್ವನಿ ಇನ್‌ಪುಟ್',
      sourcesTitle: 'ಕಾನೂನು ಉಲ್ಲೇಖಗಳು ಮತ್ತು ವಿಭಾಗಗಳು',
      plainSummaryTitle: 'ಸರಳ ಭಾಷೆಯ ಸಾರಾಂಶ',
      samplePromptLabel: 'ತ್ವರಿತ ಪ್ರಶ್ನೆಗಳು:',
      answeringIn: 'ಉತ್ತರಿಸುತ್ತಿರುವ ಭಾಷೆ:',
    },
    complaintToDraft: {
      title: 'ದೂರು → ಕಾನೂನು ಕರಡು ಜನರೇಟರ್',
      subtitle: 'ನಿಮ್ಮ ದೂರನ್ನು ಸರಳ ಪದಗಳಲ್ಲಿ ವಿವರಿಸಿ. ನ್ಯಾಯಮಿತ್ರ ಕಾನೂನು ಸತ್ಯಗಳನ್ನು ಹೊರತೆಗೆದು ಕೋರ್ಟ್ ನೋಟಿಸ್ ಅಥವಾ ದೂರನ್ನು ಸಿದ್ಧಪಡಿಸುತ್ತದೆ.',
      inputLabel: 'ನಿಮ್ಮ ದೂರು / ವಿವಾದದ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ:',
      inputPlaceholder: 'ಉದಾ. ನಾನು ಜೂನ್ 10, 2026 ರಂದು XYZ ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್‌ನಿಂದ ₹45,000 ಗೆ ರೆಫ್ರಿಜರೇಟರ್ ಖರೀದಿಸಿದೆ. 12 ದಿನಗಳ ನಂತರ ಅದು ಕೆಲಸ ಮಾಡುವುದನ್ನು ನಿಲ್ಲಿಸಿತು, ಅವರು ದುರಸ್ತಿ ಅಥವಾ ಹಣ ಮರುಪಾವತಿಸಲು ನಿರಾಕರಿಸಿದರು...',
      generateBtn: 'ವಿವರಗಳನ್ನು ಪಡೆದು ಕರಡು ರಚಿಸಿ',
      generating: 'ದೂರನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಕರಡು ರಚಿಸಲಾಗುತ್ತಿದೆ...',
      sampleTitle: 'ಮಾದರಿ ದೂರನ್ನು ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ:',
      factsTitle: 'ಹೊರತೆಗೆಯಲಾದ ಕಾನೂನು ಸತ್ಯಗಳು',
      draftTitle: 'ರಚಿಸಲಾದ ಕಾನೂನು ಕರಡು',
      copyDraft: 'ಕರಡು ನಕಲಿಸಿ',
      downloadDraft: 'ಪಠ್ಯ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
      complainant: 'ದೂರುದಾರ / ಸಂತ್ರಸ್ತ ವ್ಯಕ್ತಿ',
      oppositeParty: 'ಎದುರು ಪಕ್ಷ / ಮಾರಾಟಗಾರ',
      productService: 'ವಿವಾದಿತ ಉತ್ಪನ್ನ / ಸೇವೆ',
      amount: 'ವ್ಯವಹಾರದ ಮೊತ್ತ',
      incidentDate: 'ಘಟನೆ / ಖರೀದಿಸಿದ ದಿನಾಂಕ',
      defectIssue: 'ಮುಖ್ಯ ದೋಷ / ಸೇವಾ ಕೊರತೆ',
      reliefClaimed: 'ಬೇಡಿದ ಪರಿಹಾರ / ನಷ್ಟ ಪರಿಹಾರ',
    },
    summarizer: {
      title: 'ದಾಖಲೆ ಸಾರಾಂಶ & ವಿವರಣೆ',
      subtitle: 'ಕಾನೂನು ದಾಖಲೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ನ್ಯಾಯಮಿತ್ರ ನಿಯಮಗಳು, ಅಪಾಯಗಳು ಮತ್ತು ಮುಂದಿನ ಹಂತಗಳನ್ನು ಸರಳ ಭಾಷೆಯಲ್ಲಿ ವಿವರಿಸುತ್ತದೆ.',
      uploadTitle: 'ಕಾನೂನು ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ ಡ್ರ್ಯಾಗ್ ಮಾಡಿ',
      uploadDesc: 'ಬೆಂಬಲಿತ ಮಾದರಿಗಳು: PDF, DOCX, TXT',
      pasteLabel: 'ಅಥವಾ ದಾಖಲೆಯ ಪಠ್ಯವನ್ನು ಕೆಳಗೆ ಅಂಟಿಸಿ:',
      pastePlaceholder: 'ಬಾಡಿಗೆ ಒಪ್ಪಂದ, ಉದ್ಯೋಗ ಒಪ್ಪಂದ, ಕಾನೂನು ನೋಟಿಸ್ ಅಥವಾ ನಿಯಮಗಳನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ...',
      clearBtn: 'ತೆರವುಗೊಳಿಸಿ',
      summarizeBtn: 'ದಾಖಲೆ ಸಾರಾಂಶ ರಚಿಸಿ',
      summarizing: 'ಸರಳ ಭಾಷೆಯಲ್ಲಿ ದಾಖಲೆಯನ್ನು ವಿವರಿಸಲಾಗುತ್ತಿದೆ...',
      resultTitle: 'ದಾಖಲೆ ವಿವರಣೆ',
      summaryTitle: 'ದಾಖಲೆ ಸಾರಾಂಶ',
      importantPointsTitle: 'ಪ್ರಮುಖ ಅಂಶಗಳು',
      importantClausesTitle: 'ಪ್ರಮುಖ ಷರತ್ತುಗಳು',
      risksTitle: 'ಸಂಭಾವ್ಯ ಅಪಾಯಗಳು / ಪರಿಶೀಲಿಸಬೇಕಾದ ಅಂಶಗಳು',
      nextStepsTitle: 'ಮುಂದೆ ನಾನು ಏನು ಮಾಡಬೇಕು?',
      copyBtn: 'ಸಾರಾಂಶ ನಕಲಿಸಿ',
      copiedBtn: 'ನಕಲಿಸಲಾಗಿದೆ',
      downloadBtn: 'ಡೌನ್‌ಲೋಡ್',
    },
    speech: {
      title: 'ಬಹುಭಾಷಾ ಧ್ವನಿ ಮತ್ತು ಮಾತು ಸಹಾಯಕ',
      subtitle: 'ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಮಾತನಾಡಿ ನಿಮ್ಮ ಕಾನೂನು ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ ಮತ್ತು ಆಡಿಯೋ ಉತ್ತರಗಳನ್ನು ಪಡೆಯಿರಿ.',
      sttTitle: 'ಮೈಕ್ರೊಫೋನ್ ಸ್ಪೀಚ್-ಟು-ಟೆಕ್ಸ್ಟ್ ಸ್ಟುಡಿಯೋ',
      ttsTitle: 'ಟೆಕ್ಸ್ಟ್-ಟು-ಸ್ಪೀಚ್ ಪರೀಕ್ಷೆ',
      startRecord: 'ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ',
      stopRecord: 'ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ',
      listeningIn: 'ಆಲಿಸುತ್ತಿದೆ:',
      speakClear: 'ಮೈಕ್ರೊಫೋನ್‌ನಲ್ಲಿ ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ.',
      previewLabel: 'ಗುರುತಿಸಲಾದ ಮಾತಿನ ಲೈವ್ ಮುನ್ನೋಟ:',
      sendToChat: 'ಕಾನೂನು ಚಾಟ್‌ಗೆ ಕಳುಹಿಸಿ',
      sendToDraft: 'ದೂರು ಕರಡಿಗೆ ಕಳುಹಿಸಿ',
      readAloud: 'ಓದಿ ಹೇಳಿ',
      stopVoice: 'ಧ್ವನಿ ನಿಲ್ಲಿಸಿ',
      wordsCount: 'ಪದಗಳನ್ನು ಗುರುತಿಸಲಾಗಿದೆ',
    },
  },
  Malayalam: {
    appName: 'ന്യായമിത്ര',
    tagline: 'ഇന്ത്യൻ നിയമ സഹായവും ഡ്രാഫ്റ്റിംഗ് സംവിധാനവും',
    disclaimer: 'നിരാകരണം: ഇത് വിവരദായക ആവശ്യങ്ങൾക്ക് മാത്രമുള്ള ഒരു AI നിയമപരമായ ഡ്രാഫ്റ്റാണ്. ഔദ്യോഗിക പ്രതിനിധാനത്തിന് ഒരു അഭിഭാഷകനെ സമീപിക്കുക.',
    disclaimerDetail: 'ഉപഭോക്തൃ സംരക്ഷണ നിയമം 2019, ഭാരതീയ ന്യായ സംഹിത 2023, RTI നിയമം 2005 എന്നിവ അടിസ്ഥാനമാക്കി.',
    nav: {
      dashboard: 'ഡാഷ്‌ബോർഡ്',
      complaintToDraft: 'പരാതി → ഡ്രാഫ്റ്റ്',
      chat: 'നിയമ ചാറ്റ്',
      summarizer: 'രേഖാ സംഗ്രഹം',
      drafts: 'നിയമ ഡ്രാഫ്റ്റുകൾ',
      documents: 'രേഖകൾ',
      speechAssistant: 'വോയ്‌സ് അസിസ്റ്റന്റ്',
    },
    header: {
      language: 'ഭാഷ',
      exportDoc: 'ഡോക്യുമെന്റ് എക്സ്പോർട്ട് ചെയ്യുക',
    },
    dashboard: {
      badge: 'AI ഇന്ത്യൻ ലീഗൽ അസിസ്റ്റന്റ്',
      heroTitle: 'ന്യായമിത്ര നിയമ വിവരങ്ങളും ഡ്രാഫ്റ്റിംഗും',
      heroDesc: 'ഇന്ത്യൻ നിയമപരമായ അവകാശങ്ങൾ മനസ്സിലാക്കുക, കോടതിക്ക് അനുയോജ്യമായ നിയമ ഡ്രാഫ്റ്റുകൾ തയ്യാറാക്കുക, ഉപഭോക്തൃ സംരക്ഷണ നിയമം 2019, BNS 2023, RTI എന്നിവയെക്കുറിച്ച് അറിയുക.',
      draftComplaintBtn: 'പരാതി ഡ്രാഫ്റ്റ് ചെയ്യുക',
      askQuestionBtn: 'നിയമപരമായ ചോദ്യം ചോദിക്കുക',
      modulesTitle: 'നിയമ സഹായ മൊഡ്യൂളുകൾ',
      modulesSubtitle: 'ആരംഭിക്കാൻ ഒരു ഉപകരണം തിരഞ്ഞെടുക്കുക',
      sampleQuestionsTitle: 'പതിവായി ചോദിക്കുന്ന നിയമ ചോദ്യങ്ങൾ',
      sampleComplaintsTitle: 'മാതൃകാ പൗര പരാതികൾ',
      trustStatutory: 'ആധികാരിക ഇന്ത്യൻ നിയമം',
      trustStatutoryDesc: 'ഉപഭോക്തൃ സംരക്ഷണം, ഭാരതീയ ന്യായ സംഹിത, RTI, IT നിയമങ്ങൾ എന്നിവയുടെ അടിസ്ഥാനത്തിൽ.',
      trustCourtFormat: 'സ്റ്റാൻഡേർഡ് കോടതി ഫോർമാറ്റുകൾ',
      trustCourtFormatDesc: 'നിയമപരമായ നോട്ടീസുകൾ, സത്യവാങ്മൂലങ്ങൾ, ഉപഭോക്തൃ ഹർജികൾ, RTI അപേക്ഷകൾ എന്നിവ തയ്യാറാക്കുന്നു.',
      trustConfidential: 'രഹസ്യാത്മകവും സുരക്ഷിതവും',
      trustConfidentialDesc: 'നിങ്ങളുടെ നിയമപരമായ ചോദ്യങ്ങളും പരാതി വിശദാംശങ്ങളും സുരക്ഷിതമായി സൂക്ഷിക്കുന്നു.',
    },
    chat: {
      title: 'ലീഗൽ ചാറ്റ് അസിസ്റ്റന്റ്',
      subtitle: 'ഇന്ത്യൻ നിയമങ്ങൾ, ക്രിമിനൽ കോഡുകൾ, ഉപഭോക്തൃ അവകാശങ്ങൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കുക.',
      greeting: 'നമസ്കാരം! ഞാൻ ന്യായമിത്ര, നിങ്ങളുടെ AI നിയമ സഹായി. ഉപഭോക്തൃ സംരക്ഷണ നിയമം 2019, ഭാരതീയ ന്യായ സംഹിത 2023, RTI നിയമം 2005 എന്നിവയിൽ നിങ്ങൾക്ക് സഹായം നൽകാൻ കഴിയും. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?',
      placeholder: 'നിങ്ങളുടെ നിയമ ചോദ്യം ചോദിക്കുക (ഉദാ. BNS 2023 പ്രകാരം മോഷണത്തിനുള്ള ശിക്ഷ എന്താണ്?)...',
      sendBtn: 'അയക്കുക',
      clearBtn: 'റീസെറ്റ് ചെയ്യുക',
      voiceBtn: 'വോയ്‌സ് ഇൻപുട്ട്',
      sourcesTitle: 'നിയമപരമായ സ്രോതസ്സുകളും വകുപ്പുകളും',
      plainSummaryTitle: 'ലളിതമായ സംഗ്രഹം',
      samplePromptLabel: 'വേഗത്തിലുള്ള ചോദ്യങ്ങൾ:',
      answeringIn: 'മറുപടി നൽകുന്ന ഭാഷ:',
    },
    complaintToDraft: {
      title: 'പരാതി → ലീഗൽ ഡ്രാഫ്റ്റ് ജനറേറ്റർ',
      subtitle: 'നിങ്ങളുടെ പരാതി ലളിതമായ വാക്കുകളിൽ വിവരിക്കുക. ന്യായമിത്ര നിയമ വസ്തുതകൾ വേർതിരിച്ച് നോട്ടീസ് തയ്യാറാക്കും.',
      inputLabel: 'നിങ്ങളുടെ പരാതി / തർക്ക വിശദാംശങ്ങൾ രേഖപ്പെടുത്തുക:',
      inputPlaceholder: 'ഉദാ. ഞാൻ 2026 ജൂൺ 10 ന് XYZ ഇലക്ട്രോണിക്സിൽ നിന്ന് ₹45,000 ന് ഒരു റഫ്രിജറേറ്റർ വാങ്ങി. 12 ദിവസത്തിന് ശേഷം അത് തകരാറിലായി, അവർ നന്നാക്കാനോ പണം തിരികെ നൽകാനോ വിസമ്മതിച്ചു...',
      generateBtn: 'വിവരങ്ങൾ എടുത്ത് ഡ്രാഫ്റ്റ് തയ്യാറാക്കുക',
      generating: 'പരാതി വിശകലനം ചെയ്ത് ഡ്രാഫ്റ്റ് തയ്യാറാക്കുന്നു...',
      sampleTitle: 'മാതൃകാ പരാതി ലോഡ് ചെയ്യാൻ ക്ലിക്ക് ചെയ്യുക:',
      factsTitle: 'വേർതിരിച്ചെടുത്ത നിയമപരമായ വസ്തുതകൾ',
      draftTitle: 'തയ്യാറാക്കിയ ലീഗൽ ഡ്രാഫ്റ്റ്',
      copyDraft: 'ഡ്രാഫ്റ്റ് കോപ്പി ചെയ്യുക',
      downloadDraft: 'ഡൗൺലോഡ് ചെയ്യുക',
      complainant: 'പരാതിക്കാരൻ / ഇരയായ വ്യക്തി',
      oppositeParty: 'എതിർകക്ഷി / വിൽപനക്കാരൻ',
      productService: 'തർക്കത്തിലുള്ള ഉൽപ്പന്നം / സേവനം',
      amount: 'ഇടപാട് തുക',
      incidentDate: 'സംഭവ / വാങ്ങിയ തീയതി',
      defectIssue: 'പ്രധാന തകരാർ / സേവന ന്യൂനത',
      reliefClaimed: 'ആവശ്യപ്പെട്ട പരിഹാരം / നഷ്ടപരിഹാരം',
    },
    summarizer: {
      title: 'ഡോക്യുമെന്റ് സംഗ്രഹം & വിശദീകരണം',
      subtitle: 'നിയമപരമായ രേഖ അപ്‌ലോഡ് ചെയ്യുക, ന്യായമിത്ര വ്യവസ്ഥകളും അപകടസാധ്യതകളും ലളിതമായ ഭാഷയിൽ വിശദീകരിക്കും.',
      uploadTitle: 'നിയമപരമായ രേഖ അപ്‌ലോഡ് ചെയ്യാൻ ക്ലിക്ക് ചെയ്യുക അല്ലെങ്കിൽ ഡ്രാഗ് ചെയ്യുക',
      uploadDesc: 'പിന്തുണയ്ക്കുന്ന ഫോർമാറ്റുകൾ: PDF, DOCX, TXT',
      pasteLabel: 'അല്ലെങ്കിൽ രേഖയുടെ വാചകം താഴെ പേസ്റ്റ് ചെയ്യുക:',
      pastePlaceholder: 'വാടക കരാർ, തൊഴിൽ കരാർ, നിയമപരമായ നോട്ടീസ്, വായ്പാ രേഖ എന്നിവ ഇവിടെ പേസ്റ്റ് ചെയ്യുക...',
      clearBtn: 'മായ്ക്കുക',
      summarizeBtn: 'ഡോക്യുമെന്റ് സംഗ്രഹിക്കുക',
      summarizing: 'ലളിതമായ ഭാഷയിൽ രേഖ വിശദീകരിക്കുന്നു...',
      resultTitle: 'ഡോക്യുമെന്റ് വിശദീകരണം',
      summaryTitle: 'ഡോക്യുമെന്റ് സംഗ്രഹം',
      importantPointsTitle: 'പ്രധാന പോയിന്റുകൾ',
      importantClausesTitle: 'പ്രധാന വ്യവസ്ഥകൾ',
      risksTitle: 'സാധ്യമായ അപകടസാധ്യതകൾ / പരിശോധിക്കേണ്ട കാര്യങ്ങൾ',
      nextStepsTitle: 'അടുത്തതായി ഞാൻ എന്ത് ചെയ്യണം?',
      copyBtn: 'സംഗ്രഹം കോപ്പി ചെയ്യുക',
      copiedBtn: 'കോപ്പി ചെയ്തു',
      downloadBtn: 'ഡൗൺലോഡ്',
    },
    speech: {
      title: 'ബഹുഭാഷാ വോയ്‌സ് & സ്പീച്ച് അസിസ്റ്റന്റ്',
      subtitle: 'ഇന്ത്യൻ ഭാഷകളിൽ സംസാരിച്ച് നിങ്ങളുടെ നിയമപരമായ ചോദ്യങ്ങൾ ചോദിക്കുക, ഓഡിയോ ഉത്തരങ്ങൾ കേൾക്കുക.',
      sttTitle: 'മൈക്രോഫോൺ സ്പീച്ച്-ടു-ടെക്സ്റ്റ് സ്റ്റുഡിയോ',
      ttsTitle: 'ടെക്സ്റ്റ്-ടു-സ്പീച്ച് ടെസ്റ്റർ',
      startRecord: 'റെക്കോർഡിംഗ് ആരംഭിക്കുക',
      stopRecord: 'റെക്കോർഡിംഗ് നിർത്തുക',
      listeningIn: 'കേൾക്കുന്നു:',
      speakClear: 'മൈക്രോഫോണിൽ വ്യക്തമായി സംസാരിക്കുക.',
      previewLabel: 'തിരിച്ചറിഞ്ഞ സംസാരത്തിന്റെ പ്രിവ്യൂ:',
      sendToChat: 'ലീഗൽ ചാറ്റിലേക്ക് അയക്കുക',
      sendToDraft: 'പരാതി ഡ്രാഫ്റ്റിലേക്ക് അയക്കുക',
      readAloud: 'വായിച്ചു കേൾപ്പിക്കുക',
      stopVoice: 'ശബ്ദം നിർത്തുക',
      wordsCount: 'വാക്കുകൾ തിരിച്ചറിഞ്ഞു',
    },
  },
  Marathi: {
    appName: 'न्यायमित्र',
    tagline: 'भारतीय कायदेशीर सहाय्य व मसुदा प्रणाली',
    disclaimer: 'अस्वीकरण: हे केवळ माहितीच्या उद्देशाने तयार केलेले AI-सहाय्यित कायदेशीर मसुदा आहे. औपचारिक प्रतिनिधित्वासाठी वकिलाचा सल्ला घ्या.',
    disclaimerDetail: 'ग्राहक संरक्षण कायदा २०१९, भारतीय न्याय संहिता २०२३ आणि माहिती अधिकार कायदा २००५ वर आधारित.',
    nav: {
      dashboard: 'डॅशबोर्ड',
      complaintToDraft: 'तक्रार → मसुदा',
      chat: 'कायदेशीर चॅट',
      summarizer: 'दस्तऐवज सारांश',
      drafts: 'कायदेशीर मसुदे',
      documents: 'दस्तऐवज',
      speechAssistant: 'आवाज सहाय्यक',
    },
    header: {
      language: 'भाषा',
      exportDoc: 'दस्तऐवज निर्यात करा',
    },
    dashboard: {
      badge: 'AI भारतीय कायदेशीर सहाय्यक',
      heroTitle: 'न्यायमित्र कायदेशीर माहिती व मसुदा',
      heroDesc: 'भारतीय कायदेशीर अधिकार समजून घ्या, न्यायालयात सादर करण्यासाठी कायदेशीर मसुदे तयार करा आणि ग्राहक संरक्षण कायदा २०१९, BNS २०२३, RTI कायद्याबद्दल माहिती मिळवा.',
      draftComplaintBtn: 'तक्रारीचा मसुदा तयार करा',
      askQuestionBtn: 'कायदेशीर प्रश्न विचारा',
      modulesTitle: 'कायदेशीर सहाय्य मॉड्यूल्स',
      modulesSubtitle: 'सुरू करण्यासाठी एक साधन निवडा',
      sampleQuestionsTitle: 'वारंवार विचारले जाणारे कायदेशीर प्रश्न',
      sampleComplaintsTitle: 'नागरिकांच्या तक्रारींचे नमुने',
      trustStatutory: 'अधिकृत भारतीय कायदा',
      trustStatutoryDesc: 'ग्राहक संरक्षण कायदा, भारतीय न्याय संहिता, RTI व IT कायद्यावर आधारित.',
      trustCourtFormat: 'मानक न्यायालयीन स्वरूप',
      trustCourtFormatDesc: 'कायदेशीर नोटिसा, प्रतिज्ञापत्रे, ग्राहक याचिका आणि RTI अर्ज तयार करते.',
      trustConfidential: 'गोपनीय आणि सुरक्षित',
      trustConfidentialDesc: 'आपल्या कायदेशीर चौकशी आणि तक्रारींची माहिती सुरक्षित ठेवली जाते.',
    },
    chat: {
      title: 'कायदेशीर चॅट सहाय्यक',
      subtitle: 'भारतीय कायदे, गुन्हेगारी संहिता, ग्राहक अधिकार आणि नियमांविषयी प्रश्न विचारा.',
      greeting: 'नमस्कार! मी न्यायमित्र आहे, तुमचा AI कायदेशीर सहाय्यक. ग्राहक संरक्षण कायदा २०१९, भारतीय न्याय संहिता २०२३ आणि RTI कायदा २००५ अंतर्गत मी आपल्याला मदत करू शकतो. आज मी आपल्याला कशी मदत करू?',
      placeholder: 'तुमचा कायदेशीर प्रश्न विचारा (उदा. BNS २०२३ नुसार चोरीची शिक्षा काय आहे?)...',
      sendBtn: 'पाठवा',
      clearBtn: 'रीसेट करा',
      voiceBtn: 'व्हॉइस इनपुट',
      sourcesTitle: 'कायदेशीर संदर्भ व कलमे',
      plainSummaryTitle: 'सोप्या भाषेतील सारांश',
      samplePromptLabel: 'त्वरित प्रश्न:',
      answeringIn: 'उत्तराची भाषा:',
    },
    complaintToDraft: {
      title: 'तक्रार → कायदेशीर मसुदा जनरेटर',
      subtitle: 'तुमची तक्रार साध्या शब्दांत लिहा. न्यायमित्र कायदेशीर तथ्ये शोधून न्यायालयासाठी नोटीस तयार करेल.',
      inputLabel: 'तुमच्या तक्रारीचा / वादाचा तपशील प्रविष्ट करा:',
      inputPlaceholder: 'उदा. मी १० जून २०२६ रोजी XYZ इलेक्ट्रॉनिक्सकडून ₹४५,००० मध्ये रेफ्रिजरेटर खरेदी केला. १२ दिवसांनंतर तो बंद पडला आणि विक्रेत्याने दुरुस्ती किंवा परतावा देण्यास नकार दिला...',
      generateBtn: 'तथ्ये काढा आणि मसुदा तयार करा',
      generating: 'तक्रारीचे विश्लेषण करून मसुदा तयार होत आहे...',
      sampleTitle: 'नमुना तक्रार लोड करण्यासाठी क्लिक करा:',
      factsTitle: 'काढलेली कायदेशीर तथ्ये',
      draftTitle: 'तयार केलेला कायदेशीर मसुदा',
      copyDraft: 'मसुदा कॉपी करा',
      downloadDraft: 'मजकूर डाउनलोड करा',
      complainant: 'तक्रारदार / पीडित व्यक्ती',
      oppositeParty: 'विरुद्ध पक्ष / विक्रेता',
      productService: 'वादग्रस्त उत्पादन / सेवा',
      amount: 'व्यवहाराची रक्कम',
      incidentDate: 'घटना / खरेदीची तारीख',
      defectIssue: 'मुख्य दोष / सेवेतील त्रुटी',
      reliefClaimed: 'मागितलेली भरपाई / दिलासा',
    },
    summarizer: {
      title: 'दस्तऐवज सारांश व स्पष्टीकरण',
      subtitle: 'कायदेशीर दस्तऐवज अपलोड करा आणि न्यायमित्र साध्या भाषेत अटी, जोखीम आणि पुढील पावलांचे स्पष्टीकरण देईल.',
      uploadTitle: 'कायदेशीर दस्तऐवज अपलोड करण्यासाठी क्लिक करा किंवा ड्रॅग करा',
      uploadDesc: 'समर्थित स्वरूप: PDF, DOCX, TXT',
      pasteLabel: 'किंवा खाली दस्तऐवजाचा मजकूर पेस्ट करा:',
      pastePlaceholder: 'भाडेकरार, रोजगार करार, कायदेशीर नोटीस, कर्ज दस्तऐवज किंवा अटी येथे पेस्ट करा...',
      clearBtn: 'साफ करा',
      summarizeBtn: 'दस्तऐवजाचा सारांश बनवा',
      summarizing: 'साध्या भाषेत दस्तऐवजाचे स्पष्टीकरण दिले जात आहे...',
      resultTitle: 'दस्तऐवजाचे स्पष्टीकरण',
      summaryTitle: 'दस्तऐवज सारांश',
      importantPointsTitle: 'महत्त्वाचे मुद्दे',
      importantClausesTitle: 'महत्त्वाची कलमे व अटी',
      risksTitle: 'संभाव्य जोखीम / तपासण्यासारख्या गोष्टी',
      nextStepsTitle: 'पुढे काय पाऊल उचलावे?',
      copyBtn: 'सारांश कॉपी करा',
      copiedBtn: 'कॉपी झाले',
      downloadBtn: 'डाउनलोड',
    },
    speech: {
      title: 'बहुभाषिक आवाज व भाषण सहाय्यक',
      subtitle: 'भारतीय भाषांमध्ये बोलून आपले कायदेशीर प्रश्न विचारा आणि ऑडिओ उत्तरे ऐका.',
      sttTitle: 'मायक्रोफोन स्पीच-टू-टेक्स्ट स्टुडिओ',
      ttsTitle: 'टेक्स्ट-टू-स्पीच चाचणी',
      startRecord: 'रेकॉर्डिंग सुरू करा',
      stopRecord: 'रेकॉर्डिंग थांबवा',
      listeningIn: 'ऐकत आहे:',
      speakClear: 'मायक्रोफोनमध्ये स्पष्ट बोला.',
      previewLabel: 'ओळखलेल्या भाषणाचे थेट पूर्वावलोकन:',
      sendToChat: 'कायदेशीर चॅटवर पाठवा',
      sendToDraft: 'तक्रार मसुद्यावर पाठवा',
      readAloud: 'वाचून दाखवा',
      stopVoice: 'आवाज थांबवा',
      wordsCount: 'शब्द ओळखले गेले',
    },
  },
  Bengali: {
    appName: 'ন্যায়মিত্র',
    tagline: 'ভারতীয় আইনি সহায়তা ও খসড়া প্রস্তুতকরণ ব্যবস্থা',
    disclaimer: 'দাবিত্যাগ: এটি শুধুমাত্র তথ্যের উদ্দেশ্যে তৈরি একটি AI-সহায়তাপ্রাপ্ত আইনি খসড়া। আনুষ্ঠানিক প্রতিনিধিত্বের জন্য আইনজীবীর পরামর্শ নিন।',
    disclaimerDetail: 'ভোক্তা সুরক্ষা আইন ২০১৯, ভারতীয় ন্যায় সংহিতা ২০২৩ এবং তথ্য অধিকার আইন ২০০৫-এর উপর ভিত্তি করে।',
    nav: {
      dashboard: 'ড্যাশবোর্ড',
      complaintToDraft: 'অভিযোগ → খসড়া',
      chat: 'আইনি চ্যাট',
      summarizer: 'নথি সারসংক্ষেপ',
      drafts: 'আইনি খসড়া',
      documents: 'নথিপত্র',
      speechAssistant: 'ভয়েস সহকারী',
    },
    header: {
      language: 'ভাষা',
      exportDoc: 'নথি এক্সপোর্ট করুন',
    },
    dashboard: {
      badge: 'AI ভারতীয় আইনি সহকারী',
      heroTitle: 'ন্যায়মিত্র আইনি তথ্য ও খসড়া',
      heroDesc: 'ভারতীয় আইনি অধিকার বুঝুন, আদালতের উপযোগী খসড়া তৈরি করুন এবং ভোক্তা সুরক্ষা আইন ২০১৯, BNS ২০২৩ ও RTI আইন সম্পর্কে জানুন।',
      draftComplaintBtn: 'অভিযোগের খসড়া তৈরি করুন',
      askQuestionBtn: 'আইনি প্রশ্ন জিজ্ঞাসা করুন',
      modulesTitle: 'আইনি সহায়তা মডিউল',
      modulesSubtitle: 'শুরু করতে একটি টুল নির্বাচন করুন',
      sampleQuestionsTitle: 'সচরাচর জিজ্ঞাসিত আইনি প্রশ্ন',
      sampleComplaintsTitle: 'নাগরিক অভিযোগের নমুনা',
      trustStatutory: 'প্রামাণ্য ভারতীয় আইন',
      trustStatutoryDesc: 'ভোক্তা সুরক্ষা, ভারতীয় ন্যায় সংহিতা, RTI এবং IT আইনের ভিত্তিতে।',
      trustCourtFormat: 'আদালতের আদর্শ ফরম্যাট',
      trustCourtFormatDesc: 'আইনি নোটিশ, হলফনামা, ভোক্তা পিটিশন এবং RTI আবেদন প্রস্তুত করে।',
      trustConfidential: 'গোপনীয় ও নিরাপদ',
      trustConfidentialDesc: 'আপনার আইনি অনুসন্ধান ও অভিযোগের তথ্য নিরাপদে সংরক্ষিত থাকে।',
    },
    chat: {
      title: 'আইনি চ্যাট সহকারী',
      subtitle: 'ভারতীয় আইন, ফৌজদারি ধারা, ভোক্তা অধিকার ও নিয়মাবলী সম্পর্কে প্রশ্ন করুন।',
      greeting: 'নমস্কার! আমি ন্যায়মিত্র, আপনার AI আইনি সহকারী। ভোক্তা সুরক্ষা আইন ২০১৯, ভারতীয় ন্যায় সংহিতা ২০২৩ এবং তথ্য অধিকার আইন ২০০৫ অনুসারে আপনাকে সাহায্য করতে পারি। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
      placeholder: 'আপনার আইনি প্রশ্ন লিখুন (যেমন: BNS ২০২৩ অনুযায়ী চুরির শাস্তি কী?)...',
      sendBtn: 'পাঠান',
      clearBtn: 'রিসেট করুন',
      voiceBtn: 'ভয়েস ইনপুট',
      sourcesTitle: 'আইনি ধারা ও উৎস',
      plainSummaryTitle: 'সহজ ভাষায় সারসংক্ষেপ',
      samplePromptLabel: 'দ্রুত প্রশ্নাবলী:',
      answeringIn: 'উত্তরের ভাষা:',
    },
    complaintToDraft: {
      title: 'অভিযোগ → আইনি খসড়া প্রস্তুতকারক',
      subtitle: 'আপনার অভিযোগ সহজ ভাষায় লিখুন। ন্যায়মিত্র আইনি তথ্য সংগ্রহ করে আইনি নোটিশ বা অভিযোগ প্রস্তুত করবে।',
      inputLabel: 'আপনার অভিযোগের বিবরণ লিখুন:',
      inputPlaceholder: 'যেমন: আমি ১০ জুন ২০২৬ তারিখে XYZ ইলেকট্রনিক্স থেকে ₹৪৫,০০০ মূল্যে একটি ফ্রিজ কিনেছিলাম। ১২ দিন পর এটি কাজ করা বন্ধ করে দেয় এবং বিক্রেতা মেরামত বা টাকা ফেরত দিতে অস্বীকার করে...',
      generateBtn: 'তথ্য সংগ্রহ ও খসড়া তৈরি করুন',
      generating: 'অভিযোগ বিশ্লেষণ করে খসড়া তৈরি হচ্ছে...',
      sampleTitle: 'নমুনা অভিযোগ লোড করতে ক্লিক করুন:',
      factsTitle: 'সংগৃহীত আইনি তথ্য',
      draftTitle: 'প্রস্তুতকৃত আইনি খসড়া',
      copyDraft: 'খসড়া কপি করুন',
      downloadDraft: 'টেক্সট ডাউনলোড করুন',
      complainant: 'অভিযোগকারী / ক্ষতিগ্রস্ত পক্ষ',
      oppositeParty: 'বিবাদী পক্ষ / বিক্রেতা',
      productService: 'বিতর্কিত পণ্য / পরিষেবা',
      amount: 'লেনদেনের পরিমাণ',
      incidentDate: 'ঘটনা / ক্রয়ের তারিখ',
      defectIssue: 'মূল ত্রুটি / পরিষেবার ঘাটতি',
      reliefClaimed: 'দাবিকৃত প্রতিকার / ক্ষতিপূরণ',
    },
    summarizer: {
      title: 'নথি সারসংক্ষেপ ও ব্যাখ্যা',
      subtitle: 'আইনি নথি আপলোড করুন ਅਤੇ ন্যায়মিত্র সহজ ভাষায় শর্তাবলী, ঝুঁকি ও পরবর্তী পদক্ষেপগুলি ব্যাখ্যা করবে।',
      uploadTitle: 'আইনি নথি আপলোড করতে ক্লিক করুন বা টেনে আনুন',
      uploadDesc: 'সমর্থিত ফরম্যাট: PDF, DOCX, TXT',
      pasteLabel: 'অথবা নিচে নথির টেক্সট পেস্ট করুন:',
      pastePlaceholder: 'ভাড়া চুক্তি, কর্মসংস্থান চুক্তি, আইনি নোটিশ, ঋণ নথি বা শর্তাবলী এখানে পেস্ট করুন...',
      clearBtn: 'মুছে ফেলুন',
      summarizeBtn: 'নথির সারসংক্ষেপ করুন',
      summarizing: 'সহজ ভাষায় নথির ব্যাখ্যা প্রস্তুত হচ্ছে...',
      resultTitle: 'নথির ব্যাখ্যা',
      summaryTitle: 'নথির সারসংক্ষেপ',
      importantPointsTitle: 'গুরুত্বপূর্ণ পয়েন্ট',
      importantClausesTitle: 'গুরুত্বপূর্ণ ধারাসমূহ',
      risksTitle: 'সম্ভাব্য ঝুঁকি / পরীক্ষা করার মতো বিষয়',
      nextStepsTitle: 'এরপর আমার কী করা উচিত?',
      copyBtn: 'সারসংক্ষেপ কপি করুন',
      copiedBtn: 'কপি করা হয়েছে',
      downloadBtn: 'ডাউনলোড',
    },
    speech: {
      title: 'বহুভাষিক ভয়েস ও স্পিচ সহকারী',
      subtitle: 'ভারতীয় ভাষায় কথা বলে আপনার আইনি প্রশ্ন জিজ্ঞাসা করুন এবং অডিও উত্তর শুনুন।',
      sttTitle: 'মাইক্রোফোন স্পিচ-টু-টেক্সট স্টুডিও',
      ttsTitle: 'টেক্সট-টু-স্পীচ পরীক্ষা',
      startRecord: 'রেকর্ডিং শুরু করুন',
      stopRecord: 'রেকর্ডিং বন্ধ করুন',
      listeningIn: 'শুনছে:',
      speakClear: 'মাইক্রোফোনে স্পষ্ট কথা বলুন।',
      previewLabel: 'শনাক্তকৃত কথার লাইভ প্রিভিউ:',
      sendToChat: 'আইনি চ্যাটে পাঠান',
      sendToDraft: 'অভিযোগ খসড়ায় পাঠান',
      readAloud: 'পড়ে শোনান',
      stopVoice: 'ভয়েস বন্ধ করুন',
      wordsCount: 'শব্দ শনাক্ত করা হয়েছে',
    },
  },
};

export const MULTILINGUAL_SAMPLE_QUERIES: Record<SupportedLanguage, Array<{ label: string; text: string }>> = {
  English: [
    { label: 'Punishment for theft', text: 'What is the punishment for theft under Bharatiya Nyaya Sanhita (BNS) 2023?' },
    { label: 'Defective Refrigerator Refund', text: 'What remedies does a consumer have under Consumer Protection Act 2019 if a seller refuses refund for a defective appliance?' },
    { label: 'RTI 30-day response', text: 'What is the mandatory time limit for a Public Information Officer (PIO) to reply under the RTI Act, 2005?' },
    { label: 'Rental security deposit', text: 'What is the maximum security deposit a residential landlord can demand under Model Tenancy laws?' },
    { label: 'Online Identity Theft', text: 'Under what section of the Information Technology Act 2000 is online identity theft and financial phishing punishable?' },
  ],
  Hindi: [
    { label: 'चोरी की सजा (BNS 2023)', text: 'भारतीय न्याय संहिता 2023 (BNS) की धारा 303 के तहत चोरी के लिए क्या सजा है?' },
    { label: 'दोषपूर्ण सामान का रिफंड', text: 'उपभोक्ता संरक्षण अधिनियम 2019 के तहत खराब उत्पाद के बदले रिफंड न मिलने पर उपभोक्ता के पास क्या कानूनी उपाय हैं?' },
    { label: 'RTI उत्तर की समय सीमा', text: 'सूचना का अधिकार (RTI) अधिनियम 2005 के तहत लोक सूचना अधिकारी को कितने दिनों में जवाब देना अनिवार्य है?' },
    { label: 'मकान मालिक द्वारा सिक्योरिटी डिपॉजिट', text: 'मॉडल टेनेंसी नियमों के अनुसार आवासीय किरायेदार से मकान मालिक अधिकतम कितनी सिक्योरिटी राशि ले सकता है?' },
    { label: 'ऑनलाइन वित्तीय धोखाधड़ी', text: 'आईटी अधिनियम 2000 और आरबीआई नियमों के तहत अनधिकृत बैंक डेबिट के मामले में क्या कदम उठाने चाहिए?' },
  ],
  Telugu: [
    { label: 'దొంగతనానికి శిక్ష (BNS 2023)', text: 'భారతీయ న్యాయ సంహిత 2023 (BNS) సెక్షన్ 303 ప్రకారం దొంగతనానికి విధించే శిక్ష ఏమిటి?' },
    { label: 'లోపభూయిష్ట వస్తువు రీఫండ్', text: 'వినియోగదారుల రక్షణ చట్టం 2019 ప్రకారం లోపభూయిష్ట వస్తువుకు రీఫండ్ ఇవ్వని వ్యాపారిపై ఎలాంటి చర్యలు తీసుకోవచ్చు?' },
    { label: 'RTI సమాధాన సమయ పరిమితి', text: 'సమాచార హక్కు చట్టం (RTI) 2005 ప్రకారం పబ్లిక్ ఇన్ఫర్మేషన్ ఆఫీసర్ ఎన్ని రోజుల్లో సమాచారం ఇవ్వాలి?' },
    { label: 'అద్దె సెక్యూరిటీ డిపాజిట్', text: 'మోడల్ టెనెన్సీ నిబంధనల ప్రకారం రెసిడెన్షియల్ అద్దెదారు నుండి యజమాని గరిష్టంగా ఎంత సెక్యూరిటీ డిపాజిట్ తీసుకోవచ్చు?' },
    { label: 'ఆన్‌లైన్ సైబర్ మోసం', text: 'IT చట్టం 2000 మరియు RBI మార్గదర్శకాల ప్రకారం అనధికారిక బ్యాంక్ లావాదేవీలపై ఎలాంటి రక్షణ ఉంటుంది?' },
  ],
  Tamil: [
    { label: 'திருட்டுக்கான தண்டனை (BNS 2023)', text: 'பாரதிய நியாய சன்ஹிதா 2023 பிரிவு 303-ன் கீழ் திருட்டுக்கு என்ன தண்டனை?' },
    { label: 'பழுதான பொருளுக்கு பணத்தைத் திரும்பப் பெறுதல்', text: 'நுகர்வோர் பாதுகாப்பு சட்டம் 2019-ன் கீழ் பழுதான பொருளுக்கு விற்பனையாளர் பணத்தைத் திரும்பத் தர மறுத்தால் என்ன நிவாரணம் உண்டு?' },
    { label: 'RTI பதில் அளிக்கும் கால வரம்பு', text: 'தகவல் அறியும் உரிமை சட்டம் 2005-ன் கீழ் பொது தகவல் அதிகாரி எத்தனை நாட்களுக்குள் பதிலளிக்க வேண்டும்?' },
    { label: 'வாடகை பாதுகாப்பு வைப்புத்தொகை', text: 'மாதிரி வாடகை விதிகளின் கீழ் நில உரிமையாளர் குடியிருப்பு வாடகைதாரரிடம் அதிகபட்சமாக எவ்வளவு முன்பணம் கோரலாம்?' },
    { label: 'இணையதள சைபர் மோசடி', text: 'தகவல் தொழில்நுட்ப சட்டம் 2000-ன் கீழ் இணையதள நிதி மோசடிகளுக்கு என்ன சட்ட தீர்வு உள்ளது?' },
  ],
  Kannada: [
    { label: 'ಕಳ್ಳತನಕ್ಕೆ ಶಿಕ್ಷೆ (BNS 2023)', text: 'ಭಾರತೀಯ ನ್ಯಾಯ ಸಂಹಿತೆ 2023 (BNS) ಸೆಕ್ಷನ್ 303 ರ ಅಡಿಯಲ್ಲಿ ಕಳ್ಳತನಕ್ಕೆ ಯಾವ ಶಿಕ್ಷೆ ವಿಧಿಸಲಾಗುತ್ತದೆ?' },
    { label: 'ದೋಷಪೂರಿತ ವಸ್ತು ಮರುಪಾವತಿ', text: 'ಗ್ರಾಹಕರ ರಕ್ಷಣಾ ಕಾಯ್ದೆ 2019 ರ ಪ್ರಕಾರ ದೋಷಪೂರಿತ ಉತ್ಪನ್ನಕ್ಕೆ ಹಣ ಮರುಪಾವತಿಸದ ವ್ಯಾಪಾರಿಯ ವಿರುದ್ಧ ಯಾವ ಪರಿಹಾರಗಳಿವೆ?' },
    { label: 'RTI ಉತ್ತರದ ಸಮಯ ಮಿತಿ', text: 'ಮಾಹಿತಿ ಹಕ್ಕು ಕಾಯ್ದೆ (RTI) 2005 ರ ಅಡಿಯಲ್ಲಿ ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ ಅಧಿಕಾರಿಯು ಎಷ್ಟು ದಿನಗಳಲ್ಲಿ ಮಾಹಿತಿ ನೀಡಬೇಕು?' },
    { label: 'ಬಾಡಿಗೆ ಭದ್ರತಾ ಠೇವಣಿ', text: 'ಮಾದರಿ ಬಾಡಿಗೆ ನಿಯಮಗಳ ಪ್ರಕಾರ ವಸತಿ ಬಾಡಿಗೆದಾರರಿಂದ ಮಾಲೀಕರು ಗರಿಷ್ಠ ಎಷ್ಟು ಭದ್ರತಾ ಠೇವಣಿ ಪಡೆಯಬಹುದು?' },
    { label: 'ಆನ್‌ಲೈನ್ ಸೈಬರ್ ವಂಚನೆ', text: 'ಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ ಕಾಯ್ದೆ 2000 ಮತ್ತು RBI ನಿಯಮಗಳ ಅಡಿಯಲ್ಲಿ ಅನಧಿಕೃತ ಬ್ಯಾಂಕ್ ವಹಿವಾಟುಗಳಿಗೆ ಯಾವ ರಕ್ಷಣೆ ಇದೆ?' },
  ],
  Malayalam: [
    { label: 'മോഷണത്തിനുള്ള ശിക്ഷ (BNS 2023)', text: 'ഭാരതീയ ന്യായ സംഹിത 2023 (BNS) സെക്ഷൻ 303 പ്രകാരം മോഷണത്തിനുള്ള ശിക്ഷ എന്താണ്?' },
    { label: 'കേടായ ഉൽപ്പന്നത്തിന്റെ റീഫണ്ട്', text: 'ഉപഭോക്തൃ സംരക്ഷണ നിയമം 2019 പ്രകാരം കേടായ ഉൽപ്പന്നത്തിന് പണം തിരികെ നൽകാത്ത വ്യാപാരിക്കെതിരെ എന്ത് നടപടിയെടുക്കാം?' },
    { label: 'RTI മറുപടി സമയപരിധി', text: 'വിവരാവകാശ നിയമം (RTI) 2005 പ്രകാരം പബ്ലിക് ഇൻഫർമേഷൻ ഓഫീസർ എത്ര ദിവസത്തിനുള്ളിൽ മറുപടി നൽകണം?' },
    { label: 'വാടക സെക്യൂരിറ്റി ഡെപ്പോസിറ്റ്', text: 'മോഡൽ വാടക നിയമപ്രകാരം താമസ ആവശ്യങ്ങൾക്ക് പരമാവധി എത്ര തുക സെക്യൂരിറ്റിയായി ഈടാക്കാം?' },
    { label: 'ഓൺലൈൻ സൈബർ തട്ടിപ്പ്', text: 'IT നിയമം 2000 പ്രകാരം ഓൺലൈൻ ബാങ്കിംഗ് തട്ടിപ്പുകൾക്കെതിരെ എന്ത് നിയമപരമായ പരിഹാരമാണുള്ളത്?' },
  ],
  Marathi: [
    { label: 'चोरीची शिक्षा (BNS २०२३)', text: 'भारतीय न्याय संहिता २०२३ (BNS) कलम ३०३ अन्वये चोरीसाठी काय शिक्षा आहे?' },
    { label: 'दोषपूर्ण उत्पादनाचा परतावा', text: 'ग्राहक संरक्षण कायदा २०१९ नुसार सदोष वस्तूचा परतावा न देणाऱ्या विक्रेत्याविरुद्ध काय कायदेशीर उपाय आहेत?' },
    { label: 'RTI उत्तराची मुदत', text: 'माहिती अधिकार कायदा २००५ अन्वये जन माहिती अधिकाऱ्याने किती दिवसांत उत्तर देणे बंधनकारक आहे?' },
    { label: 'भाडे अनामत रक्कम मर्यादा', text: 'मॉडेल भाडेपट्टा नियमांनुसार घरमालक जास्तीत जास्त किती महिन्यांची अनामत रक्कम घेऊ शकतो?' },
    { label: 'सायबर फसवणूक उपाय', text: 'माहिती तंत्रज्ञान कायदा २००० अन्वये ऑनलाइन आर्थिक फसवणुकीविरुद्ध काय कायदेशीर पावले उचलावीत?' },
  ],
  Bengali: [
    { label: 'চুরির শাস্তি (BNS ২০২৩)', text: 'ভারতীয় ন্যায় সংহিতা ২০২৩ (BNS)-এর ধারা ৩০৩ অনুযায়ী চুরির শাস্তি কী?' },
    { label: 'ত্রুটিযুক্ত পণ্যের অর্থ ফেরত', text: 'ভোক্তা সুরক্ষা আইন ২০১৯ অনুযায়ী ত্রুটিযুক্ত পণ্যের টাকা ফেরত না দিলে কী আইনি প্রতিকার পাওয়া যায়?' },
    { label: 'RTI জবাবের সময়সীমা', text: 'তথ্য অধিকার আইন ২০০৫ অনুযায়ী জনতথ্য আধিকারিককে কত দিনের মধ্যে তথ্য প্রদান করতে হয়?' },
    { label: 'ভাড়া সিকিউরিটি ডিপোজিট', text: 'মডেল ভাড়াটে নির্দেশিকা অনুযায়ী বাড়িওয়ালা সর্বাধিক কত মাসের জামানত দাবি করতে পারেন?' },
    { label: 'অনলাইন সাইবার জালিয়াতি', text: 'তথ্যপ্রযুক্তি আইন ২০০০ ও আরবিআই নির্দেশিকা অনুযায়ী অননুমোদিত অনলাইন লেনদেনের বিরুদ্ধে কী প্রতিকার রয়েছে?' },
  ],
};

export const MULTILINGUAL_SAMPLE_COMPLAINTS: Record<SupportedLanguage, Array<{ title: string; text: string }>> = {
  English: [
    {
      title: 'Defective Refrigerator Refund',
      text: 'I purchased a refrigerator for ₹45,000 from XYZ Electronics on 10 June 2026. The refrigerator stopped working after 12 days. The seller refused to repair or replace it despite several requests. I want a refund and compensation.',
    },
    {
      title: 'Unauthorized Online Banking Debits',
      text: 'On 15 July 2026, an unauthorized debit of ₹82,500 was made from my savings account through a fraudulent e-commerce transaction without OTP delivery. The bank is refusing to credit the amount back despite an immediate complaint within 24 hours.',
    },
    {
      title: 'Withholding of Rental Security Deposit',
      text: 'I vacated flat #302 on 31 August 2026 after serving proper 1-month notice. The landlord Mr. Sharma is refusing to refund my security deposit of ₹70,000 citing baseless wear-and-tear damages.',
    },
  ],
  Hindi: [
    {
      title: 'दोषपूर्ण फ्रिज की धनवापसी',
      text: 'मैंने 10 जून 2026 को XYZ इलेक्ट्रॉनिक्स से ₹45,000 में एक फ्रिज खरीदा था। 12 दिनों के बाद फ्रिज ने काम करना बंद कर दिया। कई बार अनुरोध करने के बावजूद विक्रेता ने इसकी मरम्मत करने या बदलने से इनकार कर दिया। मुझे पूरा रिफंड और मुआवजा चाहिए।',
    },
    {
      title: 'अवैध ऑनलाइन बैंक निकासी',
      text: '15 जुलाई 2026 को बिना ओटीपी के मेरे बचत खाते से ₹82,500 की अनधिकृत निकासी हो गई। 24 घंटे के भीतर शिकायत दर्ज कराने के बावजूद बैंक पैसा वापस जमा करने से मना कर रहा है।',
    },
    {
      title: 'मकान मालिक द्वारा अमानत राशि रोकना',
      text: 'मैंने 1 महीने का उचित नोटिस देकर 31 अगस्त 2026 को फ्लैट खाली कर दिया था। मकान मालिक श्री शर्मा बिना किसी कारण ₹70,000 की मेरी सिक्योरिटी डिपॉजिट वापस करने से इनकार कर रहे हैं।',
    },
  ],
  Telugu: [
    {
      title: 'లోపభూయిష్ట ఫ్రిజ్ రీఫండ్',
      text: 'నేను 10 జూన్ 2026న XYZ ఎలక్ట్రానిక్స్ నుండి ₹45,000 కు రిఫ్రిజిరేటర్ కొన్నాను. 12 రోజుల తర్వాత అది పనిచేయడం ఆగిపోయింది. పలుమార్లు అడిగినా వారు రిపేర్ లేదా రీప్లేస్ చేయడానికి నిరాకరించారు. నాకు పూర్తి రీఫండ్ మరియు నష్టపరిహారం కావాలి.',
    },
    {
      title: 'అనధికారిక ఆన్‌లైన్ బ్యాంక్ డెబిట్',
      text: '15 జూలై 2026న ఎటువంటి OTP రాకుండానే నా సేవింగ్స్ ఖాతా నుండి ₹82,500 మోసపూరితంగా కట్ అయ్యాయి. 24 గంటల్లో ఫిర్యాదు చేసినా బ్యాంక్ ఆ మొత్తాన్ని తిరిగి జమ చేయడానికి నిరాకరిస్తోంది.',
    },
    {
      title: 'అద్దె సెక్యూరిటీ డిపాజిట్ నిలిపివేత',
      text: 'నేను 1 నెల నోటీసు ఇచ్చి 31 ఆగస్టు 2026న ఫ్లాట్ ఖాళీ చేశాను. ఇంటి యజమాని ఎలాంటి కారణం లేకుండా నా ₹70,000 సెక్యూరిటీ డిపాజిట్ తిరిగి ఇవ్వడానికి నిరాకరిస్తున్నారు.',
    },
  ],
  Tamil: [
    {
      title: 'பழுதான குளிர்சாதனப் பெட்டி பணத்தைத் திரும்பப் பெறுதல்',
      text: 'நான் 10 ஜூன் 2026 அன்று XYZ எலக்ட்ரானிக்ஸிலிருந்து ₹45,000-க்கு குளிர்சாதனப் பெட்டியை வாங்கினேன். 12 நாட்களுக்குப் பிறகு அது இயங்கவில்லை. பலமுறை கேட்டும் விற்பனையாளர் பழுதுபார்க்க அல்லது மாற்ற மறுத்துவிட்டார். எனக்கு முழு பணமும் இழப்பீடும் வேண்டும்.',
    },
    {
      title: 'அங்கீகரிக்கப்படாத வங்கி பரிவர்த்தனை',
      text: '15 ஜூலை 2026 அன்று OTP வராமலேயே எனது சேமிப்புக் கணக்கிலிருந்து ₹82,500 மோசடியாக எடுக்கப்பட்டது. 24 மணி நேரத்திற்குள் புகார் அளித்தும் வங்கி பணத்தை திரும்ப செலுத்த மறுக்கிறது.',
    },
    {
      title: 'வாடகை முன்பணத்தை திருப்பித் தராமை',
      text: '1 மாத அறிவிப்பு அளித்து 31 ஆகஸ்ட் 2026 அன்று வீட்டை காலி செய்தேன். வீட்டு உரிமையாளர் ₹70,000 வாடகை முன்பணத்தை திருப்பித் தர மறுக்கிறார்.',
    },
  ],
  Kannada: [
    {
      title: 'ದೋಷಪೂರಿತ ರೆಫ್ರಿಜರೇಟರ್ ಮರುಪಾವತಿ',
      text: 'ನಾನು 10 ಜೂನ್ 2026 ರಂದು XYZ ಎಲೆಕ್ಟ್ರಾನಿಕ್ಸ್‌ನಿಂದ ₹45,000 ಕ್ಕೆ ರೆಫ್ರಿಜರೇಟರ್ ಖರೀದಿಸಿದೆ. 12 ದಿನಗಳ ನಂತರ ಅದು ಕೆಲಸ ಮಾಡುವುದನ್ನು ನಿಲ್ಲಿಸಿತು. ಹಲವು ಬಾರಿ ಕೋರಿದರೂ ಮಾರಾಟಗಾರರು ದುರಸ್ತಿ ಮಾಡಲು ಅಥವಾ ಬದಲಾಯಿಸಲು ನಿರಾಕರಿಸಿದರು. ನನಗೆ ಪೂರ್ಣ ಹಣ ಮರುಪಾವತಿ ಮತ್ತು ಪರಿಹಾರ ಬೇಕು.',
    },
    {
      title: 'ಅನಧಿಕೃತ ಆನ್‌ಲೈನ್ ಬ್ಯಾಂಕ್ ವಹಿವಾಟು',
      text: '15 ಜುಲೈ 2026 ರಂದು ಯಾವುದೇ OTP ಬಾರದೆ ನನ್ನ ಉಳಿತಾಯ ಖಾತೆಯಿಂದ ₹82,500 ಕಡಿತಗೊಂಡಿದೆ. 24 ಗಂಟೆಗಳಲ್ಲಿ ದೂರು ನೀಡಿದ್ದರೂ ಬ್ಯಾಂಕ್ ಹಣವನ್ನು ಮರಳಿ ಜಮಾ ಮಾಡಲು ನಿರಾಕರಿಸುತ್ತಿದೆ.',
    },
    {
      title: 'ಬಾಡಿಗೆ ಸೆಕ್ಯೂರಿಟಿ ಠೇವಣಿ ಮರುಪಾವತಿಸದಿರುವುದು',
      text: 'ನಾನು 1 ತಿಂಗಳ ಮುನ್ಸೂಚನೆ ನೀಡಿ 31 ಆಗಸ್ಟ್ 2026 ರಂದು ಫ್ಲಾಟ್ ಖಾಲಿ ಮಾಡಿದ್ದೇನೆ. ಮನೆ ಮಾಲೀಕರು ₹70,000 ಸೆಕ್ಯೂರಿಟಿ ಠೇವಣಿಯನ್ನು ಹಿಂತಿರುಗಿಸಲು ನಿರಾಕರಿಸುತ್ತಿದ್ದಾರೆ.',
    },
  ],
  Malayalam: [
    {
      title: 'കേടായ റഫ്രിജറേറ്ററിന്റെ റീഫണ്ട്',
      text: 'ഞാൻ 2026 ജൂൺ 10 ന് XYZ ഇലക്ട്രോണിക്സിൽ നിന്ന് ₹45,000 ന് ഒരു റഫ്രിജറേറ്റർ വാങ്ങി. 12 ദിവസത്തിന് ശേഷം അത് തകരാറിലായി. പലതവണ ആവശ്യപ്പെട്ടിട്ടും റിപ്പയർ ചെയ്യാനോ മാറ്റി നൽകാനോ വ്യാപാരി തയ്യാറായില്ല. എനിക്ക് മുഴുവൻ തുകയും നഷ്ടപരിഹാരവും വേണം.',
    },
    {
      title: 'അനധികൃത ബാങ്ക് അക്കൗണ്ട് തട്ടിപ്പ്',
      text: '2026 ജൂലൈ 15 ന് ഒടിപി ലഭിക്കാതെ എന്റെ സേവിംഗ്സ് അക്കൗണ്ടിൽ നിന്ന് ₹82,500 തട്ടിയെടുത്തു. 24 മണിക്കൂറിനുള്ളിൽ പരാതി നൽകിയിട്ടും ബാങ്ക് തുക തിരികെ നൽകാൻ വിസമ്മതിക്കുന്നു.',
    },
    {
      title: 'വാടക സെക്യൂരിറ്റി ഡെപ്പോസിറ്റ് തിരികെ നൽകാതിരിക്കൽ',
      text: '1 മാസത്തെ നോട്ടീസ് നൽകി 2026 ആഗസ്റ്റ് 31 ന് ഞാൻ ഫ്ലാറ്റ് ഒഴിഞ്ഞു. എന്നാൽ വീട്ടുടമസ്ഥൻ ₹70,000 സെക്യൂരിറ്റി ഡെപ്പോസിറ്റ് തിരികെ നൽകാൻ വിസമ്മതിക്കുന്നു.',
    },
  ],
  Marathi: [
    {
      title: 'सदोष फ्रिजचा परतावा',
      text: 'मी १० जून २०२६ रोजी XYZ इलेक्ट्रॉनिक्सकडून ₹४५,००० मध्ये रेफ्रिजरेटर खरेदी केला होता. १२ दिवसांनंतर तो बंद पडला. वारंवार विनंती करूनही विक्रेत्याने दुरुस्ती किंवा बदलून देण्यास नकार दिला. मला संपूर्ण परतावा आणि भरपाई हवी आहे.',
    },
    {
      title: 'अनधिकृत बँक व्यवहार',
      text: '१५ जुलै २०२६ रोजी कोणताही ओटीपी न येता माझ्या बचत खात्यातून ₹८२,५०० ची अनधिकृत वजावट झाली. २४ तासांत तक्रार करूनही बँक पैसे परत जमा करण्यास नकार देत आहे.',
    },
    {
      title: 'घरमालकाकडून डिपॉझिट अडवणे',
      text: 'मी १ महिन्याची नोटीस देऊन ३१ ऑगस्ट २०२६ रोजी फ्लॅट रिकामा केला. घरमालक ₹७०,००० ची माझी अनामत रक्कम परत देण्यास नकार देत आहेत.',
    },
  ],
  Bengali: [
    {
      title: 'ত্রুটিযুক্ত ফ্রিজের টাকা ফেরত',
      text: 'আমি ১০ জুন ২০২৬ তারিখে XYZ ইলেকট্রনিক্স থেকে ₹৪৫,০০০ দিয়ে একটি ফ্রিজ কিনেছিলাম। ১২ দিন পর এটি নষ্ট হয়ে যায়। বারবার অনুরোধ করা সত্ত্বেও বিক্রেতা মেরামত বা পরিবর্তন করতে অস্বীকার করেছে। আমি সম্পূর্ণ টাকা ফেরত ও ক্ষতিপূরণ চাই।',
    },
    {
      title: 'অননুমোদিত অনলাইন ব্যাংক লেনদেন',
      text: '১৫ জুলাই ২০২৬ তারিখে কোনো ওটিপি ছাড়াই আমার সেভিংস অ্যাকাউন্ট থেকে ₹৮২,৫০০ প্রতারণামূলকভাবে কেটে নেওয়া হয়েছে। ২৪ ঘণ্টার মধ্যে অভিযোগ জানানো সত্ত্বেও ব্যাংক টাকা ফেরত দিতে অস্বীকার করছে।',
    },
    {
      title: 'ভাড়ার সিকিউরিটি ডিপোজিট আটকে রাখা',
      text: 'আমি ১ মাসের যথাযথ নোটিশ দিয়ে ৩১ আগস্ট ২০২৬ তারিখে ফ্ল্যাট ছেড়ে দিয়েছি। বাড়িওয়ালা কোনো কারণ ছাড়াই আমার ₹৭০,০০০ সিকিউরিটি ডিপোজিট ফেরত দিতে অস্বীকার করছেন।',
    },
  ],
};
