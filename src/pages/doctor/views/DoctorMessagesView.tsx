import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  User, 
  Volume2, 
  CheckCheck, 
  Stethoscope, 
  Heart, 
  UserCheck 
} from 'lucide-react';
import { dataService } from '../../../services/dataService';
import { voiceService } from '../../../services/voiceService';
import type { DoctorProfile, PatientProfile, ChatMessage } from '../../../types';

interface Props {
  doctor: DoctorProfile;
  onSelectPatient: (patientId: string) => void;
}

export const DoctorMessagesView: React.FC<Props> = ({ doctor, onSelectPatient }) => {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPatients = async () => {
      const list = await dataService.getLinkedPatientsForDoctor(doctor.uid);
      setPatients(list);
      if (list.length > 0 && !selectedPatientId) {
        setSelectedPatientId(list[0].patientId);
      }
    };
    loadPatients();

    const handleUpdate = () => loadPatients();
    window.addEventListener('patientProfileUpdated', handleUpdate);
    return () => window.removeEventListener('patientProfileUpdated', handleUpdate);
  }, [doctor.uid]);

  useEffect(() => {
    if (!selectedPatientId) return;

    // Mark as read for doctor
    dataService.markChatAsRead(selectedPatientId, 'doctor');

    const unsub = dataService.subscribeChatMessages(selectedPatientId, (list) => {
      setMessages(list);
      dataService.markChatAsRead(selectedPatientId, 'doctor');
    });
    return () => unsub();
  }, [selectedPatientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedPatientId) return;

    const textToSend = inputText.trim();
    setInputText('');

    await dataService.sendChatMessage({
      patientId: selectedPatientId,
      senderUid: doctor.uid,
      senderName: `Dr. ${doctor.fullName?.startsWith('Dr.') ? doctor.fullName.replace(/^Dr\.\s*/, '') : (doctor.fullName || 'Dre')}`,
      senderRole: 'doctor',
      text: textToSend,
      timestamp: Date.now()
    });

    dataService.markChatAsRead(selectedPatientId, 'doctor');
  };

  const handleSpeakText = (text: string) => {
    voiceService.speak(text, 'en');
  };

  const selectedPatient = patients.find(p => p.patientId === selectedPatientId);

  const filteredPatients = patients.filter(p => 
    !searchQuery || 
    (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.patientId && p.patientId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.caregiverName && p.caregiverName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4 font-sans text-slate-800">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#0284C7]" />
            <span>Clinical Messaging Center</span>
          </h2>
          <p className="text-xs text-slate-500">
            Secure multi-party channel with authorized patients and family caregivers
          </p>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-[#0284C7] mx-auto flex items-center justify-center">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">No Patient Conversations Active</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Pair with a patient using their unique Patient ID to open real-time clinical consultations.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[620px]">
          
          {/* Left Panel: Conversations Directory */}
          <div className="border-r border-slate-200/80 bg-[#F8FAFC] flex flex-col h-full">
            {/* Search Box */}
            <div className="p-3.5 border-b border-slate-200/80 bg-white">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search patient or caregiver..."
                  className="w-full bg-[#F1F5F9] border-none rounded-xl pl-9 pr-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0284C7]/30 transition-all"
                />
              </div>
            </div>

            <div className="px-4 py-2 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 flex justify-between items-center">
              <span>Authorized Channels</span>
              <span className="bg-sky-100 text-[#0284C7] px-2 py-0.5 rounded-full font-mono font-bold text-[10px]">
                {patients.length}
              </span>
            </div>

            {/* Patients List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredPatients.map((p) => {
                const isActive = p.patientId === selectedPatientId;
                const lastMsg = dataService.getLastChatMessage(p.patientId);
                const hasUnread = dataService.hasUnreadMessages(p.patientId, 'doctor');

                return (
                  <div
                    key={p.patientId}
                    onClick={() => setSelectedPatientId(p.patientId)}
                    className={`p-3.5 hover:bg-white transition-all cursor-pointer flex items-center gap-3 relative ${
                      isActive ? 'bg-white border-l-4 border-[#0284C7] shadow-2xs' : ''
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                        {p.name ? p.name.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs truncate ${isActive ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                          {p.name || 'Patient'}
                        </span>
                        {lastMsg && (
                          <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-1">
                            {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="font-mono text-[10px] font-medium text-[#0284C7] bg-sky-50 px-1.5 py-0.2 rounded">
                          {p.patientId}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate">
                          • {p.caregiverName || 'Caregiver'}
                        </span>
                      </div>

                      {lastMsg && (
                        <p className={`text-[11px] truncate mt-1 ${hasUnread ? 'font-bold text-slate-900' : 'text-slate-500'}`}>
                          {lastMsg.text}
                        </p>
                      )}
                    </div>

                    {hasUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" title="Unread" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Main Chat Panel */}
          <div className="md:col-span-2 flex flex-col h-full bg-white">
            {selectedPatient ? (
              <>
                {/* Active Chat Header */}
                <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                      {selectedPatient.name ? selectedPatient.name.charAt(0).toUpperCase() : 'P'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{selectedPatient.name}</h3>
                        <span className="font-mono text-[10px] font-bold text-[#0284C7] bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                          {selectedPatient.patientId}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <UserCheck className="w-3 h-3 text-emerald-600" />
                        <span>Caregiver: {selectedPatient.caregiverName || 'Registered Caregiver'}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-emerald-600 font-semibold">Active Patient Link</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectPatient(selectedPatient.patientId)}
                      className="text-xs font-semibold text-[#0284C7] bg-[#EBF5FF] hover:bg-sky-100 border border-sky-200 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Open Patient Chart
                    </button>
                  </div>
                </div>

                {/* Messages Stream Container */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8FAFC]/60">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#0284C7] flex items-center justify-center text-xl">
                        💬
                      </div>
                      <p className="text-xs font-bold text-slate-700">No consultation messages exchanged yet.</p>
                      <p className="text-[11px] text-slate-500 max-w-xs">
                        Send a message below to communicate directly with {selectedPatient.name} and their family caregiver.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      // Check if message was sent by doctor
                      const isDoctorSender = msg.senderRole === 'doctor' || msg.senderUid === doctor.uid;
                      const isCaregiverSender = msg.senderRole === 'caregiver';
                      const isPatientSender = msg.senderRole === 'patient';
                      const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div
                          key={msg.id || idx}
                          className={`flex flex-col ${isDoctorSender ? 'items-end' : 'items-start'} space-y-1`}
                        >
                          <div className={`flex items-end gap-2 max-w-[80%] ${isDoctorSender ? 'flex-row-reverse' : 'flex-row'}`}>
                            
                            {/* Text-to-speech button for incoming messages */}
                            {!isDoctorSender && (
                              <button
                                onClick={() => handleSpeakText(msg.text)}
                                className="w-7 h-7 rounded-full bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center shrink-0 mb-1 cursor-pointer transition-colors"
                                title="Read aloud"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <div
                              className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-2xs space-y-1 ${
                                isDoctorSender
                                  ? 'bg-gradient-to-r from-[#0284C7] to-sky-700 text-white rounded-tr-xs'
                                  : isCaregiverSender
                                  ? 'bg-emerald-50 border border-emerald-200/80 text-slate-800 rounded-tl-xs'
                                  : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
                              }`}
                            >
                              {/* Sender Header Badge */}
                              <div className={`text-[10px] font-bold tracking-tight flex items-center gap-1.5 ${
                                isDoctorSender 
                                  ? 'text-sky-100' 
                                  : isCaregiverSender 
                                  ? 'text-emerald-700' 
                                  : 'text-[#0284C7]'
                              }`}>
                                {isDoctorSender && <Stethoscope className="w-3 h-3 text-sky-200" />}
                                {isCaregiverSender && <Heart className="w-3 h-3 text-emerald-600" />}
                                {isPatientSender && <User className="w-3 h-3 text-sky-600" />}
                                <span>
                                  {msg.senderName} ({msg.senderRole ? msg.senderRole.charAt(0).toUpperCase() + msg.senderRole.slice(1) : 'User'})
                                </span>
                              </div>

                              <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          </div>

                          {/* Timestamp & Status Icon */}
                          <div className={`flex items-center gap-1 text-[10px] font-semibold text-slate-400 px-1 ${isDoctorSender ? 'justify-end' : 'justify-start'}`}>
                            <span>{timeStr}</span>
                            {isDoctorSender && <CheckCheck className="w-3.5 h-3.5 text-[#0284C7]" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Bottom Input Composer */}
                <form onSubmit={handleSend} className="p-3.5 border-t border-slate-200/80 bg-white shrink-0">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Send clinical advice or note to ${selectedPatient.name}...`}
                      className="flex-1 bg-[#F1F5F9] focus:bg-white border border-transparent focus:border-[#0284C7] rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="bg-[#0284C7] hover:bg-[#0369A1] text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shadow-2xs shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center flex-1 text-xs text-slate-400">
                Select a patient from the list to start clinical messaging
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

