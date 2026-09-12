import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit2, 
  User, 
  Calendar, 
  Phone, 
  Heart, 
  Pill, 
  Stethoscope, 
  ShieldCheck, 
  Check,
  Copy
} from 'lucide-react';
import type { PatientProfile, Prescription } from '../../../types';
import { dataService } from '../../../services/dataService';
import { offlineStorage } from '../../../services/offlineStorage';

interface Props {
  patientProfile: PatientProfile;
  onBack: () => void;
  onUpdateProfile?: (updated: Partial<PatientProfile>) => void;
}

export const PatientProfileView: React.FC<Props> = ({
  patientProfile,
  onBack,
  onUpdateProfile
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form State initialized with dynamic patient profile values
  const [name, setName] = useState<string>(patientProfile.name || 'Patient');
  const [dob, setDob] = useState<string>(patientProfile.dob || '');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(patientProfile.gender || 'Male');
  const [phone, setPhone] = useState<string>(patientProfile.phone || '');

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [livePrescriptions, setLivePrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    const pId = patientProfile.patientId || patientProfile.id;
    if (!pId) return;
    const unsub = dataService.subscribePrescriptions(pId, (rxs) => {
      setLivePrescriptions(rxs);
    });
    return () => unsub();
  }, [patientProfile.patientId, patientProfile.id]);

  const handleCopyId = () => {
    if (patientProfile.patientId) {
      navigator.clipboard.writeText(patientProfile.patientId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        name,
        dob,
        gender,
        phone
      });
    }
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto animate-in fade-in duration-300 px-4 sm:px-0 bg-white">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 cursor-pointer flex items-center justify-center transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-extrabold text-slate-900">
          My Profile
        </h1>

        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
            isEditing 
              ? 'bg-[#1E7F53] text-white shadow-xs' 
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Edit2 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3.5 rounded-2xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile & health information updated successfully!</span>
        </div>
      )}

      {/* Hero Profile Card — compact horizontal */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs flex items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-[#1E7F53] flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-2xl font-black text-white uppercase select-none">
            {(name || patientProfile.name || 'P').charAt(0)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1">
          <h2 className="text-base font-black text-slate-900 tracking-tight truncate">
            {name || patientProfile.name || 'Friend'}
          </h2>
          {(patientProfile.age || patientProfile.state) && (
            <p className="text-[11px] text-slate-400 font-semibold">
              {patientProfile.age ? `Age ${patientProfile.age}` : ''}{patientProfile.state ? ` · ${patientProfile.state}` : ''}
            </p>
          )}

          {/* Patient ID row */}
          {patientProfile.patientId && (
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[10px] text-slate-400 font-semibold">ID</span>
              <span className="font-mono font-black text-xs text-blue-600 tracking-wider">
                {patientProfile.patientId}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                title="Copy ID"
                className="w-5 h-5 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-400 hover:text-blue-600 flex items-center justify-center transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Form Wrapper */}
      <form onSubmit={handleSave} className="space-y-6">

        {/* Section: Personal Information */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Personal Information
            </h3>
            {!isEditing && (
              <span className="text-xs font-bold text-[#1E7F53] cursor-pointer hover:underline" onClick={() => setIsEditing(true)}>
                Tap to edit
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {/* Full Name */}
            <div 
              onClick={() => !isEditing && setIsEditing(true)}
              className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between gap-3 transition-all hover:border-emerald-200"
            >
              <div className="flex items-center gap-3 shrink-0">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500">Full Name</span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full text-right text-xs font-extrabold text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 outline-none focus:border-[#1E7F53]"
                />
              ) : (
                <span className="text-xs font-extrabold text-slate-900">{name || 'Not added'}</span>
              )}
            </div>

            {/* Date of Birth */}
            <div 
              onClick={() => !isEditing && setIsEditing(true)}
              className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between gap-3 transition-all hover:border-emerald-200"
            >
              <div className="flex items-center gap-3 shrink-0">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500">Date of Birth</span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  placeholder="e.g. 12 Mar 1952"
                  className="w-full text-right text-xs font-extrabold text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 outline-none focus:border-[#1E7F53]"
                />
              ) : (
                <span className="text-xs font-extrabold text-slate-900">{dob}</span>
              )}
            </div>

            {/* Gender */}
            <div 
              onClick={() => !isEditing && setIsEditing(true)}
              className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between gap-3 transition-all hover:border-emerald-200"
            >
              <div className="flex items-center gap-3 shrink-0">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500">Gender</span>
              </div>
              {isEditing ? (
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                  className="text-xs font-extrabold text-slate-900 bg-white border border-slate-300 rounded-xl px-2 py-1.5 outline-none focus:border-[#1E7F53]"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <span className="text-xs font-extrabold text-slate-900">{gender}</span>
              )}
            </div>

            {/* Phone Number */}
            <div 
              onClick={() => !isEditing && setIsEditing(true)}
              className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between gap-3 transition-all hover:border-emerald-200"
            >
              <div className="flex items-center gap-3 shrink-0">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500">Phone Number</span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full text-right text-xs font-extrabold text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 outline-none focus:border-[#1E7F53]"
                />
              ) : (
                <span className="text-xs font-extrabold text-slate-900">{phone}</span>
              )}
            </div>
          </div>
        </div>

        {/* Section: Health, Doctor & Caregiver Information (LOCKED TO DOCTOR / CAREGIVER PERMISSIONS) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Clinical & Network Information
            </h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Verified Clinical Records</span>
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Attending Doctor & Hospital */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-700">Attending Doctor & Hospital</span>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {patientProfile.doctorName && !patientProfile.doctorName.includes('Dre') ? 'Doctor Linked' : 'Doctor Controlled'}
                </span>
              </div>
              <p className="text-xs font-black text-slate-900 pt-1">
                {patientProfile.doctorName && !patientProfile.doctorName.includes('Dre') ? patientProfile.doctorName : 'Not linked yet'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {patientProfile.doctorHospital && !patientProfile.doctorHospital.includes('Metropolitan') 
                  ? patientProfile.doctorHospital 
                  : (patientProfile.doctorName && !patientProfile.doctorName.includes('Dre') ? 'Hospital not specified' : 'No clinical facility linked')}
              </p>
              <p className="text-[10px] text-slate-400 pt-1 font-medium">
                Updated by Doctor via Doctor Portal
              </p>
            </div>

            {/* Known Conditions & Diagnoses */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-bold text-slate-700">Known Conditions & Stage</span>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Doctor Controlled
                </span>
              </div>
              <p className="text-xs font-black text-slate-900 pt-1">
                {patientProfile.medicalConditions || patientProfile.knownConditions || 'Mild Cognitive Impairment (MCI)'}
              </p>
              <p className="text-[10px] text-slate-400 pt-1 font-medium">
                Managed and diagnosed by Attending Doctor
              </p>
            </div>

            {/* Current Medications & Prescriptions */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-pink-500" />
                  <span className="text-xs font-bold text-slate-700">Prescribed Active Medications</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Prescription Schedule
                </span>
              </div>
              <p className="text-xs font-black text-slate-900 pt-1">
                {livePrescriptions.length > 0 
                  ? livePrescriptions.map(r => `${r.medicineName} (${r.dosage})`).join(', ')
                  : (patientProfile.currentMedications && !patientProfile.currentMedications.includes('Donepezil') 
                      ? patientProfile.currentMedications 
                      : 'No active medications prescribed by doctor yet')}
              </p>
              <p className="text-[10px] text-slate-400 pt-1 font-medium">
                Prescribed by Doctor & managed by Caregiver
              </p>
            </div>

            {/* Primary Caregiver & Emergency Contact */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700">Primary Caregiver Contact</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Synced Profile
                </span>
              </div>
              <p className="text-xs font-black text-slate-900 pt-1">
                {(patientProfile.caregiverName && !patientProfile.caregiverName.startsWith('Dr.') ? patientProfile.caregiverName : offlineStorage.getCaregiverProfile().name)} ({((patientProfile.caregiverPhone || patientProfile.emergencyContact || offlineStorage.getCaregiverProfile().phone).replace(/\s*\([^)]*\)/g, '').trim())}{(patientProfile.caregiverRelation || offlineStorage.getCaregiverProfile().relation ? ` • ${patientProfile.caregiverRelation || offlineStorage.getCaregiverProfile().relation}` : '')})
              </p>
              <p className="text-[10px] text-slate-400 pt-1 font-medium">
                Synced directly from Caregiver Profile Settings
              </p>
            </div>
          </div>

          {isEditing && (
            <button
              type="submit"
              className="w-full py-4 bg-[#1E7F53] hover:bg-[#146743] text-white rounded-2xl text-sm font-extrabold shadow-md transition-all cursor-pointer mt-4"
            >
              Save Personal Information
            </button>
          )}
        </div>

      </form>

      {/* Security & Privacy Banner */}
      <div className="bg-[#EFFBF2] border border-[#DCFCE7] p-4 rounded-2xl shadow-2xs flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#1E7F53] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-[#1E7F53]" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-extrabold text-slate-900">
            Your information is safe with us
          </h4>
          <p className="text-[11px] text-slate-500 font-medium leading-snug">
            We keep your medical data strictly private and offline-first.
          </p>
        </div>
      </div>

    </div>
  );
};
