import type { Router, Request, Response } from 'express';
import type { PatientService, BiomarkerService } from '../services';
import type { BiomarkerCategory } from '../models';

export function setupBiomarkerRoutes(
  router: Router,
  patientService: PatientService,
  biomarkerService: BiomarkerService
): void {
  // GET /api/patients/:id/biomarkers
  // GET /api/patients/:id/biomarkers?category=:category
  router.get('/patients/:id/biomarkers', (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { category } = req.query;

      // Verify patient exists
      const patient = patientService.getPatientById(id);
      if (!patient) {
        res.status(404).json({
          success: false,
          error: 'Patient not found',
        });
        return;
      }

      let biomarkers;

      if (category) {
        // Validate category
        const validCategories: BiomarkerCategory[] = ['metabolic', 'cardiovascular', 'hormonal'];
        if (!validCategories.includes(category as BiomarkerCategory)) {
          res.status(400).json({
            success: false,
            error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
          });
          return;
        }

        biomarkers = biomarkerService.getBiomarkersByPatientIdAndCategory(
          id,
          category as BiomarkerCategory
        );
      } else {
        biomarkers = biomarkerService.getBiomarkersByPatientId(id);
      }

      res.json({
        success: true,
        data: {
          patientId: id,
          patientName: patient.name,
          category: category || 'all',
          biomarkers,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch biomarkers',
      });
    }
  });
}
