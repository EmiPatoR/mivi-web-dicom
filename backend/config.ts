export const WORKLIST_DIR = "./worklists";
export const STATIC_DIR = "./frontend";
export const PORT = Number(Deno.env.get("PORT") ?? "8080");

export const DEFAULTS = {
  modality: "US",
  sex: "M",
  stationAET: "WS80A",
};

export const MIGRATIONS_DIR = "./backend/db/migrations";

export const ALLOWED_SEXES = new Set(["M", "F", "O"]);

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
