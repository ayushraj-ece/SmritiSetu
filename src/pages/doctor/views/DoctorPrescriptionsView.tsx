import React, { useState, useEffect } from 'react';
import { Pill, Trash2, Search, BellRing, Stethoscope } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import { offlineStorage } from '../../../services/offlineStorage';
import type { DoctorProfile, Prescription, PatientReminder } from '../../../types';

interface Props {
  doctor: DoctorProfile;
  onSelectPatient: (patientId: string) => void;
}

export const DoctorPrescriptionsView: React.FC<Props> = ({ doctor, onSelectPatient }) => {
  const [allPrescriptions, setAllPrescriptions] = useState<{ rx: Prescription; patientName: string }[]>([]);
  const [allReminders, setAllReminders] = useState<{ rem: PatientReminder; patientName: string }[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'prescriptions' | 'reminders'>('prescriptions');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const loadAll = async () => {
      const patients = await dataService.getLinkedPatientsForDoctor(doctor.uid);
      const combinedRx: { rx: Prescription; patientName: string }[] = [];
      const combinedRem: { rem: PatientReminder; patientName: string }[] = [];
      const cleanDocName = doctor.fullName?.toLowerCase() || '';

      for (const p of patients) {
        const rxs = await dataService.getPrescriptions(p.patientId);
        rxs.forEach((rx: Prescription) => {
          const rxDocName = rx.prescribedBy ? rx.prescribedBy.toLowerCase() : '';
          if (!rx.doctorId || rx.doctorId === doctor.uid || (cleanDocName && rxDocName.includes(cleanDocName.replace(/^dr\.\s*/, '')))) {
            combinedRx.push({ rx, patientName: p.name });
          }
        });

        const rems = offlineStorage.getReminders(p.patientId);
        rems.forEach((rem: PatientReminder) => {
          combinedRem.push({ rem, patientName: p.name });
        });
      }
      setAllPrescriptions(combinedRx);
      setAllReminders(combinedRem);
    };

    loadAll();

    const handleUpdate = () => loadAll();
    if (typeof window !== 'undefined') {
      window.addEventListener('prescriptionsUpdated', handleUpdate);
      window.addEventListener('remindersUpdated', handleUpdate);
      window.addEventListener('patientProfileUpdated', handleUpdate);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('prescriptionsUpdated', handleUpdate);
        window.removeEventListener('remindersUpdated', handleUpdate);
        window.removeEventListener('patientProfileUpdated', handleUpdate);
      }
    };
  }, [doctor.uid, doctor.fullName]);

  const handleDeleteRx = async (id: string) => {
    if (window.confirm('Discontinue/delete this active prescription?')) {
      await dataService.deletePrescription(id);
      setAllPrescriptions(prev => prev.filter(item => item.rx.id !== id));
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (window.confirm('Delete this active patient reminder/alarm?')) {
      await dataService.deleteReminder(id);
      setAllReminders(prev => prev.filter(item => item.rem.id !== id));
    }
  };

  const filteredRx = allPrescriptions.filter(item => 
    item.rx.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.rx.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRem = allReminders.filter(item => 
    item.rem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.rem.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Prescriptions & Patient Alarms Hub</h2>
          <p className="text-xs text-slate-500">Manage doctor prescriptions and patient medication reminders across all linked patients</p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveSubTab('prescriptions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'prescriptions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
            <span>Prescriptions ({allPrescriptions.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('reminders')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'reminders' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BellRing className="w-3.5 h-3.5 text-emerald-600" />
            <span>Patient Alarms ({allReminders.length})</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by medication name, patient name, or ID..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
          {activeSubTab === 'prescriptions' ? `${filteredRx.length} Prescriptions` : `${filteredRem.length} Alarms`}
        </div>
      </div>

      {activeSubTab === 'prescriptions' ? (
        filteredRx.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <Pill className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Prescriptions Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {searchTerm ? `No prescriptions match "${searchTerm}".` : 'You have not issued any prescriptions yet. Open a patient chart to prescribe medications.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Patient Name & ID</th>
                  <th className="py-3.5 px-4">Medication & Dosage</th>
                  <th className="py-3.5 px-4">Frequency & Time</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRx.map(({ rx, patientName }) => (
                  <tr key={rx.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <span 
                        onClick={() => onSelectPatient(rx.patientId)}
                        className="font-bold text-slate-900 text-sm hover:text-[#0284C7] cursor-pointer"
                      >
                        {patientName}
                      </span>
                      <div className="font-mono text-[11px] text-slate-500">ID: {rx.patientId}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{rx.medicineName}</div>
                      <div className="text-slate-500">{rx.dosage}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{rx.frequency || 'Daily'}</div>
                      <div className="font-mono text-slate-500">{rx.time}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {rx.duration || '30 Days'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectPatient(rx.patientId)}
                          className="text-xs font-semibold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Patient Chart
                        </button>
                        <button
                          onClick={() => handleDeleteRx(rx.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
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
        )
      ) : (
        filteredRem.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
            <BellRing className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Patient Alarms Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {searchTerm ? `No patient alarms match "${searchTerm}".` : 'No patient alarms currently configured.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Patient Name & ID</th>
                  <th className="py-3.5 px-4">Alarm Title</th>
                  <th className="py-3.5 px-4">Time</th>
                  <th className="py-3.5 px-4">Repeat Schedule</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRem.map(({ rem, patientName }) => (
                  <tr key={rem.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <span 
                        onClick={() => onSelectPatient(rem.patientId)}
                        className="font-bold text-slate-900 text-sm hover:text-[#0284C7] cursor-pointer"
                      >
                        {patientName}
                      </span>
                      <div className="font-mono text-[11px] text-slate-500">ID: {rem.patientId}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {rem.title}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      {rem.time}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {rem.repeatPattern || 'Daily'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onSelectPatient(rem.patientId)}
                          className="text-xs font-semibold text-[#0284C7] bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-lg cursor-pointer"
                        >
                          Patient Chart
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(rem.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          title="Delete Reminder"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};
