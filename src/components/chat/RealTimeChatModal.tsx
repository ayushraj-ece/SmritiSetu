import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { dataService } from '../../services/dataService';
import { voiceService } from '../../services/voiceService';
import type { ChatMessage, UserRole } from '../../types';
import { Send, Volume2, ArrowLeft, Phone, CheckCheck, User, Stethoscope, Heart } from 'lucide-react';

interface Props {
  patientId: string;
  currentUserUid: string;
  currentUserName: string;
  currentUserRole: UserRole;
  recipientRole?: UserRole;
  recipientName?: string;
  threadId?: string;
  onClose: () => void;
}

export const RealTimeChatModal: React.FC<Props> = ({
  patientId,
  currentUserUid,
  currentUserName,
  currentUserRole,
  recipientRole = 'caregiver',
  recipientName,
  threadId,
  onClose
}) => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const targetThreadId = threadId || (recipientRole === 'doctor' ? `${patientId}_doctor` : `${patientId}_caregiver`);
  const displayName = recipientName || (recipientRole === 'doctor' ? 'Attending Doctor' : 'Primary Caregiver');

  useEffect(() => {
    // Mark chat as read
    dataService.markChatAsRead(patientId, currentUserRole);

    const unsub = dataService.subscribeChatMessages(patientId, targetThreadId, (list) => {
      setMessages(list);
      dataService.markChatAsRead(patientId, currentUserRole);
    });
    return () => unsub();
  }, [patientId, currentUserRole, targetThreadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    await dataService.sendChatMessage({
      patientId,
      senderUid: currentUserUid,
      senderName: currentUserName,
      senderRole: currentUserRole,
      recipientRole,
      threadId: targetThreadId,
      text: textToSend,
      timestamp: Date.now()
    });

    dataService.markChatAsRead(patientId, currentUserRole);
  };

  const handleSpeakText = (text: string) => {
    voiceService.speak(text, language);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col h-full w-full font-sans animate-in slide-in-from-right duration-200">
      <div className="max-w-md md:max-w-xl mx-auto w-full h-full flex flex-col bg-white border-x border-slate-100 shadow-xl">
        
        {/* Full Screen Top Header */}
        <div className="bg-[#0284C7] text-white px-4 py-3.5 flex items-center justify-between shadow-md shrink-0 border-b border-sky-700">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              title="Back to Messages"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center font-black text-base shadow-sm">
                {recipientRole === 'doctor' ? <Stethoscope className="w-5 h-5 text-white" /> : displayName.charAt(0).toUpperCase()}
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-sky-600 absolute bottom-0 right-0 animate-pulse" />
            </div>

            <div>
              <h3 className="font-black text-sm leading-tight text-white">
                {displayName}
              </h3>
              <p className="text-[11px] text-sky-100 font-medium">
                Patient Code: <span className="font-mono font-bold text-white">{patientId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => alert(`Calling ${displayName}...`)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors text-white"
            title="Call"
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>

        {/* Full Height Chat Log Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <div className="w-14 h-14 rounded-full bg-sky-50 text-[#0284C7] flex items-center justify-center text-2xl">
                💬
              </div>
              <p className="text-sm font-black text-slate-700">No messages yet with {displayName}</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Type a message below to start real-time private DMs.
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isMe = msg.senderRole === currentUserRole || msg.senderUid === currentUserUid;
              const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={msg.id || idx}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1 w-full`}
                >
                  <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isMe && (
                      <button
                        onClick={() => handleSpeakText(msg.text)}
                        className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center shrink-0 mb-1 cursor-pointer transition-all"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-2xs space-y-1 ${
                        isMe
                          ? 'bg-gradient-to-r from-[#0284C7] to-sky-700 text-white rounded-tr-xs'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
                      }`}
                    >
                      {!isMe && (
                        <div className="text-[10px] font-bold text-sky-700 flex items-center gap-1">
                          {msg.senderRole === 'doctor' ? <Stethoscope className="w-3 h-3 text-blue-600" /> : <User className="w-3 h-3 text-emerald-600" />}
                          <span>{msg.senderName} ({msg.senderRole})</span>
                        </div>
                      )}
                      <p>{msg.text}</p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-1 text-[10px] font-bold text-slate-400 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span>{timeStr}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-sky-500" />}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Full Width Bottom Input Bar */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Send message to ${displayName}...`}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-11 h-11 rounded-2xl bg-[#0284C7] hover:bg-sky-700 text-white flex items-center justify-center shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:hover:bg-[#0284C7]"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
