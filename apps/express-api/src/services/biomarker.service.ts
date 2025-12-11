import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import type { Biomarker, BiomarkerCategory } from '../models';
import { BiomarkerRepository } from '../repositories';

@injectable()
export class BiomarkerService {
  constructor(@inject(BiomarkerRepository) private biomarkerRepository: BiomarkerRepository) {}

  getBiomarkersByPatientId(patientId: string): Biomarker[] {
    return this.biomarkerRepository.getBiomarkersByPatientId(patientId);
  }

  getBiomarkersByPatientIdAndCategory(
    patientId: string,
    category: BiomarkerCategory
  ): Biomarker[] {
    return this.biomarkerRepository.getBiomarkersByPatientIdAndCategory(patientId, category);
  }
}
