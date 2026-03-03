// backend/db/database.ts - PostgreSQL database wrapper using Drizzle ORM
import { MIGRATIONS_DIR } from "../config.ts";
import { asc, desc, drizzle, eq, migrate, postgres } from "../deps.ts";
import { type NewPatientRecord, type PatientRecord, patients } from "./schema.ts";

export class Database {
  private sql: ReturnType<typeof postgres> | null = null;
  private db: ReturnType<typeof drizzle> | null = null;
  private isConnected = false;

  async connect() {
    if (this.isConnected) {
      return;
    }

    const databaseUrl = Deno.env.get("DATABASE_URL");
    if (!databaseUrl) {
      console.warn("⚠️ DATABASE_URL not set, using in-memory storage");
      return;
    }

    try {
      this.sql = postgres(databaseUrl, { max: 10 });
      this.db = drizzle(this.sql);
      this.isConnected = true;
      console.log("✅ Connected to PostgreSQL database (Drizzle)");

      const autoMigrate = Deno.env.get("AUTO_MIGRATE") === "true";
      if (autoMigrate) {
        try {
          await this.migrate();
        } catch (error) {
          console.error("❌ Failed to apply migrations:", error);
        }
      }
    } catch (error) {
      console.error("❌ Failed to connect to database:", error);
      console.warn("⚠️ Falling back to in-memory storage");
      this.sql = null;
      this.db = null;
      this.isConnected = false;
    }
  }

  async migrate(migrationsFolder: string = MIGRATIONS_DIR) {
    if (!this.db) {
      return;
    }

    await migrate(this.db, { migrationsFolder });
    console.log("✅ Database migrations applied");
  }

  async createPatient(patient: NewPatientRecord): Promise<PatientRecord | null> {
    if (!this.db) {
      return null;
    }

    try {
      const result = await this.db
        .insert(patients)
        .values(patient)
        .returning();
      return result[0] ?? null;
    } catch (error) {
      console.error("❌ Error creating patient:", error);
      return null;
    }
  }

  async getPatientByAccession(accessionNumber: string): Promise<PatientRecord | null> {
    if (!this.db) {
      return null;
    }

    try {
      const result = await this.db
        .select()
        .from(patients)
        .where(eq(patients.accessionNumber, accessionNumber));
      return result[0] ?? null;
    } catch (error) {
      console.error("❌ Error getting patient:", error);
      return null;
    }
  }

  async getAllPatients(): Promise<PatientRecord[]> {
    if (!this.db) {
      return [];
    }

    try {
      return await this.db
        .select()
        .from(patients)
        .orderBy(desc(patients.createdAt));
    } catch (error) {
      console.error("❌ Error getting patients:", error);
      return [];
    }
  }

  async updatePatient(
    accessionNumber: string,
    updates: Partial<NewPatientRecord>,
  ): Promise<PatientRecord | null> {
    if (!this.db) {
      return null;
    }

    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...safeUpdates } = updates;
    if (Object.keys(safeUpdates).length === 0) {
      return null;
    }

    try {
      const result = await this.db
        .update(patients)
        .set({ ...safeUpdates, updatedAt: new Date() })
        .where(eq(patients.accessionNumber, accessionNumber))
        .returning();
      return result[0] ?? null;
    } catch (error) {
      console.error("❌ Error updating patient:", error);
      return null;
    }
  }

  async deletePatient(accessionNumber: string): Promise<boolean> {
    if (!this.db) {
      return false;
    }

    try {
      await this.db
        .delete(patients)
        .where(eq(patients.accessionNumber, accessionNumber));
      return true;
    } catch (error) {
      console.error("❌ Error deleting patient:", error);
      return false;
    }
  }

  async getPatientsByDate(date: string): Promise<PatientRecord[]> {
    if (!this.db) {
      return [];
    }

    try {
      return await this.db
        .select()
        .from(patients)
        .where(eq(patients.scheduledDate, date))
        .orderBy(asc(patients.scheduledTime));
    } catch (error) {
      console.error("❌ Error getting patients by date:", error);
      return [];
    }
  }

  async close() {
    if (this.sql && this.isConnected) {
      await this.sql.end({ timeout: 5 });
      this.sql = null;
      this.db = null;
      this.isConnected = false;
      console.log("🔌 Database connection closed");
    }
  }

  isAvailable(): boolean {
    return this.isConnected && this.db !== null;
  }
}

export const db = new Database();
export type { NewPatientRecord, PatientRecord };
