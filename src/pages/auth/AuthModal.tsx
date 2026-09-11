import React, { useState } from 'react';
import { authService } from '../../services/authService';
import type { UserRole, NERState, Language, UserProfile } from '../../types';
import { Mail, Lock, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userProfile: UserProfile) => void;
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

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'forgot'>('login');

  // Form state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [age, setAge] = useState<number>(72);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [state, setState] = useState<NERState>('Assam');
  const [language] = useState<Language>('as');
  const [role, setRole] = useState<UserRole>('patient');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const userProf = await authService.loginUser(email, password);
      setLoading(false);
      if (userProf) {
        onSuccess(userProf);
        onClose();
      } else {
        setErrorMsg('Invalid login credentials or user profile not found.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
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
      onClose();
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
      setSuccessMsg('Password reset link sent to your email address.');
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to send reset link.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              {tab === 'login' && 'Sign In to स्मृतिसेतु (SMRITISETU)'}
              {tab === 'register' && 'Create SMRITISETU Account'}
              {tab === 'forgot' && 'Reset Password'}
            </h3>
            <p className="text-xs font-semibold text-slate-500">Live Firebase Authentication</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-xl">✕</button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-xl text-sm">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-xl text-sm">
            ✓ {successMsg}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => { setTab('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-sm font-black rounded-xl transition-all ${tab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-sm font-black rounded-xl transition-all ${tab === 'register' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            Register
          </button>
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-1">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-3 py-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-900 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-3 py-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-900 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setTab('forgot')}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-lg shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-900 focus:border-emerald-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-900 focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-900 focus:border-emerald-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-900 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-900 focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-900 focus:border-emerald-500 outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">State (NER)</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value as NERState)}
                  className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-900 focus:border-emerald-500 outline-none"
                >
                  {NER_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase mb-1">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full p-2.5 rounded-xl border-2 border-slate-200 font-bold text-slate-900 focus:border-emerald-500 outline-none"
                >
                  <option value="patient">Patient</option>
                  <option value="caregiver">Caregiver</option>
                  <option value="doctor">Doctor / Healthcare Worker</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-lg shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Registering...' : 'Complete Registration'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        )}

        {/* Forgot Form */}
        {tab === 'forgot' && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase mb-1">Registered Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-slate-200 font-bold text-slate-900 focus:border-emerald-500 outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-lg shadow-md cursor-pointer"
            >
              {loading ? 'Sending...' : 'Send Password Reset Email'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
