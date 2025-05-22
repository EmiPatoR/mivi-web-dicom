// backend/server.ts - Enhanced with proper modality support
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { ensureDir } from "https://deno.land/std@0.208.0/fs/ensure_dir.ts";

const WORKLIST_DIR = "./worklists";
const PORT = 8092;

// Ensure worklist directory exists
await ensureDir(WORKLIST_DIR);

interface WorklistItem {
  accessionNumber: string;
  patientName: string;
  patientFirstName: string;
  patientMiddleName?: string;
  patientId: string;
  birthDate: string;
  sex: string;
  requestingPhysician?: string;
  referringPhysician?: string;
  procedureDescription: string;
  scheduledDate: string;
  scheduledTime: string;
  modality: string;
  stationAET: string;
  procedureStepId: string;
  stationName: string;
  location: string;
}

// Enhanced patient data structure for better tracking
interface ParsedPatientData {
  filename: string;
  patientName: string;
  patientFirstName?: string;
  patientId: string;
  accessionNumber: string;
  scheduledDate: string;
  scheduledTime: string;
  procedureDescription: string;
  sex: string; // This is crucial for the gender emoji
  modality: string; // Enhanced modality support
  stationAET?: string;
  requestingPhysician?: string;
  referringPhysician?: string;
  createdAt: Date;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Utility functions
function formatDicomDate(dateStr: string): string {
  return dateStr.replace(/-/g, "");
}

function formatDicomTime(timeStr: string): string {
  return timeStr.replace(/:/g, "") + "00";
}

function generateDicomDump(data: WorklistItem): string {
  const patientName = data.patientMiddleName 
    ? `${data.patientName}^${data.patientFirstName}^${data.patientMiddleName}^^`
    : `${data.patientName}^${data.patientFirstName}^^`;

  const requestingPhysician = data.requestingPhysician || "";
  const referringPhysician = data.referringPhysician || "";

  return `# Dicom-File-Format

# Dicom-Data-Set
(0008,0050) SH [${data.accessionNumber}]
(0010,0010) PN [${patientName}]
(0010,0020) LO [${data.patientId}]
(0010,0030) DA [${formatDicomDate(data.birthDate)}]
(0010,0040) CS [${data.sex}]
${requestingPhysician ? `(0032,1032) PN [${requestingPhysician}]` : ""}
${referringPhysician ? `(0008,0090) PN [${referringPhysician}]` : ""}
(0032,1060) LO [${data.procedureDescription}]
(0040,0100) SQ
(fffe,e000) na (Item with explicit length #=88)
(0008,0060) CS [${data.modality}]
(0040,0001) AE [${data.stationAET}]
(0040,0002) DA [${formatDicomDate(data.scheduledDate)}]
(0040,0003) TM [${formatDicomTime(data.scheduledTime)}]
(0040,0007) LO [${data.procedureDescription}]
(0040,0009) SH [${data.procedureStepId}]
(0040,0010) SH [${data.stationName}]
(0040,0011) SH [${data.location}]
(fffe,e00d) na (ItemDelimitationItem)
(fffe,e0dd) na (SequenceDelimitationItem)`;
}

// Store patient data in memory for quick access (in production, use a database)
const patientDatabase = new Map<string, ParsedPatientData>();

// DICOM worklist operations
async function createWorklistFile(data: WorklistItem): Promise<string> {
  const filename = `${data.accessionNumber}.wl`;
  const dumpContent = generateDicomDump(data);
  const tempDumpFile = `/tmp/${data.accessionNumber}.dump`;
  const outputFile = `${WORKLIST_DIR}/${filename}`;

  try {
    await Deno.writeTextFile(tempDumpFile, dumpContent);

    const cmd = new Deno.Command("dump2dcm", {
      args: [tempDumpFile, outputFile],
    });

    const process = await cmd.output();
    
    if (!process.success) {
      const error = new TextDecoder().decode(process.stderr);
      throw new Error(`dump2dcm failed: ${error}`);
    }

    await Deno.remove(tempDumpFile);
    
    // Store patient data in memory with all fields including modality
    const patientData: ParsedPatientData = {
      filename,
      patientName: `${data.patientName}, ${data.patientFirstName}${data.patientMiddleName ? ' ' + data.patientMiddleName : ''}`,
      patientFirstName: data.patientFirstName,
      patientId: data.patientId,
      accessionNumber: data.accessionNumber,
      scheduledDate: data.scheduledDate,
      scheduledTime: data.scheduledTime,
      procedureDescription: data.procedureDescription,
      sex: data.sex, // Properly store the sex field
      modality: data.modality, // Store modality for display
      stationAET: data.stationAET,
      requestingPhysician: data.requestingPhysician,
      referringPhysician: data.referringPhysician,
      createdAt: new Date()
    };
    
    patientDatabase.set(filename, patientData);
    console.log(`✅ Created patient record: ${patientData.patientName} (${patientData.sex}, ${patientData.modality})`);
    
    return filename;
  } catch (error) {
    console.error("Error creating worklist file:", error);
    throw error;
  }
}

async function parseWorklistFiles(): Promise<ParsedPatientData[]> {
  const worklists: ParsedPatientData[] = [];
  
  try {
    for await (const entry of Deno.readDir(WORKLIST_DIR)) {
      if (entry.isFile && entry.name.endsWith('.wl')) {
        // First check if we have this patient in our database
        if (patientDatabase.has(entry.name)) {
          const storedData = patientDatabase.get(entry.name)!;
          worklists.push(storedData);
          continue;
        }
        
        // If not in database, try to parse from filename or create default
        // In production, you would parse the actual DICOM file here
        const accessionNumber = entry.name.replace('.wl', '');
        const stat = await Deno.stat(`${WORKLIST_DIR}/${entry.name}`);
        
        // Create a default patient record (this is a fallback)
        const defaultPatient: ParsedPatientData = {
          filename: entry.name,
          patientName: `Patient ${accessionNumber}`,
          patientId: accessionNumber,
          accessionNumber,
          scheduledDate: stat.mtime?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          scheduledTime: '1000',
          procedureDescription: 'Ultrasound Examination',
          sex: 'M', // Default to Male if unknown
          modality: 'US', // Default to Ultrasound
          createdAt: stat.mtime || new Date()
        };
        
        // Store in database for future reference
        patientDatabase.set(entry.name, defaultPatient);
        worklists.push(defaultPatient);
      }
    }
  } catch (error) {
    console.error("Error reading worklist directory:", error);
  }

  // Sort by creation date (newest first)
  return worklists.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

async function deleteWorklistFile(filename: string): Promise<void> {
  await Deno.remove(`${WORKLIST_DIR}/${filename}`);
  // Also remove from our database
  patientDatabase.delete(filename);
  console.log(`🗑️ Deleted patient record: ${filename}`);
}

// Route handlers
async function handleGetWorklists(): Promise<Response> {
  const worklists = await parseWorklistFiles();
  console.log(`📡 Returning ${worklists.length} patient records`);
  
  // Log patient data for debugging
  worklists.forEach(patient => {
    console.log(`  - ${patient.patientName} (${patient.sex}, ${patient.modality}) - ${patient.filename}`);
  });
  
  return new Response(JSON.stringify(worklists), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleCreateWorklist(req: Request): Promise<Response> {
  try {
    const data: WorklistItem = await req.json();
    
    // Validate required fields
    if (!data.patientName || !data.patientFirstName || !data.birthDate || 
        !data.procedureDescription || !data.scheduledDate || !data.scheduledTime) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ensure sex field is properly set
    if (!data.sex || !['M', 'F', 'O'].includes(data.sex)) {
      data.sex = 'M'; // Default to Male if not specified or invalid
    }

    // Ensure modality field is properly set
    if (!data.modality) {
      data.modality = 'US'; // Default to Ultrasound if not specified
    }

    console.log(`🆕 Creating patient: ${data.patientFirstName} ${data.patientName} (${data.sex}, ${data.modality})`);

    const filename = await createWorklistFile(data);
    
    return new Response(JSON.stringify({ 
      success: true, 
      filename,
      message: "Worklist item created successfully",
      patientData: {
        name: `${data.patientFirstName} ${data.patientName}`,
        sex: data.sex,
        modality: data.modality,
        id: data.patientId
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating worklist:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to create worklist item",
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

async function handleDeleteWorklist(filename: string): Promise<Response> {
  try {
    await deleteWorklistFile(filename);
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Failed to delete worklist item" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// Static file serving
async function serveStaticFile(filepath: string, contentType: string): Promise<Response> {
  try {
    const content = await Deno.readTextFile(filepath);
    return new Response(content, {
      headers: { ...corsHeaders, "Content-Type": contentType },
    });
  } catch (error) {
    console.error(`Error serving ${filepath}:`, error);
    return new Response("File not found", { 
      status: 404, 
      headers: corsHeaders 
    });
  }
}

// Main request handler
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  console.log(`${new Date().toISOString()} - ${req.method} ${pathname}`);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Static files
  if (pathname === "/" || pathname === "/index.html") {
    return await serveStaticFile("./frontend/index.html", "text/html");
  }

  if (pathname === "/app.js") {
    return await serveStaticFile("./frontend/app.js", "application/javascript");
  }

  if (pathname === "/app.css") {
    return await serveStaticFile("./frontend/app.css", "text/css");
  }

  // Component files
  if (pathname.startsWith("/components/") && pathname.endsWith(".js")) {
    const componentPath = `./frontend${pathname}`;
    return await serveStaticFile(componentPath, "application/javascript");
  }

  // API Routes
  if (pathname === "/api/worklists") {
    if (req.method === "GET") {
      return await handleGetWorklists();
    }
    if (req.method === "POST") {
      return await handleCreateWorklist(req);
    }
  }

  if (pathname.startsWith("/api/worklists/") && req.method === "DELETE") {
    const filename = pathname.split("/").pop();
    if (!filename) {
      return new Response(JSON.stringify({ error: "Invalid filename" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return await handleDeleteWorklist(filename);
  }

  // Health check
  if (pathname === "/health") {
    return new Response(JSON.stringify({ 
      status: "healthy",
      timestamp: new Date().toISOString(),
      worklistDir: WORKLIST_DIR,
      port: PORT,
      patientsCount: patientDatabase.size,
      patients: Array.from(patientDatabase.values()).map(p => ({
        name: p.patientName,
        sex: p.sex,
        modality: p.modality,
        filename: p.filename
      }))
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 404 for unknown routes
  return new Response("Not Found", { 
    status: 404, 
    headers: corsHeaders 
  });
}

console.log(`🚀 MiVi DICOM Worklist Manager starting on http://localhost:${PORT}`);
console.log(`📁 Worklist directory: ${WORKLIST_DIR}`);
console.log(`🔗 Connect your ultrasound machine to query Orthanc worklists`);
console.log(`💾 Patient database initialized (in-memory) with modality support`);

await serve(handler, { port: PORT });
