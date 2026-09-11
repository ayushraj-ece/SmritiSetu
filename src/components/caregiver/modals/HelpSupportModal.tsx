import React, { useState } from 'react';
import { X, HelpCircle, Phone, Mail, ChevronDown } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'How do I link my patient to the Caregiver App?',
      a: 'Ask your patient for their 5-digit Patient ID (displayed on their profile, e.g. ASM58291). Click "+ Add Patient" in the Patients tab, enter the code, and send a pairing request.'
    },
    {
      q: 'Will my scheduled medication alerts sync to the patient in real time?',
      a: 'Yes! Any medication or activity scheduled in the Caregiver App syncs instantly to the patient app via live Firestore integration.'
    },
    {
      q: 'How are cognitive performance scores calculated?',
      a: 'Scores are computed using our AI Adaptive Engine across 4 domains: Memory & Recall, Focus & Attention, Pattern Recognition, and Daily Routines.'
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Help & Support</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Support Hotline Box */}
        <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-100 space-y-2">
          <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">
            Smritisetu 24/7 Helpline
          </span>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-900">
            <a href="tel:18001234567" className="flex items-center gap-1.5 text-blue-600 hover:underline">
              <Phone className="w-3.5 h-3.5" /> 1800-123-4567
            </a>
            <span>•</span>
            <a href="mailto:support@smritisetu.org" className="flex items-center gap-1.5 text-blue-600 hover:underline">
              <Mail className="w-3.5 h-3.5" /> Email
            </a>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-extrabold text-slate-900 block">Frequently Asked Questions</span>
          <div className="space-y-2">
            {faqs.map((item, idx) => (
              <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-3 text-left flex items-center justify-between text-xs font-bold text-slate-900 cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-3 pb-3 text-[11px] text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-2 bg-white">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
};
