/**
 * Tool handlers for MCP server
 */
import { AIClient } from '../ai-client';
import {
  Biomarker,
  Patient,
  BiomarkerAnalysis,
  MonitoringPriority,
  HealthSummary,
} from '../types';

// Helper to extract JSON from response (handles markdown, direct JSON, or text)
function extractJSON(text: string): string {
  // Clean up the text
  let cleaned = text.trim();

  // Remove leading/trailing markdown code blocks: ```json...```
  // This handles newlines and variations
  cleaned = cleaned.replace(/^```(?:json|javascript|ts|typescript)?\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  cleaned = cleaned.trim();

  // If it still starts with backticks, try more aggressive stripping
  while (cleaned.startsWith('`')) {
    cleaned = cleaned.slice(1);
  }
  while (cleaned.endsWith('`')) {
    cleaned = cleaned.slice(0, -1);
  }
  cleaned = cleaned.trim();

  // Try to find JSON object or array using greedy matching
  // Look for { or [ and find the matching closing brace
  if (cleaned.includes('{')) {
    const startIdx = cleaned.indexOf('{');
    // Try to find closing brace, handling nested braces
    let braceCount = 0;
    let endIdx = -1;
    for (let i = startIdx; i < cleaned.length; i++) {
      if (cleaned[i] === '{') braceCount++;
      if (cleaned[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIdx = i;
          break;
        }
      }
    }
    if (endIdx !== -1) {
      return cleaned.substring(startIdx, endIdx + 1);
    }
  }

  if (cleaned.includes('[')) {
    const startIdx = cleaned.indexOf('[');
    // Try to find closing bracket, handling nested brackets
    let bracketCount = 0;
    let endIdx = -1;
    for (let i = startIdx; i < cleaned.length; i++) {
      if (cleaned[i] === '[') bracketCount++;
      if (cleaned[i] === ']') {
        bracketCount--;
        if (bracketCount === 0) {
          endIdx = i;
          break;
        }
      }
    }
    if (endIdx !== -1) {
      return cleaned.substring(startIdx, endIdx + 1);
    }
  }

  throw new Error('No valid JSON found in response');
}

export class ToolHandlers {
  private aiClient: AIClient;

  constructor(apiKey: string) {
    this.aiClient = new AIClient(apiKey);
  }

  async analyzeBiomarkers(patient: Patient): Promise<BiomarkerAnalysis[]> {
    const patientJson = JSON.stringify(patient, null, 2);

    try {
      const result = await this.aiClient.analyzeBiomarkers(patientJson);
      // Extract JSON from response (handles markdown, direct JSON, or text)
      const jsonStr = extractJSON(result);
      const parsed = JSON.parse(jsonStr);
      return parsed.analyses || [];
    } catch (error) {
      console.error('Error analyzing biomarkers:', error);
      return this.getFallbackAnalysis(patient);
    }
  }

  async suggestMonitoringPriorities(patient: Patient): Promise<MonitoringPriority[]> {
    const patientJson = JSON.stringify(patient, null, 2);

    try {
      const result = await this.aiClient.suggestMonitoringPriorities(patientJson);
      // Extract JSON from response (handles markdown, direct JSON, or text)
      const jsonStr = extractJSON(result);
      const parsed = JSON.parse(jsonStr);
      return parsed || [];
    } catch (error) {
      console.error('Error suggesting monitoring priorities:', error);
      return this.getFallbackPriorities(patient);
    }
  }

  async generateHealthSummary(patient: Patient): Promise<HealthSummary> {
    const patientJson = JSON.stringify(patient, null, 2);

    try {
      const result = await this.aiClient.generateHealthSummary(patientJson);
      // Extract JSON from response (handles markdown, direct JSON, or text)
      const jsonStr = extractJSON(result);
      const parsed = JSON.parse(jsonStr);
      return {
        patientId: patient.id,
        patientName: patient.name,
        ...parsed,
      };
    } catch (error) {
      console.error('Error generating health summary:', error);
      return this.getFallbackHealthSummary(patient);
    }
  }

  private getFallbackAnalysis(patient: Patient): BiomarkerAnalysis[] {
    return patient.biomarkers.map((bm) => {
      const rangeStr = bm.referenceRange
        ? `${bm.referenceRange.min}-${bm.referenceRange.max}`
        : 'unknown';
      return {
        biomarkerId: bm.id,
        name: bm.name,
        value: bm.value,
        status: bm.status,
        riskLevel: bm.status === 'normal' ? 'low' : 'moderate',
        explanation: `${bm.name} is currently ${bm.status}. Reference range: ${rangeStr} ${bm.unit}`,
        recommendations: [
          bm.status === 'normal'
            ? `Continue monitoring ${bm.name} regularly`
            : `Consider discussing ${bm.name} with your healthcare provider`,
        ],
      };
    });
  }

  private getFallbackPriorities(patient: Patient): MonitoringPriority[] {
    return patient.biomarkers
      .filter((bm) => bm.status !== 'normal')
      .map((bm) => ({
        biomarkerId: bm.id,
        name: bm.name,
        priority:
          bm.status === 'high' || bm.status === 'low' ? 'high' : 'medium',
        reason: `${bm.name} is ${bm.status} and requires attention`,
        actionItems: [
          `Monitor ${bm.name} weekly`,
          `Schedule follow-up appointment if not improving`,
        ],
      }));
  }

  private getFallbackHealthSummary(patient: Patient): HealthSummary {
    const abnormalBiomarkers = patient.biomarkers.filter(
      (bm) => bm.status !== 'normal'
    );
    const overallRiskLevel =
      abnormalBiomarkers.length > 3
        ? 'high'
        : abnormalBiomarkers.length > 0
          ? 'moderate'
          : 'low';

    return {
      patientId: patient.id,
      patientName: patient.name,
      overallRiskLevel,
      keyFindings: [
        `Patient has ${abnormalBiomarkers.length} abnormal biomarkers`,
        `Age: ${patient.age}, Gender: ${patient.gender}`,
      ],
      concerningBiomarkers: abnormalBiomarkers.map((bm) => bm.name),
      recommendations: [
        'Regular monitoring recommended',
        'Discuss results with healthcare provider',
      ],
      nextSteps: [
        'Schedule follow-up appointment',
        'Consider lifestyle modifications if appropriate',
      ],
    };
  }
}
