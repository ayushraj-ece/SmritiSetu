import React, { useState } from 'react';
import { X, Search, Clock, UserCheck, Send, AlertCircle } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import { auth } from '../../../services/firebase';
import type { PatientProfile } from '../../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (patientId: string) => void;
}

export const AddPatientModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [patientCode, setPatientCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchedPatient, setSearchedPatient] = useState<PatientProfile | null>(null);
  const [pairingStatus, setPairingStatus] = useState<'paired' | 'pending' | 'none' | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientCode.trim()) return;

    setLoading(true);
    setStatusMsg(null);
    setSearchedPatient(null);

    try {
      const cleanCode = patientCode.trim().toUpperCase();
      const caregiverUid = auth.currentUser?.uid || 'caregiver_demo';

      // 1. Search patient profile
      const prof = await dataService.searchPatientById(cleanCode);
      if (prof) {
        setSearchedPatient(prof);
        const status = await dataService.checkPairingStatus(caregiverUid, cleanCode);
        setPairingStatus(status);
      } else {
        setStatusMsg({
          type: 'error',
          text: `No patient found with ID "${cleanCode}". Please verify the 5-digit code with your patient.`
        });
      }
    } catch {
      setStatusMsg({
        type: 'error',
        text: 'Failed to search patient code. Please check your connection.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!searchedPatient) return;
    setLoading(true);
    setStatusMsg(null);

    try {
      const caregiverUid = auth.currentUser?.uid || 'caregiver_demo';
      const caregiverName = auth.currentUser?.displayName || 'Caregiver';
      const caregiverEmail = auth.currentUser?.email || '';

      await dataService.sendPairingRequest(searchedPatient.patientId || searchedPatient.id, caregiverUid, caregiverName, caregiverEmail);
      setPairingStatus('pending');
      setStatusMsg({
        type: 'success',
        text: `Pairing request sent to ${searchedPatient.name}! The patient will be notified in their app to accept.`
      });
      if (onSuccess) onSuccess(searchedPatient.patientId || searchedPatient.id);
    } catch {
      setStatusMsg({
        type: 'error',
        text: 'Failed to send pairing request. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Find & Link Patient</h3>
              <p className="text-[11px] text-slate-400 font-medium">Search by unique 5-digit Patient ID</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Patient Unique Code</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={patientCode}
                  onChange={(e) => {
                    setPatientCode(e.target.value.toUpperCase());
                    setSearchedPatient(null);
                    setStatusMsg(null);
                  }}
                  placeholder="E.g. ASM58291"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono font-bold text-slate-900 tracking-wider placeholder-slate-400 uppercase focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || !patientCode.trim()}
                className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl shadow-xs cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {/* Status Alert */}
        {statusMsg && (
          <div className={`p-3 rounded-2xl text-xs font-bold flex items-start gap-2 ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : statusMsg.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Initial Patient Profile Card Preview */}
        {searchedPatient && (
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-3xl space-y-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white p-0.5 shadow-md flex items-center justify-center shrink-0">
                {searchedPatient.avatarUrl ? (
                  <img src={searchedPatient.avatarUrl} alt={searchedPatient.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-xl font-black uppercase">
                    {searchedPatient.name?.charAt(0) || 'P'}
                  </span>
                )}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-black text-slate-900 leading-none">
                    {searchedPatient.name}
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">
                    {searchedPatient.patientId || searchedPatient.id}
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-500">
                  {searchedPatient.age ? `Age ${searchedPatient.age}` : ''} {searchedPatient.state ? `| Living in ${searchedPatient.state}` : ''}
                </p>
              </div>
            </div>

            {/* Action State Buttons */}
            <div className="pt-2 border-t border-slate-200">
              {pairingStatus === 'paired' ? (
                <div className="w-full py-2.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span>Already Linked as Caregiver</span>
                </div>
              ) : pairingStatus === 'pending' ? (
                <div className="space-y-2">
                  <div className="w-full py-2.5 bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                    <span>Request Sent • Awaiting Acceptance</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium text-center">
                    The request will stay pending in the patient's notification bar until accepted.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSendRequest}
                  disabled={loading}
                  className="w-full py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Pairing Request</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
