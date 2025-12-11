export type BiomarkerStatus = 'normal' | 'high' | 'low';
export type BiomarkerCategory = 'metabolic' | 'cardiovascular' | 'hormonal';

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
  measuredAt: string; // ISO 8601 format
  status: BiomarkerStatus;
}
