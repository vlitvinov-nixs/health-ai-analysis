/**
 * MCP Client Service
 * Handles communication with the MCP AI Service for biomarker analysis
 */
import { injectable } from 'tsyringe';

interface MCPToolResponse {
  success: boolean;
  result?: unknown;
  error?: string;
}

interface BiomarkerData {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'high' | 'low';
  category: 'metabolic' | 'cardiovascular' | 'hormonal';
  referenceRange?: { min: number; max: number };
}

interface PatientAnalysisRequest {
  patient_id: string;
  patient_name: string;
  age?: number;
  gender?: string;
  biomarkers: BiomarkerData[];
}

interface AnalysisResult {
  analyzeBiomarkers: unknown;
  suggestMonitoringPriorities: unknown;
  generateHealthSummary: unknown;
}

@injectable()
export class MCPClientService {
  private readonly mcpServerUrl: string;
  private readonly mcpPort: string;

  constructor() {
    this.mcpPort = process.env.MCP_PORT || '3001';
    this.mcpServerUrl = `http://localhost:${this.mcpPort}`;
  }

  /**
   * Check if MCP server is healthy
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/`);
      return response.ok;
    } catch (error) {
      console.error('MCP health check failed:', error);
      return false;
    }
  }

  /**
   * Analyze biomarkers using MCP service
   */
  async analyzeBiomarkers(
    patient: PatientAnalysisRequest
  ): Promise<unknown> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/tool`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolName: 'analyze_biomarkers',
          args: patient,
        }),
      });

      if (!response.ok) {
        throw new Error(`MCP service error: ${response.statusText}`);
      }

      const data = (await response.json()) as MCPToolResponse;

      if (!data.success) {
        throw new Error(data.error || 'MCP service returned error');
      }

      return data.result;
    } catch (error) {
      console.error('Error analyzing biomarkers:', error);
      throw error;
    }
  }

  /**
   * Suggest monitoring priorities using MCP service
   */
  async suggestMonitoringPriorities(
    patient: PatientAnalysisRequest
  ): Promise<unknown> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/tool`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolName: 'suggest_monitoring_priorities',
          args: patient,
        }),
      });

      if (!response.ok) {
        throw new Error(`MCP service error: ${response.statusText}`);
      }

      const data = (await response.json()) as MCPToolResponse;

      if (!data.success) {
        throw new Error(data.error || 'MCP service returned error');
      }

      return data.result;
    } catch (error) {
      console.error('Error suggesting monitoring priorities:', error);
      throw error;
    }
  }

  /**
   * Generate health summary using MCP service
   */
  async generateHealthSummary(
    patient: PatientAnalysisRequest
  ): Promise<unknown> {
    try {
      const response = await fetch(`${this.mcpServerUrl}/tool`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolName: 'generate_health_summary',
          args: patient,
        }),
      });

      if (!response.ok) {
        throw new Error(`MCP service error: ${response.statusText}`);
      }

      const data = (await response.json()) as MCPToolResponse;

      if (!data.success) {
        throw new Error(data.error || 'MCP service returned error');
      }

      return data.result;
    } catch (error) {
      console.error('Error generating health summary:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive analysis combining all three tools
   */
  async getComprehensiveAnalysis(
    patient: PatientAnalysisRequest
  ): Promise<AnalysisResult> {
    try {
      const [analyzeBiomarkers, suggestMonitoringPriorities, generateHealthSummary] =
        await Promise.all([
          this.analyzeBiomarkers(patient),
          this.suggestMonitoringPriorities(patient),
          this.generateHealthSummary(patient),
        ]);

      return {
        analyzeBiomarkers,
        suggestMonitoringPriorities,
        generateHealthSummary,
      };
    } catch (error) {
      console.error('Error getting comprehensive analysis:', error);
      throw error;
    }
  }
}
