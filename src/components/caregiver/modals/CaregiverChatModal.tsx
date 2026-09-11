import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Phone, Volume2, CheckCheck } from 'lucide-react';
import { dataService } from '../../../services/dataService';
import { voiceService } from '../../../services/voiceService';
import { auth } from '../../../services/firebase';
import type { ChatMessage } from '../../../types';

interface Props {
  recipientId: string;
  recipientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CaregiverChatModal: React.FC<Props> = ({
  recipientId,
  recipientName,
  isOpen,
  onClose
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !recipientId) return;

    // Mark messages as read by caregiver
    dataService.markChatAsRead(recipientId, 'caregiver');

    // Real-time listener for chat messages
    const unsub = dataService.subscribeChatMessages(recipientId, (list) => {
      setMessages(list);
      dataService.markChatAsRead(recipientId, 'caregiver');
    });

    return () => unsub();
  }, [isOpen, recipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const currentUid = auth.currentUser?.uid || 'caregiver_user';
    const currentName = auth.currentUser?.displayName || 'Caregiver';

    const text = inputMessage.trim();
    setInputMessage('');

    await dataService.sendChatMessage({
      patientId: recipientId,
      senderUid: currentUid,
      senderName: currentName,
      senderRole: 'caregiver',
      text,
      timestamp: Date.now()
    });

    dataService.markChatAsRead(recipientId, 'caregiver');
  };

  const handleSpeak = (text: string) => {
    voiceService.speak(text, 'en');
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col h-full w-full font-sans animate-in slide-in-from-right duration-200">
      <div className="max-w-md md:max-w-xl mx-auto w-full h-full flex flex-col bg-white">
        
        {/* Full Screen Top Header */}
        <div className="bg-[#2563EB] text-white px-4 py-3.5 flex items-center justify-between shadow-md shrink-0 border-b border-blue-700">
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
                {recipientName.charAt(0).toUpperCase()}
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-blue-600 absolute bottom-0 right-0 animate-pulse" />
            </div>

            <div>
              <h3 className="font-black text-sm leading-tight text-white">{recipientName}</h3>
              <p className="text-[11px] text-blue-100 font-medium">
                Patient Code: <span className="font-mono font-bold text-white">{recipientId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => alert(`Calling ${recipientName}...`)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors text-white"
            title="Call Patient"
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>

        {/* Full Height Chat Log Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
                💬
              </div>
              <p className="text-sm font-black text-slate-700">No messages yet with {recipientName}</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Type a message below to start real-time DMs with your patient.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.senderRole === 'caregiver';
              const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={msg.id || index}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-end gap-2 max-w-[85%]">
                    {!isMe && (
                      <button
                        onClick={() => handleSpeak(msg.text)}
                        className="w-7 h-7 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center shrink-0 mb-1 cursor-pointer transition-all"
                        title="Read aloud"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-2xs ${
                        isMe
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>

                  <div className={`flex items-center gap-1 text-[10px] font-bold text-slate-400 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <span>{timeStr}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
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
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Message ${recipientName}...`}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="w-11 h-11 rounded-2xl bg-[#2563EB] hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:hover:bg-[#2563EB]"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
