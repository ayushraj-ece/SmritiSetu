import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserPlus, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Phone,
  FileText
} from 'lucide-react';
import { dataService } from '../../../services/dataService';
import { offlineStorage } from '../../../services/offlineStorage';
import type { DoctorProfile, PatientProfile, DoctorPairingRequest } from '../../../types';

interface Props {
  doctor: DoctorProfile;
  onSelectPatient: (patientId: string) => void;
}

export const DoctorPatientsView: React.FC<Props> = ({ doctor, onSelectPatient }) => {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Search modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [searchIdInput, setSearchIdInput] = useState<string>('');
  const [foundPatient, setFoundPatient] = useState<PatientProfile | null>(null);
  const [searchError, setSearchError] = useState<string>('');
  const [requestSending, setRequestSending] = useState<boolean>(false);
  const [requestSuccess, setRequestSuccess] = useState<string>('');

  const loadData = async () => {
    const list = await dataService.getLinkedPatientsForDoctor(doctor.uid);
    setPatients(list);
  };

  useEffect(() => {
    loadData();

    const unsubPairing = dataService.subscribeDoctorPairingRequests(doctor.uid, (_reqs: DoctorPairingRequest[]) => {
      loadData();
    });

    const handleProfileUpdate = () => loadData();
    window.addEventListener('patientProfileUpdated', handleProfileUpdate);

    return () => {
      unsubPairing();
      window.removeEventListener('patientProfileUpdated', handleProfileUpdate);
    };
  }, [doctor.uid]);

  const handleSearchPatientModal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setFoundPatient(null);
    setRequestSuccess('');

    const clean = searchIdInput.trim().toUpperCase();
    if (!clean) {
      setSearchError('Enter a valid 5-digit Patient ID');
      return;
    }

    const res = await dataService.searchPatientById(clean);
    if (!res) {
      setSearchError(`No patient found matching ID "${clean}". Please verify the code with the patient or caregiver.`);
    } else {
      setFoundPatient(res);
    }
  };

  const handleSendPairing = async () => {
    if (!foundPatient) return;
    setRequestSending(true);
    setSearchError('');

    try {
      const res = await dataService.sendDoctorPairingRequest(doctor.uid, foundPatient.patientId);
      if (res.success) {
        setRequestSuccess(`Pairing request transmitted to ${foundPatient.name} (ID: ${foundPatient.patientId}).`);
        setTimeout(() => {
          setModalOpen(false);
          setSearchIdInput('');
          setFoundPatient(null);
          setRequestSuccess('');
        }, 1800);
      } else {
        setSearchError(res.message || 'Failed to send pairing request.');
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error sending request.');
    } finally {
      setRequestSending(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.stage && p.stage.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clinical Patient Directory</h2>
          <p className="text-xs text-slate-500">Manage patient records paired with your clinical account</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add / Pair Patient</span>
        </button>
      </div>

      {/* Search & Filter Control */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search roster by patient name, 5-digit ID, or condition..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
          {filteredPatients.length} Authorized Records
        </div>
      </div>

      {/* Patient Directory Table / Cards */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Patient Records Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            {searchTerm ? `No results matching "${searchTerm}".` : 'You currently have no authorized patients linked to your profile.'}
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Pair Patient by ID</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Patient Name & ID</th>
                  <th className="py-3.5 px-4">Age / Demographics</th>
                  <th className="py-3.5 px-4">Clinical Stage</th>
                  <th className="py-3.5 px-4">Caregiver Contact</th>
                  <th className="py-3.5 px-4">Authorization</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.patientId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-100 text-[#0284C7] flex items-center justify-center font-bold text-xs shrink-0">
                          {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{patient.name || 'Unnamed Patient'}</div>
                          <div className="font-mono text-[11px] text-slate-500">ID: {patient.patientId}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div>Age: {patient.age || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400">Gender: {patient.gender || 'Not specified'}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {patient.stage || 'General Medical Care'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{patient.caregiverPhone || patient.emergencyContact || offlineStorage.getCaregiverProfile().phone}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{patient.caregiverName || offlineStorage.getCaregiverProfile().name}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Authorized</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectPatient(patient.patientId)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Open Chart</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Pair Patient Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0284C7]" />
                <span>Pair Patient Record</span>
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Enter the patient's 5-digit code (e.g. <code className="bg-slate-100 font-mono text-[#0284C7] px-1 py-0.5 rounded">ASM58291</code>). Once paired, you can view cognitive indices, add clinical notes, and manage prescriptions.
            </p>

            <form onSubmit={handleSearchPatientModal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  5-Digit Patient ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchIdInput}
                    onChange={(e) => setSearchIdInput(e.target.value.toUpperCase())}
                    placeholder="e.g. ASM58291"
                    maxLength={10}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>

            {searchError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{searchError}</span>
              </div>
            )}

            {requestSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{requestSuccess}</span>
              </div>
            )}

            {foundPatient && !requestSuccess && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{foundPatient.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">Patient ID: {foundPatient.patientId}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                    Authorization Needed
                  </span>
                </div>

                <div className="text-xs text-slate-600 border-t border-slate-200 pt-2 space-y-1">
                  <p>• Age: {foundPatient.age || 'N/A'}</p>
                  <p>• Primary Caregiver: {foundPatient.caregiverName || offlineStorage.getCaregiverProfile().name}</p>
                </div>

                <button
                  type="button"
                  onClick={handleSendPairing}
                  disabled={requestSending}
                  className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                >
                  {requestSending ? 'Transmitting Request...' : 'Send Authorization Request'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
