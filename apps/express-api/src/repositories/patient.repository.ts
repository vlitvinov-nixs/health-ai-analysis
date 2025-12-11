import 'reflect-metadata';
import { injectable } from 'tsyringe';
import type { Patient } from '../models';
import { database } from '../config/database';

@injectable()
export class PatientRepository {
  getAllPatients(): Patient[] {
    return database.getAllPatients();
  }

  getPatientById(id: string): Patient | undefined {
    return database.getPatientById(id);
  }
}
