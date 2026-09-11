import React, { useState, useEffect } from 'react';
import { Pill, Trash2, Search } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import type { DoctorProfile, Prescription } from '../../../types';

interface Props {
  doctor: DoctorProfile;
  onSelectPatient: (patientId: string) => void;
}

export const DoctorPrescriptionsView: React.FC<Props> = ({ doctor, onSelectPatient }) => {
  const [allPrescriptions, setAllPrescriptions] = useState<{ rx: Prescription; patientName: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const loadAll = async () => {
      const patients = await dataService.getLinkedPatientsForDoctor(doctor.uid);
      const combined: { rx: Prescription; patientName: string }[] = [];

      for (const p of patients) {
        const rxs = await dataService.getPrescriptions(p.patientId);
        rxs.forEach((rx: Prescription) => {
          if (rx.doctorId === doctor.uid || rx.prescribedBy.includes(doctor.fullName)) {
            combined.push({ rx, patientName: p.name });
          }
        });
      }
      setAllPrescriptions(combined);
    };

    loadAll();
  }, [doctor.uid]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Discontinue/delete this active prescription?')) {
      await dataService.deletePrescription(id);
      setAllPrescriptions(prev => prev.filter(item => item.rx.id !== id));
    }
  };

  const filtered = allPrescriptions.filter(item => 
    item.rx.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.rx.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Active Prescriptions Hub</h2>
          <p className="text-xs text-slate-500">All medications issued by you across linked patients</p>
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
          {filtered.length} Active Prescriptions
        </div>
      </div>

      {filtered.length === 0 ? (
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
              {filtered.map(({ rx, patientName }) => (
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
                        onClick={() => handleDelete(rx.id)}
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
      )}
    </div>
  );
};
