import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Edit2, 
  Camera, 
  User, 
  Calendar, 
  Phone, 
  Heart, 
  Pill, 
  Stethoscope, 
  ShieldCheck, 
  Sparkles,
  Check
} from 'lucide-react';
import type { PatientProfile } from '../../../types';

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

  const [knownConditions, setKnownConditions] = useState<string>(patientProfile.knownConditions || '');
  const [currentMedications, setCurrentMedications] = useState<string>(patientProfile.currentMedications || '');
  const [doctorHospital, setDoctorHospital] = useState<string>(patientProfile.doctorHospital || '');
  const [emergencyContact, setEmergencyContact] = useState<string>(patientProfile.emergencyContact || '');

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        name,
        dob,
        gender,
        phone,
        knownConditions,
        currentMedications,
        doctorHospital,
        emergencyContact
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

      {/* Hero Profile Card (Clean pastel green surface, non-boxy) */}
      <div className="bg-[#EFFBF2] border border-[#DCFCE7] p-6 rounded-3xl text-center space-y-3.5 shadow-2xs relative">
        <div className="relative w-22 h-22 mx-auto">
          <div className="w-full h-full rounded-full bg-emerald-100 border-4 border-white shadow-sm flex items-center justify-center text-4xl">
            👵
          </div>
          <button 
            type="button"
            className="absolute bottom-0 right-0 p-2 bg-white text-slate-700 rounded-full shadow-xs border border-slate-200 cursor-pointer hover:bg-emerald-50"
            title="Upload Profile Picture"
          >
            <Camera className="w-3.5 h-3.5 text-[#1E7F53]" />
          </button>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {name || patientProfile.name || 'Friend'}
          </h2>
          <div className="bg-white/90 border border-sky-200 px-4 py-2 rounded-2xl shadow-2xs flex flex-wrap items-center justify-center gap-2 max-w-full my-1">
            <span className="text-xs text-slate-600 font-bold flex items-center gap-1.5 shrink-0">
              🔑 Unique 5-Digit Patient Code:
            </span>
            <span className="font-mono font-black text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100 shrink-0 tracking-wider">
              {patientProfile.patientId || 'ASM58291'}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-500">
            Share this 5-digit code with your caregiver to pair accounts!
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-[#1E7F53] text-xs font-bold rounded-full border border-emerald-100/80 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#1E7F53]" />
          <span>"Every day is a new beginning."</span>
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

        {/* Section: Health Information */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Health Information
            </h3>
            {!isEditing && (
              <span className="text-xs font-bold text-[#1E7F53] cursor-pointer hover:underline" onClick={() => setIsEditing(true)}>
                Tap to edit
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {/* Known Conditions */}
            <div 
              onClick={() => !isEditing && setIsEditing(true)}
              className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all hover:border-emerald-200"
            >
              <div className="flex items-center gap-3 shrink-0">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-xs font-semibold text-slate-500">Known Conditions</span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={knownConditions}
                  onChange={(e) => setKnownConditions(e.target.value)}
                  placeholder="e.g. Hypertension, Diabetes"
                  className="w-full text-right text-xs font-extrabold text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 outline-none focus:border-[#1E7F53]"
                />
              ) : (
                <span className="text-xs font-extrabold text-slate-900 text-right">{knownConditions || 'None added'}</span>
              )}
            </div>

            {/* Current Medications */}
            <div 
              onClick={() => !isEditing && setIsEditing(true)}
              className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all hover:border-emerald-200"
            >
              <div className="flex items-center gap-3 shrink-0">
                <Pill className="w-4 h-4 text-pink-500" />
                <span className="text-xs font-semibold text-slate-500">Current Medications</span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  placeholder="e.g. Donepezil 5mg, BP Meds"
                  className="w-full text-right text-xs font-extrabold text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 outline-none focus:border-[#1E7F53]"
                />
              ) : (
                <span className="text-xs font-extrabold text-slate-900 text-right">{currentMedications || 'None added'}</span>
              )}
            </div>

            {/* Doctor / Hospital */}
            <div 
              onClick={() => !isEditing && setIsEditing(true)}
              className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all hover:border-emerald-200"
            >
              <div className="flex items-center gap-3 shrink-0">
                <Stethoscope className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-semibold text-slate-500">Doctor / Hospital</span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={doctorHospital}
                  onChange={(e) => setDoctorHospital(e.target.value)}
                  placeholder="e.g. Dr. Barua (City Hospital)"
                  className="w-full text-right text-xs font-extrabold text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 outline-none focus:border-[#1E7F53]"
                />
              ) : (
                <span className="text-xs font-extrabold text-slate-900 text-right">{doctorHospital || 'Not added'}</span>
              )}
            </div>

            {/* Emergency Contact */}
            <div 
              onClick={() => !isEditing && setIsEditing(true)}
              className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all hover:border-emerald-200"
            >
              <div className="flex items-center gap-3 shrink-0">
                <User className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-500">Emergency Contact</span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="e.g. Son (Rahul - +91 98100 12345)"
                  className="w-full text-right text-xs font-extrabold text-slate-900 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 outline-none focus:border-[#1E7F53]"
                />
              ) : (
                <span className="text-xs font-extrabold text-slate-900 text-right">{emergencyContact || 'Not added'}</span>
              )}
            </div>
          </div>

          {isEditing && (
            <button
              type="submit"
              className="w-full py-4 bg-[#1E7F53] hover:bg-[#146743] text-white rounded-2xl text-sm font-extrabold shadow-md transition-all cursor-pointer mt-4"
            >
              Save Profile & Health Data
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
