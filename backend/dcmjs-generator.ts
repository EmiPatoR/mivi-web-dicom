// backend/dcmjs-generator.ts - New DICOM file generator using dcmjs
// This replaces the dump2dcm approach with direct binary DICOM creation

// Import dcmjs - you'll need to install this via npm
// For Deno, you can use: https://esm.sh/dcmjs@0.39.0
import * as dcmjs from "https://esm.sh/dcmjs@0.39.0";

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

export class DCMJSDicomGenerator {
  
  /**
   * Creates a proper binary DICOM worklist file using dcmjs
   * This matches the structure of the working Python script
   */
  static async createWorklistFile(data: WorklistItem, outputPath: string): Promise<void> {
    try {
      // Create a new DICOM dataset with proper metadata
      const dataset = DCMJSDicomGenerator.createWorklistDataset(data);
      
      // Create DICOM message with proper file meta information
      const dicomDict = new dcmjs.data.DicomDict({});
      dicomDict.dict = dcmjs.data.DicomMetaDictionary.denaturalizeDataset(dataset);
      
      // Add proper file meta information (critical for compatibility)
      DCMJSDicomGenerator.addFileMetaInformation(dicomDict);
      
      // Write binary DICOM file
      const dicomBuffer = dicomDict.write();
      await Deno.writeFile(outputPath, new Uint8Array(dicomBuffer));
      
      console.log(`✅ Created DICOM worklist file: ${outputPath}`);
      
    } catch (error) {
      console.error("❌ Error creating DICOM file:", error);
      throw error;
    }
  }
  
  /**
   * Creates the DICOM dataset with all required tags for worklist
   * This matches the structure from the working Python script
   */
  private static createWorklistDataset(data: WorklistItem) {
    const now = new Date();
    const currentDate = now.toISOString().slice(0, 10).replace(/-/g, "");
    const currentTime = now.toTimeString().slice(0, 8).replace(/:/g, "");
    
    // Format patient name properly for DICOM
    const patientName = data.patientMiddleName 
      ? `${data.patientName}^${data.patientFirstName}^${data.patientMiddleName}^^`
      : `${data.patientName}^${data.patientFirstName}^^`;
    
    // Format dates and times for DICOM
    const formattedBirthDate = data.birthDate.replace(/-/g, "");
    const formattedScheduledDate = data.scheduledDate.replace(/-/g, "");
    const formattedScheduledTime = data.scheduledTime.replace(/:/g, "") + "00";
    
    // Generate unique UIDs
    const studyInstanceUID = dcmjs.data.DicomMetaDictionary.uid();
    const sopInstanceUID = dcmjs.data.DicomMetaDictionary.uid();
    
    // Create the main dataset (matches Python script structure)
    const dataset: any = {
      // Transfer Syntax and encoding
      _meta: {
        FileMetaInformationVersion: new Uint8Array([0, 1]),
        MediaStorageSOPClassUID: "1.2.840.10008.5.1.4.31", // Modality Worklist Info Model
        MediaStorageSOPInstanceUID: sopInstanceUID,
        TransferSyntaxUID: "1.2.840.10008.1.2.1", // Explicit VR Little Endian
        ImplementationClassUID: "1.2.826.0.1.3680043.8.498.1",
        ImplementationVersionName: "MiVi-DCMJS-1.0"
      },
      
      // Patient Information (Level 0)
      AccessionNumber: data.accessionNumber,
      PatientName: patientName,
      PatientID: data.patientId,
      PatientBirthDate: formattedBirthDate,
      PatientSex: data.sex,
      
      // Study/Order Information
      StudyInstanceUID: studyInstanceUID,
      RequestedProcedureDescription: data.procedureDescription,
      SpecificCharacterSet: "ISO_IR 100",
      
      // Optional physician information
      ...(data.referringPhysician && { ReferringPhysicianName: data.referringPhysician }),
      ...(data.requestingPhysician && { RequestingPhysician: data.requestingPhysician }),
      
      // CRITICAL: Scheduled Procedure Step Sequence (0040,0100)
      // This is the key sequence that modalities query for
      ScheduledProcedureStepSequence: [{
        ScheduledStationAETitle: data.stationAET, // Must match your modality's AE title
        Modality: data.modality, // CRITICAL: Must be correct for the modality
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
    
    return dataset;
  }
  
  /**
   * Adds proper file meta information to the DICOM dictionary
   * This is critical for proper DICOM file structure
   */
  private static addFileMetaInformation(dicomDict: any) {
    // Ensure proper DICOM file meta information is present
    const fileMetaInformationGroupLength = dicomDict.write().byteLength;
    
    // These are required for proper DICOM Part 10 format
    dicomDict.upsertTag("00020000", "UL", fileMetaInformationGroupLength); // File Meta Information Group Length
    dicomDict.upsertTag("00020001", "OB", new Uint8Array([0, 1])); // File Meta Information Version
    dicomDict.upsertTag("00020002", "UI", "1.2.840.10008.5.1.4.31"); // Media Storage SOP Class UID
    dicomDict.upsertTag("00020003", "UI", dcmjs.data.DicomMetaDictionary.uid()); // Media Storage SOP Instance UID
    dicomDict.upsertTag("00020010", "UI", "1.2.840.10008.1.2.1"); // Transfer Syntax UID (Explicit VR Little Endian)
    dicomDict.upsertTag("00020012", "UI", "1.2.826.0.1.3680043.8.498.1"); // Implementation Class UID
    dicomDict.upsertTag("00020013", "SH", "MiVi-DCMJS-1.0"); // Implementation Version Name
  }
  
  /**
   * Validates that the created DICOM file has all required tags for worklist
   */
  static async validateWorklistFile(filePath: string): Promise<boolean> {
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
      
      console.log("✅ DICOM worklist file validation successful");
      return true;
      
    } catch (error) {
      console.error("❌ Error validating DICOM file:", error);
      return false;
    }
  }
  
  /**
   * Utility function to generate a minimal test DICOM file
   * This can be used to test compatibility with your Samsung WS80A
   */
  static async createTestWorklistFile(outputPath: string): Promise<void> {
    const now = new Date();
    const testData: WorklistItem = {
      accessionNumber: "TEST" + Date.now().toString().slice(-6),
      patientName: "TEST",
      patientFirstName: "PATIENT", 
      patientId: "PAT" + Date.now().toString().slice(-4),
      birthDate: "1980-01-01",
      sex: "M",
      requestingPhysician: "DrTest",
      referringPhysician: "DrRef",
      procedureDescription: "Test Ultrasound Procedure",
      scheduledDate: now.toISOString().slice(0, 10),
      scheduledTime: now.toTimeString().slice(0, 5),
      modality: "US",
      stationAET: "WS80A", // Must match your Samsung configuration
      procedureStepId: "STEP" + Date.now().toString().slice(-4),
      stationName: "US_ROOM",
      location: "US_LAB"
    };
    
    await DCMJSDicomGenerator.createWorklistFile(testData, outputPath);
    await DCMJSDicomGenerator.validateWorklistFile(outputPath);
  }
}
