import 'reflect-metadata';
import { injectable, inject } from 'tsyringe';
import type { Patient } from '../models';
import { PatientRepository } from '../repositories';

@injectable()
export class PatientService {
  constructor(@inject(PatientRepository) private patientRepository: PatientRepository) {}

  getAllPatients(): Patient[] {
    return this.patientRepository.getAllPatients();
  }

  getPatientById(id: string): Patient | undefined {
    return this.patientRepository.getPatientById(id);
  }
}
