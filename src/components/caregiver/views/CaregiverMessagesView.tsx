import React, { useState } from 'react';
import { Users, Stethoscope, Search, ChevronRight, Edit3, MessageSquarePlus } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import type { PatientProfile } from '../../../types';

interface Props {
  patients: PatientProfile[];
  onOpenChat: (patientId: string, recipientName: string) => void;
  onNewMessage: () => void;
}

export const CaregiverMessagesView: React.FC<Props> = ({
  patients,
  onOpenChat,
  onNewMessage
}) => {
  const [activeSegment, setActiveSegment] = useState<'Patients' | 'Doctors'>('Patients');
  const [searchQuery, setSearchQuery] = useState('');

  // Deduplicate and filter out legacy hardcoded format IDs
  const validPatients = patients.filter((p, index, self) => {
    const pid = (p.patientId || p.id || '').toUpperCase();
    if (!pid || pid.startsWith('SS-IND-') || pid.startsWith('MC-IND-')) return false;
    return self.findIndex(t => (t.patientId || t.id || '').toUpperCase() === pid) === index;
  });

  // Dynamic Patient Conversations mapped directly from valid paired patients
  const patientConversations = validPatients.map(p => {
    const cleanId = p.patientId || p.id;
    const lastMsg = dataService.getLastChatMessage(cleanId);
    const hasUnread = dataService.hasUnreadMessages(cleanId, 'caregiver');

    const lastMsgText = lastMsg ? lastMsg.text : 'Tap to start real-time messaging...';
    const timeStr = lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live';

    return {
      id: cleanId,
      name: p.name || 'Patient',
      patientId: cleanId,
      avatarUrl: p.avatarUrl,
      lastMessage: lastMsgText,
      time: timeStr,
      hasUnread,
      online: true
    };
  });

  // Doctors Network Conversations
  const doctorConversations: Array<{
    id: string;
    name: string;
    specialty: string;
    avatar: string;
    lastMessage: string;
    time: string;
    hasUnread: boolean;
    online: boolean;
  }> = [];

  const filteredPatients = patientConversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDoctors = doctorConversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = patientConversations.filter(c => c.hasUnread).length;

  return (
    <div className="space-y-5 pb-24 max-w-md md:max-w-lg mx-auto animate-in fade-in duration-300 px-4 pt-3 relative font-sans">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Messages
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Stay connected with patients and medical experts
        </p>
      </div>

      {/* Segmented Switcher: Patients | Doctors */}
      <div className="bg-white border border-slate-100 p-1.5 rounded-2xl shadow-2xs flex items-center gap-1">
        <button
          onClick={() => setActiveSegment('Patients')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 relative ${
            activeSegment === 'Patients'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Patients ({patientConversations.length})</span>
          {totalUnread > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute top-2 right-4" />
          )}
        </button>

        <button
          onClick={() => setActiveSegment('Doctors')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSegment === 'Doctors'
              ? 'bg-[#2563EB] text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctors ({doctorConversations.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={activeSegment === 'Patients' ? 'Search patient conversations...' : 'Search doctor conversations...'}
          className="w-full bg-white border border-slate-100 rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-300 shadow-2xs transition-all"
        />
      </div>

      {/* Segment View Body */}
      {activeSegment === 'Patients' ? (
        <div className="space-y-3">
          {filteredPatients.length === 0 ? (
            <div className="bg-white border border-slate-100 p-8 rounded-3xl text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
                <MessageSquarePlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">No Patient Conversations</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Pair with your patient using their 5-digit ID to send real-time text & audio messages.
                </p>
              </div>
              <button
                onClick={onNewMessage}
                className="px-4 py-2 bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-xs hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Pair Patient & Start Chat</span>
              </button>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-2 shadow-2xs divide-y divide-slate-50">
              {filteredPatients.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onOpenChat(conv.id, conv.name)}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-2xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-100 via-indigo-50 to-blue-200 p-0.5 shadow-xs flex items-center justify-center">
                        {conv.avatarUrl ? (
                          <img src={conv.avatarUrl} alt={conv.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className="text-base font-black text-blue-700 uppercase">
                            {conv.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <span className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0" />
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-extrabold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors truncate">
                          {conv.name}
                        </h4>
                        <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded-md">
                          {conv.patientId}
                        </span>
                      </div>
                      <p className={`text-xs font-medium truncate ${conv.hasUnread ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400">
                      {conv.time}
                    </span>
                    {conv.hasUnread ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" title="Unread Message" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Doctors Segment */
        <div className="space-y-3">
          {filteredDoctors.length === 0 ? (
            <div className="bg-white border border-slate-100 p-8 rounded-3xl text-center space-y-3 shadow-2xs">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">No Doctor Connections</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Assigned medical specialists will appear here for longitudinal consultation.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-3xl p-2 shadow-2xs divide-y divide-slate-50">
              {filteredDoctors.map((docItem) => (
                <div
                  key={docItem.id}
                  onClick={() => onOpenChat(docItem.id, docItem.name)}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 rounded-2xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center">
                      {docItem.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {docItem.name}
                      </h4>
                      <p className="text-xs text-slate-400 font-medium">{docItem.specialty}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating Link Button */}
      <div className="fixed bottom-20 left-0 right-0 max-w-md md:max-w-lg mx-auto px-6 pointer-events-none flex justify-end">
        <button
          onClick={onNewMessage}
          className="pointer-events-auto px-5 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-xs rounded-full shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
        >
          <Edit3 className="w-4 h-4" />
          <span>Link Patient / New Chat</span>
        </button>
      </div>

    </div>
  );
};
