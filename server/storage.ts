import {
  users,
  facilities,
  patients,
  consultations,
  prescriptions,
  medicalHistory,
  voiceRecordings,
  type User,
  type InsertUser,
  type Facility,
  type InsertFacility,
  type Patient,
  type InsertPatient,
  type Consultation,
  type InsertConsultation,
  type Prescription,
  type InsertPrescription,
  type MedicalHistory,
  type InsertMedicalHistory,
  type VoiceRecording,
  type InsertVoiceRecording,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, like, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByHprId(hprId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  verifyHprId(id: number, hprId: string): Promise<User>;

  // Facility operations
  createFacility(facility: InsertFacility): Promise<Facility>;
  getFacilityByAdmin(adminId: number): Promise<Facility | undefined>;
  updateFacility(id: number, updates: Partial<InsertFacility>): Promise<Facility>;

  // Patient operations
  getPatients(doctorId: number, search?: string): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByAbhaId(abhaId: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, updates: Partial<InsertPatient>): Promise<Patient>;

  // Consultation operations
  getConsultations(doctorId: number, status?: string): Promise<Consultation[]>;
  getConsultation(id: number): Promise<Consultation | undefined>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultation(id: number, updates: Partial<InsertConsultation>): Promise<Consultation>;
  getPatientConsultations(patientId: number): Promise<Consultation[]>;

  // Prescription operations
  getPrescriptions(doctorId: number): Promise<Prescription[]>;
  getPrescription(id: number): Promise<Prescription | undefined>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: number, updates: Partial<InsertPrescription>): Promise<Prescription>;

  // Medical history operations
  getPatientMedicalHistory(patientId: number): Promise<MedicalHistory[]>;
  addMedicalHistory(history: InsertMedicalHistory): Promise<MedicalHistory>;

  // Voice recording operations
  createVoiceRecording(recording: InsertVoiceRecording): Promise<VoiceRecording>;
  getConsultationRecordings(consultationId: number): Promise<VoiceRecording[]>;
  updateVoiceRecording(id: number, updates: Partial<InsertVoiceRecording>): Promise<VoiceRecording>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByHprId(hprId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.hprId, hprId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async verifyHprId(id: number, hprId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ hprId, isHprVerified: true, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Facility operations
  async createFacility(insertFacility: InsertFacility): Promise<Facility> {
    const [facility] = await db.insert(facilities).values(insertFacility).returning();
    return facility;
  }

  async getFacilityByAdmin(adminId: number): Promise<Facility | undefined> {
    const [facility] = await db.select().from(facilities).where(eq(facilities.adminId, adminId));
    return facility;
  }

  async updateFacility(id: number, updates: Partial<InsertFacility>): Promise<Facility> {
    const [facility] = await db
      .update(facilities)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(facilities.id, id))
      .returning();
    return facility;
  }

  // Patient operations
  async getPatients(doctorId: number, search?: string): Promise<Patient[]> {
    if (search) {
      return await db.select().from(patients)
        .where(
          and(
            eq(patients.doctorId, doctorId),
            or(
              like(patients.fullName, `%${search}%`),
              like(patients.abhaId, `%${search}%`),
              like(patients.mobile, `%${search}%`)
            )
          )
        )
        .orderBy(desc(patients.updatedAt));
    }
    
    return await db.select().from(patients)
      .where(eq(patients.doctorId, doctorId))
      .orderBy(desc(patients.updatedAt));
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async getPatientByAbhaId(abhaId: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.abhaId, abhaId));
    return patient;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db.insert(patients).values(insertPatient).returning();
    return patient;
  }

  async updatePatient(id: number, updates: Partial<InsertPatient>): Promise<Patient> {
    const [patient] = await db
      .update(patients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();
    return patient;
  }

  // Consultation operations
  async getConsultations(doctorId: number, status?: string): Promise<Consultation[]> {
    if (status) {
      return await db.select().from(consultations)
        .where(and(eq(consultations.doctorId, doctorId), eq(consultations.status, status)))
        .orderBy(desc(consultations.scheduledAt));
    }
    
    return await db.select().from(consultations)
      .where(eq(consultations.doctorId, doctorId))
      .orderBy(desc(consultations.scheduledAt));
  }

  async getConsultation(id: number): Promise<Consultation | undefined> {
    const [consultation] = await db.select().from(consultations).where(eq(consultations.id, id));
    return consultation;
  }

  async createConsultation(insertConsultation: InsertConsultation): Promise<Consultation> {
    const [consultation] = await db.insert(consultations).values(insertConsultation).returning();
    return consultation;
  }

  async updateConsultation(id: number, updates: Partial<InsertConsultation>): Promise<Consultation> {
    const [consultation] = await db
      .update(consultations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(consultations.id, id))
      .returning();
    return consultation;
  }

  async getPatientConsultations(patientId: number): Promise<Consultation[]> {
    return await db
      .select()
      .from(consultations)
      .where(eq(consultations.patientId, patientId))
      .orderBy(desc(consultations.scheduledAt));
  }

  // Prescription operations
  async getPrescriptions(doctorId: number): Promise<Prescription[]> {
    return await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.doctorId, doctorId))
      .orderBy(desc(prescriptions.createdAt));
  }

  async getPrescription(id: number): Promise<Prescription | undefined> {
    const [prescription] = await db.select().from(prescriptions).where(eq(prescriptions.id, id));
    return prescription;
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const [prescription] = await db.insert(prescriptions).values(insertPrescription).returning();
    return prescription;
  }

  async updatePrescription(id: number, updates: Partial<InsertPrescription>): Promise<Prescription> {
    const [prescription] = await db
      .update(prescriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(prescriptions.id, id))
      .returning();
    return prescription;
  }

  // Medical history operations
  async getPatientMedicalHistory(patientId: number): Promise<MedicalHistory[]> {
    return await db
      .select()
      .from(medicalHistory)
      .where(eq(medicalHistory.patientId, patientId))
      .orderBy(desc(medicalHistory.date));
  }

  async addMedicalHistory(insertHistory: InsertMedicalHistory): Promise<MedicalHistory> {
    const [history] = await db.insert(medicalHistory).values(insertHistory).returning();
    return history;
  }

  // Voice recording operations
  async createVoiceRecording(insertRecording: InsertVoiceRecording): Promise<VoiceRecording> {
    const [recording] = await db.insert(voiceRecordings).values(insertRecording).returning();
    return recording;
  }

  async getConsultationRecordings(consultationId: number): Promise<VoiceRecording[]> {
    return await db
      .select()
      .from(voiceRecordings)
      .where(eq(voiceRecordings.consultationId, consultationId))
      .orderBy(desc(voiceRecordings.createdAt));
  }

  async updateVoiceRecording(id: number, updates: Partial<InsertVoiceRecording>): Promise<VoiceRecording> {
    const [recording] = await db
      .update(voiceRecordings)
      .set(updates)
      .where(eq(voiceRecordings.id, id))
      .returning();
    return recording;
  }
}

export const storage = new DatabaseStorage();
