/**
 * Types for biomarker analysis tools
 */

export interface Biomarker {
  id: string;
  name: string;
  value: number;
  unit: string;
  referenceRange: {
    min: number;
    max: number;
  };
  status: 'normal' | 'high' | 'low';
  category: 'metabolic' | 'cardiovascular' | 'hormonal';
  lastUpdated: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  biomarkers: Biomarker[];
}

export interface BiomarkerAnalysis {
  biomarkerId: string;
  name: string;
  value: number;
  status: string;
  riskLevel: 'low' | 'moderate' | 'high';
  explanation: string;
  recommendations: string[];
}

export interface MonitoringPriority {
  biomarkerId: string;
  name: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  actionItems: string[];
}

export interface HealthSummary {
  patientId: string;
  patientName: string;
  overallRiskLevel: 'low' | 'moderate' | 'high' | 'critical';
  keyFindings: string[];
  concerningBiomarkers: string[];
  recommendations: string[];
  nextSteps: string[];
}
