import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { index, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "../deps.ts";

export const patients = pgTable(
  "patients",
  {
    id: serial("id").primaryKey(),
    accessionNumber: varchar("accession_number", { length: 64 }).notNull(),
    patientId: varchar("patient_id", { length: 64 }).notNull(),
    patientName: varchar("patient_name", { length: 255 }).notNull(),
    patientFirstName: varchar("patient_first_name", { length: 128 }),
    patientMiddleName: varchar("patient_middle_name", { length: 128 }),
    birthDate: varchar("birth_date", { length: 8 }).notNull(),
    sex: varchar("sex", { length: 1 }).notNull(),
    scheduledDate: varchar("scheduled_date", { length: 8 }).notNull(),
    scheduledTime: varchar("scheduled_time", { length: 6 }).notNull(),
    procedureDescription: text("procedure_description"),
    modality: varchar("modality", { length: 16 }).default("US"),
    stationAET: varchar("station_aet", { length: 64 }),
    requestingPhysician: varchar("requesting_physician", { length: 255 }),
    referringPhysician: varchar("referring_physician", { length: 255 }),
    procedureStepId: varchar("procedure_step_id", { length: 64 }),
    stationName: varchar("station_name", { length: 255 }),
    location: varchar("location", { length: 255 }),
    filename: varchar("filename", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
  },
  (table) => ({
    accessionIdx: uniqueIndex("idx_accession").on(table.accessionNumber),
    patientIdx: index("idx_patient_id").on(table.patientId),
    scheduledDateIdx: index("idx_scheduled_date").on(table.scheduledDate),
  }),
);

export type PatientRecord = InferSelectModel<typeof patients>;
export type NewPatientRecord = InferInsertModel<typeof patients>;
