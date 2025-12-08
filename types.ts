
export enum AgeGroup {
  INFANT = 'Infant (0-2)',
  CHILD = 'Child (3-12)',
  TEEN = 'Teen (13-18)',
  ADULT = 'Adult (19-64)',
  SENIOR = 'Senior (65+)'
}

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
  ageGroup: AgeGroup;
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

// Chat Module Types

export interface Differential {
    condition: string;
    reasoning: string;
    confidence: number;
}

export interface StructuredAIResponse {
    summary: string;
    differentialDiagnosis: Differential[];
    recommendedActions: string[];
    suggestedMedications: string[];
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
    startTime: number;
    messages: ChatMessage[];
    patientSummary: PatientDetails;
}

// Care Finder Module Types

export interface CarePlace {
  id: string; // generated or place_id
  name: string;
  type: 'Hospital' | 'Pharmacy' | 'Clinic' | 'Other';
  address: string;
  distanceKm: number; // calculated or provided
  rating?: number;
  userRatingsTotal?: number;
  isOpenNow?: boolean;
  openingHours?: string;
  phoneNumber?: string;
  googleMapsUrl?: string;
  summary?: string; // AI generated note
  coordinates?: { lat: number; lng: number };
  priorityScore?: number; // 0-100
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
  | 'family-alert';
