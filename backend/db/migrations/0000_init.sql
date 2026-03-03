CREATE TABLE IF NOT EXISTS "patients" (
  "id" serial PRIMARY KEY,
  "accession_number" varchar(64) NOT NULL,
  "patient_id" varchar(64) NOT NULL,
  "patient_name" varchar(255) NOT NULL,
  "patient_first_name" varchar(128),
  "patient_middle_name" varchar(128),
  "birth_date" varchar(8) NOT NULL,
  "sex" varchar(1) NOT NULL,
  "scheduled_date" varchar(8) NOT NULL,
  "scheduled_time" varchar(6) NOT NULL,
  "procedure_description" text,
  "modality" varchar(16) DEFAULT 'US',
  "station_aet" varchar(64),
  "requesting_physician" varchar(255),
  "referring_physician" varchar(255),
  "procedure_step_id" varchar(64),
  "station_name" varchar(255),
  "location" varchar(255),
  "filename" varchar(255) NOT NULL,
  "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_accession" ON "patients" ("accession_number");
CREATE INDEX IF NOT EXISTS "idx_patient_id" ON "patients" ("patient_id");
CREATE INDEX IF NOT EXISTS "idx_scheduled_date" ON "patients" ("scheduled_date");
