import React, { useState, useEffect } from 'react';
import { Download, FileText, Search } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import { pdfReportService } from '../../../services/pdfReportService';
import { offlineStorage } from '../../../services/offlineStorage';
import type { DoctorProfile, PatientProfile } from '../../../types';

interface Props {
  doctor: DoctorProfile;
  onSelectPatient: (patientId: string) => void;
}

export const DoctorReportsView: React.FC<Props> = ({ doctor, onSelectPatient }) => {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      const list = await dataService.getLinkedPatientsForDoctor(doctor.uid);
      setPatients(list);
    };
    load();
  }, [doctor.uid]);

  const handleDownloadPatientReport = async (patient: PatientProfile) => {
    const gameResults = await dataService.getGameResults(patient.patientId);
    const evaluations = offlineStorage.getEvaluations(patient.patientId);

    pdfReportService.downloadPdfReport({
      patient,
      gameResults,
      reminders: [],
      evaluations
    });
  };

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Clinical Reports & Documentation</h2>
        <p className="text-xs text-slate-500">Generate standardized cognitive health PDF reports for medical records</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient roster for report generation..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Patient Records Available</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Pair with a patient to generate cognitive evaluation reports.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((p) => (
            <div key={p.patientId} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                  <span className="font-mono text-xs text-slate-500">ID: {p.patientId}</span>
                </div>
                <span className="px-2 py-1 rounded text-[10px] font-semibold bg-sky-50 text-[#0284C7]">
                  {p.stage || 'Clinical Observation'}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Caregiver: {p.caregiverName || 'Registered Caregiver'} • Age: {p.age || 'N/A'}
              </p>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleDownloadPatientReport(p)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Report</span>
                </button>
                <button
                  onClick={() => onSelectPatient(p.patientId)}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Chart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
