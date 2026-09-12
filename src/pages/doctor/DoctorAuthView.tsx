import React, { useState } from 'react';
import { 
  Stethoscope, 
  Mail, 
  Lock, 
  User, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { authService } from '../../services/authService';
import { dataService } from '../../services/dataService';
import type { UserProfile, NERState } from '../../types';

interface Props {
  onSuccess: (profile: UserProfile) => void;
}

export const DoctorAuthView: React.FC<Props> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [registrationNumber, setRegistrationNumber] = useState<string>('');
  const [specialization, setSpecialization] = useState<string>('');
  const [qualification, setQualification] = useState<string>('MBBS, MD');
  const [experienceYears, setExperienceYears] = useState<number>(10);
  const [clinicHospital, setClinicHospital] = useState<string>('');
  const [state] = useState<NERState>('Assam');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const profile = await authService.loginUser(email.trim(), password);
        setLoading(false);
        if (profile) {
          if (profile.role !== 'doctor') {
            setErrorMsg(`This account is registered as a ${profile.role.toUpperCase()}. Please sign in through the ${profile.role} portal.`);
            return;
          }
          const fetchedDoc = await dataService.getDoctorProfile(profile.uid);
          const docProfile: UserProfile = {
            ...profile,
            name: fetchedDoc?.fullName || profile.displayName || profile.name || fullName
          };
          localStorage.setItem('smritisetu_user_profile', JSON.stringify(docProfile));
          onSuccess(docProfile);
        } else {
          setErrorMsg('Invalid doctor credentials. Please register a new profile or check email and password.');
        }
      } else {
        const cleanName = fullName.trim().startsWith('Dr.') ? fullName.trim() : `Dr. ${fullName.trim()}`;
        const res = await authService.registerUser({
          name: cleanName,
          email: email.trim(),
          password,
          phone: phone.trim(),
          age: 45,
          gender: 'Male',
          state,
          preferredLanguage: 'en',
          role: 'doctor',
          registrationNumber: registrationNumber.trim(),
          specialization: specialization.trim(),
          qualification: qualification.trim(),
          experienceYears: Number(experienceYears) || 0,
          clinicHospital: clinicHospital.trim()
        });

        const docProfileObj: any = {
          uid: res.userProfile.uid,
          fullName: cleanName,
          registrationNumber: registrationNumber.trim(),
          specialization: specialization.trim(),
          qualification: qualification.trim(),
          experienceYears: Number(experienceYears) || 0,
          clinicHospital: clinicHospital.trim(),
          address: `${state}, India`,
          phone: phone.trim(),
          email: email.trim(),
          preferredLanguage: 'en',
          availability: 'Mon - Fri (09:00 AM - 05:00 PM)',
          createdAt: Date.now()
        };

        const { offlineStorage } = await import('../../services/offlineStorage');
        offlineStorage.saveDoctorProfile(docProfileObj);
        await dataService.saveDoctorProfile(docProfileObj);

        setLoading(false);
        const docProfile: UserProfile = {
          ...res.userProfile,
          role: 'doctor',
          name: cleanName,
          displayName: cleanName
        };
        localStorage.setItem('smritisetu_user_profile', JSON.stringify(docProfile));
        onSuccess(docProfile);
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Authentication failed. Please verify inputs.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="max-w-lg w-full bg-slate-950 rounded-2xl border border-slate-800 p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-[#0284C7] border border-sky-500/30 flex items-center justify-center mx-auto mb-2">
            <Stethoscope className="w-6 h-6 text-sky-400" />
          </div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Clinical Doctor Web Portal
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {mode === 'login' ? 'Practitioner Sign In' : 'Register New Doctor Profile'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'login' 
              ? 'Access clinical telemetry, cognitive charts, and patient prescriptions' 
              : 'Register your official medical credentials to create a new doctor profile'}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'register' ? 'bg-[#0284C7] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register Profile
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'login' ? 'bg-[#0284C7] text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Doctor Full Name (e.g. Dr. Ananya Sen)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Full Name"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Medical Reg No.
                  </label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. MCI/2024/59281"
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Hospital / Clinic
                  </label>
                  <input
                    type="text"
                    value={clinicHospital}
                    onChange={(e) => setClinicHospital(e.target.value)}
                    placeholder="e.g. City Neuro Care Center"
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. Neurology & Cognitive Health"
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Qualifications
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. MBBS, MD, DM"
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                    Phone / Mobile
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
              Doctor Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@example.com"
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#0284C7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-[#0284C7]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Processing...' : mode === 'login' ? 'Sign In to Doctor Web Portal' : 'Register New Doctor Profile'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-[11px] text-slate-500">
            Need patient or caregiver app access? Navigate to <code className="text-sky-400">/</code> (Root App)
          </span>
        </div>
      </div>
    </div>
  );
};

