import { dcmjs } from "../deps.ts";
import type { WorklistItem } from "../types.ts";

function formatDicomDate(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 ? digits.slice(0, 8) : digits;
}

function formatDicomTime(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length >= 6) {
    return digits.slice(0, 6);
  }
  if (digits.length >= 4) {
    return digits.padEnd(6, "0");
  }
  return digits.padEnd(6, "0");
}

function formatDicomPersonName(data: WorklistItem): string {
  if (data.patientMiddleName) {
    return `${data.patientName}^${data.patientFirstName}^${data.patientMiddleName}^^`;
  }
  return `${data.patientName}^${data.patientFirstName}^^`;
}

export function buildWorklistDataset(data: WorklistItem): Record<string, unknown> {
  const patientName = formatDicomPersonName(data);
  const formattedBirthDate = formatDicomDate(data.birthDate);
  const formattedScheduledDate = formatDicomDate(data.scheduledDate);
  const formattedScheduledTime = formatDicomTime(data.scheduledTime);

  const studyInstanceUID = dcmjs.data.DicomMetaDictionary.uid();

  const scheduledStep: Record<string, unknown> = {
    ScheduledStationAETitle: data.stationAET,
    Modality: data.modality,
    ScheduledProcedureStepStartDate: formattedScheduledDate,
    ScheduledProcedureStepStartTime: formattedScheduledTime,
    ScheduledProcedureStepID: data.procedureStepId,
    ScheduledProcedureStepDescription: data.procedureDescription,
    ScheduledStationName: data.stationName,
    ScheduledProcedureStepLocation: data.location,
  };

  if (data.requestingPhysician) {
    scheduledStep.ScheduledPerformingPhysicianName = data.requestingPhysician;
  }

  const dataset: Record<string, unknown> = {
    AccessionNumber: data.accessionNumber,
    PatientName: patientName,
    PatientID: data.patientId,
    PatientBirthDate: formattedBirthDate,
    PatientSex: data.sex,
    StudyInstanceUID: studyInstanceUID,
    RequestedProcedureDescription: data.procedureDescription,
    SpecificCharacterSet: "ISO_IR 100",
    ScheduledProcedureStepSequence: [scheduledStep],
  };

  if (data.referringPhysician) {
    dataset.ReferringPhysicianName = data.referringPhysician;
  }

  if (data.requestingPhysician) {
    dataset.RequestingPhysician = data.requestingPhysician;
  }

  return dataset;
}

export async function createWorklistFile(
  data: WorklistItem,
  outputPath: string,
): Promise<void> {
  const dataset = buildWorklistDataset(data);

  const dicomDict = new dcmjs.data.DicomDict({});
  dicomDict.dict = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(dataset);

  // Orthanc worklist plugin expects raw datasets without Part 10 headers.
  const dicomBuffer = dicomDict.write({
    fragmentMultiframe: false,
    allowInvalidVRLength: false,
  });

  await Deno.writeFile(outputPath, new Uint8Array(dicomBuffer));
}

export async function readWorklistDataset(
  filePath: string,
): Promise<Record<string, unknown>> {
  const fileBuffer = await Deno.readFile(filePath);
  const dicomDict = dcmjs.data.DicomMessage.readFile(fileBuffer.buffer);
  return dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDict.dict);
}

export async function validateWorklistFile(filePath: string): Promise<boolean> {
  try {
    const dataset = await readWorklistDataset(filePath);

    const requiredTags = [
      "AccessionNumber",
      "PatientName",
      "PatientID",
      "PatientSex",
      "ScheduledProcedureStepSequence",
    ];

    for (const tag of requiredTags) {
      if (!dataset[tag]) {
        console.warn(`⚠️ Missing required tag: ${tag}`);
        return false;
      }
    }

    const sequence = dataset.ScheduledProcedureStepSequence;
    if (!Array.isArray(sequence) || sequence.length === 0) {
      console.warn("⚠️ Invalid ScheduledProcedureStepSequence");
      return false;
    }

    const stepSequence = sequence[0] as Record<string, unknown>;
    const requiredStepTags = [
      "ScheduledStationAETitle",
      "Modality",
      "ScheduledProcedureStepStartDate",
      "ScheduledProcedureStepStartTime",
    ];

    for (const tag of requiredStepTags) {
      if (!stepSequence[tag]) {
        console.warn(`⚠️ Missing required step tag: ${tag}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("❌ Error validating DICOM file:", error);
    return false;
  }
}
