import React, { useState } from 'react';
import { X, User, Save, HeartHandshake } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { auth } from '../../../services/firebase';
import { dataService } from '../../../services/dataService';
import { offlineStorage } from '../../../services/offlineStorage';

interface Props {
  isOpen: boolean;
  currentName?: string;
  currentEmail?: string;
  currentPhone?: string;
  currentRelation?: string;
  onClose: () => void;
  onSuccess?: (newName: string) => void;
  onSave?: (updated: { name: string; phone: string; relation: string }) => void;
}

export const EditCaregiverProfileModal: React.FC<Props> = ({
  isOpen,
  currentName,
  currentPhone,
  currentRelation,
  onClose,
  onSuccess,
  onSave
}) => {
  const cProfile = offlineStorage.getCaregiverProfile();
  const [name, setName] = useState<string>(currentName || cProfile.name);
  const [phone, setPhone] = useState<string>(currentPhone || cProfile.phone);
  const [relation, setRelation] = useState<string>(currentRelation || cProfile.relation);

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isDoctorUser = auth.currentUser?.displayName?.startsWith('Dr.') || auth.currentUser?.email?.includes('doctor') || auth.currentUser?.email?.includes('aiims');
      if (auth.currentUser && !isDoctorUser) {
        await updateProfile(auth.currentUser, { displayName: name.trim() }).catch(() => {});
      }

      await dataService.updateCaregiverProfile({
        name: name.trim(),
        phone: phone.trim(),
        relation: relation.trim()
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('caregiverProfileUpdated'));
      }

      if (onSuccess) onSuccess(name.trim());
      if (onSave) onSave({ name: name.trim(), phone: phone.trim(), relation: relation.trim() });
      onClose();
    } catch (err) {
      console.error('Failed to update caregiver profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Caregiver Profile</h3>
              <p className="text-[11px] text-slate-400 font-medium">Linked to patient profile</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pratham Sharma"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Mobile Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Relation with Patient</label>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Spouse">Spouse (Husband / Wife)</option>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling (Brother / Sister)</option>
              <option value="Primary Caregiver">Primary Family Caregiver</option>
              <option value="Professional Nurse">Professional Nurse / Attendant</option>
            </select>
          </div>

          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-start gap-2 text-[11px] text-indigo-900 font-medium">
            <HeartHandshake className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>This profile information automatically populates as the primary emergency contact in your paired patient's chart.</span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-xs font-bold text-slate-600 rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
