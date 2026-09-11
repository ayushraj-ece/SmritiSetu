import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { UserRole, NERState, Language, UserProfile, PatientProfile } from '../types';

const STATE_PREFIXES: Record<string, string> = {
  'Assam': 'ASM',
  'Meghalaya': 'ML',
  'Tripura': 'TR',
  'Manipur': 'MN',
  'Nagaland': 'NL',
  'Mizoram': 'MZ',
  'Arunachal Pradesh': 'AR',
  'Sikkim': 'SK',
};

// Helper to generate unique State-prefixed 5-digit Patient ID (e.g. ASM58291)
export const generatePatientId = (state?: string): string => {
  const prefix = (state && STATE_PREFIXES[state]) || 'ASM';
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}${randomNum}`;
};

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  state: NERState;
  preferredLanguage: Language;
  role: UserRole;
}

export const authService = {
  // Register user in Firebase Auth and Firestore (with duplicate email recovery)
  async registerUser(input: RegisterInput): Promise<{ userProfile: UserProfile; patientProfile?: PatientProfile }> {
    let user;
    try {
      const res = await createUserWithEmailAndPassword(auth, input.email, input.password);
      user = res.user;
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        // Recovery: sign in existing Auth user and update/create Firestore docs
        const res = await signInWithEmailAndPassword(auth, input.email, input.password);
        user = res.user;
      } else {
        throw err;
      }
    }
    
    // Update display name
    await updateProfile(user, { displayName: input.name });

    const patientId = input.role === 'patient' ? generatePatientId(input.state) : undefined;

    const userProfileData: Record<string, any> = {
      uid: user.uid,
      email: input.email,
      displayName: input.name,
      phone: input.phone || '',
      state: input.state,
      preferredLanguage: input.preferredLanguage,
      role: input.role,
      createdAt: Date.now()
    };

    if (patientId) {
      userProfileData.patientId = patientId;
    }

    const userProfile = userProfileData as UserProfile;

    // Save to users collection
    await setDoc(doc(db, 'users', user.uid), userProfileData);

    let patientProfile: PatientProfile | undefined = undefined;

    if (input.role === 'patient' && patientId) {
      patientProfile = {
        id: user.uid,
        patientId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        age: input.age,
        gender: input.gender,
        state: input.state,
        preferredLanguage: input.preferredLanguage,
        createdAt: Date.now()
      };
      // Save to patients collection
      await setDoc(doc(db, 'patients', patientId), patientProfile);
    }

    return { userProfile, patientProfile };
  },

  // Login user (with automatic Firestore document self-healing)
  async loginUser(email: string, pass: string): Promise<UserProfile | null> {
    let currentUser = auth.currentUser;
    if (!currentUser && email && pass) {
      const { user } = await signInWithEmailAndPassword(auth, email, pass);
      currentUser = user;
    }
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      let userDoc = await getDoc(userDocRef);
      
      // Self-healing: if Firestore doc was missing from an interrupted setup, create it
      if (!userDoc.exists()) {
        const fallbackProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || email,
          displayName: currentUser.displayName || (email ? email.split('@')[0] : 'User'),
          role: 'patient',
          preferredLanguage: 'en',
          patientId: generatePatientId('Assam'),
          createdAt: Date.now()
        };
        await setDoc(userDocRef, fallbackProfile);
        userDoc = await getDoc(userDocRef);
      }

      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
    }
    return null;
  },

  // Password reset email
  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  },

  // Update patient profile details
  async updatePatientProfile(patientId: string, updates: Partial<PatientProfile>): Promise<void> {
    const patientRef = doc(db, 'patients', patientId);
    await updateDoc(patientRef, updates);
  },

  // Sign out
  async logout(): Promise<void> {
    await signOut(auth);
  }
};
