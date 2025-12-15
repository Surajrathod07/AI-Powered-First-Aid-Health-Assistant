
export enum Sex {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other / Not specified'
}

export enum SymptomType {
  EXTERNAL = 'External injury / skin wound',
  INTERNAL = 'Internal / organ related',
  MSK = 'Musculoskeletal / bone / joint',
  NEURO = 'Neurological',
  RESPIRATORY = 'Respiratory / chest',
  GASTRO = 'Abdominal / gastrointestinal',
  OTHER = 'Other / unsure'
}

export enum Duration {
  HOURS = 'Hours',
  DAYS = 'Days',
  WEEKS = 'Weeks',
  MONTHS = 'Months',
  CHRONIC = 'Chronic / long-term'
}

export enum PainSeverity {
  NONE = '0 - No pain',
  MILD = '1-3 - Mild',
  MODERATE = '4-6 - Moderate',
  SEVERE = '7-8 - Severe',
  EXTREME = '9-10 - Extreme'
}

export enum ReportFocus {
  RADIOLOGY = 'Detailed radiology-style report only',
  DIAGNOSIS = 'Diagnosis + differential diagnosis',
  TREATMENT = 'Step-by-step treatment guidance (general advice)',
  LAYMAN = 'Simple explanation in layman language',
  COMBINED = 'Combination of professional report + simple explanation'
}

export interface PatientDetails {
  name: string;
  age: number; // Numeric age is now mandatory
  sex: Sex;
  symptomType: SymptomType;
  duration: Duration;
  painSeverity: PainSeverity;
  reportFocus: ReportFocus;
}

export interface AnalysisRequest {
  patientDetails: PatientDetails;
  clinicalContext: string;
  imageFile: File | null;
}

// Health Profile Types
export interface UserHealthProfile {
  id?: string;
  user_id?: string;
  full_name: string;
  age_group: string; 
  gender: string;
  conditions: string[];
  allergies: string;
  medications: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  blood_group: string;
  preferred_language: 'English' | 'Hindi' | 'Marathi';
  updated_at?: string;
}

// Report Generation Types
export type RiskLevel = "low" | "moderate" | "emergency";

export interface SuggestedMedicine {
  name: string;             
  form: "tablet"|"syrup"|"cream"|"ointment";
  strength: string;         
  dose: string;             
  frequency: string;        
  timing: string;           
  maxDailyDose?: string;    
  ageLimit?: string;        
  contraindications?: string[];
  notes?: string;           
}

export interface ReportPayload {
  reportId: string;
  generatedAt: string; // ISO date
  patient: {
    name?: string;
    ageYears: number;   
    sex?: string;
  };
  contextText?: string;      
  riskLevel: RiskLevel;
  clinicalSummary: string;   
  possibleCauses: { name: string; confidence?: string }[]; 
  recommendedActions: string[]; 
  suggestedMedicines?: SuggestedMedicine[]; 
  redFlags?: string[]; // "When to see a doctor"
  disclaimer: string;
  generatedBy: string;       
}

// Chat Module Types

export interface Differential {
    condition: string;
    reasoning: string;
    confidence: number;
}

export interface StructuredAIResponse {
    summary: string;
    riskLevel: RiskLevel; // Added for professional report generation
    differentialDiagnosis: Differential[];
    recommendedActions: string[];
    suggestedMedications: SuggestedMedicine[]; // Updated to strict type
    redFlags: string[];
    confidenceScore: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
    attachments?: string[];
    structuredResponse?: StructuredAIResponse;
}

export interface ChatSession {
    id: string;
    title: string; 
    startTime: number;
    lastUpdated: number; 
    messages: ChatMessage[];
    patientSummary: PatientDetails;
}

// Care Finder Module Types

export interface CarePlace {
  id: string; 
  name: string;
  type: 'Hospital' | 'Pharmacy' | 'Clinic' | 'Other';
  address: string;
  distanceKm: number; 
  rating?: number;
  userRatingsTotal?: number;
  isOpenNow?: boolean;
  openingHours?: string;
  phoneNumber?: string;
  googleMapsUrl?: string;
  summary?: string; 
  coordinates?: { lat: number; lng: number };
  priorityScore?: number; 
  isTopRecommendation?: boolean;
}

// Family Alert Types

export interface Contact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  language: 'English' | 'Hindi' | 'Marathi';
}

export interface FamilyMessageRequest {
  medicalSummary: string;
  patientName: string;
  contacts: Contact[];
}

export type ViewState = 
  | 'landing' 
  | 'auth-login' 
  | 'auth-signup' 
  | 'dashboard' 
  | 'radiology' 
  | 'chat' 
  | 'care-finder' 
  | 'family-alert'
  | 'health-profile';
