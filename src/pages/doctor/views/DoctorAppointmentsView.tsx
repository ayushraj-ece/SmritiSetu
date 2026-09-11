import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Video, Phone, Building2 } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import type { DoctorProfile, Appointment, PatientProfile } from '../../../types';

interface Props {
  doctor: DoctorProfile;
  onSelectPatient: (patientId: string) => void;
}

export const DoctorAppointmentsView: React.FC<Props> = ({ doctor, onSelectPatient }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [linkedPatients, setLinkedPatients] = useState<PatientProfile[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  
  const [form, setForm] = useState<{
    patientId: string;
    date: string;
    time: string;
    type: Appointment['type'];
    meetingMethod: Appointment['meetingMethod'];
    instructions: string;
  }>({
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    type: 'Follow-up',
    meetingMethod: 'In-Person',
    instructions: 'Bring latest prescription log and memory activity diary.'
  });

  useEffect(() => {
    const loadPatients = async () => {
      const list = await dataService.getLinkedPatientsForDoctor(doctor.uid);
      setLinkedPatients(list);
      if (list.length > 0 && !form.patientId) {
        setForm(f => ({ ...f, patientId: list[0].patientId }));
      }
    };
    loadPatients();

    const unsub = dataService.subscribeAppointments(doctor.uid, undefined, (appts: Appointment[]) => {
      setAppointments(appts);
    });

    return () => unsub();
  }, [doctor.uid]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientId) return;

    const targetPatient = linkedPatients.find(p => p.patientId === form.patientId);

    await dataService.createAppointment({
      doctorId: doctor.uid,
      doctorName: `Dr. ${doctor.fullName}`,
      doctorHospital: doctor.clinicHospital,
      patientId: form.patientId,
      patientName: targetPatient?.name || form.patientId,
      caregiverUid: targetPatient?.caregiverUid,
      date: form.date,
      time: form.time,
      durationMinutes: 30,
      type: form.type,
      meetingMethod: form.meetingMethod,
      instructions: form.instructions,
      status: 'scheduled'
    });

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clinical Consultation Schedule</h2>
          <p className="text-xs text-slate-500">Manage patient appointments and teleconsultation sessions</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Scheduled Appointments</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
            You currently have no scheduled consultations. Click "New Appointment" to add one.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Consult</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-200">
          {appointments.map((appt) => (
            <div key={appt.id} className="p-5 hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#0284C7] flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span 
                      onClick={() => onSelectPatient(appt.patientId)}
                      className="font-bold text-slate-900 text-sm hover:text-[#0284C7] cursor-pointer"
                    >
                      {appt.patientName || appt.patientId}
                    </span>
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      ID: {appt.patientId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    <strong className="text-slate-800">{appt.type}</strong> • Date: <span className="font-semibold text-slate-900">{appt.date}</span> at <span className="font-mono">{appt.time}</span>
                  </p>
                  {appt.instructions && (
                    <p className="text-xs text-slate-500 mt-0.5">Note: {appt.instructions}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {appt.meetingMethod === 'Video Call' && <Video className="w-3.5 h-3.5" />}
                  {appt.meetingMethod === 'Phone Call' && <Phone className="w-3.5 h-3.5" />}
                  {appt.meetingMethod === 'In-Person' && <Building2 className="w-3.5 h-3.5" />}
                  <span>{appt.meetingMethod}</span>
                </span>

                <button
                  onClick={() => onSelectPatient(appt.patientId)}
                  className="text-xs font-semibold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  View Chart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Schedule Appointment</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Select Patient
                </label>
                {linkedPatients.length === 0 ? (
                  <p className="text-xs text-red-600">No authorized patients linked. Pair a patient first.</p>
                ) : (
                  <select
                    value={form.patientId}
                    onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {linkedPatients.map(p => (
                      <option key={p.patientId} value={p.patientId}>
                        {p.name} (ID: {p.patientId})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as any })}
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
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
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
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
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
                  value={form.meetingMethod}
                  onChange={(e) => setForm({ ...form, meetingMethod: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="In-Person">In-Person at Clinic</option>
                  <option value="Video Call">Teleconsultation Video Call</option>
                  <option value="Phone Call">Phone Call</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Instructions
                </label>
                <input
                  type="text"
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={linkedPatients.length === 0}
                className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white py-2 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                Schedule Consultation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
