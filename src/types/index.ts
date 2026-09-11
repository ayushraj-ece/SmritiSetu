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
  currentMedications?: string;
  doctorHospital?: string;
  emergencyContact?: string;
  state: NERState;
  preferredLanguage: Language;
  caregiverId?: string;
  doctorId?: string;
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
