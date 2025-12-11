import type { Router, Request, Response } from 'express';
import type { PatientService } from '../services';

export function setupPatientRoutes(router: Router, patientService: PatientService): void {
  // GET /api/patients
  router.get('/patients', (req: Request, res: Response) => {
    try {
      const patients = patientService.getAllPatients();
      res.json({
        success: true,
        data: patients,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch patients',
      });
    }
  });
}
