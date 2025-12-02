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
