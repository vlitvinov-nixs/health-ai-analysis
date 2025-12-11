import 'reflect-metadata';
import { injectable } from 'tsyringe';
import type { Biomarker, BiomarkerCategory } from '../models';
import { database } from '../config/database';

@injectable()
export class BiomarkerRepository {
  getBiomarkersByPatientId(patientId: string): Biomarker[] {
    return database.getBiomarkersByPatientId(patientId);
  }

  getBiomarkersByPatientIdAndCategory(patientId: string, category: BiomarkerCategory): Biomarker[] {
    return database.getBiomarkersByPatientIdAndCategory(patientId, category);
  }
}
