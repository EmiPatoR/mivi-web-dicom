import { PORT, WORKLIST_DIR } from "../config.ts";
import type { WorklistService } from "../services/worklistService.ts";
import { jsonResponse } from "../utils/http.ts";

export async function handleHealth(
  service: WorklistService,
): Promise<Response> {
  const snapshot = await service.getHealthSnapshot();

  return jsonResponse({
    status: "healthy",
    timestamp: new Date().toISOString(),
    worklistDir: WORKLIST_DIR,
    port: PORT,
    generator: "dcmjs-1.0",
    ...snapshot,
  });
}
