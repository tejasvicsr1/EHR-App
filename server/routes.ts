import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, insertPatientSchema, insertConsultationSchema, insertPrescriptionSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "24h" });

      res.status(201).json({
        message: "User created successfully",
        token,
        user: { ...user, password: undefined },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "24h" });

      res.json({
        message: "Login successful",
        token,
        user: { ...user, password: undefined },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    res.json({ user: { ...req.user, password: undefined } });
  });

  // HPR ID verification
  app.post("/api/auth/verify-hpr", authenticateToken, async (req: any, res) => {
    try {
      const { hprId } = req.body;
      
      // In a real implementation, this would call the actual HPR API
      // For now, we'll simulate the verification
      if (!hprId || hprId.length !== 14) {
        return res.status(400).json({ message: "Invalid HPR ID format" });
      }

      const updatedUser = await storage.verifyHprId(req.user.id, hprId);
      res.json({
        message: "HPR ID verified successfully",
        user: { ...updatedUser, password: undefined },
      });
    } catch (error) {
      console.error("HPR verification error:", error);
      res.status(500).json({ message: "HPR verification failed" });
    }
  });

  // Facility routes
  app.post("/api/facilities", authenticateToken, async (req: any, res) => {
    try {
      const facilityData = {
        ...req.body,
        adminId: req.user.id,
      };
      
      const facility = await storage.createFacility(facilityData);
      res.status(201).json({ facility });
    } catch (error) {
      console.error("Create facility error:", error);
      res.status(400).json({ message: "Failed to create facility" });
    }
  });

  app.get("/api/facilities/my", authenticateToken, async (req: any, res) => {
    try {
      const facility = await storage.getFacilityByAdmin(req.user.id);
      res.json({ facility });
    } catch (error) {
      console.error("Get facility error:", error);
      res.status(500).json({ message: "Failed to fetch facility" });
    }
  });

  // Patient routes
  app.get("/api/patients", authenticateToken, async (req: any, res) => {
    try {
      const { search } = req.query;
      const patients = await storage.getPatients(req.user.id, search);
      res.json({ patients });
    } catch (error) {
      console.error("Get patients error:", error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", authenticateToken, async (req: any, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const patient = await storage.getPatient(patientId);
      
      if (!patient || patient.doctorId !== req.user.id) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json({ patient });
    } catch (error) {
      console.error("Get patient error:", error);
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", authenticateToken, async (req: any, res) => {
    try {
      const patientData = insertPatientSchema.parse({
        ...req.body,
        doctorId: req.user.id,
      });
      
      const patient = await storage.createPatient(patientData);
      res.status(201).json({ patient });
    } catch (error) {
      console.error("Create patient error:", error);
      res.status(400).json({ message: "Failed to create patient" });
    }
  });

  // Consultation routes
  app.get("/api/consultations", authenticateToken, async (req: any, res) => {
    try {
      const { status } = req.query;
      const consultations = await storage.getConsultations(req.user.id, status);
      res.json({ consultations });
    } catch (error) {
      console.error("Get consultations error:", error);
      res.status(500).json({ message: "Failed to fetch consultations" });
    }
  });

  app.get("/api/consultations/:id", authenticateToken, async (req: any, res) => {
    try {
      const consultationId = parseInt(req.params.id);
      const consultation = await storage.getConsultation(consultationId);
      
      if (!consultation || consultation.doctorId !== req.user.id) {
        return res.status(404).json({ message: "Consultation not found" });
      }
      
      res.json({ consultation });
    } catch (error) {
      console.error("Get consultation error:", error);
      res.status(500).json({ message: "Failed to fetch consultation" });
    }
  });

  app.post("/api/consultations", authenticateToken, async (req: any, res) => {
    try {
      const consultationData = insertConsultationSchema.parse({
        ...req.body,
        doctorId: req.user.id,
      });
      
      const consultation = await storage.createConsultation(consultationData);
      res.status(201).json({ consultation });
    } catch (error) {
      console.error("Create consultation error:", error);
      res.status(400).json({ message: "Failed to create consultation" });
    }
  });

  app.patch("/api/consultations/:id", authenticateToken, async (req: any, res) => {
    try {
      const consultationId = parseInt(req.params.id);
      const consultation = await storage.getConsultation(consultationId);
      
      if (!consultation || consultation.doctorId !== req.user.id) {
        return res.status(404).json({ message: "Consultation not found" });
      }
      
      const updatedConsultation = await storage.updateConsultation(consultationId, req.body);
      res.json({ consultation: updatedConsultation });
    } catch (error) {
      console.error("Update consultation error:", error);
      res.status(400).json({ message: "Failed to update consultation" });
    }
  });

  // Prescription routes
  app.get("/api/prescriptions", authenticateToken, async (req: any, res) => {
    try {
      const prescriptions = await storage.getPrescriptions(req.user.id);
      res.json({ prescriptions });
    } catch (error) {
      console.error("Get prescriptions error:", error);
      res.status(500).json({ message: "Failed to fetch prescriptions" });
    }
  });

  app.post("/api/prescriptions", authenticateToken, async (req: any, res) => {
    try {
      const prescriptionData = insertPrescriptionSchema.parse({
        ...req.body,
        doctorId: req.user.id,
      });
      
      const prescription = await storage.createPrescription(prescriptionData);
      res.status(201).json({ prescription });
    } catch (error) {
      console.error("Create prescription error:", error);
      res.status(400).json({ message: "Failed to create prescription" });
    }
  });

  // Voice recording routes
  app.post("/api/voice-recordings", authenticateToken, async (req: any, res) => {
    try {
      const recordingData = {
        ...req.body,
        // In a real implementation, you'd upload the audio file and get the URL
      };
      
      const recording = await storage.createVoiceRecording(recordingData);
      res.status(201).json({ recording });
    } catch (error) {
      console.error("Create voice recording error:", error);
      res.status(400).json({ message: "Failed to create voice recording" });
    }
  });

  app.get("/api/consultations/:id/recordings", authenticateToken, async (req: any, res) => {
    try {
      const consultationId = parseInt(req.params.id);
      const recordings = await storage.getConsultationRecordings(consultationId);
      res.json({ recordings });
    } catch (error) {
      console.error("Get recordings error:", error);
      res.status(500).json({ message: "Failed to fetch recordings" });
    }
  });

  // Medical history routes
  app.get("/api/patients/:id/history", authenticateToken, async (req: any, res) => {
    try {
      const patientId = parseInt(req.params.id);
      const patient = await storage.getPatient(patientId);
      
      if (!patient || patient.doctorId !== req.user.id) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      const history = await storage.getPatientMedicalHistory(patientId);
      res.json({ history });
    } catch (error) {
      console.error("Get medical history error:", error);
      res.status(500).json({ message: "Failed to fetch medical history" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", authenticateToken, async (req: any, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [patients, consultations, prescriptions] = await Promise.all([
        storage.getPatients(req.user.id),
        storage.getConsultations(req.user.id),
        storage.getPrescriptions(req.user.id),
      ]);
      
      const todayConsultations = consultations.filter(c => 
        c.scheduledAt && new Date(c.scheduledAt) >= today
      );
      
      const stats = {
        todayAppointments: todayConsultations.length,
        totalPatients: patients.length,
        totalPrescriptions: prescriptions.length,
        aiSessions: consultations.filter(c => c.aiTranscription).length,
      };
      
      res.json({ stats });
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
