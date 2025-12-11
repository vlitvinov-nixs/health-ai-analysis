export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string; // ISO 8601 format
  lastVisit: string;   // ISO 8601 format
}
