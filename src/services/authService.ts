import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { offlineStorage } from './offlineStorage';
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
  // Doctor specific registration fields
  registrationNumber?: string;
  specialization?: string;
  qualification?: string;
  experienceYears?: number;
  clinicHospital?: string;
  address?: string;
  availability?: string;
  bio?: string;
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

    if (input.role === 'doctor') {
      const docProf = {
        uid: user.uid,
        fullName: input.name,
        registrationNumber: input.registrationNumber || `MCI-REG-${Math.floor(10000 + Math.random() * 90000)}`,
        specialization: input.specialization || 'Neurologist & Geriatric Specialist',
        qualification: input.qualification || 'MBBS, MD',
        experienceYears: input.experienceYears || 10,
        clinicHospital: input.clinicHospital || 'Guwahati Medical College & Hospital',
        address: input.address || `${input.state}, India`,
        phone: input.phone || '',
        email: input.email,
        preferredLanguage: input.preferredLanguage,
        availability: input.availability || 'Mon - Fri (10:00 AM - 04:00 PM)',
        bio: input.bio || 'Attending Physician specializing in cognitive health and neuro-rehabilitation.',
        createdAt: Date.now()
      };
      await setDoc(doc(db, 'doctors', user.uid), docProf);
    }

    if (input.role === 'caregiver') {
      const caregiverProf = {
        uid: user.uid,
        name: input.name,
        email: input.email,
        phone: input.phone || '+91 98765 43210',
        relation: 'Caregiver',
        state: input.state,
        preferredLanguage: input.preferredLanguage,
        createdAt: Date.now()
      };
      await setDoc(doc(db, 'caregivers', user.uid), caregiverProf);
      offlineStorage.saveCaregiverProfile({
        name: input.name,
        email: input.email,
        phone: input.phone || '+91 98765 43210',
        relation: 'Caregiver',
        caregiverUid: user.uid
      });
    }

    return { userProfile, patientProfile };
  },

  // Login user (with authoritative Firestore document role resolution)
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
        const docSnap = await getDoc(doc(db, 'doctors', currentUser.uid));
        const caregiverSnap = await getDoc(doc(db, 'caregivers', currentUser.uid));
        const isDoc = docSnap.exists();
        const isCaregiver = caregiverSnap.exists();
        const resolvedRole: UserRole = isDoc ? 'doctor' : isCaregiver ? 'caregiver' : 'patient';

        const fallbackProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || email,
          displayName: currentUser.displayName || (email ? email.split('@')[0] : 'User'),
          role: resolvedRole,
          preferredLanguage: 'en',
          patientId: resolvedRole === 'patient' ? generatePatientId('Assam') : undefined,
          createdAt: Date.now()
        };
        await setDoc(userDocRef, fallbackProfile);
        userDoc = await getDoc(userDocRef);
      }

      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        if (data.role === 'caregiver') {
          try {
            const cSnap = await getDoc(doc(db, 'caregivers', currentUser.uid));
            if (cSnap.exists()) {
              const cData = cSnap.data();
              offlineStorage.saveCaregiverProfile({
                name: cData.name || currentUser.displayName || data.displayName || 'Caregiver',
                email: cData.email || currentUser.email || data.email,
                phone: cData.phone || '+91 98765 43210',
                relation: cData.relation || 'Caregiver',
                caregiverUid: currentUser.uid
              });
            } else {
              offlineStorage.saveCaregiverProfile({
                name: currentUser.displayName || data.displayName || 'Caregiver',
                email: currentUser.email || data.email,
                phone: '+91 98765 43210',
                relation: 'Caregiver',
                caregiverUid: currentUser.uid
              });
            }
          } catch {}
        }
        return data;
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

  // Sign out & clear session data
  async logout(): Promise<void> {
    try {
      localStorage.removeItem('smritisetu_user_profile');
      localStorage.removeItem('smritisetu_caregiver_profile');
      localStorage.removeItem('smritisetu_paired_patients');
      localStorage.removeItem('smritisetu_pending_requests');
    } catch {
      // Ignore storage clear errors
    }
    await signOut(auth);
  }
};
