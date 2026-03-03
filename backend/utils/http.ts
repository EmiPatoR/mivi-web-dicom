import { CORS_HEADERS } from "../config.ts";

function mergeHeaders(initHeaders?: HeadersInit): Headers {
  const headers = new Headers(initHeaders);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  }
  return headers;
}

export function jsonResponse(
  payload: unknown,
  init: ResponseInit = {},
): Response {
  const headers = mergeHeaders(init.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return new Response(JSON.stringify(payload), { ...init, headers });
}

export function textResponse(
  text: string,
  init: ResponseInit = {},
): Response {
  const headers = mergeHeaders(init.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "text/plain");
  }
  return new Response(text, { ...init, headers });
}
