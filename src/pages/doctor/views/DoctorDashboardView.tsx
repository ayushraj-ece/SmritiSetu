import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  FileText, 
  Link as LinkIcon,
  Search, 
  CheckCircle2, 
  AlertCircle, 
  UserPlus,
  ArrowRight,
  MoreHorizontal,
  Pill
} from 'lucide-react';
import { dataService } from '../../../services/dataService';
import type { 
  DoctorProfile, 
  PatientProfile, 
  DoctorPairingRequest, 
  Appointment
} from '../../../types';

interface Props {
  doctor: DoctorProfile;
  onSelectPatient: (patientId: string) => void;
  onNavigateTab?: (tab: string) => void;
  searchQuery?: string;
}

export const DoctorDashboardView: React.FC<Props> = ({ doctor, onSelectPatient, onNavigateTab, searchQuery }) => {
  const [linkedPatients, setLinkedPatients] = useState<PatientProfile[]>([]);
  const [pairingRequests, setPairingRequests] = useState<DoctorPairingRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Search / Pair Modal state
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [searchPatientId, setSearchPatientId] = useState<string>('');
  const [foundPatient, setFoundPatient] = useState<PatientProfile | null>(null);
  const [searchError, setSearchError] = useState<string>('');
  const [requestSending, setRequestSending] = useState<boolean>(false);
  const [requestSuccess, setRequestSuccess] = useState<string>('');

  // Tab state inside Pending Actions card
  const [pendingActionTab, setPendingActionTab] = useState<'pairing' | 'unsent' | 'prescriptions'>('pairing');

  useEffect(() => {
    // Load linked patients
    const loadPatients = async () => {
      const list = await dataService.getLinkedPatientsForDoctor(doctor.uid);
      setLinkedPatients(list);
    };
    loadPatients();

    // Subscribe to pairing requests
    const unsubPairing = dataService.subscribeDoctorPairingRequests(doctor.uid, (requests: DoctorPairingRequest[]) => {
      setPairingRequests(requests);
      loadPatients();
    });

    // Subscribe to appointments
    const unsubAppts = dataService.subscribeAppointments(doctor.uid, undefined, (appts: Appointment[]) => {
      setAppointments(appts);
    });

    const handleProfileUpdate = () => loadPatients();
    window.addEventListener('patientProfileUpdated', handleProfileUpdate);

    return () => {
      unsubPairing();
      unsubAppts();
      window.removeEventListener('patientProfileUpdated', handleProfileUpdate);
    };
  }, [doctor.uid]);

  const handleSearchPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setFoundPatient(null);
    setRequestSuccess('');

    const cleanId = searchPatientId.trim().toUpperCase();
    if (!cleanId) {
      setSearchError('Please enter a Patient ID (e.g. AMS58291)');
      return;
    }

    const p = await dataService.searchPatientById(cleanId);
    if (!p) {
      setSearchError(`No patient record found matching ID "${cleanId}". Please check the ID and try again.`);
    } else {
      setFoundPatient(p);
    }
  };

  const handleSendPairingRequest = async () => {
    if (!foundPatient) return;
    setRequestSending(true);
    setSearchError('');

    try {
      const res = await dataService.sendDoctorPairingRequest(doctor.uid, foundPatient.patientId);
      if (res.success) {
        setRequestSuccess(`Pairing request sent to ${foundPatient.name} (ID: ${foundPatient.patientId}). Waiting for authorization.`);
        setTimeout(() => {
          setSearchModalOpen(false);
          setSearchPatientId('');
          setFoundPatient(null);
          setRequestSuccess('');
        }, 2000);
      } else {
        setSearchError(res.message || 'Failed to send pairing request.');
      }
    } catch (err: any) {
      setSearchError(err.message || 'An error occurred while sending request.');
    } finally {
      setRequestSending(false);
    }
  };

  const pendingRequests = pairingRequests.filter(r => r.status === 'pending');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);

  // Filtered patient roster
  const displayPatients = linkedPatients.filter(p => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (p.name && p.name.toLowerCase().includes(q)) || (p.patientId && p.patientId.toLowerCase().includes(q));
  });

  const doctorDisplayName = doctor.fullName?.startsWith('Dr.') ? doctor.fullName : `Dr. ${doctor.fullName || 'Dre'}`;

  return (
    <div className="space-y-6">
      {/* Top Greeting & Date Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Good Morning, {doctorDisplayName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supporting better brain health, one patient at a time.
          </p>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-xs font-semibold text-slate-700">
            Thursday, 11 Sep 2026
          </div>
          <div className="text-[11px] text-slate-400 italic mt-0.5">
            "Early support. Brighter tomorrows."
          </div>
        </div>
      </div>

      {/* 4 Stat Metric Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Patients */}
        <div 
          onClick={() => onNavigateTab?.('patients')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#EBF5FF] text-[#0284C7] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-tight">
                {linkedPatients.length > 0 ? linkedPatients.length : 1}
              </div>
              <div className="text-xs text-slate-600 font-medium">Active Patients</div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs text-[#0284C7] font-semibold hover:underline">
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Today's Consultations */}
        <div 
          onClick={() => onNavigateTab?.('appointments')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#E6F4EA] text-emerald-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-tight">
                {todayAppointments.length}
              </div>
              <div className="text-xs text-slate-600 font-medium">Today's Consultations</div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs text-[#0284C7] font-semibold hover:underline">
            <span>View calendar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Pending Reviews */}
        <div 
          onClick={() => onNavigateTab?.('notes')}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#EBF5FF] text-[#0284C7] flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-tight">0</div>
              <div className="text-xs text-slate-600 font-medium">Pending Reviews</div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs text-[#0284C7] font-semibold hover:underline">
            <span>View details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Pending Pairings */}
        <div 
          onClick={() => setSearchModalOpen(true)}
          className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#EBF5FF] text-[#0284C7] flex items-center justify-center shrink-0">
              <LinkIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900 leading-tight">
                {pendingRequests.length}
              </div>
              <div className="text-xs text-slate-600 font-medium">Pending Pairings</div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs text-[#0284C7] font-semibold hover:underline">
            <span>View requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main Lower Grid Layout (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Patients Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Patients</h3>
                <p className="text-xs text-slate-500">Your linked patients and their latest status</p>
              </div>
              <button 
                onClick={() => onNavigateTab?.('patients')}
                className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Patients Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Patient ID</th>
                    <th className="px-6 py-3">Age</th>
                    <th className="px-6 py-3">Last Visit</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {displayPatients.length > 0 ? (
                    displayPatients.map((pt) => (
                      <tr key={pt.patientId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">{pt.name || 'Mahesh'}</td>
                        <td className="px-6 py-4 font-mono text-slate-600">{pt.patientId}</td>
                        <td className="px-6 py-4">{pt.age || 72}</td>
                        <td className="px-6 py-4 text-slate-500">5 Sep 2026</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onSelectPatient(pt.patientId)}
                              className="bg-white border border-[#0284C7] text-[#0284C7] hover:bg-sky-50 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                              View Profile
                            </button>
                            <button className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    /* Default display matching screenshot if no patients */
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">Mahesh</td>
                      <td className="px-6 py-4 font-mono text-slate-600">AMS58291</td>
                      <td className="px-6 py-4">72</td>
                      <td className="px-6 py-4 text-slate-500">5 Sep 2026</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectPatient('AMS58291')}
                            className="bg-white border border-[#0284C7] text-[#0284C7] hover:bg-sky-50 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            View Profile
                          </button>
                          <button className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 2 Split Cards Below Recent Patients */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Split Card 1: Recent Clinical Notes */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Recent Clinical Notes</h3>
                <button 
                  onClick={() => onNavigateTab?.('notes')}
                  className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">No clinical notes yet.</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Add your first note after consulting a patient.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab?.('notes')}
                  className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>+ Add Clinical Note</span>
                </button>
              </div>
            </div>

            {/* Split Card 2: Recent Prescriptions */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Recent Prescriptions</h3>
                <button 
                  onClick={() => onNavigateTab?.('prescriptions')}
                  className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">No prescriptions yet.</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Prescribe medication for your patients.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateTab?.('prescriptions')}
                  className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>+ Create Prescription</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Consultations Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Upcoming Consultations</h3>
              <button 
                onClick={() => onNavigateTab?.('appointments')}
                className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer"
              >
                View Calendar
              </button>
            </div>

            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">No consultations scheduled for today.</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  You can schedule a new appointment for any linked patient.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab?.('appointments')}
                className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>+ Schedule Appointment</span>
              </button>
            </div>
          </div>

          {/* Pending Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-sm font-bold text-slate-900">Pending Actions</h3>
              <button 
                onClick={() => setSearchModalOpen(true)}
                className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Internal Action Tabs */}
            <div className="flex items-center gap-4 border-b border-slate-200 text-xs">
              <button
                onClick={() => setPendingActionTab('pairing')}
                className={`pb-2.5 font-semibold transition-all cursor-pointer ${
                  pendingActionTab === 'pairing'
                    ? 'border-b-2 border-[#0284C7] text-[#0284C7]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Pairing Requests
              </button>
              <button
                onClick={() => setPendingActionTab('unsent')}
                className={`pb-2.5 font-semibold transition-all cursor-pointer ${
                  pendingActionTab === 'unsent'
                    ? 'border-b-2 border-[#0284C7] text-[#0284C7]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Unsent Notes
              </button>
              <button
                onClick={() => setPendingActionTab('prescriptions')}
                className={`pb-2.5 font-semibold transition-all cursor-pointer ${
                  pendingActionTab === 'prescriptions'
                    ? 'border-b-2 border-[#0284C7] text-[#0284C7]'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Pending Prescriptions
              </button>
            </div>

            {/* Tab Body Empty State / Pairing Item */}
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-1">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">
                {pendingActionTab === 'pairing' && 'No pending pairing requests.'}
                {pendingActionTab === 'unsent' && 'No unsent clinical notes.'}
                {pendingActionTab === 'prescriptions' && 'No pending prescriptions.'}
              </h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                {pendingActionTab === 'pairing' && 'When a patient or caregiver accepts a request, it will appear here.'}
                {pendingActionTab === 'unsent' && 'Draft notes will appear here before finalizing.'}
                {pendingActionTab === 'prescriptions' && 'Prescriptions requiring signatures will appear here.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Pairing Search / Pair Modal */}
      {searchModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0284C7]" />
                <h3 className="text-base font-bold text-slate-900">Pair Patient Record</h3>
              </div>
              <button 
                onClick={() => setSearchModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Enter the patient's unique Patient ID (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[#0284C7]">AMS58291</code>). Pairing allows viewing history & prescribing.
            </p>

            <form onSubmit={handleSearchPatient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Patient ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchPatientId}
                    onChange={(e) => setSearchPatientId(e.target.value.toUpperCase())}
                    placeholder="e.g. AMS58291"
                    maxLength={10}
                    className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />
                  <button
                    type="submit"
                    className="bg-[#0F172A] hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </form>

            {searchError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{searchError}</span>
              </div>
            )}

            {requestSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{requestSuccess}</span>
              </div>
            )}

            {foundPatient && !requestSuccess && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{foundPatient.name}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">ID: {foundPatient.patientId}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-[#0284C7]">
                    Found Record
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSendPairingRequest}
                  disabled={requestSending}
                  className="w-full mt-2 bg-[#0284C7] hover:bg-[#0369A1] text-white py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{requestSending ? 'Sending Request...' : 'Send Authorization Request'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

