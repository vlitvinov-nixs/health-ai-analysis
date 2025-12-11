import { randomUUID } from 'crypto';
import type { Patient, Biomarker, BiomarkerCategory } from '../models';

class Database {
  private patients: Patient[] = [];
  private biomarkers: Biomarker[] = [];

  constructor() {
    this.seed();
  }

  private seed(): void {
    // Create 5 patients
    const patientNames = [
      'John Smith',
      'Sarah Johnson',
      'Michael Brown',
      'Emily Davis',
      'Robert Wilson',
    ];

    const patients: Patient[] = patientNames.map((name) => ({
      id: randomUUID(),
      name,
      dateOfBirth: new Date(1970 + Math.floor(Math.random() * 30), 0, 1).toISOString(),
      lastVisit: new Date(2024, 0, 1 + Math.floor(Math.random() * 365)).toISOString(),
    }));

    this.patients = patients;

    // Create biomarkers for each patient
    const metabolicBiomarkers = [
      { name: 'Glucose', unit: 'mg/dL', min: 70, max: 100 },
      { name: 'Triglycerides', unit: 'mg/dL', min: 0, max: 150 },
      { name: 'Total Cholesterol', unit: 'mg/dL', min: 0, max: 200 },
      { name: 'HbA1c', unit: '%', min: 0, max: 5.7 },
      { name: 'Insulin', unit: 'mIU/L', min: 2, max: 25 },
    ];

    const cardiovascularBiomarkers = [
      { name: 'Systolic BP', unit: 'mmHg', min: 90, max: 120 },
      { name: 'Diastolic BP', unit: 'mmHg', min: 60, max: 80 },
      { name: 'HDL Cholesterol', unit: 'mg/dL', min: 40, max: 200 },
      { name: 'LDL Cholesterol', unit: 'mg/dL', min: 0, max: 100 },
      { name: 'Heart Rate', unit: 'bpm', min: 60, max: 100 },
    ];

    const hormonalBiomarkers = [
      { name: 'Testosterone', unit: 'ng/dL', min: 300, max: 1000 },
      { name: 'Cortisol', unit: 'μg/dL', min: 10, max: 20 },
      { name: 'TSH', unit: 'mIU/L', min: 0.4, max: 4 },
      { name: 'Estrogen', unit: 'pg/mL', min: 10, max: 500 },
      { name: 'Progesterone', unit: 'ng/mL', min: 0.1, max: 28 },
    ];

    const biomarkerTemplates = [
      { category: 'metabolic' as const, markers: metabolicBiomarkers },
      { category: 'cardiovascular' as const, markers: cardiovascularBiomarkers },
      { category: 'hormonal' as const, markers: hormonalBiomarkers },
    ];

    const biomarkers: Biomarker[] = [];

    patients.forEach((patient) => {
      biomarkerTemplates.forEach(({ category, markers }) => {
        markers.forEach((template) => {
          const randomValue = template.min + Math.random() * (template.max - template.min);
          const value = Math.round(randomValue * 100) / 100;

          let status: 'normal' | 'high' | 'low';
          if (value < template.min) {
            status = 'low';
          } else if (value > template.max) {
            status = 'high';
          } else {
            status = 'normal';
          }

          biomarkers.push({
            id: randomUUID(),
            patientId: patient.id,
            name: template.name,
            value,
            unit: template.unit,
            category,
            referenceRange: {
              min: template.min,
              max: template.max,
            },
            measuredAt: new Date(2024, 0, 1 + Math.floor(Math.random() * 365)).toISOString(),
            status,
          });
        });
      });
    });

    this.biomarkers = biomarkers;
  }

  // Patient methods
  getAllPatients(): Patient[] {
    return this.patients;
  }

  getPatientById(id: string): Patient | undefined {
    return this.patients.find((p) => p.id === id);
  }

  // Biomarker methods
  getBiomarkersByPatientId(patientId: string): Biomarker[] {
    return this.biomarkers.filter((b) => b.patientId === patientId);
  }

  getBiomarkersByPatientIdAndCategory(
    patientId: string,
    category: BiomarkerCategory
  ): Biomarker[] {
    return this.biomarkers.filter((b) => b.patientId === patientId && b.category === category);
  }
}

// Export singleton instance
export const database = new Database();
