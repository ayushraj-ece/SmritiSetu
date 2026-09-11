import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Stethoscope, Search, ChevronRight, HeartHandshake } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import type { PatientProfile } from '../../../types';

interface Props {
  patientProfile: PatientProfile;
  onBack: () => void;
  onOpenChat: (recipientId: string, recipientName: string) => void;
}

export const PatientMessagesView: React.FC<Props> = ({
  patientProfile,
  onBack,
  onOpenChat
}) => {
  const [activeSegment, setActiveSegment] = useState<'Caregivers' | 'Doctors'>('Caregivers');
  const [searchQuery, setSearchQuery] = useState('');
  const [caregiverInfo, setCaregiverInfo] = useState<{
    caregiverName: string;
    caregiverUid: string;
    caregiverEmail?: string;
    status: string;
  } | null>(null);

  useEffect(() => {
    const unsub = dataService.subscribePairedCaregiver(patientProfile.patientId || patientProfile.id, (info) => {
      setCaregiverInfo(info);
    });
    return () => unsub();
  }, [patientProfile]);

  const patientId = patientProfile.patientId || patientProfile.id;
  const lastMsg = dataService.getLastChatMessage(patientId);
  const hasUnread = dataService.hasUnreadMessages(patientId, 'patient');

  const caregiverConversations = caregiverInfo ? [{
    id: caregiverInfo.caregiverUid,
    name: caregiverInfo.caregiverName,
    role: 'Primary Caregiver',
    lastMessage: lastMsg ? lastMsg.text : 'Tap to start real-time chat with your caregiver...',
    time: lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live',
    hasUnread,
    online: true
  }] : [];

  const doctorConversations: Array<{
    id: string;
    name: string;
    specialty: string;
    lastMessage: string;
    time: string;
    online: boolean;
  }> = [];

  const filteredCaregivers = caregiverConversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDoctors = doctorConversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-24 max-w-xl md:max-w-2xl mx-auto animate-in fade-in duration-300 px-4 sm:px-6 pt-3 relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 cursor-pointer flex items-center justify-center transition-all"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight text-center">
            Messages & Care Network
          </h1>
          <p className="text-xs text-slate-400 font-medium text-center">
            Stay connected with your family and doctor
          </p>
        </div>

        <div className="w-10 h-10" />
      </div>

      {/* Segmented Switcher */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1">
        <button
          onClick={() => setActiveSegment('Caregivers')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSegment === 'Caregivers'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Caregivers ({caregiverConversations.length})</span>
        </button>

        <button
          onClick={() => setActiveSegment('Doctors')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSegment === 'Doctors'
              ? 'bg-[#0284C7] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctors ({doctorConversations.length})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={activeSegment === 'Caregivers' ? "Search caregivers..." : "Search doctors..."}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-sky-400 transition-all"
        />
      </div>

      {/* Conversations List */}
      {activeSegment === 'Caregivers' ? (
        <div className="space-y-3">
          {filteredCaregivers.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-3xl text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-sky-100 text-[#0284C7] mx-auto flex items-center justify-center">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">No Caregiver Linked</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Share your Patient Code <span className="font-mono font-bold text-[#0284C7]">{patientProfile.patientId || 'ASM58291'}</span> with your family or caregiver to start messaging.
                </p>
              </div>
            </div>
          ) : (
            filteredCaregivers.map((c) => (
              <div
                key={c.id}
                onClick={() => onOpenChat(c.id, c.name)}
                className="bg-white border border-slate-200 hover:border-sky-300 p-4 rounded-3xl shadow-2xs transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                      {c.name.charAt(0)}
                    </div>
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">
                        {c.name}
                      </h3>
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">
                        {c.role}
                      </span>
                    </div>

                    <p className={`text-xs font-medium truncate ${c.hasUnread ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                      {c.lastMessage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400">
                    {c.time}
                  </span>
                  {c.hasUnread ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" title="Unread Message" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDoctors.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 p-8 rounded-3xl text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-sky-100 text-[#0284C7] mx-auto flex items-center justify-center">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">No Paired Doctors</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Your assigned doctor will appear here once connected by your healthcare center.
                </p>
              </div>
            </div>
          ) : (
            filteredDoctors.map((d) => (
              <div
                key={d.id}
                onClick={() => onOpenChat(d.id, d.name)}
                className="bg-white border border-slate-200 hover:border-sky-300 p-4 rounded-3xl shadow-2xs transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                    {d.name.charAt(0)}
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {d.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      {d.specialty}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-sky-500 transition-colors" />
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
