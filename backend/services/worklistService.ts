import type { Database, NewPatientRecord, PatientRecord } from "../db/database.ts";
import {
  createWorklistFile,
  readWorklistDataset,
  validateWorklistFile,
} from "../dicom/worklist.ts";
import type { ParsedPatientData, WorklistItem } from "../types.ts";
import { formatDisplayName, parseDicomPersonName } from "../utils/patient.ts";
import { normalizeFilename } from "../utils/worklist.ts";

const FALLBACK_MODALITY = "US";

function toDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function toString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function toDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export class WorklistService {
  private cache = new Map<string, ParsedPatientData>();

  constructor(private options: { worklistDir: string; db: Database }) {}

  async createWorklist(data: WorklistItem): Promise<{ filename: string }> {
    const filename = `${data.accessionNumber}.wl`;
    const outputPath = `${this.options.worklistDir}/${filename}`;

    await createWorklistFile(data, outputPath);

    const isValid = await validateWorklistFile(outputPath);
    if (!isValid) {
      throw new Error("Created DICOM file failed validation");
    }

    const patientRecord = this.toPatientRecord(data, filename);
    const parsed = this.toParsedPatientData(data, filename, new Date());

    this.cache.set(filename, parsed);

    if (this.options.db.isAvailable()) {
      const stored = await this.options.db.createPatient(patientRecord);
      if (!stored) {
        console.warn("⚠️ Failed to persist patient record to database");
      }
    }

    return { filename };
  }

  async listWorklists(): Promise<ParsedPatientData[]> {
    if (this.options.db.isAvailable()) {
      const records = await this.options.db.getAllPatients();
      const parsed = records.map((record) => this.mapRecordToParsed(record));
      this.cache.clear();
      parsed.forEach((item) => this.cache.set(item.filename, item));
      return parsed;
    }

    const fromFiles = await this.listFromFiles();
    return fromFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async deleteWorklist(filename: string): Promise<void> {
    const safeFilename = normalizeFilename(filename);
    if (!safeFilename) {
      throw new Error("Invalid filename");
    }

    try {
      await Deno.remove(`${this.options.worklistDir}/${safeFilename}`);
    } catch (error) {
      // Allow cleanup of DB rows even when the DICOM file is already missing.
      if (!(error instanceof Deno.errors.NotFound)) {
        throw error;
      }
    }

    if (this.options.db.isAvailable()) {
      const accessionNumber = safeFilename.replace(/\.wl$/i, "");
      await this.options.db.deletePatient(accessionNumber);
    }

    this.cache.delete(safeFilename);
  }

  async getHealthSnapshot(): Promise<{
    patientsCount: number;
    patients: Array<{
      name: string;
      sex: string;
      modality: string;
      stationAET?: string;
      filename: string;
    }>;
  }> {
    const patients = await this.listWorklists();
    return {
      patientsCount: patients.length,
      patients: patients.map((patient) => ({
        name: patient.patientName,
        sex: patient.sex,
        modality: patient.modality,
        stationAET: patient.stationAET,
        filename: patient.filename,
      })),
    };
  }

  private toPatientRecord(data: WorklistItem, filename: string): NewPatientRecord {
    return {
      accessionNumber: data.accessionNumber,
      patientId: data.patientId,
      patientName: data.patientName,
      patientFirstName: data.patientFirstName,
      patientMiddleName: data.patientMiddleName,
      birthDate: toDigits(data.birthDate),
      sex: data.sex,
      scheduledDate: toDigits(data.scheduledDate),
      scheduledTime: toDigits(data.scheduledTime),
      procedureDescription: data.procedureDescription,
      modality: data.modality,
      stationAET: data.stationAET,
      requestingPhysician: data.requestingPhysician,
      referringPhysician: data.referringPhysician,
      procedureStepId: data.procedureStepId,
      stationName: data.stationName,
      location: data.location,
      filename,
    };
  }

  private toParsedPatientData(
    data: WorklistItem,
    filename: string,
    createdAt: Date,
  ): ParsedPatientData {
    return {
      filename,
      patientName: formatDisplayName(
        data.patientName,
        data.patientFirstName,
        data.patientMiddleName,
      ),
      patientFirstName: data.patientFirstName,
      patientId: data.patientId,
      accessionNumber: data.accessionNumber,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      procedureDescription: data.procedureDescription,
      sex: data.sex,
      modality: data.modality,
      stationAET: data.stationAET,
      requestingPhysician: data.requestingPhysician,
      referringPhysician: data.referringPhysician,
      createdAt,
    };
  }

  private mapRecordToParsed(record: PatientRecord): ParsedPatientData {
    return {
      filename: record.filename,
      patientName: formatDisplayName(
        record.patientName,
        record.patientFirstName ?? undefined,
        record.patientMiddleName ?? undefined,
      ),
      patientFirstName: record.patientFirstName ?? undefined,
      patientId: record.patientId,
      accessionNumber: record.accessionNumber,
      scheduledDate: record.scheduledDate,
      scheduledTime: record.scheduledTime,
      procedureDescription: record.procedureDescription ?? "",
      sex: record.sex,
      modality: record.modality ?? FALLBACK_MODALITY,
      stationAET: record.stationAET ?? undefined,
      requestingPhysician: record.requestingPhysician ?? undefined,
      referringPhysician: record.referringPhysician ?? undefined,
      createdAt: toDate(record.createdAt) ?? new Date(),
    };
  }

  private async listFromFiles(): Promise<ParsedPatientData[]> {
    const worklists: ParsedPatientData[] = [];

    try {
      for await (const entry of Deno.readDir(this.options.worklistDir)) {
        if (!entry.isFile || !entry.name.endsWith(".wl")) {
          continue;
        }

        if (this.cache.has(entry.name)) {
          const cached = this.cache.get(entry.name);
          if (cached) {
            worklists.push(cached);
          }
          continue;
        }

        const filePath = `${this.options.worklistDir}/${entry.name}`;
        const parsed = await this.parseWorklistFile(filePath, entry.name);
        this.cache.set(entry.name, parsed);
        worklists.push(parsed);
      }
    } catch (error) {
      console.error("Error reading worklist directory:", error);
    }

    return worklists;
  }

  private async parseWorklistFile(
    filePath: string,
    filename: string,
  ): Promise<ParsedPatientData> {
    try {
      const dataset = await readWorklistDataset(filePath);
      const stat = await Deno.stat(filePath);
      const createdAt = stat.mtime ?? new Date();

      const nameValue = toString(dataset.PatientName);
      const nameParts = nameValue ? parseDicomPersonName(nameValue) : null;

      const sequence = Array.isArray(dataset.ScheduledProcedureStepSequence)
        ? dataset.ScheduledProcedureStepSequence[0]
        : undefined;

      const sequenceRecord = sequence && typeof sequence === "object"
        ? (sequence as Record<string, unknown>)
        : undefined;

      const scheduledDate = toString(
        sequenceRecord?.ScheduledProcedureStepStartDate,
      ) ??
        stat.mtime?.toISOString().split("T")[0] ??
        new Date().toISOString().split("T")[0];

      const scheduledTime = toString(
        sequenceRecord?.ScheduledProcedureStepStartTime,
      ) ?? "1000";

      const modality = toString(sequenceRecord?.Modality) ??
        FALLBACK_MODALITY;

      const stationAET = toString(sequenceRecord?.ScheduledStationAETitle);

      return {
        filename,
        patientName: formatDisplayName(
          nameParts?.patientName ?? `Patient ${filename.replace(".wl", "")}`,
          nameParts?.patientFirstName,
          nameParts?.patientMiddleName,
        ),
        patientFirstName: nameParts?.patientFirstName,
        patientId: toString(dataset.PatientID) ?? filename.replace(".wl", ""),
        accessionNumber: toString(dataset.AccessionNumber) ??
          filename.replace(".wl", ""),
        scheduledDate,
        scheduledTime,
        procedureDescription: toString(dataset.RequestedProcedureDescription) ??
          "Ultrasound Examination",
        sex: toString(dataset.PatientSex) ?? "M",
        modality,
        stationAET,
        requestingPhysician: toString(dataset.RequestingPhysician),
        referringPhysician: toString(dataset.ReferringPhysicianName),
        createdAt,
      };
    } catch (error) {
      console.warn(`⚠️ Could not parse DICOM file ${filename}:`, error);

      const stat = await Deno.stat(filePath);
      return {
        filename,
        patientName: `Patient ${filename.replace(".wl", "")}`,
        patientId: filename.replace(".wl", ""),
        accessionNumber: filename.replace(".wl", ""),
        scheduledDate: stat.mtime?.toISOString().split("T")[0] ??
          new Date().toISOString().split("T")[0],
        scheduledTime: "1000",
        procedureDescription: "Ultrasound Examination",
        sex: "M",
        modality: FALLBACK_MODALITY,
        createdAt: stat.mtime ?? new Date(),
      };
    }
  }
}
