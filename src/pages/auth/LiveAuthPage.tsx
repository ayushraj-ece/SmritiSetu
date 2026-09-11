import React, { useState } from 'react';
import { authService } from '../../services/authService';
import type { UserRole, NERState, Language, UserProfile } from '../../types';
import { Mail, Lock, ArrowRight, ArrowLeft, ShieldCheck, Brain, UserCheck, Sparkles } from 'lucide-react';

interface Props {
  initialRole?: UserRole;
  onSuccess: (userProfile: UserProfile) => void;
  onBackToLanding: () => void;
  onEnterDemo?: () => void;
}

const NER_STATES: NERState[] = [
  'Arunachal Pradesh',
  'Assam',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Sikkim',
  'Tripura'
];

export const LiveAuthPage: React.FC<Props> = ({ initialRole, onSuccess, onBackToLanding, onEnterDemo }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [age, setAge] = useState<number>(72);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [state, setState] = useState<NERState>('Assam');
  const [language, setLanguage] = useState<Language>('as');
  const [role, setRole] = useState<UserRole>(initialRole || 'patient');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const userProf = await authService.loginUser(email, password);
      setLoading(false);
      if (userProf) {
        onSuccess(userProf);
      } else {
        setErrorMsg('Invalid login credentials or profile not found.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Authentication failed.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const { userProfile } = await authService.registerUser({
        name,
        email,
        password,
        phone,
        age,
        gender,
        state,
        preferredLanguage: language,
        role
      });
      setLoading(false);
      onSuccess(userProfile);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Registration failed.');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await authService.resetPassword(email);
      setLoading(false);
      setSuccessMsg('Password reset link sent to your email.');
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to send reset link.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-6 font-sans relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-950/90 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 relative z-10 backdrop-blur-md">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-emerald-400" />
            <span className="text-base font-black text-white tracking-tight">SmritiSetu</span>
          </div>

          <span className="text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Live DB
          </span>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {role === 'patient' ? 'Patient Portal Sign In 🙋‍♂️' : 'Caregiver Portal Sign In 🧑‍⚕️'}
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Real-time synchronization for North-East India
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-300 font-medium text-xs rounded-2xl">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-medium text-xs rounded-2xl">
            ✓ {successMsg}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => { setTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              tab === 'login' 
                ? 'bg-[#1E7F53] text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setErrorMsg(''); }}
            className={`flex-1 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer ${
              tab === 'register' 
                ? 'bg-[#1E7F53] text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3 py-3 bg-slate-900 border border-slate-800 text-white font-medium text-sm rounded-2xl focus:border-[#1E7F53] outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-3 bg-slate-900 border border-slate-800 text-white font-medium text-sm rounded-2xl focus:border-[#1E7F53] outline-none"
                  required
                />
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setTab('forgot')}
                className="text-xs font-bold text-emerald-400 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1E7F53] hover:bg-[#146743] text-white font-extrabold text-sm rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <span>{loading ? 'Authenticating...' : `Enter ${role === 'patient' ? 'Patient' : 'Caregiver'} Portal`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 text-xs font-medium">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full p-3 bg-slate-900 border border-slate-800 text-white font-medium text-sm rounded-2xl focus:border-[#1E7F53] outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@domain.com"
                  className="w-full p-3 bg-slate-900 border border-slate-800 text-white font-medium text-sm rounded-2xl focus:border-[#1E7F53] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-slate-900 border border-slate-800 text-white font-medium text-sm rounded-2xl focus:border-[#1E7F53] outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98640..."
                  className="w-full p-3 bg-slate-900 border border-slate-800 text-white font-medium text-sm rounded-2xl focus:border-[#1E7F53] outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full p-3 bg-slate-900 border border-slate-800 text-white font-medium text-sm rounded-2xl focus:border-[#1E7F53] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full p-3 bg-slate-900 border border-slate-800 text-white font-medium text-sm rounded-2xl focus:border-[#1E7F53] outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">NER State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value as NERState)}
                  className="w-full p-3 bg-slate-900 border border-slate-800 text-white font-medium text-sm rounded-2xl focus:border-[#1E7F53] outline-none"
                >
                  {NER_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full p-3 bg-slate-900 border border-slate-800 text-white font-medium text-sm rounded-2xl focus:border-[#1E7F53] outline-none"
                >
                  <option value="en">English</option>
                  <option value="as">Assamese (অসমীয়া)</option>
                  <option value="bn">Bengali (বাংলা)</option>
                  <option value="brx">Bodo (বড়ো)</option>
                  <option value="mni">Manipuri (মৈতেইলোন্)</option>
                  <option value="kha">Khasi (Ka Ktien Khasi)</option>
                  <option value="lus">Mizo (Mizo ṭawng)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full p-3 bg-slate-900 border border-slate-800 text-white font-medium text-sm rounded-2xl focus:border-[#1E7F53] outline-none font-bold"
              >
                <option value="patient">Patient Portal User</option>
                <option value="caregiver">Caregiver / Family Portal User</option>
                <option value="doctor">Doctor / Healthcare Professional</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1E7F53] hover:bg-[#146743] text-white font-extrabold text-sm rounded-2xl shadow-md cursor-pointer flex items-center justify-center gap-2 mt-3 transition-all active:scale-98"
            >
              <UserCheck className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Create Account & Generate Patient Code'}</span>
            </button>
          </form>
        )}

        {/* Forgot Password Form */}
        {tab === 'forgot' && (
          <form onSubmit={handleReset} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Registered Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
                className="w-full p-3 bg-slate-900 border border-slate-800 text-white font-medium text-sm rounded-2xl focus:border-[#1E7F53] outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#1E7F53] hover:bg-[#146743] text-white font-extrabold text-xs rounded-2xl shadow-md cursor-pointer transition-all"
            >
              {loading ? 'Sending...' : 'Send Password Reset Email'}
            </button>
          </form>
        )}

        {/* Enter Demo Mode Button */}
        {onEnterDemo && (
          <div className="pt-4 border-t border-slate-800 text-center space-y-2">
            <p className="text-[11px] text-slate-400 font-medium">Want to explore without logging in?</p>
            <button
              type="button"
              onClick={onEnterDemo}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/40 hover:border-emerald-400 font-extrabold text-xs rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Enter Demo Mode (Preloaded Demo Data)</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
