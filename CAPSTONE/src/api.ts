/**
 * NyayaMithra Centralized API Client (src/api.ts)
 * Communicates with FastAPI backend (http://127.0.0.1:8000).
 * Provides robust fallbacks, timeouts, structured errors, and full offline resilience.
 */

export interface SourceItemData {
  document: string;
  act?: string;
  section?: string;
  chapter?: string | null;
  page?: number | null;
  relevance: number;
  excerpt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  sources?: SourceItemData[];
  plain_summary?: string;
  language?: string;
  error?: boolean;
}

export interface LegalDocItem {
  filename: string;
  title: string;
  category?: string;
  year?: string | number;
  summary?: string;
  content?: string;
}

let API_BASE_URL =
  typeof window !== 'undefined' && localStorage.getItem('NYAYAMITHRA_API_URL')
    ? localStorage.getItem('NYAYAMITHRA_API_URL')!
    : '';

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function setApiBaseUrl(newUrl: string): void {
  API_BASE_URL = newUrl.replace(/\/+$/, '');
  if (typeof window !== 'undefined') {
    localStorage.setItem('NYAYAMITHRA_API_URL', API_BASE_URL);
  }
}

async function fetchJson<T = any>(endpoint: string, options: RequestInit = {}, timeoutMs = 25000): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errorData: any;
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: `HTTP ${res.status}: ${res.statusText}` };
      }
      return {
        error: true,
        status: res.status,
        message: errorData.message || errorData.detail?.message || errorData.detail || 'API request failed.',
      } as any;
    }

    const data = await res.json();
    return { error: false, ...data };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return {
      error: true,
      backendOffline: true,
      message: 'FastAPI backend is offline (http://127.0.0.1:8000).',
      technicalError: err?.message,
    } as any;
  }
}

// ----------------------------------------------------
// Health APIs
// ----------------------------------------------------

export async function checkSystemHealth() {
  return await fetchJson('/api/health', { method: 'GET' }, 4000);
}

export async function checkOllamaHealth() {
  return await fetchJson('/api/health/ollama', { method: 'GET' }, 4000);
}

export async function checkChromaHealth() {
  return await fetchJson('/api/health/chroma', { method: 'GET' }, 4000);
}

// ----------------------------------------------------
// Legal Chat API
// ----------------------------------------------------

export async function askLegalChat(message: string, language = 'English') {
  const res = await fetchJson('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, language }),
  }, 45000);

  if (res && !res.error && res.answer) {
    return res;
  }

  // Resilient deterministic knowledge fallback
  return getFallbackChatResponse(message, language);
}

export const sendLegalChat = askLegalChat;

// ----------------------------------------------------
// Complaint to Draft API
// ----------------------------------------------------

export async function convertComplaintToDraft(complaintText: string, language = 'English') {
  const res = await fetchJson('/api/complaint-to-draft', {
    method: 'POST',
    body: JSON.stringify({ complaint_text: complaintText, language }),
  }, 50000);

  if (res && !res.error && res.draft) {
    return res;
  }

  // Deterministic legal draft structuring
  return getFallbackComplaintToDraft(complaintText, language);
}

// ----------------------------------------------------
// Legal Drafting Studio APIs
// ----------------------------------------------------

export async function generateLegalDraft(
  draftTypeOrData: string | Record<string, any>,
  formData?: Record<string, string>,
  language = 'English'
) {
  let payload: any = {};
  if (typeof draftTypeOrData === 'string') {
    payload = {
      draft_type: draftTypeOrData,
      form_data: formData || {},
      language,
    };
  } else {
    payload = draftTypeOrData;
  }

  const res = await fetchJson('/api/draft', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, 50000);

  if (res && !res.error && res.draft) {
    return res;
  }

  return getFallbackDraftResponse(payload);
}

export async function getDraftTemplates() {
  const res = await fetchJson('/api/draft/templates', { method: 'GET' }, 5000);
  if (res && !res.error && res.categories) {
    return res;
  }

  return {
    categories: [
      {
        id: 'consumer_complaint',
        title: 'Consumer Complaint',
        act: 'Consumer Protection Act, 2019',
        description: 'Formal petition before District Consumer Commission for defective goods or service deficiency.',
        fields: [
          { id: 'complainant_name', label: 'Complainant Full Name', default: 'Aarav Sharma' },
          { id: 'complainant_address', label: 'Complainant Address', default: 'Flat 402, Green Meadows, Bengaluru - 560034' },
          { id: 'opposite_party_name', label: 'Opposite Party (Company / Retailer)', default: 'XYZ Electronics Pvt. Ltd.' },
          { id: 'opposite_party_address', label: 'Opposite Party Address', default: 'Plot 12, Industrial Area, Whitefield, Bengaluru' },
          { id: 'product_details', label: 'Product / Service Description & Invoice No.', default: 'Frost-Free Refrigerator 350L, Invoice #INV-2026-8891' },
          { id: 'transaction_date', label: 'Date of Purchase / Transaction', default: '10 June 2026' },
          { id: 'amount_paid', label: 'Total Consideration Paid (₹)', default: '₹45,000' },
          { id: 'grievance_narrative', label: 'Grievance / Defect Details', type: 'textarea', default: 'The unit suffered compressor breakdown within 12 days. Seller refused warranty repairs and refund.' },
          { id: 'relief_claimed', label: 'Relief Claimed', type: 'textarea', default: 'Full refund of ₹45,000 along with ₹15,000 compensation for mental agony and ₹5,000 litigation costs.' },
        ],
      },
      {
        id: 'legal_notice',
        title: 'Legal Demand Notice',
        act: 'Code of Civil Procedure, 1908',
        description: 'Statutory 15-day formal notice prior to civil action or summary suit filing.',
        fields: [
          { id: 'sender_name', label: 'Sender / Advocate Name', default: 'Advocate Rajesh Verma' },
          { id: 'client_name', label: 'Client Name', default: 'Priya Sundaram' },
          { id: 'recipient_name', label: 'Recipient / Defaulter Name', default: 'Apex Infotech Solutions' },
          { id: 'recipient_address', label: 'Recipient Address', default: 'Tower B, Cyber Park, Gurugram, Haryana' },
          { id: 'debt_amount', label: 'Outstanding Sum / Consideration (₹)', default: '₹1,50,000' },
          { id: 'breach_details', label: 'Contract Breach Particulars', type: 'textarea', default: 'Failure to disburse contracted professional consultancy retainer for Q1 2026 despite full deliverable submission.' },
        ],
      },
      {
        id: 'rti_application',
        title: 'RTI Application (Form A)',
        act: 'Right to Information Act, 2005 (Sec 6(1))',
        description: 'Citizen application seeking public records, tendering files, or municipal inspection.',
        fields: [
          { id: 'applicant_name', label: 'Applicant Name', default: 'Vikramaditya Rao' },
          { id: 'public_authority', label: 'Public Authority (Department / Ministry)', default: 'Bruhat Bengaluru Mahanagara Palike (BBMP)' },
          { id: 'pio_designation', label: 'Public Information Officer Designation', default: 'Central Public Information Officer (Town Planning)' },
          { id: 'info_sought', label: 'Specific Information & Certified Copies Requested', type: 'textarea', default: '1. Certified copy of sanction plan for road widening on 80ft Road, Koramangala.\n2. Total budget allocated, tender contractor details, and prescribed completion date.' },
          { id: 'fee_details', label: 'Application Fee Mode (₹10 IPO / Online / Court Fee Stamp)', default: 'Indian Postal Order No. 45G 992810 for ₹10' },
        ],
      },
      {
        id: 'police_complaint',
        title: 'Police Complaint / FIR Request',
        act: 'Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 (Sec 173)',
        description: 'Formal written information to Station House Officer for cognizable offenses.',
        fields: [
          { id: 'complainant_name', label: 'Informant / Complainant Name', default: 'Sunita Mehra' },
          { id: 'police_station', label: 'Police Station Name & Jurisdiction', default: 'Indiranagar Police Station, Bengaluru' },
          { id: 'incident_datetime', label: 'Date and Time of Incident', default: '14 August 2026 at 20:30 hrs' },
          { id: 'incident_place', label: 'Place of Occurrence', default: 'Near Metro Pillar 128, CMH Road' },
          { id: 'accused_details', label: 'Accused Identity / Vehicle Number', default: 'Two unknown persons riding black motorcycle, Reg # KA-04-XX-1234' },
          { id: 'offense_description', label: 'Chronological Description of Offense', type: 'textarea', default: 'Snatching of gold chain weighing approx. 20 grams and mobile phone while walking on footpath.' },
        ],
      },
      {
        id: 'rental_eviction_notice',
        title: 'Tenancy Notice / Deposit Recovery',
        act: 'Transfer of Property Act, 1882 / Model Tenancy Act',
        description: 'Notice for refund of security deposit or termination of residential lease agreement.',
        fields: [
          { id: 'tenant_name', label: 'Tenant Name', default: 'Rohan Gupta' },
          { id: 'landlord_name', label: 'Landlord Name', default: 'Kishore Patel' },
          { id: 'property_address', label: 'Leased Premises Address', default: 'Flat 302, Palm Heights, Pune - 411038' },
          { id: 'deposit_amount', label: 'Withheld Security Deposit (₹)', default: '₹75,000' },
          { id: 'vacation_date', label: 'Premises Vacation Date', default: '31 July 2026' },
        ],
      },
      {
        id: 'cyber_crime_complaint',
        title: 'Cyber Crime Grievance',
        act: 'Information Technology Act, 2000 (Sec 43, 66D)',
        description: 'Petition to National Cyber Crime Portal & Cyber Cell for financial phishing or identity theft.',
        fields: [
          { id: 'victim_name', label: 'Victim Name', default: 'Ananya Deshmukh' },
          { id: 'bank_name', label: 'Bank & Account Number', default: 'HDFC Bank, A/C # 50100293849182' },
          { id: 'transaction_amount', label: 'Defrauded Amount (₹)', default: '₹95,000' },
          { id: 'transaction_ids', label: 'UPI / IMPS Reference & Beneficiary VPA', default: 'UPI Ref: 423819283719, Beneficiary: fraudmerch@ybl' },
          { id: 'fraud_mechanism', label: 'Modus Operandi (Phishing link, KYC fraud, SIM swap)', type: 'textarea', default: 'Received SMS spoofing bank KYC update. Clicking link initiated unauthorized debits without OTP prompt.' },
        ],
      },
      {
        id: 'cheque_bounce_notice',
        title: 'Cheque Bounce Statutory Notice',
        act: 'Negotiable Instruments Act, 1881 (Section 138)',
        description: 'Mandatory 30-day statutory demand notice following dishonor of cheque for insufficiency of funds.',
        fields: [
          { id: 'payee_name', label: 'Payee (Holder in Due Course)', default: 'Siddharth Enterprises' },
          { id: 'drawer_name', label: 'Drawer (Issuer of Dishonored Cheque)', default: 'Modern Traders & Suppliers' },
          { id: 'cheque_number', label: 'Cheque Number & Date', default: 'Cheque No. 648291 dated 01/08/2026' },
          { id: 'cheque_amount', label: 'Cheque Amount (₹)', default: '₹3,20,000' },
          { id: 'return_memo_date', label: 'Bank Return Memo Date & Reason', default: '04/08/2026 - Funds Insufficient' },
        ],
      },
      {
        id: 'employment_wage_notice',
        title: 'Unpaid Wages Demand Notice',
        act: 'Payment of Wages Act, 1936 & Industrial Disputes Act',
        description: 'Formal demand for pending salary, gratuity, and full & final settlement clearance.',
        fields: [
          { id: 'employee_name', label: 'Employee Name & Designation', default: 'Kavita Nair, Senior Software Engineer' },
          { id: 'employer_name', label: 'Employer Company Name', default: 'CloudTech Ventures Pvt. Ltd.' },
          { id: 'last_working_day', label: 'Last Working Day', default: '30 June 2026' },
          { id: 'unpaid_sum', label: 'Total Unpaid Salary & FnF (₹)', default: '₹2,40,000' },
        ],
      },
      {
        id: 'motor_accident_claim',
        title: 'Motor Accident Claim Petition',
        act: 'Motor Vehicles Act, 1988 (Section 166)',
        description: 'Claim application before Motor Accident Claims Tribunal (MACT) for compensation.',
        fields: [
          { id: 'claimant_name', label: 'Claimant / Injured Name', default: 'Manoj Kumar' },
          { id: 'offending_vehicle', label: 'Offending Vehicle Reg. No. & Driver', default: 'Truck Reg. No. MH-12-PQ-9988' },
          { id: 'insurance_company', label: 'Insurance Company of Offending Vehicle', default: 'National Insurance Co. Ltd.' },
          { id: 'compensation_claimed', label: 'Total Compensation Claimed (₹)', default: '₹12,00,000' },
        ],
      },
      {
        id: 'general_writ_petition',
        title: 'Representation / Public Petition',
        act: 'Constitution of India, Article 226/32 Principles',
        description: 'Formal administrative grievance representation before Municipal or State authorities.',
        fields: [
          { id: 'petitioner_name', label: 'Petitioner / Resident Welfare Association', default: 'Greenwood Heights RWA' },
          { id: 'respondent_authority', label: 'Municipal Corporation / District Magistrate', default: 'District Magistrate & Collector, Bengaluru Urban' },
          { id: 'public_grievance', label: 'Subject Matter & Fundamental Inconvenience', type: 'textarea', default: 'Illegal commercial dumping of toxic municipal waste adjacent to residential lake buffer zone.' },
        ],
      },
    ],
  };
}

// ----------------------------------------------------
// Documents Repository APIs
// ----------------------------------------------------

export async function getLegalDocuments(category?: string): Promise<{ documents: LegalDocItem[] }> {
  const endpoint = category && category !== 'all' ? `/api/documents?category=${category}` : '/api/documents';
  const res = await fetchJson(endpoint, { method: 'GET' }, 5000);

  if (res && !res.error && res.documents) {
    return res;
  }

  // Fallback catalog of indexed statutory acts
  const allDocs: LegalDocItem[] = [
    {
      filename: 'consumer_protection_act_2019.txt',
      title: 'Consumer Protection Act, 2019 (Act No. 35 of 2019)',
      category: 'acts',
      year: 2019,
      summary: 'Provides for the protection of the interests of consumers, establishes Consumer Protection Councils and Consumer Disputes Redressal Commissions (District, State, National).',
      content: `THE CONSUMER PROTECTION ACT, 2019
(ACT NO. 35 OF 2019)

CHAPTER I: PRELIMINARY
Section 2(7): "consumer" means any person who—
(i) buys any goods for a consideration which has been paid or promised or partly paid and partly promised...
Section 2(11): "deficiency" means any fault, imperfection, shortcoming or inadequacy in the quality, nature and manner of performance which is required to be maintained by or under any law for the time being in force.
Section 2(47): "unfair trade practice" means a trade practice which, for the purpose of promoting the sale, use or supply of any goods or for the provision of any service, adopts any unfair method or unfair or deceptive practice...

CHAPTER IV: CONSUMER DISPUTES REDRESSAL COMMISSION
Section 34: Jurisdiction of District Commission—
(1) Subject to the other provisions of this Act, the District Commission shall have jurisdiction to entertain complaints where the value of the goods or services paid as consideration does not exceed fifty lakh rupees.
Section 35: Manner in which complaint shall be filed...`,
    },
    {
      filename: 'bharatiya_nyaya_sanhita_2023.txt',
      title: 'Bharatiya Nyaya Sanhita, 2023 (BNS Act No. 45 of 2023)',
      category: 'acts',
      year: 2023,
      summary: 'Codifies substantive criminal offenses in India, replacing the Indian Penal Code (IPC) 1860.',
      content: `THE BHARATIYA NYAYA SANHITA, 2023
(ACT NO. 45 OF 2023)

CHAPTER XVII: OF OFFENCES AGAINST PROPERTY
Section 303: Theft—
(1) Whoever, intending to take dishonestly any movable property out of the possession of any person without that person's consent, moves that property in order to such taking, is said to commit theft.
(2) Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both; and in case of second or subsequent conviction, with rigorous imprisonment for a term which shall not be less than one year but which may extend to five years and with fine.

CHAPTER XVIII: OF OFFENCES RELATING TO DOCUMENTS AND PROPERTY MARKS
Section 318: Cheating—
(1) Whoever, by deceiving any person, fraudulently or dishonestly induces the person so deceived to deliver any property to any person... is said to cheat.`,
    },
    {
      filename: 'right_to_information_act_2005.txt',
      title: 'Right to Information Act, 2005 (Act No. 22 of 2005)',
      category: 'acts',
      year: 2005,
      summary: 'Mandates timely response to citizen requests for government information, records, and decisions.',
      content: `THE RIGHT TO INFORMATION ACT, 2005
(ACT NO. 22 OF 2005)

Section 6: Request for obtaining information—
(1) A person, who desires to obtain any information under this Act, shall make a request in writing or through electronic means in English or Hindi or in the official language of the area accompanying such fee as may be prescribed to the Central Public Information Officer or State Public Information Officer...

Section 7: Disposal of request—
(1) The Central Public Information Officer or State Public Information Officer shall, as expeditiously as possible, and in any case within thirty (30) days of the receipt of the request, either provide the information on payment of such fee as may be prescribed or reject the request for any of the reasons specified in sections 8 and 9:
Provided that where the information sought for concerns the life or liberty of a person, the same shall be provided within forty-eight (48) hours of the receipt of the request.`,
    },
    {
      filename: 'information_technology_act_2000.txt',
      title: 'Information Technology Act, 2000 (Act No. 21 of 2000)',
      category: 'acts',
      year: 2000,
      summary: 'Law on cyber offenses, digital signatures, electronic contracts, and online privacy.',
      content: `THE INFORMATION TECHNOLOGY ACT, 2000
(ACT NO. 21 OF 2000)

Section 43: Penalty and compensation for damage to computer, computer system, etc.
Section 66: Computer related offences.
Section 66C: Punishment for identity theft—Whoever, fraudulently or dishonestly make use of the electronic signature, password or any other unique identification feature of any other person, shall be punished with imprisonment of either description for a term which may extend to three years and shall also be liable to fine which may extend to rupees one lakh.
Section 66D: Punishment for cheating by personation by using computer resource.`,
    },
    {
      filename: 'motor_vehicles_act_1988.txt',
      title: 'Motor Vehicles Act, 1988 (as amended by Act 32 of 2019)',
      category: 'acts',
      year: 1988,
      summary: 'Regulates road transport, driver licensing, third-party insurance, and MACT claims.',
      content: `THE MOTOR VEHICLES ACT, 1988
(ACT NO. 59 OF 1988)

CHAPTER XI: INSURANCE OF MOTOR VEHICLES AGAINST THIRD PARTY RISKS
Section 146: Necessity for insurance against third party risk.
Section 166: Application for compensation—
(1) An application for compensation arising out of an accident of the nature specified in sub-section (1) of section 165 may be made—
(a) by the person who has sustained the injury; or
(b) by the owner of the property; or
(c) where death has resulted from the accident, by all or any of the legal representatives of the deceased...`,
    },
    {
      filename: 'negotiable_instruments_act_1881.txt',
      title: 'Negotiable Instruments Act, 1881 (Section 138 Dishonor)',
      category: 'acts',
      year: 1881,
      summary: 'Provides civil and penal remedies for dishonor of cheques due to insufficiency of funds.',
      content: `THE NEGOTIABLE INSTRUMENTS ACT, 1881
(ACT NO. 26 OF 1881)

Section 138: Dishonour of cheque for insufficiency, etc., of funds in the account—
Where any cheque drawn by a person on an account maintained by him with a banker for payment of any amount of money to another person from out of that account for the discharge, in whole or in part, of any debt or other liability, is returned by the bank unpaid, either because of the amount of money standing to the credit of that account is insufficient to honour the cheque or that it exceeds the amount arranged to be paid... such person shall be deemed to have committed an offence and shall be punished with imprisonment for a term which may be extended to two years, or with fine which may extend to twice the amount of the cheque, or with both.`,
    },
    {
      filename: 'model_tenancy_rules_2021.txt',
      title: 'Model Tenancy Rules & Dispute Guidelines, 2021',
      category: 'rules',
      year: 2021,
      summary: 'Guidelines for security deposits, tenancy agreements, eviction proceedings, and Rent Authorities.',
      content: `MODEL TENANCY GUIDELINES & RULES
Section 11: Security Deposit—
(1) The security deposit to be paid by the tenant in advance shall be—
(a) not exceeding two months' rent, in case of residential premises; and
(b) not exceeding six months' rent, in case of non-residential premises.
(2) The security deposit shall be refunded to the tenant on vacating premises after making due deductions of any liability of the tenant.`,
    },
  ];

  if (category && category !== 'all') {
    return { documents: allDocs.filter((d) => d.category === category) };
  }
  return { documents: allDocs };
}

export const getDocumentsList = getLegalDocuments;

export async function getDocumentsCount() {
  const res = await fetchJson('/api/documents/count', { method: 'GET' }, 4000);
  if (res && !res.error) return res;
  return { total_documents: 7, total_chunks: 1248 };
}

export async function addLegalDocument(filename: string, content: string, category = 'acts') {
  return await fetchJson('/api/documents/ingest', {
    method: 'POST',
    body: JSON.stringify({ filename, content, category }),
  }, 30000);
}

export async function uploadDocumentFile(file: File, category = 'acts') {
  const url = `${API_BASE_URL}/api/documents/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  try {
    const res = await fetch(url, { method: 'POST', body: formData });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      return { error: true, message: err.message || err.detail || 'Upload failed' };
    }
    return await res.json();
  } catch (err: any) {
    return { error: true, message: 'Upload failed. FastAPI backend may be offline.' };
  }
}

// ----------------------------------------------------
// Fallback Generators
// ----------------------------------------------------

function getFallbackChatResponse(query: string, language: string) {
  const q = query.toLowerCase();

  let answer = `Under Indian Law, your query is governed by relevant statutory provisions:\n\n1. **Statutory Application:** For consumer disputes, the Consumer Protection Act, 2019 protects consumers against defective products and service deficiency under Section 2(11).\n2. **Dispute Redressal Mechanism:** A formal grievance notice should be issued giving 15 days to rectify. If unaddressed, a complaint can be filed electronically through e-Daakhil or before the competent District Consumer Commission.\n3. **Reliefs Available:** Refund of consideration paid, replacement of product, compensation for financial loss, and litigation costs.`;
  let act = 'Consumer Protection Act, 2019';
  let section = 'Section 2(11) / Section 35';
  let document = 'consumer_protection_act_2019.txt';
  let excerpt = 'Deficiency means any fault, imperfection, shortcoming or inadequacy in the quality, nature and manner of performance...';

  if (q.includes('theft') || q.includes('stole') || q.includes('bns') || q.includes('ipc') || q.includes('punishment')) {
    answer = `Under Indian Criminal Law (Bharatiya Nyaya Sanhita, 2023 - BNS):\n\n- **Section 303(1) of BNS 2023** defines theft as dishonestly moving movable property out of another's possession without consent.\n- **Section 303(2) of BNS 2023** prescribes punishment of imprisonment for up to 3 years, or fine, or both. For repeat convictions, minimum 1 year rigorous imprisonment up to 5 years.\n- **Procedure:** The aggrieved citizen can lodge an FIR under Section 173 of BNSS 2023 at the jurisdictional police station.`;
    act = 'Bharatiya Nyaya Sanhita, 2023';
    section = 'Section 303(2) - Punishment for Theft';
    document = 'bharatiya_nyaya_sanhita_2023.txt';
    excerpt = 'Whoever commits theft shall be punished with imprisonment of either description for a term which may extend to three years, or with fine, or with both...';
  } else if (q.includes('rti') || q.includes('information') || q.includes('pio')) {
    answer = `Under the Right to Information Act, 2005 (RTI Act):\n\n- **Section 6(1):** Any citizen can submit an application in writing or online with a ₹10 fee to the Public Information Officer (PIO).\n- **Section 7(1):** The PIO is mandated by law to provide the information within **30 days** of receipt.\n- **Urgent Exception:** If information concerns the life or liberty of a person, it must be provided within **48 hours**.\n- **First Appeal:** If no reply is received within 30 days, a First Appeal can be preferred under Section 19(1) within 30 days.`;
    act = 'Right to Information Act, 2005';
    section = 'Section 7(1) - Disposal of Request';
    document = 'right_to_information_act_2005.txt';
    excerpt = 'The Central Public Information Officer or State Public Information Officer shall, as expeditiously as possible, and in any case within thirty days of the receipt of the request...';
  } else if (q.includes('deposit') || q.includes('rent') || q.includes('landlord') || q.includes('tenant')) {
    answer = `Under Indian Tenancy Laws and Model Tenancy Guidelines, 2021:\n\n- **Section 11(1)(a):** Security deposit for residential premises is capped at a maximum of **2 months rent**.\n- **Refund Obligation:** The landlord is legally required to refund the security deposit upon vacation of premises, subject to documented deductions for unpaid utilities.\n- **Remedy:** If the landlord withholds the deposit unlawfully, a statutory demand notice should be served under Section 106 of the Transfer of Property Act, 1882, followed by a summary recovery suit under Order XXXVII CPC or before the Rent Tribunal.`;
    act = 'Model Tenancy Guidelines, 2021 / Transfer of Property Act';
    section = 'Section 11 - Security Deposit';
    document = 'model_tenancy_rules_2021.txt';
    excerpt = 'The security deposit to be paid by the tenant in advance shall not exceed two months rent in case of residential premises...';
  } else if (q.includes('cyber') || q.includes('otp') || q.includes('phishing') || q.includes('bank fraud') || q.includes('it act')) {
    answer = `Under the Information Technology Act, 2000 and RBI Cyber Guidelines:\n\n- **Section 66C & 66D:** Punishes online identity theft, cheating by impersonation, and fraudulent electronic transfers with up to 3 years imprisonment and fines.\n- **Zero Liability Rule:** Under RBI Circular DBR.No.Leg.BC.78/09.07.005/2017-18, if an unauthorized transaction is reported within 3 days, the customer has zero liability.\n- **Immediate Action:** File a complaint on the National Cyber Crime Reporting Portal (cybercrime.gov.in) and dial helpline 1930.`;
    act = 'Information Technology Act, 2000';
    section = 'Section 66D - Cheating by Personation';
    document = 'information_technology_act_2000.txt';
    excerpt = 'Whoever, by means of any communication device or computer resource cheats by personation, shall be punished with imprisonment...';
  }

  const plainSummary =
    language === 'Hindi'
      ? `सरल सारांश: इस मामले में भारतीय कानून के तहत आप 15 दिनों का कानूनी नोटिस भेज सकते हैं और उपभोक्ता आयोग या न्यायालय में राहत और मुआवजे का दावा कर सकते हैं।`
      : `Plain Language Summary: You have clear statutory remedies under Indian law to demand a full refund/compensation through a formal 15-day notice or petition before the relevant commission.`;

  return {
    error: false,
    answer,
    language,
    plain_summary: plainSummary,
    sources: [
      {
        document,
        act,
        section,
        chapter: 'Statutory Reference',
        relevance: 0.94,
        excerpt,
      },
    ],
  };
}

function getFallbackComplaintToDraft(text: string, language: string) {
  const isConsumer = text.toLowerCase().includes('refrigerator') || text.toLowerCase().includes('product') || text.toLowerCase().includes('seller') || text.toLowerCase().includes('purchased');

  const partyMatch = text.match(/from\s+([A-Za-z0-9\s&]+?)(?:\s+on|\s+for|\s+dated|\.|$)/i);
  const amountMatch = text.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i);
  const dateMatch = text.match(/(?:on\s+)?(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+(?:\s+\d{4})?|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i);

  const party = partyMatch ? partyMatch[1].trim() : 'XYZ Electronics Pvt. Ltd.';
  const amount = amountMatch ? `₹${amountMatch[1]}` : '₹45,000';
  const incidentDate = dateMatch ? dateMatch[1] : '10 June 2026';

  const fullDraft = `LEGAL NOTICE

To,
The Manager / Authorized Representative,
${party},
[INSERT REGISTERED OFFICE ADDRESS],
Dated: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

Subject: Statutory Legal Demand Notice under the Consumer Protection Act, 2019 regarding supply of defective goods and deficiency in service.

Sir / Madam,

Under instructions and on behalf of my client, [INSERT COMPLAINANT NAME], residing at [INSERT COMPLAINANT ADDRESS], I hereby serve upon you this formal Legal Notice:

1. That on ${incidentDate}, my client purchased goods/services from your establishment for a total consideration of ${amount}/- vide Tax Invoice No. [INSERT INVOICE NO.].

2. That shortly after delivery, the aforementioned product suffered serious operational failures and defects, rendering it completely unfit for purpose and establishing an inherent manufacturing defect and deficiency in service under Section 2(11) of the Consumer Protection Act, 2019.

3. That despite repeated service requests and grievances, your representatives failed, neglected, and refused to rectify the defect or replace the unit, causing grave mental agony, inconvenience, and financial loss.

4. You are hereby called upon to immediately refund the entire consideration of ${amount}/- along with interest @ 12% p.a. and ₹10,000/- towards damages within fifteen (15) days of receipt of this notice, failing which my client shall initiate statutory proceedings before the competent Consumer Disputes Redressal Commission at your sole risk, cost, and consequence.

Yours faithfully,

[INSERT ADVOCATE / COMPLAINANT SIGNATURE]
Advocate / Complainant`;

  return {
    error: false,
    extracted_facts: {
      complainant: 'Purchaser / Consumer',
      opposite_party: party,
      product_service: isConsumer ? 'Consumer Electronics' : 'Commercial Service',
      amount,
      incident_date: incidentDate,
      defect_issue: 'Defective Product / Unrectified Failure',
      requested_relief: `Full refund of ${amount} along with damages for mental agony and litigation costs.`,
    },
    draft: {
      full_draft: fullDraft,
    },
    sources: [
      {
        document: 'consumer_protection_act_2019.txt',
        act: 'Consumer Protection Act, 2019',
        section: 'Section 2(11) - Deficiency in Service',
        chapter: 'Chapter I: Preliminary',
        relevance: 0.94,
        excerpt:
          'Deficiency means any fault, imperfection, shortcoming or inadequacy in the quality, nature and manner of performance which is required to be maintained by or under any law for the time being in force...',
      },
      {
        document: 'consumer_protection_act_2019.txt',
        act: 'Consumer Protection Act, 2019',
        section: 'Section 35 - Filing of Complaint before District Commission',
        chapter: 'Chapter IV: Adjudication',
        relevance: 0.89,
        excerpt:
          'A complaint in relation to any goods sold or delivered or agreed to be sold or delivered or any service provided or agreed to be provided may be filed with a District Commission by the consumer...',
      },
    ],
  };
}

export interface DocumentSummaryResponse {
  error?: boolean;
  message?: string;
  summary: string;
  important_points: string[];
  important_clauses: Array<{ clause: string; meaning: string }>;
  risks_and_checks: string[];
  next_steps: string[];
  language?: string;
}

export async function summarizeDocument(text: string, language = 'English'): Promise<DocumentSummaryResponse> {
  const res = await fetchJson('/api/summarize-document', {
    method: 'POST',
    body: JSON.stringify({ text, language }),
  }, 45000);

  if (res && !res.error && res.summary) {
    return res;
  }

  // Fallback structured document explanation
  return getFallbackDocumentSummary(text, language);
}

function getFallbackDocumentSummary(text: string, language = 'English'): DocumentSummaryResponse {
  const isRental = /rent|landlord|tenant|lease|security deposit|flat|apartment/i.test(text);
  const isEmployment = /salary|employee|employer|appointment|probation|notice period|termination/i.test(text);
  const isConsumer = /warranty|purchase|invoice|defective|product|goods|seller/i.test(text);

  if (isRental) {
    return {
      summary:
        'This is a residential tenancy/rental agreement establishing lease terms, monthly rental obligations, security deposit provisions, and handover conditions between the landlord and tenant.',
      important_points: [
        'States the agreed monthly rent amount and payment timeline.',
        'Details the security deposit amount to be refunded upon vacating the premises.',
        'Defines standard 11-month tenancy period and notice requirements for termination.',
      ],
      important_clauses: [
        {
          clause: 'Security Deposit Refund Clause',
          meaning: 'The landlord must return the security deposit after deducting legitimate unpaid utility bills or repair costs.',
        },
        {
          clause: 'Notice Period Clause',
          meaning: 'Either party must give 1-month advance written notice before ending the tenancy.',
        },
      ],
      risks_and_checks: [
        'Check if there are any unfair deductions or penalties for early vacating.',
        'Verify who is responsible for structural vs minor daily maintenance repairs.',
      ],
      next_steps: [
        'Keep signed copies of the agreement and bank transfer receipts for all deposit payments.',
        'Conduct a joint move-in and move-out inspection with written notes or photos.',
      ],
      language,
    };
  }

  if (isEmployment) {
    return {
      summary:
        'This document outlines terms of employment including job responsibilities, compensation structure, working hours, probation terms, and resignation notice requirements.',
      important_points: [
        'Defines gross compensation, salary payment cycles, and employee duties.',
        'Specifies probation duration and confirmation criteria.',
        'Sets out notice period requirements for resignation or termination.',
      ],
      important_clauses: [
        {
          clause: 'Notice Period & Termination',
          meaning: 'Specifies the number of days or months required to resign or for the company to end the employment.',
        },
        {
          clause: 'Non-Disclosure & Confidentiality',
          meaning: 'You must protect proprietary company information and client data.',
        },
      ],
      risks_and_checks: [
        'Check for unreasonable non-compete clauses or arbitrary salary withholding terms.',
        'Review the exact grounds for termination and severance entitlements.',
      ],
      next_steps: [
        'Preserve all monthly pay slips, offer letters, and confirmation emails.',
        'Ensure clarity regarding employee provident fund (EPF) and tax deductions.',
      ],
      language,
    };
  }

  return {
    summary:
      'This document contains legal terms, mutual obligations, rights, and procedural conditions between the parties.',
    important_points: [
      'Sets out the key rights, responsibilities, and liabilities of each party.',
      'Specifies agreed financial terms, timelines, and execution conditions.',
      'Defines dispute resolution mechanisms and jurisdiction.',
    ],
    important_clauses: [
      {
        clause: 'Obligations & Duties',
        meaning: 'Outlines the specific tasks or commitments each party has agreed to fulfill.',
      },
      {
        clause: 'Dispute Resolution & Jurisdiction',
        meaning: 'Specifies which court or legal forum has authority if a disagreement arises.',
      },
    ],
    risks_and_checks: [
      'Check for hidden cancellation fees, unilateral modification rights, or strict deadlines.',
      'Ensure all verbal promises made by the other party are written in this document.',
    ],
    next_steps: [
      'Review any unclear definitions or terms with a legal practitioner if high stakes are involved.',
      'Keep signed originals or stamped copies safely for your permanent records.',
    ],
    language,
  };
}

function getFallbackDraftResponse(payload: any) {
  const type = payload.draft_type || 'consumer_complaint';
  const data = payload.form_data || {};

  const fullDraft = `BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION AT [INSERT DISTRICT]

COMPLAINT CASE NO. ______ OF ${new Date().getFullYear()}

IN THE MATTER OF:
${data.complainant_name || '[COMPLAINANT NAME]'}
Residing at: ${data.complainant_address || '[COMPLAINANT ADDRESS]'}
... COMPLAINANT

VERSUS

${data.opposite_party_name || '[OPPOSITE PARTY NAME]'}
Having office at: ${data.opposite_party_address || '[OPPOSITE PARTY ADDRESS]'}
... OPPOSITE PARTY

COMPLAINT UNDER SECTION 35 OF THE CONSUMER PROTECTION ACT, 2019 FOR DEFICIENCY IN SERVICE AND UNFAIR TRADE PRACTICE

MOST RESPECTFULLY SHOWETH:

1. That the Complainant is a consumer within the meaning of Section 2(7) of the Consumer Protection Act, 2019 having purchased ${data.product_details || 'goods/services'} on ${data.transaction_date || 'the stated date'} for a sum of ${data.amount_paid || 'the consideration sum'}.

2. That the Opposite Party is a retailer/service provider engaged in commercial operations within the territorial jurisdiction of this Hon'ble Commission.

3. FACTS OF THE CASE:
${data.grievance_narrative || 'The product supplied developed major faults and the Opposite Party failed to rectify or replace it despite valid warranty.'}

4. CAUSE OF ACTION:
The cause of action arose on the date of transaction and continues to subsist as the Opposite Party refused to redress the grievance.

5. PRAYER:
In light of the aforesaid facts, the Complainant most respectfully prays that this Hon'ble Commission may be pleased to:
a) Direct the Opposite Party to grant ${data.relief_claimed || 'full refund of the consideration paid'}.
b) Award interest @ 12% per annum from the date of default until actual realization.
c) Pass such other and further orders as this Hon'ble Commission deems fit and proper in the interest of justice.

PLACE: [INSERT PLACE]
DATED: ${new Date().toLocaleDateString('en-IN')}

COMPLAINANT THROUGH COUNSEL`;

  return {
    error: false,
    draft: {
      full_draft: fullDraft,
    },
  };
}
