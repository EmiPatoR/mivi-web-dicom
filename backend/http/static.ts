import { CORS_HEADERS, STATIC_DIR } from "../config.ts";
import { textResponse } from "../utils/http.ts";

const STATIC_FILES = new Map([
  ["/", { file: `${STATIC_DIR}/index.html`, type: "text/html" }],
  ["/index.html", { file: `${STATIC_DIR}/index.html`, type: "text/html" }],
  ["/app.js", { file: `${STATIC_DIR}/app.js`, type: "application/javascript" }],
  ["/app.css", { file: `${STATIC_DIR}/app.css`, type: "text/css" }],
]);

export async function maybeServeStatic(
  pathname: string,
): Promise<Response | null> {
  const staticEntry = STATIC_FILES.get(pathname);
  if (staticEntry) {
    return await serveStaticFile(staticEntry.file, staticEntry.type);
  }

  if (pathname.startsWith("/components/") && pathname.endsWith(".js")) {
    const componentPath = `${STATIC_DIR}${pathname}`;
    return await serveStaticFile(componentPath, "application/javascript");
  }

  return null;
}

async function serveStaticFile(
  filepath: string,
  contentType: string,
): Promise<Response> {
  try {
    const content = await Deno.readTextFile(filepath);
    return new Response(content, {
      headers: { ...CORS_HEADERS, "Content-Type": contentType },
    });
  } catch (error) {
    console.error(`Error serving ${filepath}:`, error);
    return textResponse("File not found", { status: 404 });
  }
}
