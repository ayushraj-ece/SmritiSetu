import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { offlineStorage } from '../../services/offlineStorage';
import { authService } from '../../services/authService';
import type { PatientProfile, NERState, Language } from '../../types';
import { User, Phone, MapPin, Globe, Save, ArrowLeft, ShieldCheck } from 'lucide-react';

interface Props {
  patientId: string;
  onClose: () => void;
}

const NER_STATES: NERState[] = [
  'Arunachal Pradesh',
  'Assam',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Sikkim',
  'Tripura'
];

export const PatientProfilePage: React.FC<Props> = ({ patientId, onClose }) => {
  const { t, setLanguage } = useLanguage();

  const [profile, setProfile] = useState<PatientProfile>(() => {
    const cached = offlineStorage.getPatientProfile();
    if (cached) return cached;
    return {
      id: 'patient_001',
      patientId: patientId.includes('DEMO') ? patientId : 'ASM58291',
      name: 'Ramesh Kumar',
      email: 'ramesh.kumar@example.com',
      phone: '+91 98640 12345',
      age: 72,
      gender: 'Male',
      state: 'Assam',
      preferredLanguage: 'as',
      createdAt: Date.now()
    };
  });

  const [name, setName] = useState<string>(profile.name);
  const [age, setAge] = useState<number>(profile.age);
  const [phone, setPhone] = useState<string>(profile.phone || '');
  const [state, setState] = useState<NERState>(profile.state);
  const [prefLang, setPrefLang] = useState<Language>(profile.preferredLanguage);
  const [savedMsg, setSavedMsg] = useState<boolean>(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PatientProfile = {
      ...profile,
      name,
      age,
      phone,
      state,
      preferredLanguage: prefLang
    };

    setProfile(updated);
    offlineStorage.savePatientProfile(updated);
    setLanguage(prefLang);

    if (profile.patientId && !profile.patientId.includes('DEMO')) {
      try {
        await authService.updatePatientProfile(profile.patientId, {
          name,
          age,
          phone,
          state,
          preferredLanguage: prefLang
        });
      } catch (err) {
        console.warn('Firestore profile sync warning:', err);
      }
    }

    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white text-[#1C1F24] border-2 border-[#D8CEBE] p-6 md:p-8 shadow-xs space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#E2DDD3]">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-[#555A62] hover:text-[#1C1F24] bg-[#FAF7F0] hover:bg-[#E5E0D8] border border-[#E2DDD3] px-4 py-2 font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4 text-[#9E7F40]" />
          <span>{t('backToHome')}</span>
        </button>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1C1F24]">
          {t('profileTitle')}
        </h2>
      </div>

      {savedMsg && (
        <div className="bg-[#FAF0D9] border border-[#D4B46E] text-[#7A612D] font-mono font-bold text-center py-3 px-4 text-xs">
          ✓ Clinical Patient Record Updated Successfully!
        </div>
      )}

      {/* Unique Patient ID Banner */}
      <div className="bg-[#FAF7F0] p-6 border-2 border-[#C5A059] flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#7E786D] block">
            {t('patientIdLabel')}
          </span>
          <span className="font-mono text-2xl md:text-3xl font-bold tracking-wide text-[#1C1F24]">
            {profile.patientId}
          </span>
        </div>
        <ShieldCheck className="w-10 h-10 text-[#9E7F40] shrink-0" />
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#1C1F24] mb-1">
            Full Legal Name
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-[#7E786D] absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#E2DDD3] font-bold text-base text-[#1C1F24] focus:border-[#C5A059] outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#1C1F24] mb-1">
              Age (Years)
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full p-3 bg-white border border-[#E2DDD3] font-bold text-base text-[#1C1F24] focus:border-[#C5A059] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#1C1F24] mb-1">
              Mobile Contact
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-[#7E786D] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#E2DDD3] font-bold text-base text-[#1C1F24] focus:border-[#C5A059] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#1C1F24] mb-1">
              State (NER)
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-[#7E786D] absolute left-3.5 top-3.5" />
              <select
                value={state}
                onChange={(e) => setState(e.target.value as NERState)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#E2DDD3] font-bold text-base text-[#1C1F24] focus:border-[#C5A059] outline-none appearance-none"
              >
                {NER_STATES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider font-bold text-[#1C1F24] mb-1">
              Preferred Dialect
            </label>
            <div className="relative">
              <Globe className="w-5 h-5 text-[#7E786D] absolute left-3.5 top-3.5" />
              <select
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value as Language)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#E2DDD3] font-bold text-base text-[#1C1F24] focus:border-[#C5A059] outline-none appearance-none"
              >
                <option value="en">English</option>
                <option value="as">Assamese (অসমীয়া)</option>
                <option value="bn">Bengali (বাংলা)</option>
                <option value="brx">Bodo (বড়ো)</option>
                <option value="mni">Manipuri (মৈতেইলোন্)</option>
                <option value="kha">Khasi (Ka Ktien Khasi)</option>
                <option value="lus">Mizo (Mizo ṭawng)</option>
                <option value="ne">Nepali (नेपाली)</option>
                <option value="trp">Kokborok (Kokborok)</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-[#2B352B] hover:bg-[#1E251E] text-[#FAF8F5] border border-[#C5A059] font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all mt-6 min-h-[48px]"
        >
          <Save className="w-5 h-5 text-[#C5A059]" />
          <span>Save Patient Record</span>
        </button>
      </form>
    </div>
  );
};
