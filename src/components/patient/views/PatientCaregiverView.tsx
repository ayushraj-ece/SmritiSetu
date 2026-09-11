import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MessageSquare, ShieldCheck, Copy, Check, HeartHandshake } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import type { PatientProfile } from '../../../types';

interface Props {
  patientProfile: PatientProfile;
  onBack: () => void;
  onOpenChat: () => void;
}

export const PatientCaregiverView: React.FC<Props> = ({
  patientProfile,
  onBack,
  onOpenChat
}) => {
  const [caregiverInfo, setCaregiverInfo] = useState<{
    caregiverName: string;
    caregiverUid: string;
    caregiverEmail?: string;
    status: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsub = dataService.subscribePairedCaregiver(patientProfile.patientId || patientProfile.id, (info) => {
      setCaregiverInfo(info);
    });

    return () => unsub();
  }, [patientProfile]);

  const handleCopyCode = () => {
    if (patientProfile.patientId) {
      navigator.clipboard.writeText(patientProfile.patientId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-28 max-w-xl md:max-w-2xl mx-auto animate-in fade-in duration-300 px-4 sm:px-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 cursor-pointer flex items-center justify-center transition-all"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-lg font-extrabold text-slate-900">
          Caregiver & Family
        </h1>

        <div className="w-10 h-10" />
      </div>

      {/* Patient Unique ID Share Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-5 shadow-lg space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200 block">
              YOUR UNIQUE PATIENT CODE
            </span>
            <h2 className="text-3xl font-black font-mono tracking-wider pt-0.5">
              {patientProfile.patientId || 'ASM58291'}
            </h2>
          </div>

          <button
            onClick={handleCopyCode}
            className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer backdrop-blur-md transition-all border border-white/30"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        <p className="text-xs text-blue-100 font-medium leading-relaxed pt-1">
          Share this 5-digit code with your family members or caregiver so they can link with your account to monitor your progress in real time.
        </p>
      </div>

      {/* Linked Caregiver Section */}
      <div className="space-y-3 pt-1">
        <h3 className="text-base font-extrabold text-slate-900">
          Paired Caregiver
        </h3>

        {!caregiverInfo ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 p-6 rounded-3xl text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-800">No Caregiver Paired Yet</h4>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
              Share your Patient Code <span className="font-mono font-bold text-blue-600">{patientProfile.patientId || 'ASM58291'}</span> with your caregiver. Once they send a request, an accept popup will appear here.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xl shadow-xs">
                  {caregiverInfo.caregiverName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                    {caregiverInfo.caregiverName}
                  </h4>
                  <span className="text-xs font-semibold text-slate-400 block">
                    Primary Caregiver
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                    <ShieldCheck className="w-3 h-3" /> {caregiverInfo.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-50 flex items-center gap-3">
              <button
                onClick={onOpenChat}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send Chat Message</span>
              </button>
              <a
                href="tel:9876543210"
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4" />
                <span>Call</span>
              </a>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
