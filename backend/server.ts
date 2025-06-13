// backend/server.ts - Updated to use dcmjs instead of dump2dcm
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { ensureDir } from "https://deno.land/std@0.208.0/fs/ensure_dir.ts";
// Import dcmjs from ESM
import * as dcmjs from "https://esm.sh/dcmjs@0.39.0";

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
  sex: string;
  modality: string;
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

// Store patient data in memory for quick access
const patientDatabase = new Map<string, ParsedPatientData>();

/**
 * NEW: Create DICOM worklist file using dcmjs (replaces dump2dcm)
 * This creates proper binary DICOM files that match the Python script structure
 */
async function createWorklistFileWithDcmjs(data: WorklistItem): Promise<string> {
  const filename = `${data.accessionNumber}.wl`;
  const outputPath = `${WORKLIST_DIR}/${filename}`;

  try {
    console.log(`🔧 Creating DICOM file with dcmjs for: ${data.patientFirstName} ${data.patientName}`);
    
    // Create the DICOM dataset with proper structure
    const dataset = createWorklistDataset(data);
    
    // Create DICOM dictionary and add file meta information
    const dicomDict = new dcmjs.data.DicomDict({});
    dicomDict.dict = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(dataset);
    
    // Add critical file meta information for proper DICOM Part 10 format
    addFileMetaInformation(dicomDict);
    
    // Write binary DICOM file
    const dicomBuffer = dicomDict.write();
    await Deno.writeFile(outputPath, new Uint8Array(dicomBuffer));
    
    // Validate the created file
    const isValid = await validateWorklistFile(outputPath);
    if (!isValid) {
      throw new Error("Created DICOM file failed validation");
    }
    
    // Store patient data in memory
    const patientData: ParsedPatientData = {
      filename,
      patientName: `${data.patientName}, ${data.patientFirstName}${data.patientMiddleName ? ' ' + data.patientMiddleName : ''}`,
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
      createdAt: new Date()
    };
    
    patientDatabase.set(filename, patientData);
    console.log(`✅ Successfully created DICOM worklist: ${filename}`);
    
    return filename;
    
  } catch (error) {
    console.error("❌ Error creating DICOM worklist file:", error);
    throw error;
  }
}

/**
 * Creates the DICOM dataset with all required tags for modality worklist
 * This structure matches the working Python script
 */
function createWorklistDataset(data: WorklistItem) {
  // Format patient name properly for DICOM (Family^Given^Middle^^)
  const patientName = data.patientMiddleName 
    ? `${data.patientName}^${data.patientFirstName}^${data.patientMiddleName}^^`
    : `${data.patientName}^${data.patientFirstName}^^`;
  
  // Format dates and times for DICOM (YYYYMMDD and HHMMSS)
  const formattedBirthDate = data.birthDate.replace(/-/g, "");
  const formattedScheduledDate = data.scheduledDate.replace(/-/g, "");
  const formattedScheduledTime = data.scheduledTime.replace(/:/g, "") + "00";
  
  // Generate unique UIDs (required for DICOM)
  const studyInstanceUID = dcmjs.data.DicomMetaDictionary.uid();
  
  // Create the dataset following DICOM Modality Worklist specification
  const dataset: any = {
    // Patient Level (Level 0)
    AccessionNumber: data.accessionNumber,
    PatientName: patientName,
    PatientID: data.patientId,
    PatientBirthDate: formattedBirthDate,
    PatientSex: data.sex,
    
    // Study/Procedure Level
    StudyInstanceUID: studyInstanceUID,
    RequestedProcedureDescription: data.procedureDescription,
    SpecificCharacterSet: "ISO_IR 100",
    
    // Optional physician information
    ...(data.referringPhysician && { ReferringPhysicianName: data.referringPhysician }),
    ...(data.requestingPhysician && { RequestingPhysician: data.requestingPhysician }),
    
    // CRITICAL: Scheduled Procedure Step Sequence (0040,0100)
    // This is what modalities query for - must be present and properly structured
    ScheduledProcedureStepSequence: [{
      ScheduledStationAETitle: data.stationAET, // Must match modality configuration
      Modality: data.modality, // CRITICAL: Must be correct (US, CT, MR, etc.)
      ScheduledProcedureStepStartDate: formattedScheduledDate,
      ScheduledProcedureStepStartTime: formattedScheduledTime,
      ScheduledProcedureStepID: data.procedureStepId,
      ScheduledProcedureStepDescription: data.procedureDescription,
      ScheduledStationName: data.stationName,
      ScheduledProcedureStepLocation: data.location,
      ...(data.requestingPhysician && { 
        ScheduledPerformingPhysicianName: data.requestingPhysician 
      })
    }]
  };
  
  console.log(`📝 Created dataset for ${patientName}, Modality: ${data.modality}, AET: ${data.stationAET}`);
  return dataset;
}

/**
 * Adds proper file meta information to ensure DICOM Part 10 compliance
 * This is critical for modality compatibility
 */
function addFileMetaInformation(dicomDict: any) {
  const sopInstanceUID = dcmjs.data.DicomMetaDictionary.uid();
  
  // Required DICOM Part 10 file meta information
  dicomDict.upsertTag("00020001", "OB", new Uint8Array([0, 1])); // File Meta Information Version
  dicomDict.upsertTag("00020002", "UI", "1.2.840.10008.5.1.4.31"); // Media Storage SOP Class UID (Modality Worklist)
  dicomDict.upsertTag("00020003", "UI", sopInstanceUID); // Media Storage SOP Instance UID
  dicomDict.upsertTag("00020010", "UI", "1.2.840.10008.1.2.1"); // Transfer Syntax UID (Explicit VR Little Endian)
  dicomDict.upsertTag("00020012", "UI", "1.2.826.0.1.3680043.8.498.1"); // Implementation Class UID
  dicomDict.upsertTag("00020013", "SH", "MiVi-DCMJS-1.0"); // Implementation Version Name
  
  console.log(`🔧 Added file meta information with SOP Instance UID: ${sopInstanceUID}`);
}

/**
 * Validates that the created DICOM file has all required tags
 */
async function validateWorklistFile(filePath: string): Promise<boolean> {
  try {
    const fileBuffer = await Deno.readFile(filePath);
    const dicomDict = dcmjs.data.DicomMessage.readFile(fileBuffer.buffer);
    const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDict.dict);
    
    // Check for required worklist tags
    const requiredTags = [
      'AccessionNumber',
      'PatientName', 
      'PatientID',
      'PatientSex',
      'ScheduledProcedureStepSequence'
    ];
    
    for (const tag of requiredTags) {
      if (!dataset[tag]) {
        console.warn(`⚠️ Missing required tag: ${tag}`);
        return false;
      }
    }
    
    // Validate scheduled procedure step sequence
    if (!dataset.ScheduledProcedureStepSequence || 
        !Array.isArray(dataset.ScheduledProcedureStepSequence) ||
        dataset.ScheduledProcedureStepSequence.length === 0) {
      console.warn("⚠️ Invalid ScheduledProcedureStepSequence");
      return false;
    }
    
    const stepSequence = dataset.ScheduledProcedureStepSequence[0];
    const requiredStepTags = [
      'ScheduledStationAETitle',
      'Modality', 
      'ScheduledProcedureStepStartDate',
      'ScheduledProcedureStepStartTime'
    ];
    
    for (const tag of requiredStepTags) {
      if (!stepSequence[tag]) {
        console.warn(`⚠️ Missing required step tag: ${tag}`);
        return false;
      }
    }
    
    console.log(`✅ DICOM validation successful - Modality: ${stepSequence.Modality}, AET: ${stepSequence.ScheduledStationAETitle}`);
    return true;
    
  } catch (error) {
    console.error("❌ Error validating DICOM file:", error);
    return false;
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
        
        // Try to parse the DICOM file to extract patient data
        try {
          const filePath = `${WORKLIST_DIR}/${entry.name}`;
          const fileBuffer = await Deno.readFile(filePath);
          const dicomDict = dcmjs.data.DicomMessage.readFile(fileBuffer.buffer);
          const dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(dicomDict.dict);
          
          const stat = await Deno.stat(filePath);
          
          const parsedPatient: ParsedPatientData = {
            filename: entry.name,
            patientName: dataset.PatientName || `Patient ${entry.name}`,
            patientFirstName: dataset.PatientName?.split('^')[1] || '',
            patientId: dataset.PatientID || entry.name.replace('.wl', ''),
            accessionNumber: dataset.AccessionNumber || entry.name.replace('.wl', ''),
            scheduledDate: dataset.ScheduledProcedureStepSequence?.[0]?.ScheduledProcedureStepStartDate || 
                          stat.mtime?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
            scheduledTime: dataset.ScheduledProcedureStepSequence?.[0]?.ScheduledProcedureStepStartTime || '1000',
            procedureDescription: dataset.RequestedProcedureDescription || 'Ultrasound Examination',
            sex: dataset.PatientSex || 'M',
            modality: dataset.ScheduledProcedureStepSequence?.[0]?.Modality || 'US',
            stationAET: dataset.ScheduledProcedureStepSequence?.[0]?.ScheduledStationAETitle,
            requestingPhysician: dataset.RequestingPhysician,
            referringPhysician: dataset.ReferringPhysicianName,
            createdAt: stat.mtime || new Date()
          };
          
          // Store in database for future reference
          patientDatabase.set(entry.name, parsedPatient);
          worklists.push(parsedPatient);
          
        } catch (parseError) {
          console.warn(`⚠️ Could not parse DICOM file ${entry.name}:`, parseError);
          
          // Fallback to basic info
          const stat = await Deno.stat(`${WORKLIST_DIR}/${entry.name}`);
          const fallbackPatient: ParsedPatientData = {
            filename: entry.name,
            patientName: `Patient ${entry.name.replace('.wl', '')}`,
            patientId: entry.name.replace('.wl', ''),
            accessionNumber: entry.name.replace('.wl', ''),
            scheduledDate: stat.mtime?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
            scheduledTime: '1000',
            procedureDescription: 'Ultrasound Examination',
            sex: 'M',
            modality: 'US',
            createdAt: stat.mtime || new Date()
          };
          
          patientDatabase.set(entry.name, fallbackPatient);
          worklists.push(fallbackPatient);
        }
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
  patientDatabase.delete(filename);
  console.log(`🗑️ Deleted patient record: ${filename}`);
}

// Route handlers
async function handleGetWorklists(): Promise<Response> {
  const worklists = await parseWorklistFiles();
  console.log(`📡 Returning ${worklists.length} patient records`);
  
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
      data.sex = 'M';
    }

    // Ensure modality field is properly set
    if (!data.modality) {
      data.modality = 'US';
    }

    // Set default station AET if not provided
    if (!data.stationAET) {
      data.stationAET = 'WS80A'; // Default for Samsung WS80A
    }

    console.log(`🆕 Creating DICOM worklist for: ${data.patientFirstName} ${data.patientName} (${data.sex}, ${data.modality}) -> ${data.stationAET}`);

    // Use the new dcmjs-based creation method
    const filename = await createWorklistFileWithDcmjs(data);
    
    return new Response(JSON.stringify({ 
      success: true, 
      filename,
      message: "DICOM worklist created successfully with dcmjs",
      patientData: {
        name: `${data.patientFirstName} ${data.patientName}`,
        sex: data.sex,
        modality: data.modality,
        stationAET: data.stationAET,
        id: data.patientId
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
    
  } catch (error) {
    console.error("Error creating worklist:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to create DICOM worklist",
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
      generator: "dcmjs-1.0",
      patientsCount: patientDatabase.size,
      patients: Array.from(patientDatabase.values()).map(p => ({
        name: p.patientName,
        sex: p.sex,
        modality: p.modality,
        stationAET: p.stationAET,
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
console.log(`💾 Using dcmjs for DICOM generation (no dump2dcm dependency)`);
console.log(`🏥 Compatible with Samsung WS80A and other modalities`);

await serve(handler, { port: PORT });
