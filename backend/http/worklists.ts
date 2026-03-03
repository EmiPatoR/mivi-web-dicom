import type { WorklistService } from "../services/worklistService.ts";
import type { WorklistPayload } from "../types.ts";
import { jsonResponse } from "../utils/http.ts";
import { getMissingRequiredFields, normalizeWorklistInput } from "../utils/worklist.ts";

export async function handleGetWorklists(
  service: WorklistService,
): Promise<Response> {
  const worklists = await service.listWorklists();
  return jsonResponse(worklists);
}

export async function handleCreateWorklist(
  req: Request,
  service: WorklistService,
): Promise<Response> {
  try {
    const payload = (await req.json()) as WorklistPayload;
    const missing = getMissingRequiredFields(payload);

    if (missing.length > 0) {
      return jsonResponse(
        { error: "Missing required fields", missing },
        { status: 400 },
      );
    }

    const normalized = normalizeWorklistInput(payload);
    console.log(
      `🆕 Creating DICOM worklist for: ${normalized.patientFirstName} ${normalized.patientName} ` +
        `(${normalized.sex}, ${normalized.modality}) -> ${normalized.stationAET}`,
    );

    const { filename } = await service.createWorklist(normalized);

    return jsonResponse({
      success: true,
      filename,
      message: "DICOM worklist created successfully with dcmjs",
      patientData: {
        name: `${normalized.patientFirstName} ${normalized.patientName}`,
        sex: normalized.sex,
        modality: normalized.modality,
        stationAET: normalized.stationAET,
        id: normalized.patientId,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating worklist:", error);
    return jsonResponse(
      { error: "Failed to create DICOM worklist", details: message },
      { status: 500 },
    );
  }
}

export async function handleDeleteWorklist(
  filename: string,
  service: WorklistService,
): Promise<Response> {
  try {
    await service.deleteWorklist(filename);
    return jsonResponse({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid filename") {
      return jsonResponse({ error: "Invalid filename" }, { status: 400 });
    }
    if (error instanceof Deno.errors.NotFound) {
      return jsonResponse({ error: "Worklist not found" }, { status: 404 });
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting worklist:", error);
    return jsonResponse(
      { error: "Failed to delete worklist item", details: message },
      { status: 500 },
    );
  }
}
