/**
 * Local fallback knowledge base and templates for NyayaMithra
 */

export const INDIAN_LANGUAGES = [
  { code: 'English', label: 'English', speechCode: 'en-IN' },
  { code: 'Hindi', label: 'Hindi (हिंदी)', speechCode: 'hi-IN' },
  { code: 'Telugu', label: 'Telugu (తెలుగు)', speechCode: 'te-IN' },
  { code: 'Tamil', label: 'Tamil (தமிழ்)', speechCode: 'ta-IN' },
  { code: 'Kannada', label: 'Kannada (ಕನ್ನಡ)', speechCode: 'kn-IN' },
  { code: 'Malayalam', label: 'Malayalam (മലയാളം)', speechCode: 'ml-IN' },
  { code: 'Marathi', label: 'Marathi (मराठी)', speechCode: 'mr-IN' },
  { code: 'Bengali', label: 'Bengali (বাংলা)', speechCode: 'bn-IN' },
];

export const DRAFT_TYPES = [
  'Consumer Complaint',
  'Legal Complaint',
  'Police Complaint',
  'Legal Notice',
  'RTI Application',
  'Rental Dispute Complaint',
  'Employment Complaint',
  'Cyber Crime Complaint',
  'Motor Vehicle Accident Complaint',
  'General Petition',
];

export const SAMPLE_CHAT_QUERIES = [
  { label: 'Punishment for theft', text: 'What is the punishment for theft under Indian law?' },
  { label: 'Defective Refrigerator', text: 'What remedies does a consumer have if an electronics seller refuses refund for a defective refrigerator?' },
  { label: 'RTI 30-day response', text: 'What is the time limit for a Public Information Officer to reply under the RTI Act, 2005?' },
  { label: 'Security deposit limit', text: 'What is the maximum security deposit a residential landlord can demand under Model Tenancy laws?' },
  { label: 'Online Identity Theft', text: 'Under what section of the Information Technology Act is identity theft punishable?' },
];

export const SAMPLE_COMPLAINTS = [
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
];
