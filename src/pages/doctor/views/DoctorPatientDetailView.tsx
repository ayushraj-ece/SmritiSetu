import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  Brain, 
  Pill, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Download, 
  Save, 
  Send,
  BellRing
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { dataService } from '../../../services/dataService';
import { offlineStorage } from '../../../services/offlineStorage';
import { adaptiveEngine } from '../../../ai/adaptiveEngine';
import { pdfReportService } from '../../../services/pdfReportService';
import type { 
  DoctorProfile, 
  PatientProfile, 
  Prescription, 
  PatientReminder,
  ClinicalNote, 
  Appointment, 
  DoctorTask, 
  GameResult,
  ChatMessage,
  AdaptiveEvaluation 
} from '../../../types';

interface Props {
  doctor: DoctorProfile;
  patientId: string;
  onBack: () => void;
}

export const DoctorPatientDetailView: React.FC<Props> = ({ doctor, patientId, onBack }) => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'cognitive' | 'prescriptions' | 'tasks' | 'appointments' | 'notes' | 'caregiver' | 'messages' | 'reports'>('overview');

  // Subscribed Data States
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reminders, setReminders] = useState<PatientReminder[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctorTasks, setDoctorTasks] = useState<DoctorTask[]>([]);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [evaluations, setEvaluations] = useState<AdaptiveEvaluation[]>([]);

  // Medical conditions editing
  const [editingMedical, setEditingMedical] = useState<boolean>(false);
  const [medicalConditionsInput, setMedicalConditionsInput] = useState<string>('');
  const [patientStageInput, setPatientStageInput] = useState<string>('');

  // Prescription Form State (Add / Edit)
  const [rxModalOpen, setRxModalOpen] = useState<boolean>(false);
  const [editingRxId, setEditingRxId] = useState<string | null>(null);
  const [rxForm, setRxForm] = useState<{
    medicineName: string;
    dosage: string;
    frequency?: string;
    time: string;
    daysOfWeek: string[];
    duration?: string;
    instructions: string;
  }>({
    medicineName: '',
    dosage: '',
    frequency: 'Once Daily',
    time: '08:00 AM',
    daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    duration: '30 Days',
    instructions: ''
  });

  // Clinical Note Form State
  const [noteForm, setNoteForm] = useState<{
    title: string;
    content: string;
    followUpDate: string;
    isVisibleToPatient: boolean;
    isVisibleToCaregiver: boolean;
  }>({
    title: '',
    content: '',
    followUpDate: '',
    isVisibleToPatient: true,
    isVisibleToCaregiver: true
  });
  const [savingNote, setSavingNote] = useState<boolean>(false);

  // Appointment Form State
  const [apptModalOpen, setApptModalOpen] = useState<boolean>(false);
  const [apptForm, setApptForm] = useState<{
    date: string;
    time: string;
    type: 'Consultation' | 'Follow-up' | 'Medication Review' | 'Cognitive Review';
    meetingMethod: 'In-Person' | 'Video Call' | 'Phone Call';
    instructions: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    time: '10:30 AM',
    type: 'Follow-up',
    meetingMethod: 'In-Person',
    instructions: 'Please bring recent lab work and active medications.'
  });

  // Doctor Task Form State
  const [taskModalOpen, setTaskModalOpen] = useState<boolean>(false);
  const [taskForm, setTaskForm] = useState<{
    title: string;
    category: DoctorTask['category'];
    time: string;
    repeatSchedule: 'Daily' | 'Weekly' | 'Once';
    instructions: string;
  }>({
    title: '',
    category: 'Take medicine',
    time: '08:00 AM',
    repeatSchedule: 'Daily',
    instructions: ''
  });

  // Messaging State
  const [messageInput, setMessageInput] = useState<string>('');

  useEffect(() => {
    const loadPatientInfo = async () => {
      const p = await dataService.searchPatientById(patientId);
      setPatient(p);
      if (p) {
        setMedicalConditionsInput(p.medicalConditions || 'No existing conditions logged');
        setPatientStageInput(p.stage || 'General Medical Care');
      }
    };
    loadPatientInfo();

    // Subscriptions
    const unsubRx = dataService.subscribePrescriptions(patientId, (data: Prescription[]) => {
      setPrescriptions(data);
    });

    const unsubRem = dataService.subscribeReminders(patientId, (data: PatientReminder[]) => {
      setReminders(data);
    });

    const unsubNotes = dataService.subscribeClinicalNotes(doctor.uid, patientId, (data: ClinicalNote[]) => {
      setClinicalNotes(data);
    });

    const unsubAppts = dataService.subscribeAppointments(doctor.uid, patientId, (data: Appointment[]) => {
      setAppointments(data);
    });

    const unsubTasks = dataService.subscribeDoctorTasks(doctor.uid, patientId, (data: DoctorTask[]) => {
      setDoctorTasks(data);
    });

    const unsubResults = dataService.subscribeGameResults(patientId, (data: GameResult[]) => {
      setGameResults(data);
    });

    const unsubChat = dataService.subscribeChatMessages(patientId, (data: ChatMessage[]) => {
      setChatMessages(data);
    });

    setEvaluations(offlineStorage.getEvaluations(patientId));

    return () => {
      unsubRx();
      unsubRem();
      unsubNotes();
      unsubAppts();
      unsubTasks();
      unsubResults();
      unsubChat();
    };
  }, [doctor.uid, patientId]);

  const handleDeleteReminder = async (reminderId: string) => {
    if (window.confirm('Delete this active patient reminder/alarm?')) {
      await dataService.deleteReminder(reminderId);
      setReminders(prev => prev.filter(r => r.id !== reminderId));
    }
  };

  // Handle Medical Conditions Save
  const handleSaveMedicalConditions = async () => {
    if (!patient) return;
    await dataService.updatePatientMedicalInfo(patientId, {
      knownConditions: medicalConditionsInput,
      medicalConditions: medicalConditionsInput,
      stage: patientStageInput,
      doctorId: doctor.uid,
      doctorName: `Dr. ${doctor.fullName}`,
      doctorHospital: doctor.clinicHospital || 'Guwahati Medical College'
    });

    const updated = {
      ...patient,
      knownConditions: medicalConditionsInput,
      medicalConditions: medicalConditionsInput,
      stage: patientStageInput,
      doctorId: doctor.uid,
      doctorName: `Dr. ${doctor.fullName}`,
      doctorHospital: doctor.clinicHospital || 'Guwahati Medical College'
    };
    setPatient(updated);
    setEditingMedical(false);
  };

  // Prescription Handlers (Add, Edit, Delete)
  const handleOpenAddRx = () => {
    setEditingRxId(null);
    setRxForm({
      medicineName: '',
      dosage: '',
      time: '08:00 AM',
      daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      instructions: ''
    });
    setRxModalOpen(true);
  };

  const handleOpenEditRx = (rx: Prescription) => {
    setEditingRxId(rx.id);
    setRxForm({
      medicineName: rx.medicineName,
      dosage: rx.dosage,
      time: rx.time,
      daysOfWeek: rx.daysOfWeek || [],
      instructions: rx.instructions || ''
    });
    setRxModalOpen(true);
  };

  const handleSaveRx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxForm.medicineName) return;

    const cleanDocName = doctor.fullName?.trim() ? (doctor.fullName.startsWith('Dr.') ? doctor.fullName : `Dr. ${doctor.fullName}`) : 'Doctor';

    if (editingRxId) {
      await dataService.updatePrescription(editingRxId, {
        medicineName: rxForm.medicineName,
        dosage: rxForm.dosage,
        time: rxForm.time,
        daysOfWeek: rxForm.daysOfWeek,
        instructions: rxForm.instructions,
        prescribedBy: cleanDocName,
        hospitalName: doctor.clinicHospital,
        doctorId: doctor.uid
      });
    } else {
      await dataService.addPrescription(patientId, {
        medicineName: rxForm.medicineName,
        dosage: rxForm.dosage,
        time: rxForm.time,
        daysOfWeek: rxForm.daysOfWeek,
        instructions: rxForm.instructions,
        prescribedBy: cleanDocName,
        hospitalName: doctor.clinicHospital,
        doctorId: doctor.uid
      });
    }

    setRxModalOpen(false);
  };

  const handleDeleteRx = async (id: string) => {
    if (window.confirm('Delete prescription?')) {
      await dataService.deletePrescription(id);
    }
  };

  // Clinical Note Handler
  const handleCreateClinicalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteForm.title || !noteForm.content) return;
    setSavingNote(true);

    const cleanDocName = doctor.fullName?.trim() ? (doctor.fullName.startsWith('Dr.') ? doctor.fullName : `Dr. ${doctor.fullName}`) : 'Doctor';

    await dataService.createClinicalNote({
      doctorId: doctor.uid,
      doctorName: cleanDocName,
      patientId,
      title: noteForm.title,
      content: noteForm.content,
      date: new Date().toISOString().split('T')[0],
      followUpDate: noteForm.followUpDate,
      isVisibleToPatient: noteForm.isVisibleToPatient,
      isVisibleToCaregiver: noteForm.isVisibleToCaregiver
    });

    setNoteForm({
      title: '',
      content: '',
      followUpDate: '',
      isVisibleToPatient: true,
      isVisibleToCaregiver: true
    });
    setSavingNote(false);
  };

  // Appointment Handler
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDocName = doctor.fullName?.trim() ? (doctor.fullName.startsWith('Dr.') ? doctor.fullName : `Dr. ${doctor.fullName}`) : 'Doctor';
    await dataService.createAppointment({
      doctorId: doctor.uid,
      doctorName: cleanDocName,
      doctorHospital: doctor.clinicHospital,
      patientId,
      patientName: patient?.name,
      caregiverUid: patient?.caregiverUid,
      date: apptForm.date,
      time: apptForm.time,
      durationMinutes: 30,
      type: apptForm.type,
      meetingMethod: apptForm.meetingMethod,
      instructions: apptForm.instructions,
      status: 'scheduled'
    });
    setApptModalOpen(false);
  };

  // Doctor Task Handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;

    await dataService.addDoctorTask({
      doctorId: doctor.uid,
      doctorName: `Dr. ${doctor.fullName}`,
      patientId,
      title: taskForm.title,
      category: taskForm.category,
      time: taskForm.time,
      repeatSchedule: taskForm.repeatSchedule,
      instructions: taskForm.instructions,
      status: 'pending'
    });

    setTaskForm({
      title: '',
      category: 'Take medicine',
      time: '08:00 AM',
      repeatSchedule: 'Daily',
      instructions: ''
    });
    setTaskModalOpen(false);
  };

  // Message Send Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    await dataService.sendChatMessage({
      patientId,
      senderUid: doctor.uid,
      senderName: `Dr. ${doctor.fullName}`,
      senderRole: 'doctor',
      text: messageInput.trim(),
      timestamp: Date.now()
    });

    setMessageInput('');
  };

  // PDF Report Export Handler
  const handleExportPdf = () => {
    if (!patient) return;
    pdfReportService.downloadPdfReport({
      patient,
      gameResults,
      reminders: [],
      evaluations
    });
  };

  // Compute Cognitive Scores using AI ML Engine
  const cognitiveIndices = adaptiveEngine.calculateCognitiveIndices(gameResults);

  const domainScores = [
    { name: 'Memory Index (MRI)', score: cognitiveIndices.mri },
    { name: 'Attention Index (APSI)', score: cognitiveIndices.apsi },
    { name: 'Pattern Recognition (PRE)', score: cognitiveIndices.pre },
    { name: 'Routine Awareness (ERA)', score: cognitiveIndices.era }
  ];

  if (!patient) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#0284C7] border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading clinical patient record...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shrink-0 mt-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{patient.name || 'Patient Chart'}</h1>
                <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-sky-50 text-[#0284C7] border border-sky-200">
                  ID: {patient.patientId}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Age: {patient.age || 'N/A'} • Gender: {patient.gender || 'N/A'} • Medical Stage: <span className="font-semibold text-slate-800">{patient.stage || 'General Care'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF Report</span>
            </button>
            <button
              onClick={() => setApptModalOpen(true)}
              className="flex items-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule Consult</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-t border-slate-200 mt-6 pt-3 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Patient Overview', icon: User },
            { id: 'cognitive', label: 'Cognitive Analytics', icon: Brain },
            { id: 'prescriptions', label: `Prescriptions (${prescriptions.length})`, icon: Pill },
            { id: 'tasks', label: `Care Plan / Tasks (${doctorTasks.length})`, icon: CheckCircle2 },
            { id: 'appointments', label: `Appointments (${appointments.length})`, icon: Calendar },
            { id: 'notes', label: `Clinical Notes (${clinicalNotes.length})`, icon: FileText },
            { id: 'caregiver', label: 'Caregiver Info', icon: User },
            { id: 'messages', label: 'Messaging', icon: MessageSquare },
            { id: 'reports', label: 'Reports Summary', icon: Download }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  active 
                    ? 'bg-sky-50 text-[#0284C7] border border-sky-200 font-bold' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Medical Conditions & Doctor Notes */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900">Known Medical Conditions & Diagnoses</h3>
                {!editingMedical ? (
                  <button
                    onClick={() => setEditingMedical(true)}
                    className="text-xs text-[#0284C7] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Conditions</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveMedicalConditions}
                      className="text-xs bg-[#0284C7] text-white px-3 py-1 rounded-md font-semibold flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => setEditingMedical(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {!editingMedical ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Clinical Classification / Stage
                    </span>
                    <p className="text-sm font-semibold text-slate-800">{patient.stage || 'General Medical Care'}</p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Medical Conditions Logged by Attending Physician
                    </span>
                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {patient.medicalConditions || 'No specific medical conditions recorded yet. Click "Edit Conditions" to update.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Clinical Stage / Category
                    </label>
                    <input
                      type="text"
                      value={patientStageInput}
                      onChange={(e) => setPatientStageInput(e.target.value)}
                      placeholder="e.g. Mild Cognitive Impairment, Stage 2 Observation"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Detailed Medical History & Considerations
                    </label>
                    <textarea
                      rows={5}
                      value={medicalConditionsInput}
                      onChange={(e) => setMedicalConditionsInput(e.target.value)}
                      placeholder="Enter hypertension, diabetes, cognitive observations, allergies..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Side Info Cards */}
          <div className="space-y-6">
            {/* Caregiver Details */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                Primary Caregiver Contact
              </h3>
              <div className="text-xs space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-semibold text-slate-900">{patient.caregiverName || offlineStorage.getCaregiverProfile().name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-mono text-slate-900">{patient.caregiverPhone || patient.emergencyContact || offlineStorage.getCaregiverProfile().phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Relation:</span>
                  <span>{patient.caregiverRelation || offlineStorage.getCaregiverProfile().relation}</span>
                </div>
              </div>
            </div>

            {/* Attending Physician Status */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
                Attending Physician Record
              </h3>
              <div className="text-xs space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Doctor:</span>
                  <span className="font-semibold text-slate-900">Dr. {doctor.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hospital:</span>
                  <span>{doctor.clinicHospital || 'Clinical Center'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reg No:</span>
                  <span className="font-mono text-slate-900">{doctor.registrationNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Cognitive Analytics */}
      {activeTab === 'cognitive' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Cognitive Indices & Performance Metrics</h3>
                <p className="text-xs text-slate-500">Standardized functional performance indicators derived from patient game interactions</p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                Live Data Synchronized
              </span>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {domainScores.map((item) => (
                <div key={item.name} className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    {item.name}
                  </span>
                  <div className="text-2xl font-bold text-slate-900">{item.score} <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div 
                      className="bg-[#0284C7] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.max(10, item.score))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Bar Chart */}
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={domainScores}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#0284C7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Adaptive Evaluations Log */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Adaptive Difficulty & Assessment Log</h3>
            {evaluations.length === 0 ? (
              <p className="text-xs text-slate-500">No adaptive difficulty evaluations logged yet.</p>
            ) : (
              <div className="divide-y divide-slate-200 text-xs">
                {evaluations.slice(0, 10).map((ev, i) => (
                  <div key={ev.id || i} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 uppercase tracking-wide">{ev.gameCategory}</span>
                      <p className="text-slate-500">{ev.reason}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#0284C7]">Score: {ev.performanceScore}</span>
                      <span className="text-slate-400 block text-[10px]">{new Date(ev.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Prescriptions & Medication Schedule */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Prescriptions & Medication Schedule</h3>
                <p className="text-xs text-slate-500">Doctor-prescribed medications automatically sync as patient reminders</p>
              </div>
              <button
                onClick={handleOpenAddRx}
                className="flex items-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Issue New Prescription</span>
              </button>
            </div>

            {prescriptions.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg">
                <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">No Prescriptions Issued</h4>
                <p className="text-xs text-slate-500 mt-1 mb-3">Click "Issue New Prescription" to add doctor-controlled medications.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Medication & Dosage</th>
                      <th className="py-3 px-4">Frequency & Time</th>
                      <th className="py-3 px-4">Schedule Days</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Control</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {prescriptions.map((rx) => (
                      <tr key={rx.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">{rx.medicineName}</div>
                          <div className="text-slate-500 font-medium">{rx.dosage}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{rx.frequency || 'Daily'}</div>
                          <div className="font-mono text-slate-500">{rx.time}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex gap-1 flex-wrap">
                            {(rx.daysOfWeek || []).map((day) => (
                              <span key={day} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 font-mono text-slate-700">
                                {day}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {rx.duration || 'Ongoing'}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-[#0284C7] border border-sky-200">
                            Doctor Controlled
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditRx(rx)}
                              className="p-1.5 text-slate-500 hover:text-[#0284C7] hover:bg-slate-100 rounded cursor-pointer"
                              title="Edit Prescription"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRx(rx.id)}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                              title="Delete Prescription"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active Patient Alarms & Timers Section */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BellRing className="w-4 h-4 text-emerald-600" />
                  <span>Active Patient Alarms & Timers</span>
                </h3>
                <p className="text-xs text-slate-500">Live medication alarms and daily patient reminders sync'd across device</p>
              </div>
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                {reminders.length} Active Alarms
              </span>
            </div>

            {reminders.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-lg space-y-1">
                <BellRing className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No active alarms configured for this patient</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reminders.map((rem) => (
                  <div key={rem.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 hover:border-slate-300 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <BellRing className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{rem.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {rem.time}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {rem.repeatPattern || 'Daily'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteReminder(rem.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                      title="Delete Reminder"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span className="text-red-600 text-[11px]">Delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Doctor Tasks & Care Plan */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Doctor Prescribed Tasks & Care Plan</h3>
                <p className="text-xs text-slate-500">Tasks assigned by doctor to patient and caregiver</p>
              </div>
              <button
                onClick={() => setTaskModalOpen(true)}
                className="flex items-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Assign New Task</span>
              </button>
            </div>

            {doctorTasks.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No doctor tasks currently assigned.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctorTasks.map((task) => (
                  <div key={task.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{task.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-[#0284C7]">
                        {task.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{task.instructions || 'Follow daily instructions.'}</p>
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-200">
                      <span>Time: {task.time} ({task.repeatSchedule})</span>
                      <span className="font-semibold text-amber-600 uppercase text-[10px]">{task.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Appointments */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Scheduled Consultations & Appointments</h3>
                <p className="text-xs text-slate-500">Manage patient visits and online consultations</p>
              </div>
              <button
                onClick={() => setApptModalOpen(true)}
                className="flex items-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Appointment</span>
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-lg">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No upcoming appointments scheduled for this patient.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appt) => (
                  <div key={appt.id} className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{appt.type}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {appt.meetingMethod}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Date: <span className="font-semibold text-slate-800">{appt.date}</span> at <span className="font-mono text-slate-800">{appt.time}</span>
                      </p>
                      {appt.instructions && (
                        <p className="text-xs text-slate-600 mt-1">Note: {appt.instructions}</p>
                      )}
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-[#0284C7] border border-sky-200">
                      {appt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Clinical Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {/* Note Composition Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Clinical Progress Note</h3>
            
            <form onSubmit={handleCreateClinicalNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Note Subject / Summary Title
                </label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  placeholder="e.g. Cognitive Review & Medication Adjustments"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Clinical Observation & Findings
                </label>
                <textarea
                  rows={4}
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  placeholder="Record patient mental state, memory retention, caregiver feedback..."
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Visibility Controls */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Note Visibility Settings
                </span>
                
                <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noteForm.isVisibleToPatient}
                      onChange={(e) => setNoteForm({ ...noteForm, isVisibleToPatient: e.target.checked })}
                      className="rounded border-slate-300 text-[#0284C7]"
                    />
                    <span>Visible to Patient</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noteForm.isVisibleToCaregiver}
                      onChange={(e) => setNoteForm({ ...noteForm, isVisibleToCaregiver: e.target.checked })}
                      className="rounded border-slate-300 text-[#0284C7]"
                    />
                    <span>Visible to Caregiver</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingNote}
                className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {savingNote ? 'Saving Note...' : 'Save Clinical Note'}
              </button>
            </form>
          </div>

          {/* Note History List */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Past Clinical Notes</h3>
            {clinicalNotes.length === 0 ? (
              <p className="text-xs text-slate-500">No clinical notes recorded for this patient.</p>
            ) : (
              <div className="space-y-4">
                {clinicalNotes.map((note) => (
                  <div key={note.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{note.title}</span>
                      <span className="text-xs text-slate-500">{note.date}</span>
                    </div>

                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">{note.content}</p>

                    <div className="flex items-center gap-4 pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        {note.isVisibleToPatient ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                        <span>Patient: {note.isVisibleToPatient ? 'Visible' : 'Internal Only'}</span>
                      </span>

                      <span className="flex items-center gap-1">
                        {note.isVisibleToCaregiver ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                        <span>Caregiver: {note.isVisibleToCaregiver ? 'Visible' : 'Internal Only'}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 7: Caregiver Details */}
      {activeTab === 'caregiver' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-xl space-y-4">
          <h3 className="text-base font-bold text-slate-900">Linked Primary Caregiver Profile</h3>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Caregiver Full Name:</span>
              <span className="font-semibold text-slate-900">{patient.caregiverName || offlineStorage.getCaregiverProfile().name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Primary Phone / Contact:</span>
              <span className="font-mono text-slate-900">{patient.caregiverPhone || patient.emergencyContact || offlineStorage.getCaregiverProfile().phone}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Email Address:</span>
              <span className="font-mono text-slate-900">{patient.caregiverEmail || offlineStorage.getCaregiverProfile().email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Relationship to Patient:</span>
              <span>{patient.caregiverRelation || offlineStorage.getCaregiverProfile().relation}</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Messaging */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm h-[500px] flex flex-col">
          <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            Clinical Messaging Channel (Patient & Caregiver)
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-slate-50 rounded-lg border border-slate-200 mb-4">
            {chatMessages.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                No messages exchanged yet. Type below to send clinical feedback.
              </div>
            ) : (
              chatMessages.map((msg, i) => {
                const isMe = msg.senderUid === doctor.uid;
                return (
                  <div key={msg.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-md p-3 rounded-xl text-xs ${
                      isMe ? 'bg-[#0284C7] text-white' : 'bg-white border border-slate-200 text-slate-800'
                    }`}>
                      <div className="text-[10px] opacity-75 font-semibold mb-1">
                        {msg.senderName} ({msg.senderRole})
                      </div>
                      <p>{msg.text}</p>
                      <div className="text-[9px] opacity-60 text-right mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Write a clinical note or response to patient/caregiver..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
            />
            <button
              type="submit"
              className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 9: Reports Summary */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Clinical Summary Report</h3>
            <button
              onClick={handleExportPdf}
              className="flex items-center gap-2 bg-[#0284C7] text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 text-slate-700">
            <p><strong>Patient ID:</strong> {patient.patientId}</p>
            <p><strong>Patient Name:</strong> {patient.name}</p>
            <p><strong>Clinical Stage:</strong> {patient.stage || 'General Medical Care'}</p>
            <p><strong>Active Prescriptions Count:</strong> {prescriptions.length}</p>
            <p><strong>Cognitive Game Log Count:</strong> {gameResults.length}</p>
          </div>
        </div>
      )}

      {/* Modal: Add/Edit Prescription */}
      {rxModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingRxId ? 'Edit Doctor Controlled Prescription' : 'Issue Doctor Controlled Prescription'}
              </h3>
              <button onClick={() => setRxModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRx} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Medication Name
                </label>
                <input
                  type="text"
                  value={rxForm.medicineName}
                  onChange={(e) => setRxForm({ ...rxForm, medicineName: e.target.value })}
                  placeholder="e.g. Donepezil / Memantine / Multivitamin"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={rxForm.dosage}
                    onChange={(e) => setRxForm({ ...rxForm, dosage: e.target.value })}
                    placeholder="e.g. 5mg, 10mg"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Time of Day
                  </label>
                  <input
                    type="text"
                    value={rxForm.time}
                    onChange={(e) => setRxForm({ ...rxForm, time: e.target.value })}
                    placeholder="e.g. 09:00 AM"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Frequency
                  </label>
                  <select
                    value={rxForm.frequency}
                    onChange={(e) => setRxForm({ ...rxForm, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Once Daily">Once Daily</option>
                    <option value="Twice Daily">Twice Daily</option>
                    <option value="Three Times Daily">Three Times Daily</option>
                    <option value="As Needed (PRN)">As Needed (PRN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={rxForm.duration}
                    onChange={(e) => setRxForm({ ...rxForm, duration: e.target.value })}
                    placeholder="e.g. 30 Days / Ongoing"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Special Instructions
                </label>
                <input
                  type="text"
                  value={rxForm.instructions}
                  onChange={(e) => setRxForm({ ...rxForm, instructions: e.target.value })}
                  placeholder="e.g. Take after breakfast with plenty of water"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs text-[#0284C7]">
                <strong>Doctor Controlled:</strong> Patients cannot delete or modify doctor-issued prescriptions.
              </div>

              <button
                type="submit"
                className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white py-2.5 rounded-lg text-xs font-semibold cursor-pointer"
              >
                {editingRxId ? 'Update Prescription' : 'Issue Prescription'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Appointment */}
      {apptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Schedule Consultation</h3>
              <button onClick={() => setApptModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Consultation Type
                </label>
                <select
                  value={apptForm.type}
                  onChange={(e) => setApptForm({ ...apptForm, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="Follow-up">Follow-up</option>
                  <option value="Consultation">Initial Consultation</option>
                  <option value="Medication Review">Medication Review</option>
                  <option value="Cognitive Review">Cognitive Review</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={apptForm.date}
                    onChange={(e) => setApptForm({ ...apptForm, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={apptForm.time}
                    onChange={(e) => setApptForm({ ...apptForm, time: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Method
                </label>
                <select
                  value={apptForm.meetingMethod}
                  onChange={(e) => setApptForm({ ...apptForm, meetingMethod: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="In-Person">In-Person at Hospital/Clinic</option>
                  <option value="Video Call">Teleconsultation Video Call</option>
                  <option value="Phone Call">Phone Call</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Instructions / Notes
                </label>
                <input
                  type="text"
                  value={apptForm.instructions}
                  onChange={(e) => setApptForm({ ...apptForm, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Confirm Appointment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Task */}
      {taskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Assign Doctor Task / Care Plan</h3>
              <button onClick={() => setTaskModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. 15-Min Evening Memory Game Session"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={taskForm.category}
                    onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Take medicine">Take medicine</option>
                    <option value="Cognitive exercise">Cognitive exercise</option>
                    <option value="Walk">Walk / Physical Exercise</option>
                    <option value="Doctor follow-up">Doctor follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Time
                  </label>
                  <input
                    type="text"
                    value={taskForm.time}
                    onChange={(e) => setTaskForm({ ...taskForm, time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white py-2 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Assign Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
