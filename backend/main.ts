import { ensureDir } from "./deps.ts";
import { PORT, WORKLIST_DIR } from "./config.ts";
import { db } from "./db/database.ts";
import { createServer } from "./server.ts";
import { WorklistService } from "./services/worklistService.ts";

await ensureDir(WORKLIST_DIR);
await db.connect();

const service = new WorklistService({ worklistDir: WORKLIST_DIR, db });
const handler = createServer(service);

console.log(`🚀 MiVi DICOM Worklist Manager starting on http://localhost:${PORT}`);
console.log(`📁 Worklist directory: ${WORKLIST_DIR}`);
console.log(
  `💾 Database: ${db.isAvailable() ? "PostgreSQL (persistent)" : "In-memory (not persistent)"}`,
);
console.log("🔗 Connect your ultrasound machine to query Orthanc worklists");
console.log("📝 Using dcmjs for raw DICOM worklist generation (Orthanc format)");
console.log("🏥 Compatible with Samsung WS80A and other modalities");

const controller = new AbortController();
Deno.addSignalListener("SIGINT", async () => {
  console.log("\n🛑 Shutting down...");
  await db.close();
  controller.abort();
});

Deno.serve({ port: PORT, signal: controller.signal }, handler);
