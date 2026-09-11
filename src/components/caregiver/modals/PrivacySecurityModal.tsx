import React, { useState } from 'react';
import { X, Shield } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacySecurityModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [passcodeLock, setPasscodeLock] = useState(true);
  const [biometrics, setBiometrics] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Privacy & Security</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 pt-1 text-xs">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <span className="font-extrabold text-slate-900 block">App Lock & Passcode</span>
              <span className="text-[10px] text-slate-400 font-medium">Require passcode on opening app</span>
            </div>
            <input
              type="checkbox"
              checked={passcodeLock}
              onChange={(e) => setPasscodeLock(e.target.checked)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <span className="font-extrabold text-slate-900 block">Biometric Fingerprint / FaceID</span>
              <span className="text-[10px] text-slate-400 font-medium">Fast biometrics authentication</span>
            </div>
            <input
              type="checkbox"
              checked={biometrics}
              onChange={(e) => setBiometrics(e.target.checked)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <span className="font-extrabold text-slate-900 block">Encrypted Data Sync</span>
              <span className="text-[10px] text-slate-400 font-medium">AES-256 end-to-end cloud security</span>
            </div>
            <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Enabled
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Save Security Preferences
        </button>
      </div>
    </div>
  );
};
