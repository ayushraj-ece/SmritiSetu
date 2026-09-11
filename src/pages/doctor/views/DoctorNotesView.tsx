import React, { useState, useEffect } from 'react';
import { FileText, Eye, EyeOff, Search } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import type { DoctorProfile, ClinicalNote } from '../../../types';

interface Props {
  doctor: DoctorProfile;
  onSelectPatient: (patientId: string) => void;
}

export const DoctorNotesView: React.FC<Props> = ({ doctor, onSelectPatient }) => {
  const [notes, setNotes] = useState<ClinicalNote[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const unsub = dataService.subscribeClinicalNotes(doctor.uid, undefined, (allNotes: ClinicalNote[]) => {
      setNotes(allNotes);
    });
    return () => unsub();
  }, [doctor.uid]);

  const filtered = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.patientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clinical Progress Notes Archive</h2>
          <p className="text-xs text-slate-500">Comprehensive log of all medical observations and guidance</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes by subject, content, or patient ID..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
          {filtered.length} Notes Recorded
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Clinical Notes Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {searchTerm ? `No clinical notes match "${searchTerm}".` : 'You have not authored any clinical progress notes yet. Open a patient chart to write notes.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((note) => (
            <div key={note.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-slate-300 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{note.title}</h3>
                  <button
                    onClick={() => onSelectPatient(note.patientId)}
                    className="font-mono text-xs font-semibold bg-sky-50 text-[#0284C7] hover:bg-sky-100 border border-sky-200 px-2.5 py-0.5 rounded cursor-pointer"
                  >
                    Patient ID: {note.patientId}
                  </button>
                </div>
                <span className="text-xs text-slate-500 font-medium">{note.date}</span>
              </div>

              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed border-l-2 border-[#0284C7] pl-3 py-1 bg-slate-50 rounded-r-md">
                {note.content}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    {note.isVisibleToPatient ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Patient Access: {note.isVisibleToPatient ? 'Enabled' : 'Restricted'}</span>
                  </span>

                  <span className="flex items-center gap-1">
                    {note.isVisibleToCaregiver ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Caregiver Access: {note.isVisibleToCaregiver ? 'Enabled' : 'Restricted'}</span>
                  </span>
                </div>

                <button
                  onClick={() => onSelectPatient(note.patientId)}
                  className="text-xs font-semibold text-[#0284C7] hover:underline cursor-pointer"
                >
                  Open Chart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
