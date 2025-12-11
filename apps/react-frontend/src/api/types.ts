export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  lastVisit: string;
}

export type BiomarkerCategory = 'metabolic' | 'cardiovascular' | 'hormonal';
export type BiomarkerStatus = 'normal' | 'high' | 'low';

export interface ReferenceRange {
  min: number;
  max: number;
}

export interface Biomarker {
  id: string;
  patientId: string;
  name: string;
  value: number;
  unit: string;
  category: BiomarkerCategory;
  referenceRange: ReferenceRange;
  measuredAt: string;
  status: BiomarkerStatus;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface BiomarkersResponse {
  patientId: string;
  patientName: string;
  category?: BiomarkerCategory;
  biomarkers: Biomarker[];
}
