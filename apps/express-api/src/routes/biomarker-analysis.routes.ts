import type { Router, Request, Response } from 'express';
import type { MCPClientService } from '../services';
import type { PatientService } from '../services';
import type { BiomarkerService } from '../services';

export function setupBiomarkerAnalysisRoutes(
  router: Router,
  patientService: PatientService,
  biomarkerService: BiomarkerService,
  mcpClientService: MCPClientService
): void {
  // POST /api/patients/:patientId/analyze
  router.post('/patients/:patientId/analyze', async (req: Request, res: Response) => {
    try {
      const patientId = req.params.patientId;

      // Get patient from repository
      const patient = patientService.getPatientById(patientId);

      if (!patient) {
        res.status(404).json({
          success: false,
          error: 'Patient not found',
        });
        return;
      }

      // Get patient's biomarkers
      const biomarkers = biomarkerService.getBiomarkersByPatientId(patientId);

      if (biomarkers.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Patient has no biomarkers to analyze',
        });
        return;
      }

      // Prepare data for MCP service
      const analysisRequest = {
        patient_id: patient.id,
        patient_name: patient.name,
        biomarkers: biomarkers.map((b) => ({
          id: b.id,
          name: b.name,
          value: b.value,
          unit: b.unit,
          status: b.status,
          category: b.category,
          referenceRange: b.referenceRange,
        })),
      };

      // Call MCP service for comprehensive analysis
      const analysis = await mcpClientService.getComprehensiveAnalysis(
        analysisRequest
      );

      res.json({
        success: true,
        data: {
          patientId: patient.id,
          patientName: patient.name,
          analysis,
        },
      });
    } catch (error) {
      console.error('Error analyzing patient biomarkers:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze biomarkers',
      });
    }
  });

  // GET /api/mcp/health - Check MCP service health
  router.get('/mcp/health', async (req: Request, res: Response) => {
    try {
      const isHealthy = await mcpClientService.checkHealth();
      res.json({
        success: true,
        mcpServiceHealthy: isHealthy,
        mcpServerUrl: process.env.MCP_PORT || '3001',
      });
    } catch (error) {
      console.error('Error checking MCP health:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check MCP service health',
      });
    }
  });
}
