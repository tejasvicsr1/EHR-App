import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
  varchar,
  numeric,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for healthcare providers
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  hprId: varchar("hpr_id", { length: 14 }).unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  mobile: varchar("mobile", { length: 15 }).notNull(),
  password: text("password").notNull(),
  specialization: text("specialization"),
  experience: integer("experience"),
  practiceType: varchar("practice_type", { length: 20 }).notNull(), // solo, group, hospital
  isHprVerified: boolean("is_hpr_verified").default(false),
  consultationFee: numeric("consultation_fee", { precision: 10, scale: 2 }),
  profileImageUrl: text("profile_image_url"),
  digitalSignature: text("digital_signature"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Facilities table for group practices and hospitals
export const facilities = pgTable("facilities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // clinic, hospital, diagnostic_center
  hfrId: varchar("hfr_id", { length: 14 }).unique(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  pincode: varchar("pincode", { length: 6 }).notNull(),
  isHfrVerified: boolean("is_hfr_verified").default(false),
  adminId: integer("admin_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Patients table with ABHA integration
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  abhaId: varchar("abha_id", { length: 17 }).unique(),
  fullName: text("full_name").notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  gender: varchar("gender", { length: 10 }),
  mobile: varchar("mobile", { length: 15 }),
  email: text("email"),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 15 }),
  bloodGroup: varchar("blood_group", { length: 5 }),
  allergies: text("allergies"),
  chronicConditions: text("chronic_conditions"),
  isAbhaVerified: boolean("is_abha_verified").default(false),
  doctorId: integer("doctor_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Consultations table
export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  doctorId: integer("doctor_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // regular, follow_up, emergency
  status: varchar("status", { length: 20 }).default("scheduled"), // scheduled, in_progress, completed, cancelled
  chiefComplaint: text("chief_complaint"),
  symptoms: text("symptoms"),
  diagnosis: text("diagnosis"),
  clinicalNotes: text("clinical_notes"),
  vitalSigns: jsonb("vital_signs"), // JSON object for BP, pulse, etc.
  aiTranscription: jsonb("ai_transcription"), // Store voice transcription data
  language: varchar("language", { length: 10 }).default("en"),
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  fee: numeric("fee", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Prescriptions table
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  consultationId: integer("consultation_id").references(() => consultations.id).notNull(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  doctorId: integer("doctor_id").references(() => users.id).notNull(),
  medications: jsonb("medications").notNull(), // Array of medication objects
  clinicalNotes: text("clinical_notes"),
  digitalSignature: text("digital_signature"),
  status: varchar("status", { length: 20 }).default("draft"), // draft, sent, fulfilled
  isNdhmCompliant: boolean("is_ndhm_compliant").default(true),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Medical history table
export const medicalHistory = pgTable("medical_history", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  consultationId: integer("consultation_id").references(() => consultations.id),
  type: varchar("type", { length: 30 }).notNull(), // diagnosis, procedure, medication, lab_result
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  doctorId: integer("doctor_id").references(() => users.id),
  attachments: jsonb("attachments"), // Array of file URLs
  createdAt: timestamp("created_at").defaultNow(),
});

// Voice recordings table for AI transcription
export const voiceRecordings = pgTable("voice_recordings", {
  id: serial("id").primaryKey(),
  consultationId: integer("consultation_id").references(() => consultations.id).notNull(),
  audioUrl: text("audio_url").notNull(),
  transcription: text("transcription"),
  language: varchar("language", { length: 10 }).default("en"),
  speakerType: varchar("speaker_type", { length: 10 }).notNull(), // doctor, patient
  duration: integer("duration"), // in seconds
  confidence: numeric("confidence", { precision: 5, scale: 2 }),
  isProcessed: boolean("is_processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  patients: many(patients),
  consultations: many(consultations),
  prescriptions: many(prescriptions),
  facility: one(facilities, {
    fields: [users.id],
    references: [facilities.adminId],
  }),
}));

export const facilitiesRelations = relations(facilities, ({ one }) => ({
  admin: one(users, {
    fields: [facilities.adminId],
    references: [users.id],
  }),
}));

export const patientsRelations = relations(patients, ({ many, one }) => ({
  consultations: many(consultations),
  prescriptions: many(prescriptions),
  medicalHistory: many(medicalHistory),
  doctor: one(users, {
    fields: [patients.doctorId],
    references: [users.id],
  }),
}));

export const consultationsRelations = relations(consultations, ({ one, many }) => ({
  patient: one(patients, {
    fields: [consultations.patientId],
    references: [patients.id],
  }),
  doctor: one(users, {
    fields: [consultations.doctorId],
    references: [users.id],
  }),
  prescriptions: many(prescriptions),
  voiceRecordings: many(voiceRecordings),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  consultation: one(consultations, {
    fields: [prescriptions.consultationId],
    references: [consultations.id],
  }),
  patient: one(patients, {
    fields: [prescriptions.patientId],
    references: [patients.id],
  }),
  doctor: one(users, {
    fields: [prescriptions.doctorId],
    references: [users.id],
  }),
}));

export const medicalHistoryRelations = relations(medicalHistory, ({ one }) => ({
  patient: one(patients, {
    fields: [medicalHistory.patientId],
    references: [patients.id],
  }),
  consultation: one(consultations, {
    fields: [medicalHistory.consultationId],
    references: [consultations.id],
  }),
  doctor: one(users, {
    fields: [medicalHistory.doctorId],
    references: [users.id],
  }),
}));

export const voiceRecordingsRelations = relations(voiceRecordings, ({ one }) => ({
  consultation: one(consultations, {
    fields: [voiceRecordings.consultationId],
    references: [consultations.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFacilitySchema = createInsertSchema(facilities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dateOfBirth: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

export const insertConsultationSchema = createInsertSchema(consultations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  scheduledAt: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMedicalHistorySchema = createInsertSchema(medicalHistory).omit({
  id: true,
  createdAt: true,
});

export const insertVoiceRecordingSchema = createInsertSchema(voiceRecordings).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Facility = typeof facilities.$inferSelect;
export type InsertFacility = z.infer<typeof insertFacilitySchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type MedicalHistory = typeof medicalHistory.$inferSelect;
export type InsertMedicalHistory = z.infer<typeof insertMedicalHistorySchema>;
export type VoiceRecording = typeof voiceRecordings.$inferSelect;
export type InsertVoiceRecording = z.infer<typeof insertVoiceRecordingSchema>;
