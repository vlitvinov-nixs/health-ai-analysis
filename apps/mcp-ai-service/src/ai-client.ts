/**
 * Google Generative AI client wrapper for biomarker analysis
 */
import { GoogleGenAI } from '@google/genai';

// Define JSON schemas for expected responses
const BiomarkerAnalysisSchema = {
  type: 'object' as const,
  properties: {
    analyses: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          biomarkerId: { type: 'string' },
          name: { type: 'string' },
          value: { type: 'number' },
          status: { type: 'string', enum: ['normal', 'abnormal', 'critical'] },
          riskLevel: { type: 'string', enum: ['low', 'moderate', 'high'] },
          explanation: { type: 'string' },
          recommendations: { type: 'array', items: { type: 'string' } },
        },
        required: ['biomarkerId', 'name', 'value', 'status', 'riskLevel', 'explanation'],
      },
    },
    overallAssessment: { type: 'string' },
    urgentFlags: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['analyses', 'overallAssessment'],
};

const MonitoringPrioritiesSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      biomarkerId: { type: 'string' },
      name: { type: 'string' },
      priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
      reason: { type: 'string' },
      actionItems: { type: 'array', items: { type: 'string' } },
    },
    required: ['biomarkerId', 'name', 'priority', 'reason'],
  },
};

const HealthSummarySchema = {
  type: 'object' as const,
  properties: {
    overallRiskLevel: { type: 'string', enum: ['low', 'moderate', 'high', 'critical'] },
    keyFindings: {
      type: 'array',
      items: { type: 'string' },
    },
    concerningBiomarkers: {
      type: 'array',
      items: { type: 'string' },
    },
    recommendations: {
      type: 'array',
      items: { type: 'string' },
    },
    nextSteps: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['overallRiskLevel', 'keyFindings', 'recommendations', 'nextSteps'],
};

export class AIClient {
  private client: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY environment variable is not set');
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  async generateContent(prompt: string, jsonSchema?: any): Promise<string> {
    try {
      const config: any = {
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      };

      // Add JSON schema if provided (enforces JSON mode)
      if (jsonSchema) {
        config.generationConfig = {
          responseMimeType: 'application/json',
          responseSchema: jsonSchema,
        };
      }

      const result = await this.client.models.generateContent(config);

      // Extract text from response
      if (result.candidates && result.candidates.length > 0) {
        const content = result.candidates[0].content;
        if (content && content.parts && content.parts.length > 0) {
          const textPart = content.parts.find(p => 'text' in p);
          if (textPart && 'text' in textPart && textPart.text) {
            let responseText = textPart.text;

            // Ensure we have clean text (strip markdown if present)
            // Sometimes Gemini still wraps in markdown despite schema mode
            const markdownMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (markdownMatch && markdownMatch[1]) {
              responseText = markdownMatch[1].trim();
            }

            return responseText;
          }
        }
      }

      throw new Error('No valid response from API');
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }

  async analyzeBiomarkers(patientData: string): Promise<string> {
    const prompt = `You are a healthcare AI assistant specialized in biomarker analysis. 
Analyze the following patient biomarker data and provide insights with these fields:
- analyses: array of biomarker analysis objects
- overallAssessment: brief summary of the patient's health status
- urgentFlags: (optional) array of any biomarkers requiring immediate attention

Patient Data:
${patientData}`;

    return this.generateContent(prompt, BiomarkerAnalysisSchema);
  }

  async suggestMonitoringPriorities(patientData: string): Promise<string> {
    const prompt = `You are a healthcare professional. Based on these biomarkers, prioritize which ones need the closest monitoring.
Return an array of objects with:
- biomarkerId: the marker ID
- name: marker name
- priority: critical/high/medium/low
- reason: why this priority level
- actionItems: (optional) array of recommended actions

Patient Data:
${patientData}`;

    return this.generateContent(prompt, MonitoringPrioritiesSchema);
  }

  async generateHealthSummary(patientData: string): Promise<string> {
    const prompt = `You are a healthcare AI assistant. Create a comprehensive health summary for this patient with:
- overallRiskLevel: low/moderate/high/critical
- keyFindings: array of 3-5 key clinical findings
- concerningBiomarkers: array of biomarker names that are abnormal
- recommendations: array of clinical recommendations
- nextSteps: array of recommended follow-up actions

Patient Data:
${patientData}`;

    return this.generateContent(prompt, HealthSummarySchema);
  }
}
