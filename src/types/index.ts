export type AppMode = 'live' | 'demo';

export type UserRole = 'patient' | 'caregiver' | 'doctor';

export type NERState = 
  | 'Arunachal Pradesh'
  | 'Assam'
  | 'Manipur'
  | 'Meghalaya'
  | 'Mizoram'
  | 'Nagaland'
  | 'Sikkim'
  | 'Tripura';

export type Language = 
  | 'en'   // English
  | 'as'   // Assamese (অসমীয়া)
  | 'bn'   // Bengali (বাংলা)
  | 'brx'  // Bodo (বড়ো)
  | 'mni'  // Manipuri (মৈতেইলোন্)
  | 'kha'  // Khasi (Ka Ktien Khasi)
  | 'lus'  // Mizo (Mizo ṭawng)
  | 'ne'   // Nepali (नेपाली)
  | 'trp'; // Kokborok (Kokborok)

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  displayName: string;
  name?: string;
  phone?: string;
  state?: NERState;
  preferredLanguage: Language;
  patientId?: string;
  createdAt: number;
}

export interface PatientProfile {
  id: string;
  patientId: string; // e.g. ASM58291
  name: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  age: number;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  knownConditions?: string;
  medicalConditions?: string;
  currentMedications?: string;
  doctorHospital?: string;
  doctorId?: string;
  doctorName?: string;
  isDoctorLinked?: boolean;
  stage?: string;
  emergencyContact?: string;
  state: NERState;
  preferredLanguage: Language;
  caregiverId?: string;
  caregiverUid?: string;
  caregiverName?: string;
  caregiverPhone?: string;
  caregiverEmail?: string;
  caregiverRelation?: string;
  notes?: string;
  createdAt: number;
}

export type GameCategory = 'memory' | 'attention' | 'pattern' | 'routine';

export interface GameResult {
  id?: string;
  patientId: string;
  gameCategory: GameCategory;
  difficultyLevel: number;
  score: number; // 0 to 100
  accuracyPercentage: number;
  responseTimeSeconds: number;
  timestamp: number;
  synced?: boolean;
  notes?: string;
}

export type ReminderType = 'medicine' | 'hydration' | 'activity' | 'appointment';

export interface PatientReminder {
  id: string;
  patientId: string;
  type: ReminderType;
  title: string;
  titleAssamese?: string;
  time: string; // e.g. "09:00 AM"
  repeatPattern?: 'Daily' | 'Weekly' | 'Once';
  soundOption?: 'Gentle Chime' | 'Voice Alarm' | 'Loud Alarm';
  completed: boolean;
  completedAt?: number;
  notes?: string;
  synced?: boolean;
  createdByRole?: 'patient' | 'caregiver' | 'doctor';
  scheduledBy?: string;
  prescribedBy?: string;
}

export interface PairingRequest {
  id: string;
  patientId: string; // 5-digit code e.g. 58291
  caregiverUid: string;
  caregiverName: string;
  caregiverEmail?: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: number;
}

export interface ChatMessage {
  id?: string;
  patientId: string;
  senderUid: string;
  senderName: string;
  senderRole: UserRole;
  recipientUid?: string;
  recipientRole?: UserRole;
  threadId?: string;
  text: string;
  timestamp: number;
}

export interface AdaptiveEvaluation {
  id?: string;
  patientId: string;
  gameCategory: GameCategory;
  previousLevel: number;
  newLevel: number;
  performanceScore: number;
  accuracyPercentage: number;
  reason: string;
  timestamp: number;
}

export interface PatientReportData {
  patient: PatientProfile;
  gameResults: GameResult[];
  reminders: PatientReminder[];
  evaluations: AdaptiveEvaluation[];
  generatedAt: number;
}

export interface CustomMemoryQuestion {
  id: string;
  patientId: string;
  imageUrl: string;
  title: string;
  question: string;
  options: [string, string, string, string];
  correctOptionIndex: number;
  createdAt: number;
}

export interface AppNotification {
  id: string;
  userId?: string;
  patientId?: string;
  caregiverUid?: string;
  doctorId?: string;
  pairingRequestId?: string;
  appointmentId?: string;
  title: string;
  message: string;
  type: 'pairing_request' | 'doctor_pairing_request' | 'medication_alert' | 'game_result' | 'emergency' | 'appointment' | 'system';
  timestamp: number;
  read: boolean;
}

export interface PatientNote {
  id: string;
  patientId: string;
  title?: string;
  category?: 'Observation' | 'Mood' | 'Doctor Guidance' | 'Clinical Note' | string;
  body: string;
  writtenBy: string;
  role?: 'caregiver' | 'doctor' | 'system';
  timestamp: number;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId?: string;
  medicineName: string;
  dosage: string;
  frequency?: string;
  route?: 'Oral' | 'Topical' | 'Inhalation' | 'Injection' | string;
  time: string;
  daysOfWeek: string[];
  duration?: string;
  startDate?: string;
  endDate?: string;
  instructions?: string;
  prescribedBy: string;
  hospitalName?: string;
  status?: 'active' | 'discontinued';
  createdAt: number;
}

export interface DoctorProfile {
  uid: string;
  fullName: string;
  registrationNumber: string; // Medical Council Reg No
  specialization: string;     // e.g. Neurologist, Geriatrician, Psychiatrist
  qualification: string;      // e.g. MBBS, MD (Medicine), DM (Neurology)
  experienceYears: number;
  clinicHospital: string;     // Clinic / Hospital Name
  address: string;
  phone: string;
  email: string;
  preferredLanguage: Language;
  availability: string;       // e.g. Mon - Fri (10:00 AM - 04:00 PM)
  bio?: string;
  createdAt: number;
}

export interface DoctorPairingRequest {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorHospital: string;
  doctorSpecialization?: string;
  patientId: string;
  patientName?: string;
  caregiverUid?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: number;
  respondedAt?: number;
  acceptedBy?: 'patient' | 'caregiver';
  rejectionReason?: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorHospital?: string;
  patientId: string;
  patientName?: string;
  caregiverUid?: string;
  date: string;              // YYYY-MM-DD
  time: string;              // HH:MM AM/PM
  durationMinutes: number;
  type: 'Consultation' | 'Follow-up' | 'Medication Review' | 'Cognitive Review' | 'Other';
  meetingMethod: 'In-Person' | 'Video Call' | 'Phone Call';
  instructions?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: number;
}

export interface ClinicalNote {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  title: string;
  content: string;
  date: string;
  followUpDate?: string;
  isVisibleToPatient: boolean;
  isVisibleToCaregiver: boolean;
  createdAt: number;
}

export interface DoctorTask {
  id: string;
  doctorId: string;
  doctorName?: string;
  patientId: string;
  title: string;
  category: 'Take medicine' | 'Drink water' | 'Walk' | 'Cognitive exercise' | 'Doctor follow-up' | 'Appointment' | 'Daily activity' | 'Custom task';
  time: string;
  repeatSchedule: 'Daily' | 'Weekly' | 'Once';
  instructions?: string;
  status: 'pending' | 'completed' | 'missed' | 'cancelled';
  createdAt: number;
}



