// Healthcare-specific constants for LAYRD application

// Supported languages for the application
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া" },
] as const;

// Medical specializations
export const MEDICAL_SPECIALIZATIONS = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Gynecology",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Otolaryngology (ENT)",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Urology",
  "Emergency Medicine",
  "Family Medicine",
  "Internal Medicine",
  "Pathology",
  "Anesthesiology",
  "Surgery",
  "Plastic Surgery",
  "Neurosurgery",
  "Cardiac Surgery",
  "Orthopedic Surgery",
] as const;

// Blood groups
export const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
] as const;

// Medication frequencies
export const MEDICATION_FREQUENCIES = [
  { value: "once-daily", label: "Once daily" },
  { value: "twice-daily", label: "Twice daily" },
  { value: "thrice-daily", label: "Three times daily" },
  { value: "four-times-daily", label: "Four times daily" },
  { value: "as-needed", label: "As needed (PRN)" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "every-other-day", label: "Every other day" },
  { value: "twice-weekly", label: "Twice weekly" },
  { value: "thrice-weekly", label: "Three times weekly" },
] as const;

// Practice types
export const PRACTICE_TYPES = [
  {
    value: "solo",
    title: "Solo/Small Clinic (1-3 doctors)",
    description: "Ideal for individual practitioners or small teams. Each doctor manages their own schedule, records, and settings directly.",
  },
  {
    value: "group",
    title: "Group Practice/Clinic (4+ doctors)",
    description: "For mid-sized clinics. A designated admin manages overall doctor profiles, facility-wide appointment slots, and system integrations.",
  },
  {
    value: "hospital",
    title: "Large Hospital/Tertiary Center",
    description: "Comprehensive setup for hospitals with multiple departments and staff roles. Features full role-based access control.",
  },
] as const;

// Facility types
export const FACILITY_TYPES = [
  "Clinic",
  "Nursing Home",
  "Hospital",
  "Diagnostic Center",
  "Polyclinic",
  "Specialty Center",
  "Primary Health Center",
  "Community Health Center",
  "Super Specialty Hospital",
] as const;

// Consultation types
export const CONSULTATION_TYPES = [
  { value: "regular", label: "Regular Consultation" },
  { value: "follow-up", label: "Follow-up" },
  { value: "emergency", label: "Emergency" },
  { value: "teleconsultation", label: "Teleconsultation" },
  { value: "second-opinion", label: "Second Opinion" },
  { value: "preventive", label: "Preventive Care" },
] as const;

// Consultation statuses
export const CONSULTATION_STATUSES = [
  { value: "scheduled", label: "Scheduled", color: "blue" },
  { value: "in_progress", label: "In Progress", color: "yellow" },
  { value: "completed", label: "Completed", color: "green" },
  { value: "cancelled", label: "Cancelled", color: "red" },
  { value: "no_show", label: "No Show", color: "gray" },
] as const;

// Prescription statuses
export const PRESCRIPTION_STATUSES = [
  { value: "draft", label: "Draft", color: "gray" },
  { value: "sent", label: "Sent", color: "green" },
  { value: "fulfilled", label: "Fulfilled", color: "blue" },
  { value: "cancelled", label: "Cancelled", color: "red" },
] as const;

// Common medical conditions
export const COMMON_CONDITIONS = [
  "Hypertension",
  "Diabetes Mellitus",
  "Asthma",
  "Chronic Kidney Disease",
  "Heart Disease",
  "Arthritis",
  "Depression",
  "Anxiety",
  "Migraine",
  "Allergies",
  "Thyroid Disorders",
  "COPD",
  "Acid Reflux (GERD)",
  "High Cholesterol",
  "Osteoporosis",
] as const;

// Common allergies
export const COMMON_ALLERGIES = [
  "Penicillin",
  "Sulfa drugs",
  "Aspirin",
  "NSAIDs",
  "Latex",
  "Peanuts",
  "Shellfish",
  "Dairy",
  "Eggs",
  "Soy",
  "Gluten",
  "Dust mites",
  "Pollen",
  "Pet dander",
  "Food dyes",
] as const;

// NDHM/ABHA related constants
export const NDHM_CONSTANTS = {
  HPR_ID_LENGTH: 14,
  ABHA_ID_LENGTH: 17,
  HFR_ID_LENGTH: 14,
  HPR_PORTAL_URL: "https://hpr.abdm.gov.in",
  ABHA_PORTAL_URL: "https://abha.abdm.gov.in",
  HFR_PORTAL_URL: "https://facility.abdm.gov.in",
  NDHM_PORTAL_URL: "https://ndhm.gov.in",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    ME: "/api/auth/me",
    VERIFY_HPR: "/api/auth/verify-hpr",
    UPDATE_PROFILE: "/api/auth/update-profile",
  },
  PATIENTS: {
    LIST: "/api/patients",
    CREATE: "/api/patients",
    GET: (id: number) => `/api/patients/${id}`,
    UPDATE: (id: number) => `/api/patients/${id}`,
    HISTORY: (id: number) => `/api/patients/${id}/history`,
  },
  CONSULTATIONS: {
    LIST: "/api/consultations",
    CREATE: "/api/consultations",
    GET: (id: number) => `/api/consultations/${id}`,
    UPDATE: (id: number) => `/api/consultations/${id}`,
    RECORDINGS: (id: number) => `/api/consultations/${id}/recordings`,
  },
  PRESCRIPTIONS: {
    LIST: "/api/prescriptions",
    CREATE: "/api/prescriptions",
    GET: (id: number) => `/api/prescriptions/${id}`,
    UPDATE: (id: number) => `/api/prescriptions/${id}`,
  },
  FACILITIES: {
    MY: "/api/facilities/my",
    CREATE: "/api/facilities",
    UPDATE: (id: number) => `/api/facilities/${id}`,
  },
  VOICE: {
    RECORDINGS: "/api/voice-recordings",
  },
  DASHBOARD: {
    STATS: "/api/dashboard/stats",
  },
} as const;

// Time constants
export const TIME_CONSTANTS = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in milliseconds
  VOICE_RECORDING_MAX_DURATION: 10 * 60 * 1000, // 10 minutes
  API_TIMEOUT: 30 * 1000, // 30 seconds
  DEBOUNCE_DELAY: 300, // 300ms for search inputs
} as const;

// File upload constants
export const FILE_UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ALLOWED_AUDIO_TYPES: ["audio/mp3", "audio/wav", "audio/webm", "audio/ogg"],
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  VALIDATION_ERROR: "Please check your input and try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  NOT_FOUND: "The requested resource was not found.",
  PERMISSION_DENIED: "You don't have permission to access this resource.",
  VOICE_NOT_SUPPORTED: "Voice recording is not supported in your browser.",
  MICROPHONE_ACCESS_DENIED: "Microphone access was denied. Please allow microphone access and try again.",
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: "Profile updated successfully",
  PATIENT_CREATED: "Patient added successfully",
  CONSULTATION_CREATED: "Consultation started successfully",
  PRESCRIPTION_CREATED: "Prescription created successfully",
  SETTINGS_SAVED: "Settings saved successfully",
  HPR_VERIFIED: "HPR ID verified successfully",
} as const;

// Default values
export const DEFAULT_VALUES = {
  CONSULTATION_DURATION: 30, // minutes
  PRESCRIPTION_VALIDITY: 30, // days
  VOICE_CONFIDENCE_THRESHOLD: 0.7,
  PAGINATION_SIZE: 10,
  SEARCH_MIN_LENGTH: 2,
} as const;

// Routes
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  ONBOARDING: "/onboarding",
  PATIENTS: "/patients",
  CONSULTATION: "/consultation",
  PRESCRIPTIONS: "/prescriptions",
  PROFILE: "/profile",
  SETTINGS: "/settings",
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: "token",
  USER_PREFERENCES: "userPreferences",
  LANGUAGE: "selectedLanguage",
  THEME: "theme",
} as const;
