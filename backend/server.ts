import { CORS_HEADERS } from "./config.ts";
import { handleHealth } from "./http/health.ts";
import {
  handleCreateWorklist,
  handleDeleteWorklist,
  handleGetWorklists,
} from "./http/worklists.ts";
import { maybeServeStatic } from "./http/static.ts";
import type { WorklistService } from "./services/worklistService.ts";
import { textResponse } from "./utils/http.ts";

export function createServer(service: WorklistService) {
  return async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const pathname = url.pathname;

    console.log(`${new Date().toISOString()} - ${req.method} ${pathname}`);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: CORS_HEADERS });
    }

    const staticResponse = await maybeServeStatic(pathname);
    if (staticResponse) {
      return staticResponse;
    }

    if (pathname === "/api/worklists") {
      if (req.method === "GET") {
        return await handleGetWorklists(service);
      }
      if (req.method === "POST") {
        return await handleCreateWorklist(req, service);
      }
    }

    if (pathname.startsWith("/api/worklists/") && req.method === "DELETE") {
      const filename = pathname.split("/").pop() ?? "";
      return await handleDeleteWorklist(filename, service);
    }

    if (pathname === "/health") {
      return await handleHealth(service);
    }

    return textResponse("Not Found", { status: 404 });
  };
}
