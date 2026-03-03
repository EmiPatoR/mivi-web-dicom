export interface WorklistItem {
  accessionNumber: string;
  patientName: string;
  patientFirstName: string;
  patientMiddleName?: string;
  patientId: string;
  birthDate: string;
  sex: string;
  requestingPhysician?: string;
  referringPhysician?: string;
  procedureDescription: string;
  scheduledDate: string;
  scheduledTime: string;
  modality: string;
  stationAET: string;
  procedureStepId: string;
  stationName: string;
  location: string;
}

export type WorklistPayload = Partial<WorklistItem>;

export interface ParsedPatientData {
  filename: string;
  patientName: string;
  patientFirstName?: string;
  patientId: string;
  accessionNumber: string;
  scheduledDate: string;
  scheduledTime: string;
  procedureDescription: string;
  sex: string;
  modality: string;
  stationAET?: string;
  requestingPhysician?: string;
  referringPhysician?: string;
  createdAt: Date;
}
