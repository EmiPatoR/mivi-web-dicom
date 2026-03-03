import { ALLOWED_SEXES, DEFAULTS } from "../config.ts";
import type { WorklistItem, WorklistPayload } from "../types.ts";
import { generateId } from "./ids.ts";

const REQUIRED_FIELDS: (keyof WorklistPayload)[] = [
  "patientName",
  "patientFirstName",
  "birthDate",
  "procedureDescription",
  "scheduledDate",
  "scheduledTime",
];

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function normalizeText(value: string | undefined): string {
  return value?.trim() ?? "";
}

export function getMissingRequiredFields(payload: WorklistPayload): string[] {
  return REQUIRED_FIELDS.filter((field) => isBlank(payload[field]));
}

export function normalizeWorklistInput(payload: WorklistPayload): WorklistItem {
  const sex = normalizeText(payload.sex || DEFAULTS.sex).toUpperCase();
  const normalizedSex = ALLOWED_SEXES.has(sex) ? sex : DEFAULTS.sex;
  const modality = normalizeText(payload.modality || DEFAULTS.modality).toUpperCase();

  const stationAET = normalizeText(payload.stationAET || DEFAULTS.stationAET).toUpperCase();
  const stationName = normalizeText(payload.stationName || stationAET || "WORKLIST");
  const location = normalizeText(payload.location || stationName || "WORKLIST");

  const accessionNumber = normalizeText(payload.accessionNumber) || generateId("ACC");
  const patientId = normalizeText(payload.patientId) || generateId("PAT");
  const procedureStepId = normalizeText(payload.procedureStepId) || generateId("STEP");

  return {
    accessionNumber,
    patientName: normalizeText(payload.patientName),
    patientFirstName: normalizeText(payload.patientFirstName),
    patientMiddleName: normalizeText(payload.patientMiddleName) || undefined,
    patientId,
    birthDate: normalizeText(payload.birthDate),
    sex: normalizedSex,
    requestingPhysician: normalizeText(payload.requestingPhysician) || undefined,
    referringPhysician: normalizeText(payload.referringPhysician) || undefined,
    procedureDescription: normalizeText(payload.procedureDescription),
    scheduledDate: normalizeText(payload.scheduledDate),
    scheduledTime: normalizeText(payload.scheduledTime),
    modality,
    stationAET,
    procedureStepId,
    stationName,
    location,
  };
}

export function normalizeFilename(filename: string): string | null {
  const trimmed = filename.trim();
  if (!trimmed || trimmed.includes("/") || trimmed.includes("\\")) {
    return null;
  }
  return trimmed.endsWith(".wl") ? trimmed : `${trimmed}.wl`;
}
